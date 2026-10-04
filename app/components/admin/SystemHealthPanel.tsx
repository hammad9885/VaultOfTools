"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Server,
  Bell,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { adminApi } from "../../lib/admin/api";
import { Card } from "../admin/cards";
import { OFFICIAL_EMAIL } from "../../lib/constants";

type ServiceStatus = {
  status: string;
  message: string;
  latencyMs?: number;
};

type ServiceKey = "vercelHosting" | "cloudApi" | "database" | "domainSsl";

type Diagnostics = Record<ServiceKey, ServiceStatus> & {
  alertTarget?: string;
  lastChecked: string;
};

type AlertRecord = {
  id: string;
  type: string;
  title: string;
  message: string;
  recipient: string;
  timestamp: string;
  status: string;
};

const SERVICES: { key: ServiceKey; label: string; icon: typeof Server }[] = [
  { key: "vercelHosting", label: "Vercel / Hosting", icon: Server },
  { key: "cloudApi", label: "Cloud / API", icon: Activity },
  { key: "database", label: "Database (MongoDB)", icon: Server },
  { key: "domainSsl", label: "Domain / SSL", icon: CheckCircle2 },
];

const STATUS_STYLES: Record<string, { dot: string; text: string; Icon: typeof CheckCircle2 }> = {
  operational: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
  },
  critical: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    Icon: XCircle,
  },
};

export function SystemHealthPanel() {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getSystemHealth()
      .then((data) => {
        if (cancelled) return;
        setDiagnostics(data.diagnostics);
        setAlerts(data.alerts || []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load system health");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runDiagnosticsNow = async () => {
    setRunning(true);
    setError("");
    try {
      const data = await adminApi.getSystemHealth();
      setDiagnostics(data.diagnostics);
      setAlerts(data.alerts || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to run diagnostics");
    } finally {
      setRunning(false);
    }
  };

  const sendTestAlert = async () => {
    setTesting(true);
    try {
      const result = await adminApi.sendTestAlert();
      setAlerts((prev) => [result.alert, ...prev]);
      toast.success("Test alert sent", {
        description: result.message || `Alert dispatched to ${OFFICIAL_EMAIL}.`,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send test alert");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card
      title="System Health & Infrastructure Alerts"
      description={`Live status checks. All alerts are delivered to ${OFFICIAL_EMAIL}.`}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runDiagnosticsNow}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            {running ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            Run Diagnostics
          </button>
          <button
            type="button"
            onClick={sendTestAlert}
            disabled={testing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {testing ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
            Send Test Alert
          </button>
        </div>
      }
    >
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Running diagnostics…
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICES.map(({ key, label, icon: Icon }) => {
            const service = diagnostics?.[key];
            const style = STATUS_STYLES[service?.status || "operational"];
            const StatusIcon = style.Icon;

            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-card p-3.5 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Icon size={15} className="text-muted-foreground" />
                    {label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${style.text}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <StatusIcon size={12} />
                    {service?.status || "unknown"}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {service?.message || "No diagnostic data yet."}
                </p>
                {typeof service?.latencyMs === "number" && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Latency: {service.latencyMs}ms
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {diagnostics?.lastChecked && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Last checked {new Date(diagnostics.lastChecked).toLocaleString()} · Alert target{" "}
          <span className="font-medium text-foreground">
            {diagnostics.alertTarget || OFFICIAL_EMAIL}
          </span>
        </p>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Recent alerts
        </p>
        <ul className="mt-2 divide-y divide-border">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{alert.title}</p>
                <p className="truncate text-xs text-muted-foreground">{alert.message}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  → {alert.recipient}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
          {alerts.length === 0 && (
            <li className="py-4 text-center text-xs text-muted-foreground">
              No alerts recorded yet.
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
}