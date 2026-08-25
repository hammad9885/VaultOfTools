import { NextRequest, NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/app/lib/config/db";
import BlogPost from "@/app/lib/models/BlogPost";
import memoryStore from "@/app/lib/data/memoryStore";
import { posts as dataPosts } from "@/app/lib/data/blog";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    let post;

    if (isDBConnected()) {
      post = await BlogPost.findOne({ slug });
    }
    if (!post) post = await memoryStore.getPostBySlug(slug);
    if (!post) post = dataPosts.find((p: any) => p.slug === slug) || null;

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
