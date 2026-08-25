import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Submission from "@/app/lib/models/Submission";
import Tool from "@/app/lib/models/Tool";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import { clampPage, slugify } from "@/app/lib/admin/utils";
import memoryStore from "@/app/lib/data/memoryStore";

export const dynamic = "force-dynamic";

async function filterMemorySubmissions(opts: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  let list = await memoryStore.getAllSubmissions(
    opts.status ? { status: opts.status } : {}
  );
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (s: any) =>
        String(s.name || "").toLowerCase().includes(q) ||
        String(s.website || "").toLowerCase().includes(q) ||
        String(s.category || "").toLowerCase().includes(q) ||
        String(s.email || "").toLowerCase().includes(q)
    );
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / Math.max(1, opts.limit)));
  const safePage = clampPage(opts.page, pages);
  const items = list.slice((safePage - 1) * opts.limit, safePage * opts.limit);
  return { items, total, page: safePage, pages };
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const status = url.searchParams.get("status")?.trim() || undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    if (!isDBConnected()) {
      return Response.json(await filterMemorySubmissions({ search, status, page, limit }));
    }

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

    try {
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
      console.warn("admin/submissions Mongo failed, using memory:", err?.message || err);
      return Response.json(await filterMemorySubmissions({ search, status, page, limit }));
    }
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

    const payload = {
      userId: String(user._id),
      name,
      website,
      category,
      description: body.description || "",
      pricing: body.pricing || "",
      founderName: body.founderName || "",
      companyName: body.companyName || "",
      launchYear: body.launchYear || "",
      email: body.email || "",
      status: "approved" as const,
    };

    if (!isDBConnected()) {
      const submission = await memoryStore.createSubmission(payload);
      await logActivity(user.email, "created", `submission:${submission._id}`, { name });
      return Response.json(submission, { status: 201 });
    }

    try {
      const submission = await Submission.create(payload);

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
            description: body.description || "",
            desc: body.description || "",
            pricing: body.pricing || "Free",
            status: "published",
            publishDate: new Date(),
          });
        }
      }

      await logActivity(user.email, "created", `submission:${submission._id}`, { name });
      return Response.json(submission, { status: 201 });
    } catch (err: any) {
      console.warn("admin/submissions create Mongo failed, using memory:", err?.message || err);
      const submission = await memoryStore.createSubmission(payload);
      await logActivity(user.email, "created", `submission:${submission._id}`, { name });
      return Response.json(submission, { status: 201 });
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}
