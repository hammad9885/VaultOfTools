import { connectDB } from "@/app/lib/config/db";
import Submission from "@/app/lib/models/Submission";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage, slugify } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { website: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["pending", "approved", "rejected"].includes(status)) filter.status = status;

    const [total, items] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const pages = Math.max(1, Math.ceil(total / limit));
    return Response.json({ items, total, page: clampPage(page, pages), pages });
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json();
    const name = String(body.name || "").trim();
    const website = String(body.website || "").trim();
    const category = String(body.category || "Uncategorized").trim();
    if (!name || !website) {
      return Response.json({ error: "Name and website are required" }, { status: 400 });
    }

    const submission = await Submission.create({
      userId: user._id,
      name,
      website,
      category,
      description: body.description || "",
      pricing: body.pricing || "",
      founderName: body.founderName || "",
      companyName: body.companyName || "",
      launchYear: body.launchYear || "",
      email: body.email || "",
      status: "approved",
    });

    if (body.publish) {
      const slug = slugify(name);
      const existing = await Tool.findOne({ slug });
      if (!existing) {
        await Tool.create({
          slug,
          name,
          category,
          url: website,
          website,
          shortDescription: body.description || "",
          pricing: body.pricing || "Free",
          status: "published",
          publishDate: new Date(),
        });
      }
    }

    await logActivity(user.email, "created", `submission:${submission._id}`, { name });
    return Response.json(submission, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}
