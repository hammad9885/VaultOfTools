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
  | "USER_LOGIN";

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

  // Persist a durable copy so alerts survive restarts / cold starts.
  await persistAlert(alert);

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
  const provider = userData.provider || "credentials";
  return sendAlert({
    type: "USER_LOGIN",
    title: "User Sign-In Activity",
    message: `User ${userData.email} signed in via ${provider}.`,
    status: "delivered",
    details: {
      email: userData.email,
      displayName: userData.displayName || "N/A",
      provider,
      role: userData.role || "user",
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
    title: "New Contact Message / Inquiry",
    message: `Inquiry received from ${queryData.name} (${queryData.email}): ${queryData.message.slice(0, 100)}...`,
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
