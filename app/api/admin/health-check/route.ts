import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import {
  getRecentAlerts,
  sendAlert,
  runDiagnostics,
  OFFICIAL_ALERT_EMAIL,
} from "@/app/lib/alerts";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSuperAdmin(request);

    const diagnostics = await runDiagnostics();
    const alerts = await getRecentAlerts();

    return NextResponse.json({
      diagnostics,
      alerts,
      officialEmail: OFFICIAL_ALERT_EMAIL,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrSuperAdmin(request);
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === "test_alert") {
      const alert = await sendAlert({
        type: "SYSTEM_HEALTH",
        title: "Test System Alert Verified",
        message: `Diagnostic alert successfully sent to primary notification address: ${OFFICIAL_ALERT_EMAIL}. System infrastructure is functional.`,
        status: "delivered",
        details: { triggeredBy: "Admin Console", timestamp: new Date().toISOString() },
      });

      return NextResponse.json({
        success: true,
        message: `Test alert dispatched to ${OFFICIAL_ALERT_EMAIL}`,
        alert,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return errorResponse(err);
  }
}
