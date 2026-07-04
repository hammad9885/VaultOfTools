import { NextRequest, NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import NewsletterSubscriber from "@/app/lib/models/NewsletterSubscriber";
import memoryStore from "@/app/lib/data/memoryStore";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    if (isDBConnected()) {
      const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
      if (existing) return NextResponse.json({ success: true, message: "Already subscribed" });
      await NewsletterSubscriber.create({ email });
    } else {
      const existing = await memoryStore.findSubscriber(email);
      if (existing) return NextResponse.json({ success: true, message: "Already subscribed" });
      await memoryStore.addSubscriber(email);
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
