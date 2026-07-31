/**
 * Admin module smoke test (single foreground script).
 * Runs MongoMemoryServer, seeds data, then exercises every /api/admin route
 * with real Request objects. Run: npx tsx scripts/admin-smoke.ts
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { connectDB, isDBConnected } from "../app/lib/config/db.js";
import User from "../app/lib/models/User.js";
import Tool from "../app/lib/models/Tool.js";
import Category from "../app/lib/models/Category.js";
import Tag from "../app/lib/models/Tag.js";
import Review from "../app/lib/models/Review.js";
import BlogPost from "../app/lib/models/BlogPost.js";
import Subscriber from "../app/lib/models/NewsletterSubscriber.js";
import Submission from "../app/lib/models/Submission.js";
import Consultation from "../app/lib/models/Consultation.js";
import { logActivity } from "../app/lib/admin/activity.js";

async function main() {
  const mongo = await MongoMemoryServer.create({ instance: { port: 27017, dbName: "vaultoftools" } });
  process.env.MONGODB_URI = mongo.getUri("vaultoftools");

  await connectDB();
  if (!isDBConnected()) {
    console.error("DB not connected — aborting");
    process.exit(1);
  }

  const secret = "default-secret";
  function tokenFor(user: any) {
    return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "7d" });
  }

  async function call(method: string, path: string, token?: string, body?: any, id?: string) {
    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;
    if (body !== undefined) headers["content-type"] = "application/json";
    const req = new Request(`http://localhost${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const { pathToFileURL } = await import("node:url");
    const { join } = await import("node:path");
    const { existsSync } = await import("node:fs");
    const clean = path.split("?")[0];
    const segs = clean.split("/").filter(Boolean);
    let file = join(process.cwd(), "app", ...segs, "route.ts");
    if (!existsSync(file) && segs.length === 4 && segs[0] === "api") {
      file = join(process.cwd(), "app", ...segs.slice(0, 3), "[id]", "route.ts");
    }
    if (!existsSync(file)) throw new Error("No route file for " + path);
    const mod = await import(pathToFileURL(file).href as any);
    const handler = (mod as any)[method];
    const res = await handler(req, { params: Promise.resolve({ id }) });
    let json: any = null;
    try {
      json = await res.clone().json();
    } catch {}
    return { status: res.status, json };
  }

  let passed = 0;
  let failed = 0;
  function check(name: string, cond: boolean, extra?: any) {
    if (cond) {
      passed++;
      console.log(`PASS ${name}`);
    } else {
      failed++;
      console.log(`FAIL ${name}`, extra ? JSON.stringify(extra).slice(0, 300) : "");
    }
  }

  const superAdmin = await User.create({
    email: "root@vaultoftools.com",
    password: "password123",
    displayName: "Root",
    role: "super_admin",
  });
  const normalUser = await User.create({
    email: "user@example.com",
    password: "password123",
    displayName: "Normal",
    role: "user",
  });
  const adminToken = tokenFor(superAdmin);
  const userToken = tokenFor(normalUser);

  await Category.create({ name: "Writing", slug: "writing" });
  await Tag.create({ name: "Chatbot", slug: "chatbot" });
  await Tool.create({ name: "Demo AI", slug: "demo-ai", category: "Writing", pricing: "Free", status: "published", featured: true });
  await Tool.create({ name: "Draft Tool", slug: "draft-tool", category: "Writing", pricing: "Paid", status: "draft" });
  await Review.create({
    toolSlug: "demo-ai", toolName: "Demo AI", userId: normalUser._id,
    userName: "Normal", rating: 5, text: "Great", status: "pending",
  });
  await BlogPost.create({ slug: "hello-world", title: "Hello World", category: "General", content: [] });
  await Subscriber.create({ email: "sub@example.com", status: "subscribed", active: true });
  await Submission.create({
    userId: normalUser._id, name: "New Tool", website: "https://newtool.ai",
    category: "Writing", status: "pending",
  });
  await Consultation.create({ name: "Jane", email: "jane@example.com", message: "Need help" });
  await logActivity("root@vaultoftools.com", "seeded", "smoke");

  // --- Guard rails ---
  {
    const r = await call("GET", "/api/admin/overview");
    check("no token -> 401", r.status === 401);
    const r2 = await call("GET", "/api/admin/overview", userToken);
    check("non-admin -> 403", r2.status === 403);
  }

  // --- Overview ---
  {
    const r = await call("GET", "/api/admin/overview", adminToken);
    check("overview 200", r.status === 200);
    check("overview stats", r.json?.stats?.tools === 2 && r.json?.stats?.users === 2, r.json?.stats);
    check("overview pending", r.json?.pending?.reviews === 1 && r.json?.pending?.submissions === 1, r.json?.pending);
    check("overview toolStatus", r.json?.toolStatus?.published === 1 && r.json?.toolStatus?.draft === 1, r.json?.toolStatus);
    check("overview categoryChart", Array.isArray(r.json?.categoryChart) && r.json.categoryChart.length > 0, r.json?.categoryChart);
    check("overview activity", r.json?.activity?.length > 0, r.json?.activity);
  }

  // --- Tools ---
  let toolId = "";
  {
    const r = await call("GET", "/api/admin/tools?search=demo", adminToken);
    check("tools list 200", r.status === 200 && r.json?.total === 1);
    const c = await call("POST", "/api/admin/tools", adminToken, { name: "Brand New", category: "Writing", pricing: "Freemium" });
    check("tools create 201", c.status === 201, c.json);
    toolId = c.json?._id;
    const dup = await call("POST", "/api/admin/tools", adminToken, { name: "Brand New", slug: "brand-new" });
    check("tools duplicate slug 409", dup.status === 409);
    const u = await call("PATCH", `/api/admin/tools/${toolId}`, adminToken, { featured: true, sponsored: true, tags: ["ai"] }, toolId);
    check("tools update 200", u.status === 200 && u.json?.featured === true && u.json?.sponsored === true, u.json);
    const del = await call("DELETE", `/api/admin/tools/${toolId}`, adminToken, undefined, toolId);
    check("tools delete 200", del.status === 200);
  }

  // --- Users ---
  {
    const r = await call("GET", "/api/admin/users?role=user", adminToken);
    check("users list 200", r.status === 200 && r.json?.total === 1, r.json);
    const u = await call("PATCH", `/api/admin/users/${normalUser._id}`, adminToken, { status: "suspended" }, String(normalUser._id));
    check("users update status 200", u.status === 200 && u.json?.status === "suspended", u.json);
    await call("PATCH", `/api/admin/users/${normalUser._id}`, adminToken, { status: "active" }, String(normalUser._id));
    const self = await call("PATCH", `/api/admin/users/${superAdmin._id}`, adminToken, { status: "suspended" }, String(superAdmin._id));
    check("users cannot suspend self 400", self.status === 400);
    const del = await call("DELETE", `/api/admin/users/${superAdmin._id}`, adminToken, undefined, String(superAdmin._id));
    check("users cannot delete self 400", del.status === 400);
  }

  // --- Categories / Tags ---
  {
    const c = await call("POST", "/api/admin/categories", adminToken, { name: "Video Editing" });
    check("categories create 201", c.status === 201 && c.json?.slug === "video-editing", c.json);
    const r = await call("GET", "/api/admin/categories", adminToken);
    check("categories list 200", r.status === 200 && r.json?.total === 2, r.json);
    const t = await call("POST", "/api/admin/tags", adminToken, { name: "Voice Cloning" });
    check("tags create 201", t.status === 201 && t.json?.slug === "voice-cloning", t.json);
    const u = await call("PATCH", `/api/admin/tags/${t.json?._id}`, adminToken, { name: "Voice" }, t.json?._id);
    check("tags update 200", u.status === 200 && u.json?.name === "Voice");
  }

  // --- Reviews ---
  {
    const r = await call("GET", "/api/admin/reviews?status=pending", adminToken);
    check("reviews list 200", r.status === 200 && r.json?.total === 1, r.json);
    const id = r.json?.items?.[0]?._id;
    const u = await call("PATCH", `/api/admin/reviews/${id}`, adminToken, { status: "approved" }, id);
    check("reviews approve 200", u.status === 200 && u.json?.status === "approved", u.json);
    const tool = await Tool.findOne({ slug: "demo-ai" });
    check("approve updates tool rating", tool?.rating === 5 && tool?.reviews === 1, tool);
  }

  // --- Posts ---
  {
    const c = await call("POST", "/api/admin/posts", adminToken, { title: "Second Post" });
    check("posts create 201", c.status === 201 && c.json?.slug === "second-post", c.json);
    const r = await call("GET", "/api/admin/posts", adminToken);
    check("posts list 200", r.status === 200 && r.json?.total === 2, r.json);
  }

  // --- Submissions (approve publishes to catalog) ---
  {
    const r = await call("GET", "/api/admin/submissions?status=pending", adminToken);
    check("submissions list 200", r.status === 200 && r.json?.total === 1, r.json);
    const id = r.json?.items?.[0]?._id;
    const u = await call("PATCH", `/api/admin/submissions/${id}`, adminToken, { status: "approved" }, id);
    check("submissions approve 200", u.status === 200 && u.json?.status === "approved", u.json);
    const published = await Tool.findOne({ slug: "new-tool" });
    check("approve publishes tool", !!published, published);
  }

  // --- Subscribers ---
  {
    const c = await call("POST", "/api/admin/subscribers", adminToken, { email: "NEW@example.com" });
    check("subscribers create 201", c.status === 201 && c.json?.email === "new@example.com", c.json);
    const r = await call("GET", "/api/admin/subscribers", adminToken);
    check("subscribers list 200", r.status === 200 && r.json?.total === 2, r.json);
  }

  // --- Consultations ---
  {
    const r = await call("GET", "/api/admin/consultations", adminToken);
    check("consultations list 200", r.status === 200 && r.json?.total === 1, r.json);
    const id = r.json?.items?.[0]?._id;
    const u = await call("PATCH", `/api/admin/consultations/${id}`, adminToken, { status: "qualified" }, id);
    check("consultations update 200", u.status === 200 && u.json?.status === "qualified", u.json);
  }

  // --- Settings ---
  {
    const g = await call("GET", "/api/admin/settings", adminToken);
    check("settings get 200", g.status === 200 && g.json?.general?.siteName === "Vault of Tools", g.json);
    const u = await call("PUT", "/api/admin/settings", adminToken, { general: { siteName: "VoT", itemsPerPage: 24 } });
    check("settings put 200", u.status === 200 && u.json?.general?.siteName === "VoT" && u.json?.general?.itemsPerPage === 24, u.json);
    const g2 = await call("GET", "/api/admin/settings", adminToken);
    check("settings persisted", g2.json?.general?.siteName === "VoT");
  }

  // --- Activity ---
  {
    const r = await call("GET", "/api/admin/activity", adminToken);
    check("activity list 200", r.status === 200 && r.json?.total >= 2, r.json);
  }

  // --- Export / Import / Backup ---
  {
    const exp = await call("GET", "/api/admin/export?type=tools", adminToken);
    check("export csv 200", exp.status === 200, exp.json);
    const imp = await call("POST", "/api/admin/import", adminToken, {
      csv: "name,slug,category,pricing,status\nCSV Tool,csv-tool,Writing,Free,published",
    });
    check("import csv 200", imp.status === 200 && imp.json?.imported === 1, imp.json);
    const found = await Tool.findOne({ slug: "csv-tool" });
    check("imported tool exists", !!found);
    const bak = await call("GET", "/api/admin/backup", adminToken);
    check("backup 200", bak.status === 200, bak.json);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  await mongo.stop();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
