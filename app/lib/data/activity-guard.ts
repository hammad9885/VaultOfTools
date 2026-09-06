import { connectDB, isDBConnected } from "../config/db";
import { isFirestore } from "../config/provider";
import ToolVoteModel from "../models/ToolVote";

export type GuardResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  reason?: string;
};

/** In-memory per-instance sliding window limiter (serverless-friendly). */
function limiterStore(): Map<string, { count: number; windowStart: number }> {
  const g = globalThis as any;
  if (!g.__votRateLimits) g.__votRateLimits = new Map<string, { count: number; windowStart: number }>();
  return g.__votRateLimits as Map<string, { count: number; windowStart: number }>;
}

export function getClientIp(request: Request): string {
  // Trust Cloudflare connecting IP or standard proxy header
  const cf = request.headers.get("cf-connecting-ip");
  if (cf && /^[0-9a-f:.]+$/i.test(cf.trim())) return cf.trim();

  const real = request.headers.get("x-real-ip");
  if (real && /^[0-9a-f:.]+$/i.test(real.trim())) return real.trim();

  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim());
    const valid = parts.find((ip) => /^[0-9a-f:.]+$/i.test(ip));
    if (valid) return valid;
  }
  return "127.0.0.1";
}

const BOT_PATTERN =
  /bot|crawler|spider|scraper|curl\/|wget\/|python|libwww|httpclient|okhttp|headless|phantomjs|selenium|puppeteer|java\/|node-fetch|axios|postman/i;

/** Basic bot/spam protection: reject obvious non-browser clients on write actions. */
export function isLikelyBot(request: Request): boolean {
  const ua = request.headers.get("user-agent") || "";
  if (!ua) return true;
  if (BOT_PATTERN.test(ua)) return true;
  return false;
}

/**
 * Simple sliding-window rate limit keyed by `ip|action|slug`.
 * One instance can't be gamed beyond the window; Vercel keeps warm instances briefly.
 */
export function checkRateLimit(
  ip: string,
  action: string,
  scope: string,
  opts: { max: number; windowMs: number }
): GuardResult {
  if (ip === "unknown") {
    // Anonymous/no-IP requests get a very low cap so they can't be spammed at all.
    opts = { ...opts, max: Math.min(opts.max, 3), windowMs: opts.windowMs };
  }
  const now = Date.now();
  const key = `${ip}|${action}|${scope}`;
  const map = limiterStore();
  const entry = map.get(key);
  if (!entry || now - entry.windowStart >= opts.windowMs) {
    map.set(key, { count: 1, windowStart: now });
    const resetAt = now + opts.windowMs;
    // GC old entries to avoid unbounded growth.
    if (map.size > 10000) {
      for (const [k, v] of map.entries()) {
        if (now - v.windowStart >= opts.windowMs) map.delete(k);
      }
    }
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }
  if (entry.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + opts.windowMs, reason: "rate_limited" };
  }
  entry.count += 1;
  return { allowed: true, remaining: opts.max - entry.count, resetAt: entry.windowStart + opts.windowMs };
}

const memoryVotes = globalVoteMemory();
function globalVoteMemory(): Map<string, "up"> {
  const g = globalThis as any;
  if (!g.__votToolVotes) g.__votToolVotes = new Map<string, "up">();
  return g.__votToolVotes as Map<string, "up">;
}

function voteKey(slug: string, voterId: string) {
  return `${slug}|${voterId}`;
}

/** True if this voter already upvoted this tool (server-side duplicate prevention). */
export async function hasVoted(slug: string, voterId: string): Promise<boolean> {
  const key = voteKey(slug, voterId);
  if (memoryVotes.has(key)) return true;
  await connectDB();
  if (isDBConnected() && !isFirestore()) {
    try {
      const row = await ToolVoteModel.findOne({ slug, voterId: String(voterId) }).select("_id").lean();
      return Boolean(row);
    } catch {
      // fall through to memory-only
    }
  }
  return false;
}

/** Persist an upvote so a voter can't inflate the same tool twice. */
export async function recordVoted(slug: string, voterId: string): Promise<void> {
  memoryVotes.set(voteKey(slug, voterId), "up");
  await connectDB();
  if (isDBConnected() && !isFirestore()) {
    try {
      await ToolVoteModel.updateOne(
        { slug, voterId: String(voterId) },
        { $setOnInsert: { slug, voterId: String(voterId) } },
        { upsert: true }
      );
    } catch {
      // ignore
    }
  }
}

export async function removeVoted(slug: string, voterId: string): Promise<void> {
  const key = voteKey(slug, voterId);
  if (memoryVotes.has(key)) memoryVotes.delete(key);
  await connectDB();
  if (isDBConnected() && !isFirestore()) {
    try {
      await ToolVoteModel.deleteOne({ slug, voterId: String(voterId) });
    } catch {
      // ignore
    }
  }
}

/** Shared guard constants — tune per signal. */
export const GUARDS = {
  // A normal user opens a tool page at most a handful of times per hour.
  views: { max: 12, windowMs: 60 * 60 * 1000 },
  // Visiting the website is a rarer, stronger action.
  visits: { max: 6, windowMs: 60 * 60 * 1000 },
  // Upvotes are hard-capped so bots can't pump a tool's chart.
  votes: { max: 10, windowMs: 60 * 60 * 1000 },
  // Searches are cheap but still bounded.
  searches: { max: 60, windowMs: 60 * 60 * 1000 },
  // Review helpful votes
  helpful: { max: 15, windowMs: 60 * 60 * 1000 },
} as const;

const memoryHelpfulVotes = globalHelpfulMemory();
function globalHelpfulMemory(): Set<string> {
  const g = globalThis as any;
  if (!g.__votHelpfulVotes) g.__votHelpfulVotes = new Set<string>();
  return g.__votHelpfulVotes as Set<string>;
}

export function hasVotedHelpful(reviewId: string, voterId: string): boolean {
  return memoryHelpfulVotes.has(`${reviewId}|${voterId}`);
}

export function recordVotedHelpful(reviewId: string, voterId: string): void {
  memoryHelpfulVotes.add(`${reviewId}|${voterId}`);
}