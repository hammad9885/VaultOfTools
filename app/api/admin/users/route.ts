import { connectDB, isDBConnected } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { clampPage } from "@/app/lib/admin/utils";
import { ensureAdminUser } from "@/app/lib/admin/session";
import memoryStore from "@/app/lib/data/memoryStore";

export const dynamic = "force-dynamic";

function uniqueMemoryUsers() {
  const byId = new Map<string, any>();
  for (const user of memoryStore.users.values()) {
    if (user?._id) byId.set(String(user._id), user);
  }
  return [...byId.values()];
}

function filterMemoryUsers(opts: {
  search?: string;
  role?: string;
  status?: string;
  page: number;
  limit: number;
}) {
  let list = uniqueMemoryUsers();
  if (opts.role) list = list.filter((u) => u.role === opts.role);
  if (opts.status) list = list.filter((u) => (u.status || "active") === opts.status);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (u) =>
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.displayName || "").toLowerCase().includes(q) ||
        String(u.name || "").toLowerCase().includes(q)
    );
  }
  list.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / Math.max(1, opts.limit)));
  const safePage = clampPage(opts.page, pages);
  const items = list.slice((safePage - 1) * opts.limit, safePage * opts.limit).map((u) => {
    const { password, ...rest } = u;
    return {
      ...rest,
      status: rest.status || "active",
      role: rest.role || "user",
    };
  });
  return { items, total, page: safePage, pages };
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();
    // Ensure at least the configured admin exists in memory when Mongo is down.
    await ensureAdminUser();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || undefined;
    const role = url.searchParams.get("role")?.trim() || undefined;
    const status = url.searchParams.get("status")?.trim() || undefined;
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

    // Hard gate: never call Mongoose user queries unless the connection is fully open.
    if (!isDBConnected()) {
      return Response.json(filterMemoryUsers({ search, role, status, page, limit }));
    }

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    try {
      const [total, items] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("-password")
          .lean(),
      ]);
      const pages = Math.max(1, Math.ceil(total / limit));
      return Response.json({ items, total, page: clampPage(page, pages), pages });
    } catch (err: any) {
      console.warn("admin/users Mongo failed, using memory:", err?.message || err);
      return Response.json(filterMemoryUsers({ search, role, status, page, limit }));
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();
    const role = String(body.role || "user");
    const status = String(body.status || "active");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    if (!isDBConnected()) {
      const existing = await memoryStore.findUserByEmail(email);
      if (existing) {
        return Response.json({ error: "User already exists" }, { status: 409 });
      }
      const user = await memoryStore.createUser({
        email,
        password,
        displayName: displayName || email.split("@")[0],
        role,
      });
      user.status = status;
      const { password: _pw, ...rest } = user;
      return Response.json(rest, { status: 201 });
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return Response.json({ error: "User already exists" }, { status: 409 });
      }
      const user = await User.create({
        email,
        password,
        displayName: displayName || email.split("@")[0],
        role,
        status,
      });
      const raw = await User.findOne({ _id: String(user._id) }).select("-password").lean();
      return Response.json(raw, { status: 201 });
    } catch (err: any) {
      if (err?.status === 409 || /already exists/i.test(String(err?.message))) {
        return Response.json({ error: "User already exists" }, { status: 409 });
      }
      console.warn("admin/users create Mongo failed, using memory:", err?.message || err);
      const existing = await memoryStore.findUserByEmail(email);
      if (existing) {
        return Response.json({ error: "User already exists" }, { status: 409 });
      }
      const user = await memoryStore.createUser({
        email,
        password,
        displayName: displayName || email.split("@")[0],
        role,
      });
      user.status = status;
      const { password: _pw, ...rest } = user;
      return Response.json(rest, { status: 201 });
    }
  } catch (err: any) {
    return errorResponse(err);
  }
}
