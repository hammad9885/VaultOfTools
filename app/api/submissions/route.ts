import { NextRequest, NextResponse } from "next/server";
import Submission from "@/app/lib/models/Submission";
import { authenticate } from "@/app/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    const { name, website, category, description, pricing, founderName, companyName, launchYear, email } = await request.json();

    if (!name || !website || !category || !description) {
      return NextResponse.json({ error: "name, website, category and description are required" }, { status: 400 });
    }

    const submission = await Submission.create({
      userId: user._id, name, website, category, description,
      pricing, founderName, companyName, launchYear,
      email: email || user.email,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate(request);
    const submissions = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select("-__v");
    return NextResponse.json(submissions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
