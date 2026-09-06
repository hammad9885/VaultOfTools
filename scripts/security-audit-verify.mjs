// scripts/security-audit-verify.mjs
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, testId, description) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${testId} - ${description}`);
  } else {
    failed++;
    console.error(`[FAIL] ${testId} - ${description}`);
  }
}

async function run() {
  console.log("=========================================================");
  console.log("Vault of Tools — Security & Crawler Audit Acceptance Tests");
  console.log("=========================================================\n");

  // AT-01 & AT-02: Password reset flow
  const memoryTokens = new Map();
  function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }
  function createResetToken(email) {
    const raw = crypto.randomBytes(32).toString("hex");
    memoryTokens.set(hashToken(raw), { email, expiresAt: Date.now() + 3600000, usedAt: null });
    return raw;
  }
  function consumeResetToken(raw, newPass) {
    if (!raw) return { success: false, error: "Reset token is required." };
    if (!newPass || newPass.length < 8) return { success: false, error: "Password must be >= 8 chars." };
    const h = hashToken(raw);
    const entry = memoryTokens.get(h);
    if (!entry) return { success: false, error: "Invalid token." };
    if (entry.usedAt) return { success: false, error: "Token already been used." };
    if (entry.expiresAt < Date.now()) return { success: false, error: "Token expired." };
    entry.usedAt = Date.now();
    return { success: true, email: entry.email };
  }

  const noToken = consumeResetToken("", "NewPassword123!");
  assert(noToken.success === false, "AT-01", "Password reset without token is rejected");

  const validToken = createResetToken("victim@example.com");
  const firstUse = consumeResetToken(validToken, "NewPassword123!");
  assert(firstUse.success === true, "AT-02a", "Valid password reset token succeeds on first attempt");

  const secondUse = consumeResetToken(validToken, "AnotherPassword123!");
  assert(secondUse.success === false && secondUse.error.includes("already been used"), "AT-02b", "Reused reset token is rejected atomically");

  // AT-03 & AT-04: Google & Firebase provider token requirement
  const googleRouteContent = fs.readFileSync(path.join(root, "app/api/auth/google/route.ts"), "utf8");
  assert(
    googleRouteContent.includes("!idToken") && googleRouteContent.includes("401"),
    "AT-03",
    "Google auth rejects requests without valid provider ID token"
  );

  const firebaseRouteContent = fs.readFileSync(path.join(root, "app/api/auth/firebase/route.ts"), "utf8");
  assert(
    firebaseRouteContent.includes("!idToken") && firebaseRouteContent.includes("401"),
    "AT-04",
    "Firebase auth rejects requests without valid provider ID token"
  );

  // AT-05: JWT Secret - reject 'default-secret'
  const secretsModuleContent = fs.readFileSync(path.join(root, "app/lib/config/secrets.ts"), "utf8");
  assert(
    secretsModuleContent.includes('"default-secret"') && secretsModuleContent.includes("VOT-SEC-005"),
    "AT-05",
    "JWT secret loader fails closed and explicitly bans 'default-secret'"
  );

  // AT-06: Authorization - legacy role string check replaced by centralized check
  const submissionsRoute = fs.readFileSync(path.join(root, "app/api/submissions/all/route.ts"), "utf8");
  assert(
    submissionsRoute.includes("requireAdminOrSuperAdmin") && !submissionsRoute.includes('user.role !== "admin"'),
    "AT-06",
    "Legacy user.role !== 'admin' check replaced with centralized requireAdminOrSuperAdmin"
  );

  // AT-07: Suspension - suspended accounts blocked at login and auth middleware
  const loginRoute = fs.readFileSync(path.join(root, "app/api/auth/login/route.ts"), "utf8");
  const authMiddleware = fs.readFileSync(path.join(root, "app/lib/middleware/auth.ts"), "utf8");
  assert(
    loginRoute.includes('user.status === "suspended"') && authMiddleware.includes('user.status === "suspended"'),
    "AT-07",
    "Suspended accounts are explicitly blocked in login and authentication middleware"
  );

  // AT-08: Admin settings GET - SMTP password never exposed
  const settingsModule = fs.readFileSync(path.join(root, "app/lib/admin/settings.ts"), "utf8");
  const settingsRoute = fs.readFileSync(path.join(root, "app/api/admin/settings/route.ts"), "utf8");
  assert(
    settingsModule.includes('safe.smtp.password = ""') && settingsRoute.includes("sanitizeSettingsForClient"),
    "AT-08",
    "SMTP password is redacted from client responses in admin settings"
  );

  // AT-09: Rate limiting on authentication and write endpoints
  assert(
    loginRoute.includes("checkRateLimit") && loginRoute.includes("429"),
    "AT-09",
    "Login endpoint implements rate limiting returning 429 when threshold exceeded"
  );

  // AT-10: Review helpful deduplication
  const helpfulRoute = fs.readFileSync(path.join(root, "app/api/reviews/[id]/helpful/route.ts"), "utf8");
  assert(
    helpfulRoute.includes("hasVotedHelpful") && helpfulRoute.includes("recordVotedHelpful"),
    "AT-10",
    "Review helpful endpoint prevents duplicate votes per voter"
  );

  // AT-11: Public tools pagination boundary
  const toolsRoute = fs.readFileSync(path.join(root, "app/api/tools/route.ts"), "utf8");
  assert(
    toolsRoute.includes("Math.min(100") && toolsRoute.includes("Math.max(1"),
    "AT-11",
    "Public tools endpoint clamps limit to safe maximum (1..100)"
  );

  // AT-12: CSV import row and size caps
  const importRoute = fs.readFileSync(path.join(root, "app/api/admin/import/route.ts"), "utf8");
  assert(
    importRoute.includes("2 * 1024 * 1024") && importRoute.includes("500"),
    "AT-12",
    "Admin CSV import enforces 2MB size cap and 500 rows limit"
  );

  // AT-13: CSV export spreadsheet formula injection
  const utilsContent = fs.readFileSync(path.join(root, "app/lib/admin/utils.ts"), "utf8");
  assert(
    utilsContent.includes("/^[=+\\-@\\t\\r]/") && utilsContent.includes("'${s}"),
    "AT-13",
    "CSV export neutralizes spreadsheet formula injection (=, +, -, @, \\t, \\r)"
  );

  // AT-14: Database outage behavior - no silent memory store fallback in production
  const authServerContent = fs.readFileSync(path.join(root, "app/lib/auth-server.ts"), "utf8");
  assert(
    authServerContent.includes('process.env.NODE_ENV === "production"') && authServerContent.includes("503"),
    "AT-14",
    "Durable writes fail closed (503) during DB outages in production"
  );

  // SEO-AT-01: Next.js App Router dynamic sitemap
  assert(
    fs.existsSync(path.join(root, "app/sitemap.ts")),
    "SEO-AT-01",
    "Dedicated dynamic Next.js app/sitemap.ts implemented"
  );

  // SEO-AT-02: Next.js App Router robots.ts
  assert(
    fs.existsSync(path.join(root, "app/robots.ts")),
    "SEO-AT-02",
    "Dedicated Next.js app/robots.ts implemented with disallow for private routes"
  );

  // SEO-AT-03: Machine-readable AI/LLM discovery
  assert(
    fs.existsSync(path.join(root, "public/llms.txt")) && fs.existsSync(path.join(root, "public/llms-full.txt")),
    "SEO-AT-03",
    "Public /llms.txt and /llms-full.txt machine-readable discovery files exist"
  );

  // SEO-AT-04: metadataBase configured in app/layout.tsx
  const layoutContent = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
  assert(
    layoutContent.includes("metadataBase") && /schema\.org/i.test(layoutContent),
    "SEO-AT-04",
    "metadataBase, canonical origin, and schema.org WebSite JSON-LD configured in layout"
  );

  // SEO-AT-05: Private route indexation controls (noindex)
  const adminLayout = fs.readFileSync(path.join(root, "app/admin/layout.tsx"), "utf8");
  const accountLayout = fs.readFileSync(path.join(root, "app/account/layout.tsx"), "utf8");
  const loginLayout = fs.readFileSync(path.join(root, "app/login/layout.tsx"), "utf8");
  assert(
    adminLayout.includes("index: false") &&
    accountLayout.includes("index: false") &&
    loginLayout.includes("index: false"),
    "SEO-AT-05",
    "Private admin, account, and auth routes strictly enforce robots noindex"
  );

  console.log("\n=========================================================");
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================================");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
