/**
 * Central Alert & Notification System for Vault of Tools
 * Official Alert Receiver: vaultoftools@gmail.com
 */

export const OFFICIAL_ALERT_EMAIL = "vaultoftools@gmail.com";

/** Roles that must trigger an admin alert on creation or promotion. */
export const PRIVILEGED_ROLES = ["admin", "super_admin"] as const;

export function isPrivilegedRole(role: unknown): boolean {
  return PRIVILEGED_ROLES.includes(String(role) as (typeof PRIVILEGED_ROLES)[number]);
}

export type AlertType =
  | "NEW_ADMIN"
  | "NEW_SUBSCRIBER"
  | "CONTACT_QUERY"
  | "SYSTEM_HEALTH"
  | "TOOL_SUBMISSION"
  | "USER_LOGIN"
  | "USER_SIGNUP"
  | "CONSULTATION_REQUEST"
  | "NEW_REVIEW";

export type AlertRecord = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  recipient: string;
  timestamp: string;
  status: "sent" | "delivered" | "warning" | "critical";
  details?: Record<string, unknown>;
};

// In-memory store of recent alerts for Dashboard display
const recentAlerts: AlertRecord[] = [
  {
    id: "alert-init-1",
    type: "SYSTEM_HEALTH",
    title: "System Initialized & Monitored",
    message: "Automated alert pipeline active. Primary notifications routed to vaultoftools@gmail.com",
    recipient: OFFICIAL_ALERT_EMAIL,
    timestamp: new Date().toISOString(),
    status: "delivered",
    details: { services: ["MongoDB", "Vercel Hosting", "Domain DNS", "Newsletter Pipeline"] },
  },
];

// Deduplicate rapid repeated login alerts (e.g. token refresh on page reload) within 60 seconds
const recentLoginTimestamps = new Map<string, number>();

function buildAlertEmailHtml(alert: AlertRecord): string {
  const detailsRows = Object.entries(alert.details || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;text-transform:capitalize;width:35%;">${String(k)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;word-break:break-word;">${
            typeof v === "object" ? JSON.stringify(v) : String(v)
          }</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:20px 24px;color:#ffffff;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;opacity:0.85;">Vault of Tools • Admin Alert (${alert.type})</div>
        <h2 style="margin:6px 0 0;font-size:18px;font-weight:700;">${alert.title}</h2>
      </div>
      <div style="padding:20px 24px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">${alert.message}</p>
        ${
          detailsRows
            ? `<table style="width:100%;border-collapse:collapse;font-size:13px;background:#f8fafc;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">${detailsRows}</table>`
            : ""
        }
        <div style="margin-top:18px;padding-top:12px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;">
          Sent automatically by Vault of Tools Notification Pipeline at ${alert.timestamp}
        </div>
      </div>
    </div>
  `;
}

async function dispatchEmailNotification(alert: AlertRecord): Promise<boolean> {
  const targetEmail =
    (process.env.ADMIN_EMAIL || OFFICIAL_ALERT_EMAIL).trim() || OFFICIAL_ALERT_EMAIL;
  const recipients = Array.from(
    new Set([OFFICIAL_ALERT_EMAIL, targetEmail].filter(Boolean))
  );
  const subject = `[Vault of Tools] ${alert.title}`;
  const html = buildAlertEmailHtml(alert);

  // 1. Try SMTP via Nodemailer (env vars or Admin Settings SMTP)
  try {
    let smtpHost = process.env.SMTP_HOST || "";
    let smtpPort = Number(process.env.SMTP_PORT || 587);
    let smtpUser =
      process.env.SMTP_USER ||
      process.env.GMAIL_USER ||
      process.env.EMAIL_USER ||
      "";
    let smtpPass =
      process.env.SMTP_PASS ||
      process.env.GMAIL_APP_PASSWORD ||
      process.env.EMAIL_PASS ||
      "";
    let fromEmail = process.env.SMTP_FROM || smtpUser || OFFICIAL_ALERT_EMAIL;
    let fromName = "Vault of Tools Alerts";

    if (!smtpPass) {
      try {
        const { getSettings } = await import("@/app/lib/admin/settings");
        const settings = await getSettings();
        if (settings?.smtp?.password) {
          smtpHost = settings.smtp.host || smtpHost || "smtp.gmail.com";
          smtpPort = Number(settings.smtp.port || smtpPort || 587);
          smtpUser = settings.smtp.username || settings.smtp.fromEmail || smtpUser || OFFICIAL_ALERT_EMAIL;
          smtpPass = settings.smtp.password;
          fromEmail = settings.smtp.fromEmail || smtpUser;
          fromName = settings.smtp.fromName || fromName;
        }
      } catch {}
    }

    if (smtpPass) {
      if (!smtpHost) smtpHost = "smtp.gmail.com";
      if (!smtpUser) smtpUser = OFFICIAL_ALERT_EMAIL;
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipients.join(", "),
        subject,
        text: `${alert.title}\n\n${alert.message}\n\nDetails:\n${JSON.stringify(
          alert.details || {},
          null,
          2
        )}`,
        html,
      });
      return true;
    }
  } catch (err) {
    console.warn("SMTP email dispatch warning:", err instanceof Error ? err.message : err);
  }

  // 2. Try Resend API if RESEND_API_KEY is configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Vault of Tools <onboarding@resend.dev>",
          to: recipients,
          subject,
          html,
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return true;
    } catch {}
  }

  // 3. Try Web3Forms if WEB3FORMS_ACCESS_KEY is configured
  const web3Key =
    process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (web3Key) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3Key,
          subject,
          from_name: "Vault of Tools",
          message: `${alert.title}\n\n${alert.message}`,
          ...((alert.details as Record<string, unknown>) || {}),
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) return true;
    } catch {}
  }

  // 4. Zero-config fallback via FormSubmit AJAX endpoint to vaultoftools@gmail.com
  try {
    const flatDetails: Record<string, string> = {};
    for (const [k, v] of Object.entries(alert.details || {})) {
      if (v !== undefined && v !== null) {
        flatDetails[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      }
    }
    const res = await fetch(`https://formsubmit.co/ajax/${OFFICIAL_ALERT_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: process.env.BASE_URL || "https://vaultoftools.com",
        Referer: `${process.env.BASE_URL || "https://vaultoftools.com"}/`,
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _captcha: "false",
        alert_type: alert.type,
        title: alert.title,
        message: alert.message,
        ...flatDetails,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return true;
  } catch {}

  return false;
}

/**
 * Dispatch an alert to vaultoftools@gmail.com
 */
export async function sendAlert(params: {
  type: AlertType;
  title: string;
  message: string;
  status?: "sent" | "delivered" | "warning" | "critical";
  details?: Record<string, unknown>;
}): Promise<AlertRecord> {
  const alert: AlertRecord = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: params.type,
    title: params.title,
    message: params.message,
    recipient: OFFICIAL_ALERT_EMAIL,
    timestamp: new Date().toISOString(),
    status: params.status || "delivered",
    details: params.details,
  };

  recentAlerts.unshift(alert);
  if (recentAlerts.length > 50) {
    recentAlerts.pop();
  }

  // Persist a durable copy + record in admin activity + dispatch email concurrently
  await Promise.allSettled([
    persistAlert(alert),
    (async () => {
      try {
        const { logActivity } = await import("@/app/lib/admin/activity");
        const actor = String(
          params.details?.email ||
            params.details?.workEmail ||
            params.details?.submitterEmail ||
            params.details?.userName ||
            "system"
        );
        await logActivity(actor, params.type.toLowerCase(), params.title, {
          message: params.message,
          ...(params.details || {}),
        });
      } catch {}
    })(),
    dispatchEmailNotification(alert),
  ]);

  // Console log alert event with clear branding
  console.log(`[ALERT NOTIFICATION -> ${OFFICIAL_ALERT_EMAIL}] [${alert.type}]: ${alert.title} - ${alert.message}`);

  return alert;
}

/**
 * Best-effort persistence: MongoDB/Firestore when available, memory otherwise.
 * Never throws — an alert must not fail the request that triggered it.
 */
async function persistAlert(alert: AlertRecord) {
  try {
    const { connectDB, isDBConnected } = await import("@/app/lib/config/db");
    await connectDB();
    if (!isDBConnected()) return;
    const { default: SystemAlert } = await import("@/app/lib/models/SystemAlert");
    await SystemAlert.create({
      type: alert.type,
      title: alert.title,
      message: alert.message,
      recipient: alert.recipient,
      status: alert.status,
      details: alert.details || {},
    });
  } catch {
    // Memory copy in recentAlerts is the fallback record.
  }
}

/**
 * Triggered when a new Super Admin or Admin account is created
 */
export async function alertNewAdmin(adminData: {
  email: string;
  role: string;
  displayName?: string;
  createdBy?: string;
  event?: "created" | "promoted";
  previousRole?: string;
}) {
  const event = adminData.event || "created";
  const heading =
    event === "promoted" ? "Admin Role Upgrade" : "New Admin Account Created";

  const message =
    event === "promoted"
      ? `${adminData.email} was promoted to ${adminData.role.toUpperCase()} on Vault of Tools${
          adminData.previousRole ? ` (from ${adminData.previousRole})` : ""
        }.`
      : `A new ${adminData.role.toUpperCase()} has been created on Vault of Tools (${adminData.email}).`;

  return sendAlert({
    type: "NEW_ADMIN",
    title: heading,
    message,
    status: "warning",
    details: {
      email: adminData.email,
      role: adminData.role,
      event,
      previousRole: adminData.previousRole || "N/A",
      displayName: adminData.displayName || "N/A",
      createdBy: adminData.createdBy || "Console/SuperAdmin",
      time: new Date().toISOString(),
    },
  });
}

/**
 * Triggered when a user logs in to the platform
 */
export async function alertUserLogin(userData: {
  email: string;
  displayName?: string;
  provider?: string;
  role?: string;
}) {
  const key = String(userData.email || "").toLowerCase().trim();
  const now = Date.now();
  const lastSent = recentLoginTimestamps.get(key) || 0;
  if (key && now - lastSent < 60_000) {
    return recentAlerts[0];
  }
  if (key) {
    recentLoginTimestamps.set(key, now);
  }

  const username = userData.displayName || userData.email.split("@")[0] || "User";
  const provider = userData.provider || "credentials";
  return sendAlert({
    type: "USER_LOGIN",
    title: `User Logged In: ${username} (${userData.email})`,
    message: `User ${username} has logged in with email: ${userData.email} (via ${provider}).`,
    status: "delivered",
    details: {
      "Username / Name": username,
      "User Email": userData.email,
      "Login Method": provider,
      "Account Role": userData.role || "user",
      "Login Time": new Date().toLocaleString(),
    },
  });
}

/**
 * Triggered when a new user registers an account
 */
export async function alertUserSignup(userData: {
  email: string;
  displayName?: string;
  provider?: string;
  role?: string;
}) {
  const username = userData.displayName || userData.email.split("@")[0] || "New User";
  const provider = userData.provider || "credentials";
  return sendAlert({
    type: "USER_SIGNUP",
    title: `New User Sign-Up: ${username} (${userData.email})`,
    message: `New account registered by ${username} with email: ${userData.email} (via ${provider}).`,
    status: "delivered",
    details: {
      "Username / Name": username,
      "User Email": userData.email,
      "Registration Method": provider,
      "Account Role": userData.role || "user",
      "Registration Time": new Date().toLocaleString(),
    },
  });
}

/**
 * Triggered when a user submits a new AI tool
 */
export async function alertToolSubmission(toolData: {
  name: string;
  website: string;
  category: string;
  pricing?: string;
  submitterEmail?: string;
  description?: string;
}) {
  return sendAlert({
    type: "TOOL_SUBMISSION",
    title: `New Tool Submitted: ${toolData.name}`,
    message: `A new tool "${toolData.name}" (${toolData.category}) was submitted for review.`,
    status: "delivered",
    details: {
      toolName: toolData.name,
      website: toolData.website,
      category: toolData.category,
      pricing: toolData.pricing || "Free",
      submitterEmail: toolData.submitterEmail || "N/A",
      description: toolData.description || "",
      time: new Date().toISOString(),
    },
  });
}

/**
 * Triggered when a user requests an AI consultation
 */
export async function alertConsultationRequest(data: {
  fullName: string;
  workEmail: string;
  company?: string;
  budget?: string;
  timeline?: string;
  projectDetails?: string;
}) {
  return sendAlert({
    type: "CONSULTATION_REQUEST",
    title: `New Consultation Request: ${data.fullName}`,
    message: `${data.fullName} (${data.workEmail}) submitted a consultation request${
      data.company ? ` for ${data.company}` : ""
    }.`,
    status: "delivered",
    details: {
      fullName: data.fullName,
      workEmail: data.workEmail,
      company: data.company || "N/A",
      budget: data.budget || "N/A",
      timeline: data.timeline || "N/A",
      projectDetails: data.projectDetails || "",
      time: new Date().toISOString(),
    },
  });
}

/**
 * Triggered when a user submits a tool review
 */
export async function alertNewReview(data: {
  toolName: string;
  toolSlug?: string;
  userName?: string;
  rating: number;
  text: string;
}) {
  return sendAlert({
    type: "NEW_REVIEW",
    title: `New Review (${data.rating}★) on ${data.toolName}`,
    message: `${data.userName || "Anonymous"} left a ${data.rating}-star review on ${data.toolName}.`,
    status: "delivered",
    details: {
      toolName: data.toolName,
      toolSlug: data.toolSlug || "",
      userName: data.userName || "Anonymous",
      rating: data.rating,
      reviewText: data.text,
      time: new Date().toISOString(),
    },
  });
}

/**
 * Triggered when a new user subscribes to the newsletter
 */
export async function alertNewSubscriber(subscriberEmail: string) {
  return sendAlert({
    type: "NEW_SUBSCRIBER",
    title: "New Newsletter Subscriber",
    message: `A new user subscribed to the Vault of Tools newsletter: ${subscriberEmail}`,
    status: "delivered",
    details: {
      email: subscriberEmail,
      time: new Date().toISOString(),
    },
  });
}

/**
 * Triggered when a user submits a contact query or feedback
 */
export async function alertContactQuery(queryData: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  return sendAlert({
    type: "CONTACT_QUERY",
    title: `New Contact Message from ${queryData.name}`,
    message: `Inquiry received from ${queryData.name} (${queryData.email}): ${queryData.message.slice(0, 150)}`,
    status: "delivered",
    details: queryData,
  });
}

/**
 * Triggered when a system health issue is detected
 */
export async function alertSystemHealthIssue(service: string, issue: string) {
  return sendAlert({
    type: "SYSTEM_HEALTH",
    title: `Infrastructure Alert: ${service} Issue`,
    message: `System alert on ${service}: ${issue}. Immediate check advised.`,
    status: "critical",
    details: {
      service,
      issue,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Retrieve recent alerts for the Admin Dashboard.
 * Merges the in-memory tail with persisted alerts so the feed survives cold starts.
 */
export async function getRecentAlerts(limit = 25): Promise<AlertRecord[]> {
  try {
    const { connectDB, isDBConnected } = await import("@/app/lib/config/db");
    await connectDB();

    if (isDBConnected()) {
      const { default: SystemAlert } = await import("@/app/lib/models/SystemAlert");
      const rows = (await SystemAlert.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()) as Array<Record<string, unknown>>;

      const persisted: AlertRecord[] = rows.map((r) => ({
        id: String(r._id),
        type: r.type as AlertType,
        title: String(r.title),
        message: String(r.message),
        recipient: String(r.recipient),
        timestamp: new Date(r.createdAt as string).toISOString(),
        status: r.status as AlertRecord["status"],
        details: r.details as Record<string, unknown> | undefined,
      }));

      const seen = new Set(persisted.map((a) => a.id));
      const memoryOnly = recentAlerts.filter((a) => !seen.has(a.id));
      return [...persisted, ...memoryOnly].slice(0, limit);
    }
  } catch {
    // fall through to memory
  }

  return recentAlerts.slice(0, limit);
}

export type ServiceStatus = {
  status: "operational" | "warning" | "critical";
  message: string;
  latencyMs?: number;
};

const PROBE_TIMEOUT_MS = 6000;

async function probe(url: string): Promise<{ ok: boolean; latencyMs: number; detail: string }> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return {
      ok: res.status < 500,
      latencyMs: Date.now() - started,
      detail: `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : "Unreachable",
    };
  }
}

/**
 * Run a real diagnostic pass across hosting, API, database, and domain/SSL.
 * Each probe degrades to "warning" instead of throwing so the dashboard always renders.
 */
export async function runDiagnostics(): Promise<{
  vercelHosting: ServiceStatus;
  database: ServiceStatus;
  cloudApi: ServiceStatus;
  domainSsl: ServiceStatus;
  alertTarget: string;
  lastChecked: string;
}> {
  const siteOrigin = process.env.BASE_URL || "https://vaultoftools.com";
  const results: {
    vercelHosting: ServiceStatus;
    database: ServiceStatus;
    cloudApi: ServiceStatus;
    domainSsl: ServiceStatus;
  } = {
    vercelHosting: { status: "operational", message: "Not yet checked" },
    database: { status: "operational", message: "Not yet checked" },
    cloudApi: { status: "operational", message: "Not yet checked" },
    domainSsl: { status: "operational", message: "Not yet checked" },
  };

  // 1. Hosting / CDN
  const hostingProbe = await probe(siteOrigin);
  const onVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  results.vercelHosting = {
    status: hostingProbe.ok ? "operational" : "critical",
    message: hostingProbe.ok
      ? `${onVercel ? "Vercel edge" : "Hosting origin"} reachable (${hostingProbe.detail}, ${hostingProbe.latencyMs}ms)`
      : `Hosting unreachable (${hostingProbe.detail})`,
    latencyMs: hostingProbe.latencyMs,
  };

  // 2. Database
  try {
    const { connectDB, isDBConnected } = await import("@/app/lib/config/db");
    const dbStart = Date.now();
    await connectDB();
    if (isDBConnected()) {
      results.database = {
        status: "operational",
        message: "MongoDB connection responsive",
        latencyMs: Date.now() - dbStart,
      };
    } else {
      results.database = {
        status: "warning",
        message: "MongoDB not connected — memory store fallback active",
        latencyMs: Date.now() - dbStart,
      };
    }
  } catch (err) {
    results.database = {
      status: "critical",
      message: `Database error: ${err instanceof Error ? err.message : "connection failed"}`,
    };
  }

  // 3. Public API / Cloud services
  const apiProbe = await probe(`${siteOrigin}/api/tools?limit=1`);
  results.cloudApi = {
    status: apiProbe.ok ? "operational" : "critical",
    message: apiProbe.ok
      ? `Public API responding (${apiProbe.detail}, ${apiProbe.latencyMs}ms)`
      : `Public API unreachable (${apiProbe.detail})`,
    latencyMs: apiProbe.latencyMs,
  };

  // 4. Domain + TLS
  const sslProbe = await probe(siteOrigin);
  const tlsOk = siteOrigin.startsWith("https://");
  results.domainSsl = {
    status: sslProbe.ok && tlsOk ? "operational" : sslProbe.ok ? "warning" : "critical",
    message: sslProbe.ok
      ? `${siteOrigin.replace(/^https?:\/\//, "")} resolves over ${tlsOk ? "TLS" : "plain HTTP"} (${sslProbe.latencyMs}ms)`
      : `Domain unreachable (${sslProbe.detail})`,
    latencyMs: sslProbe.latencyMs,
  };

  // Raise a critical alert for any failing service.
  for (const [service, result] of Object.entries(results)) {
    if (result.status === "critical") {
      await sendAlert({
        type: "SYSTEM_HEALTH",
        title: `Infrastructure Alert: ${service} Issue`,
        message: `Diagnostic check reported ${service} as ${result.status}: ${result.message}`,
        status: "critical",
        details: { service, ...result },
      });
    }
  }

  return {
    ...results,
    alertTarget: OFFICIAL_ALERT_EMAIL,
    lastChecked: new Date().toISOString(),
  };
}
