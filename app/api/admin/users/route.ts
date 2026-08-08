import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/User";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { clampPage } from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const role = url.searchParams.get("role")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 10));

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
      return Response.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!["user", "admin", "moderator", "super_admin"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!["active", "suspended"].includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const user = new User({
      email,
      password,
      displayName: displayName || email.split("@")[0],
      name: displayName || email.split("@")[0],
      role,
      status,
    });
    await user.save();

    const raw = await User.findOne({ _id: String(user._id) });
    const created = raw && typeof raw.toObject === "function" ? raw.toObject() : raw;
    if (created) delete created.password;
    return Response.json(created, { status: 201 });
  } catch (err: any) {
    return errorResponse(err);
  }
}
