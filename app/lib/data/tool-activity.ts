import { connectDB, isDBConnected } from "../config/db";
import { isFirestore } from "../config/provider";
import ToolActivity from "../models/ToolActivity";
import memoryStore from "./memoryStore";
import { staticToolCatalog } from "./static-tool-catalog";

export type ActivityCounts = {
  views: number;
  visits: number;
  votes: number;
  searches: number;
  ratings: number;
  ratingSum: number;
};

export type ActivityBucket = ActivityCounts & { date: string; slug: string };

const EMPTY: ActivityCounts = {
  views: 0,
  visits: 0,
  votes: 0,
  searches: 0,
  ratings: 0,
  ratingSum: 0,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HORIZON_DAYS = 30;

function dayKeyAt(offsetMs: number): string {
  return new Date(Date.now() - offsetMs).toISOString().slice(0, 10);
}

type MetricKey = keyof ActivityCounts;

/** In-memory live buckets keyed by `${slug}|${date}`. */
export function liveBuckets(): Map<string, ActivityBucket> {
  const g = globalThis as any;
  if (!g.__votActivityBuckets) g.__votActivityBuckets = new Map<string, ActivityBucket>();
  return g.__votActivityBuckets as Map<string, ActivityBucket>;
}

function emptyBucket(slug: string, date = dayKeyAt(0)): ActivityBucket {
  return { slug, date, ...EMPTY };
}

function mergeCounts(into: ActivityCounts, from: ActivityCounts) {
  for (const key of ["views", "visits", "votes", "searches", "ratings", "ratingSum"] as const) {
    into[key] = Math.max(0, Number(into[key] || 0) + Number(from[key] || 0));
  }
}

function bucketRowsToMap(rows: any[]): Map<string, ActivityBucket> {
  const map = new Map<string, ActivityBucket>();
  for (const r of rows) {
    if (!r?.slug || !r?.date) continue;
    const key = `${r.slug}|${r.date}`;
    const b: ActivityBucket = {
      slug: r.slug,
      date: r.date,
      views: Number(r.views || 0),
      visits: Number(r.visits || 0),
      votes: Number(r.votes || 0),
      searches: Number(r.searches || 0),
      ratings: Number(r.ratings || 0),
      ratingSum: Number(r.ratingSum || 0),
    };
    const existing = map.get(key);
    if (existing) mergeCounts(existing, b);
    else map.set(key, b);
  }
  return map;
}

/** Persisted rows (last 30 days) for a slug or all slugs. */
async function loadMongoRows(slug?: string): Promise<Map<string, ActivityBucket>> {
  if (isFirestore()) return new Map();
  await connectDB();
  if (!isDBConnected()) return new Map();
  const filter: any = slug ? { slug, date: { $gte: dayKeyAt(HORIZON_DAYS * DAY_MS) } } : { date: { $gte: dayKeyAt(HORIZON_DAYS * DAY_MS) } };
  try {
    const rows = await ToolActivity.find(filter)
      .select("slug date views visits votes searches ratings ratingSum")
      .lean();
    return bucketRowsToMap(rows);
  } catch {
    return new Map();
  }
}

/** A synthetic recent past so genuinely brand-new tools show non-zero baseline. */
function distributeLifetime(
  slug: string,
  clicks: number,
  upvotes: number,
  rating = 0,
  createdAt?: string | Date | null
): ActivityBucket[] {
  const buckets: ActivityBucket[] = [];
  const clicksBase = Math.max(2, Math.round(clicks * 0.06) + 2);
  const votesBase = Math.max(1, Math.round(upvotes * 0.05) + 1);
  const createdAtTime = createdAt ? new Date(String(createdAt)).getTime() : 0;
  const ageDays = createdAtTime > 0 ? Math.max(0, (Date.now() - createdAtTime) / DAY_MS) : 14;
  // New tools: spread their (likely small) counts mostly into recent days.
  const spread = Math.min(7, Math.max(3, Math.round(ageDays) || 7));
  for (let i = 0; i < spread; i++) {
    const decay = 0.5 + ((spread - i) / spread) * 0.5;
    const views = Math.max(1, Math.round(clicksBase * decay));
    const votes = Math.max(0, Math.round(votesBase * decay));
    const ratings = Math.max(0, Math.round(views / 10));
    buckets.push({
      slug,
      date: dayKeyAt(i * DAY_MS),
      views,
      visits: Math.max(0, Math.round(views / 4)),
      votes,
      searches: 0,
      ratings,
      ratingSum: Math.round(ratings * rating),
    });
  }
  return buckets;
}

/** 30-day buckets for one slug (Mongo + live, with lifetime fallback seed). */
export async function getActivityBuckets(slug: string): Promise<ActivityBucket[]> {
  const clean = decodeURIComponent(slug).trim();
  if (!clean) return [];
  const map = new Map<string, ActivityBucket>();
  for (const b of (await loadMongoRows(clean)).values()) {
    map.set(`${b.slug}|${b.date}`, b);
  }
  for (const [key, b] of liveBuckets().entries()) {
    const [liveSlug, liveDate] = key.split("|");
    if (liveSlug !== clean || b.date !== liveDate) continue;
    const existing = map.get(key);
    if (existing) {
      const patched = { ...existing, views: 0, visits: 0, votes: 0, searches: 0, ratings: 0 };
      mergeCounts(patched, b);
      map.set(key, patched);
    } else {
      map.set(key, { ...b });
    }
  }
  let rows = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  if (rows.length > 0) return rows;

  const memory = await memoryStore.getToolBySlug(clean);
  if (memory) {
    return distributeLifetime(
      clean,
      Number(memory.clicks || 0),
      Number(memory.upvotes || 0),
      Number(memory.rating || 0),
      memory.createdAt
    );
  }
  const staticHit = staticToolCatalog.find((t) => t.slug === clean);
  if (staticHit) {
    return distributeLifetime(
      clean,
      Number(staticHit.clicks || 0),
      Number(staticHit.upvotes || 0),
      Number(staticHit.rating || 0)
    );
  }
  return [];
}

/** All 30-day buckets for all known slugs (Mongo + live + static seed). */
export async function getAllActivityBuckets(): Promise<Map<string, ActivityBucket[]>> {
  const map = await loadMongoRows();

  // Stamp live buckets over persisted rows for the same day.
  for (const [key, b] of liveBuckets().entries()) {
    const [slug, date] = key.split("|");
    if (!slug || !date) continue;
    const existing = map.get(key);
    if (existing) {
      const patched = { ...existing, views: 0, visits: 0, votes: 0, searches: 0, ratings: 0 };
      mergeCounts(patched, b);
      map.set(key, patched);
    } else {
      map.set(key, { ...b });
    }
  }

  const bySlug = new Map<string, ActivityBucket[]>();
  const seen = new Set<string>();
  for (const b of map.values()) {
    seen.add(b.slug);
    if (!bySlug.has(b.slug)) bySlug.set(b.slug, []);
    bySlug.get(b.slug)!.push(b);
  }

  // Static catalog entries without activity get a seeded baseline.
  const memoryTools = (await memoryStore.getTools({})) as any[];
  const seeded = new Map<string, { clicks: number; upvotes: number; rating: number; createdAt?: string | Date | null }>();
  for (const t of staticToolCatalog) {
    seeded.set(t.slug, {
      clicks: Number(t.clicks || 0),
      upvotes: Number(t.upvotes || 0),
      rating: Number(t.rating || 0),
    });
  }
  for (const t of memoryTools) {
    if (!t?.slug) continue;
    if (bySlug.has(t.slug)) continue;
    seeded.set(t.slug, {
      clicks: Number(t.clicks || 0),
      upvotes: Number(t.upvotes || 0),
      rating: Number(t.rating || 0),
      createdAt: t.createdAt,
    });
  }
  for (const [slug, meta] of seeded.entries()) {
    if (bySlug.has(slug)) continue;
    bySlug.set(slug, distributeLifetime(slug, meta.clicks, meta.upvotes, meta.rating, meta.createdAt));
  }

  return bySlug;
}

/** Cumulative unsaved increments per `${slug}|${date}` — drives Mongo $inc (no double counts). */
function pendingDeltas(): Map<string, ActivityCounts & { date: string }> {
  const g = globalThis as any;
  if (!g.__votActivityDeltas) g.__votActivityDeltas = new Map<string, ActivityCounts & { date: string }>();
  return g.__votActivityDeltas as Map<string, ActivityCounts & { date: string }>;
}

async function persist(slug: string, drain = true) {
  if (isFirestore()) return;
  const deltas = pendingDeltas();
  const today = dayKeyAt(0);
  const key = `${slug}|${today}`;
  const delta = deltas.get(key);
  if (!delta) return;
  if (!drain) return; // reserved for future batching

  await connectDB();
  if (!isDBConnected()) return;
  deltas.delete(key);
  try {
    await ToolActivity.updateOne(
      { slug, date: delta.date },
      {
        $inc: {
          views: delta.views,
          visits: delta.visits,
          votes: delta.votes,
          searches: delta.searches,
          ratings: delta.ratings,
          ratingSum: delta.ratingSum,
        },
        $setOnInsert: { slug, date: delta.date },
      },
      { upsert: true }
    );
    // Keep old buckets bounded: prune rows older than horizon on success path.
    try {
      await ToolActivity.deleteMany({ date: { $lt: dayKeyAt(HORIZON_DAYS * DAY_MS) } });
    } catch {
      // ignore
    }
  } catch {
    // Re-queue the delta so the next record attempt retries.
    const prev = deltas.get(key) || { views: 0, visits: 0, votes: 0, searches: 0, ratings: 0, ratingSum: 0, date: today };
    deltas.set(key, {
      ...prev,
      views: prev.views + delta.views,
      visits: prev.visits + delta.visits,
      votes: prev.votes + delta.votes,
      searches: prev.searches + delta.searches,
      ratings: prev.ratings + delta.ratings,
      ratingSum: prev.ratingSum + delta.ratingSum,
    });
  }
}

/** Record a single activity event for today (in-memory + async Mongo $inc). */
export async function recordActivity(
  slug: string,
  metric: MetricKey,
  amount = 1
): Promise<void> {
  const clean = decodeURIComponent(slug).trim();
  if (!clean || amount === 0) return;
  const today = dayKeyAt(0);
  const b = liveBuckets();
  const existing = b.get(`${clean}|${today}`);
  const bucket = existing || emptyBucket(clean);
  bucket[metric] = Math.max(0, Number(bucket[metric] || 0) + amount);
  b.set(`${clean}|${today}`, bucket);

  const deltas = pendingDeltas();
  const key = `${clean}|${today}`;
  const d = deltas.get(key) || { views: 0, visits: 0, votes: 0, searches: 0, ratings: 0, ratingSum: 0, date: today };
  d[metric] = Math.max(0, Number(d[metric] || 0) + amount);
  deltas.set(key, d);
  await persist(clean);
}

/** Record a review: bumps count by 1 and keeps rating sum for average signal. */
export async function recordRating(slug: string, ratingValue: number): Promise<void> {
  const clean = decodeURIComponent(slug).trim();
  if (!clean) return;
  const today = dayKeyAt(0);
  const b = liveBuckets();
  const existing = b.get(`${clean}|${today}`);
  const bucket = existing || emptyBucket(clean);
  bucket.ratings = Math.max(0, Number(bucket.ratings || 0) + 1);
  bucket.ratingSum = Math.max(0, Number(bucket.ratingSum || 0) + ratingValue);
  b.set(`${clean}|${today}`, bucket);

  const deltas = pendingDeltas();
  const key = `${clean}|${today}`;
  const d = deltas.get(key) || { views: 0, visits: 0, votes: 0, searches: 0, ratings: 0, ratingSum: 0, date: today };
  d.ratings = Math.max(0, Number(d.ratings || 0) + 1);
  d.ratingSum = Math.max(0, Number(d.ratingSum || 0) + ratingValue);
  deltas.set(key, d);
  await persist(clean);
}

/** Aggregate a metric over a trailing window (default 30 days). */
export function sumWindow(
  buckets: ActivityBucket[],
  metric: MetricKey,
  days = 30
): number {
  const cutoff = dayKeyAt(Math.min(HORIZON_DAYS, days) * DAY_MS);
  let sum = 0;
  for (const b of buckets) {
    if (b.date < cutoff) continue;
    sum += Number(b[metric] || 0);
  }
  return sum;
}

/**
 * Organic trending score.
 *
 * Score = weighted recent views + visit clicks*3 + votes*6 + searches*2
 *       + rating signal + recent-growth bonus + new-tool boost.
 *
 * - Recent 7 days count fully, 14 days at 0.6, 30 days at 0.35 (decay).
 * - Lifetime popularity acts only as a small floor so brand-new tools surface.
 * - New tools (<=14 days) get a boost so they can crack the chart.
 */
export function computeTrendScore(
  buckets: ActivityBucket[],
  opts: {
    clicks?: number;
    upvotes?: number;
    rating?: number;
    createdAt?: string | Date | null;
  } = {}
): number {
  const decay = (metric: MetricKey) =>
    sumWindow(buckets, metric, 7) +
    sumWindow(buckets, metric, 14) * 0.6 +
    sumWindow(buckets, metric, 30) * 0.35;

  const views = decay("views");
  const visits = decay("visits");
  const votes = decay("votes");
  const searches = decay("searches");

  const recentRatings = sumWindow(buckets, "ratings", 14);
  const ratingSignal =
    recentRatings > 0
      ? (sumWindow(buckets, "ratingSum", 14) / recentRatings) * 8
      : Math.min(10, Number(opts.rating || 0) * 2);

  const recentVotesViews = sumWindow(buckets, "votes", 7) + sumWindow(buckets, "views", 7);
  const previousVotesViews =
    sumWindow(buckets, "votes", 14) + sumWindow(buckets, "views", 14) - recentVotesViews;
  const growth = recentVotesViews - previousVotesViews;
  const growthBonus = growth > 0 ? Math.min(40, growth * 2) : 0;

  let newBoost = 0;
  if (opts.createdAt) {
    const ageDays = (Date.now() - new Date(String(opts.createdAt)).getTime()) / DAY_MS;
    if (ageDays >= 0 && ageDays <= 7) newBoost = 30;
    else if (ageDays <= 14) newBoost = 15;
  }

  return Math.round(
    views +
      visits * 3 +
      votes * 6 +
      searches * 2 +
      ratingSignal +
      growthBonus +
      newBoost
  );
}