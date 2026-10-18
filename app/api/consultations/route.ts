import { NextRequest, NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import Consultation from "@/app/lib/models/Consultation";
import memoryStore from "@/app/lib/data/memoryStore";
import { requireAdminOrSuperAdmin } from "@/app/lib/admin/auth";
import { getClientIp, checkRateLimit } from "@/app/lib/data/activity-guard";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit public submissions (VOT-SEC-022)
    const rateCheck = checkRateLimit(ip, "consultation_create", "public", { max: 5, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many consultation requests. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, company, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email and message are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const cleanName = String(name).trim().slice(0, 100);
    const cleanCompany = company ? String(company).trim().slice(0, 100) : "";
    const cleanMessage = String(message).trim().slice(0, 2000);

    if (isDBConnected()) {
      await Consultation.create({
        name: cleanName,
        email: normalizedEmail,
        company: cleanCompany,
        message: cleanMessage,
      });
    } else {
      await memoryStore.createConsultation({
        name: cleanName,
        email: normalizedEmail,
        company: cleanCompany,
        message: cleanMessage,
      });
    }

    const { alertConsultationRequest } = await import("@/app/lib/alerts");
    await alertConsultationRequest({
      fullName: cleanName,
      workEmail: normalizedEmail,
      company: cleanCompany,
      projectDetails: cleanMessage,
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Consultation request received" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSuperAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const filter: any = {};
    if (status) filter.status = status;

    let consultations;
    if (isDBConnected()) {
      consultations = await Consultation.find(filter).sort({ createdAt: -1 }).select("-__v");
    } else {
      consultations = await memoryStore.getConsultations(filter);
    }

    return NextResponse.json(consultations);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
