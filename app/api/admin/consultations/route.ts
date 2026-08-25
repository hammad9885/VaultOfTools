import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Consultation from "@/app/lib/models/Consultation";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { clampPage } from "@/app/lib/admin/utils";
import memoryStore from "@/app/lib/data/memoryStore";

export const dynamic = "force-dynamic";

async function filterMemoryConsultations(opts: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  let list = await memoryStore.getConsultations(
    opts.status ? { status: opts.status } : {}
  );
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (c: any) =>
        String(c.name || "").toLowerCase().includes(q) ||
        String(c.email || "").toLowerCase().includes(q) ||
        String(c.company || "").toLowerCase().includes(q)
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
      return Response.json(await filterMemoryConsultations({ search, status, page, limit }));
    }

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    try {
      const [total, items] = await Promise.all([
        Consultation.countDocuments(filter),
        Consultation.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ]);
      const pages = Math.max(1, Math.ceil(total / limit));
      return Response.json({ items, total, page: clampPage(page, pages), pages });
    } catch (err: any) {
      console.warn("admin/consultations Mongo failed, using memory:", err?.message || err);
      return Response.json(await filterMemoryConsultations({ search, status, page, limit }));
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}
