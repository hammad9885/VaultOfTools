import { NextRequest, NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import Consultation from "@/app/lib/models/Consultation";
import memoryStore from "@/app/lib/data/memoryStore";
import { authenticate } from "@/app/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email and message are required" }, { status: 400 });
    }

    if (isDBConnected()) {
      await Consultation.create({ name, email, company, message });
    } else {
      await memoryStore.createConsultation({ name, email, company, message });
    }

    return NextResponse.json({ success: true, message: "Consultation request received" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

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
