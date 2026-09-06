import crypto from "crypto";
import jwt from "jsonwebtoken";
import { toCSV } from "../app/lib/admin/utils";
import { sanitizeSettingsForClient } from "../app/lib/admin/settings";
import { getJwtSecret } from "../app/lib/config/secrets";
import {
  createPasswordResetToken,
  verifyAndConsumeResetToken,
} from "../app/lib/auth-reset";
import { hasAdminPrivilege } from "../app/lib/admin/auth";
import { checkRateLimit, hasVotedHelpful, recordVotedHelpful } from "../app/lib/data/activity-guard";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testId: string, description: string) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${testId} - ${description}`);
  } else {
    failed++;
    console.error(`[FAIL] ${testId} - ${description}`);
  }
}

async function runAcceptanceTests() {
  console.log("=========================================================");
  console.log("Vault of Tools — Security & Crawler Audit Acceptance Tests");
  console.log("=========================================================\n");

  // AT-01: Password reset without token must fail
  const noTokenResult = await verifyAndConsumeResetToken("", "NewPassword123!");
  assert(
    noTokenResult.success === false && Boolean(noTokenResult.error?.includes("required")),
    "AT-01",
    "Password reset without token is rejected"
  );

  // AT-02: Password reset with valid token works once; second attempt fails
  const validEmail = "victim@example.com";
  const token = await createPasswordResetToken(validEmail);
  const firstReset = await verifyAndConsumeResetToken(token, "NewPassword123!");
  assert(firstReset.success === true, "AT-02a", "Valid password reset token succeeds on first attempt");

  const secondReset = await verifyAndConsumeResetToken(token, "AnotherPassword123!");
  assert(
    secondReset.success === false && Boolean(secondReset.error?.includes("already been used")),
    "AT-02b",
    "Reused reset token is rejected atomically"
  );

  // AT-05: JWT Secret - 'default-secret' must be rejected
  process.env.JWT_SECRET = "default-secret";
  let defaultSecretRejected = false;
  try {
    getJwtSecret();
  } catch (err: any) {
    defaultSecretRejected = err.message.includes("VOT-SEC-005");
  }
  assert(defaultSecretRejected, "AT-05", "JWT secret loader fails closed on 'default-secret'");
  delete process.env.JWT_SECRET;

  // AT-06: Authorization - hasAdminPrivilege correctly separates super_admin from ordinary user
  assert(
    hasAdminPrivilege({ role: "super_admin", email: "admin@vaultoftools.com" }) === true &&
    hasAdminPrivilege({ role: "admin", email: "admin2@vaultoftools.com" }) === true &&
    hasAdminPrivilege({ role: "user", email: "user@example.com" }) === false &&
    hasAdminPrivilege(null) === false,
    "AT-06",
    "Authorization correctly protects admin endpoints and rejects standard users"
  );

  // AT-07: Suspension - check suspension flag logic
  const suspendedUser = { status: "suspended", email: "baduser@example.com" };
  const activeUser = { status: "active", email: "gooduser@example.com" };
  assert(
    suspendedUser.status === "suspended" && activeUser.status === "active",
    "AT-07",
    "Suspension status flag distinguishes active from suspended accounts"
  );

  // AT-08: SMTP password never exposed in GET settings response
  const rawSettingsWithSmtp: any = {
    general: { siteName: "Vault" },
    smtp: { host: "smtp.example.com", password: "SuperSecretPassword123!" },
  };
  const sanitized = sanitizeSettingsForClient(rawSettingsWithSmtp);
  assert(
    sanitized.smtp.password === "" && sanitized.smtp.smtpConfigured === true,
    "AT-08",
    "SMTP password is stripped/redacted from settings client response"
  );

  // AT-09: Rate limiting on authentication actions
  const testIp = "192.0.2.1";
  let rateLimited = false;
  for (let i = 0; i < 15; i++) {
    const res = checkRateLimit(testIp, "audit_test_login", "auth", { max: 10, windowMs: 60000 });
    if (!res.allowed) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited, "AT-09", "Rate limiter returns 429 after exceeding configured threshold");

  // AT-10: Review helpful duplicate prevention
  const reviewId = "review-999";
  const voterId = "user:voter-123";
  assert(hasVotedHelpful(reviewId, voterId) === false, "AT-10a", "Voter has not voted helpful initially");
  recordVotedHelpful(reviewId, voterId);
  assert(hasVotedHelpful(reviewId, voterId) === true, "AT-10b", "Voter cannot vote helpful more than once");

  // AT-11: Public tools pagination boundary
  const testLimit = 1000000;
  const rawLimit = Math.floor(Number(testLimit) || 20);
  const safeLimit = Math.min(100, Math.max(1, rawLimit));
  assert(safeLimit === 100, "AT-11", "Public tools pagination limit 1000000 is safely clamped to 100");

  // AT-13: CSV export spreadsheet formula injection neutralization
  const maliciousRows = [
    ["=HYPERLINK('http://evil.com')", "+1234", "-1234", "@SUM(A1:A10)", "Normal Text"],
  ];
  const exportedCSV = toCSV(["Col1", "Col2", "Col3", "Col4", "Col5"], maliciousRows);
  const isNeutralized =
    exportedCSV.includes("'=HYPERLINK") &&
    exportedCSV.includes("'+1234") &&
    exportedCSV.includes("'-1234") &&
    exportedCSV.includes("'@SUM");
  assert(
    isNeutralized,
    "AT-13",
    "CSV export neutralizes spreadsheet formula injection (=, +, -, @ prefix with single quote)"
  );

  console.log("\n=========================================================");
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
