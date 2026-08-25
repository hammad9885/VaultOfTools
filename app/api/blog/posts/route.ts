import { NextRequest, NextResponse } from "next/server";
import { getMergedSitePosts } from "@/app/lib/data/site-posts";
import { authenticate } from "@/app/lib/middleware/auth";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import BlogPost from "@/app/lib/models/BlogPost";
import memoryStore from "@/app/lib/data/memoryStore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const all = await getMergedSitePosts();
    let posts = all.filter((p) => {
      if (category && p.category !== category) return false;
      if (featured === "true" && !p.featured) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !(p.excerpt || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    const total = posts.length;
    const skip = (page - 1) * limit;
    posts = posts.slice(skip, skip + limit);

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticate(request);
    await connectDB();
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
