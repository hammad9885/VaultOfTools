import { connectDB, isDBConnected } from "../config/db";
import Tool from "../models/Tool";
import memoryStore from "./memoryStore";
import { staticToolCatalog } from "./static-tool-catalog";

export type ToolEngagement = {
  slug: string;
  clicks: number;
  upvotes: number;
};

type EngagementMap = Map<string, ToolEngagement>;

function store(): EngagementMap {
  const g = globalThis as any;
  if (!g.__votToolEngagement) g.__votToolEngagement = new Map<string, ToolEngagement>();
  return g.__votToolEngagement as EngagementMap;
}

function seedFromTool(raw: any): ToolEngagement {
  const slug = String(raw?.slug || "").trim();
  return {
    slug,
    clicks: Math.max(0, Number(raw?.clicks || 0)),
    upvotes: Math.max(0, Number(raw?.upvotes || 0)),
  };
}

/** Trend score: upvotes weigh more than clicks. */
export function trendScore(clicks: number, upvotes: number) {
  return upvotes * 5 + clicks;
}

async function seedRow(slug: string): Promise<ToolEngagement> {
  await connectDB();

  if (isDBConnected()) {
    try {
      const rows = await Tool.find({ slug }).select("slug clicks upvotes").lean();
      const tool = rows[0];
      if (tool) return seedFromTool(tool);
    } catch {
      // fall through
    }
  }

  const memory = await memoryStore.getToolBySlug(slug);
  if (memory) return seedFromTool(memory);

  const staticHit = staticToolCatalog.find((t) => t.slug === slug);
  if (staticHit) return seedFromTool(staticHit);

  return { slug, clicks: 0, upvotes: 0 };
}

export async function getEngagement(slug: string): Promise<ToolEngagement> {
  const clean = decodeURIComponent(slug).trim();
  const cached = store().get(clean);
  if (cached) return { ...cached };

  const row = await seedRow(clean);
  store().set(clean, row);
  return { ...row };
}

export async function getAllEngagement(): Promise<Map<string, ToolEngagement>> {
  await connectDB();
  const map = new Map<string, ToolEngagement>();

  for (const t of staticToolCatalog) {
    map.set(t.slug, seedFromTool(t));
  }

  if (isDBConnected()) {
    try {
      const tools = await Tool.find({}).select("slug clicks upvotes").lean();
      for (const t of tools) {
        if (!t?.slug) continue;
        const prev = map.get(t.slug);
        const next = seedFromTool(t);
        map.set(t.slug, {
          slug: t.slug,
          clicks: Math.max(prev?.clicks || 0, next.clicks),
          upvotes: Math.max(prev?.upvotes || 0, next.upvotes),
        });
      }
    } catch {
      // ignore
    }
  }

  for (const t of (await memoryStore.getTools({})) as any[]) {
    if (!t?.slug) continue;
    const prev = map.get(t.slug);
    map.set(t.slug, {
      slug: t.slug,
      clicks: Math.max(prev?.clicks || 0, Number(t.clicks || 0)),
      upvotes: Math.max(prev?.upvotes || 0, Number(t.upvotes || 0)),
    });
  }

  // Live in-memory counters win (they include user clicks/upvotes this process).
  for (const [slug, row] of store().entries()) {
    const prev = map.get(slug);
    map.set(slug, {
      slug,
      clicks: Math.max(prev?.clicks || 0, row.clicks),
      upvotes: Math.max(prev?.upvotes || 0, row.upvotes),
    });
  }

  for (const [slug, row] of map.entries()) {
    const live = store().get(slug);
    if (!live) store().set(slug, row);
  }

  return map;
}

async function persist(slug: string, patch: { clicks?: number; upvotes?: number }) {
  await connectDB();
  if (isDBConnected()) {
    try {
      const existing = await Tool.findOne({ slug });
      if (existing) {
        await Tool.updateOne(
          { slug },
          {
            $set: {
              ...(patch.clicks !== undefined ? { clicks: patch.clicks } : {}),
              ...(patch.upvotes !== undefined ? { upvotes: patch.upvotes } : {}),
            },
          }
        );
        return;
      }
    } catch {
      // fall through
    }
  }

  const memory = await memoryStore.getToolBySlug(slug);
  if (memory) {
    if (patch.clicks !== undefined) memory.clicks = patch.clicks;
    if (patch.upvotes !== undefined) memory.upvotes = patch.upvotes;
  }
}

export async function recordToolClick(slug: string): Promise<ToolEngagement> {
  const clean = decodeURIComponent(slug).trim();
  if (!clean) throw Object.assign(new Error("slug required"), { status: 400 });

  const current = await getEngagement(clean);
  const next = { ...current, clicks: current.clicks + 1 };
  store().set(clean, next);
  await persist(clean, { clicks: next.clicks });
  return next;
}

export async function toggleToolUpvote(
  slug: string,
  direction: "up" | "down" = "up"
): Promise<ToolEngagement & { voted: boolean }> {
  const clean = decodeURIComponent(slug).trim();
  if (!clean) throw Object.assign(new Error("slug required"), { status: 400 });

  const current = await getEngagement(clean);
  const nextUpvotes =
    direction === "down" ? Math.max(0, current.upvotes - 1) : current.upvotes + 1;
  const next = { ...current, upvotes: nextUpvotes };
  store().set(clean, next);
  await persist(clean, { upvotes: next.upvotes });
  return { ...next, voted: direction === "up" };
}
