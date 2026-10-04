import { NextRequest, NextResponse } from "next/server";
import { alertContactQuery } from "@/app/lib/alerts";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip, "contact_query", "contact", { max: 5, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many messages sent. Please wait a minute." }, { status: 429 });
    }

    const { name, email, subject, message } = await request.json().catch(() => ({}));
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
    }

    await alertContactQuery({
      name: name || "Anonymous User",
      email: String(email).trim().toLowerCase(),
      subject: subject || "Website Inquiry",
      message: String(message).trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent to our team at vaultoftools@gmail.com. We will get back to you shortly!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
