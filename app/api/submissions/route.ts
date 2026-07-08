import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Submission from "@/app/lib/models/Submission";
import { authenticate } from "@/app/lib/middleware/auth";
import memoryStore from "@/app/lib/data/memoryStore";

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const { user } = await authenticate(request);
    const { name, website, category, description, pricing, founderName, companyName, launchYear, email } = await request.json();

    if (!name || !website || !category || !description) {
      return NextResponse.json({ error: "name, website, category and description are required" }, { status: 400 });
    }

    if (isDBConnected()) {
      const submission = await Submission.create({
        userId: user._id, name, website, category, description,
        pricing, founderName, companyName, launchYear,
        email: email || user.email,
      });
      return NextResponse.json(submission, { status: 201 });
    }

    const submission = await memoryStore.createSubmission({
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
  await connectDB();
  try {
    const { user } = await authenticate(request);

    if (isDBConnected()) {
      const submissions = await Submission.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .select("-__v");
      return NextResponse.json(submissions);
    }

    const submissions = await memoryStore.getUserSubmissions(user._id);
    return NextResponse.json(submissions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
