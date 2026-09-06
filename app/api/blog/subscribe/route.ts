import { NextRequest, NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import memoryStore from "@/app/lib/data/memoryStore";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit newsletter subscriptions (VOT-SEC-022)
    const rateCheck = checkRateLimit(ip, "newsletter_subscribe", "blog", { max: 5, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const { email } = await request.json().catch(() => ({}));
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (isDBConnected()) {
      const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
      if (existing) return NextResponse.json({ success: true, message: "Already subscribed" });
      await NewsletterSubscriber.create({ email: normalizedEmail });
    } else {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Database temporarily unavailable" }, { status: 503 });
      }
      const existing = await memoryStore.findSubscriber(normalizedEmail);
      if (existing) return NextResponse.json({ success: true, message: "Already subscribed" });
      await memoryStore.addSubscriber(normalizedEmail);
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
