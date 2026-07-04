import { NextRequest, NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import Consultation from "@/app/lib/models/Consultation";
import memoryStore from "@/app/lib/data/memoryStore";
import { authenticate } from "@/app/lib/middleware/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await authenticate(request);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();
    if (!["new", "contacted", "qualified", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let consultation;
    if (isDBConnected()) {
      consultation = await Consultation.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      consultation = await memoryStore.updateConsultationStatus(id, status);
    }

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
    }

    return NextResponse.json(consultation);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
