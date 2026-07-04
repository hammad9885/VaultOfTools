import { NextRequest, NextResponse } from "next/server";
import { isDBConnected } from "@/app/lib/config/db";
import BlogPost from "@/app/lib/models/BlogPost";
import memoryStore from "@/app/lib/data/memoryStore";
import { posts as dataPosts } from "@/app/lib/data/blog";
import { authenticate } from "@/app/lib/middleware/auth";

function normalizePost(p: any) {
  return { ...p, id: p._id || p.id };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const filter: any = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    let posts, total;

    if (isDBConnected()) {
      const skip = (page - 1) * limit;
      [posts, total] = await Promise.all([
        BlogPost.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
        BlogPost.countDocuments(filter),
      ]);
    } else {
      let all = await memoryStore.getPosts(filter);
      if (all.length === 0) {
        all = dataPosts.filter((p: any) => {
          if (filter.category && p.category !== filter.category) return false;
          if (filter.featured && !p.featured) return false;
          if (filter.search) {
            const q = filter.search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
          }
          return true;
        });
      }
      total = all.length;
      const skip = (page - 1) * limit;
      posts = all.slice(skip, skip + limit).map(normalizePost);
    }

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request);
    const { title, slug, excerpt, category, coverImage, date, readTime, featured, author, content } = await request.json();

    if (!title || !slug || !category) {
      return NextResponse.json({ error: "title, slug and category are required" }, { status: 400 });
    }

    let post;
    if (isDBConnected()) {
      post = await BlogPost.create({ title, slug, excerpt, category, coverImage, date, readTime, featured, author, content });
    } else {
      post = await memoryStore.createPost({ title, slug, excerpt, category, coverImage, date, readTime, featured, author, content });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: err.status || 500 });
  }
}
