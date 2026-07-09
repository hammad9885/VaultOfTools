import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { SiteNav, SiteFooter } from "../../routes/index";
import { posts as dataPosts } from "@/app/lib/data/blog";

interface ContentBlock {
  type: "paragraph" | "heading" | "quote" | "image" | "list";
  text?: string;
  cite?: string;
  src?: string;
  alt?: string;
  caption?: string;
  items?: string[];
}

interface BlogPost {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  content: ContentBlock[];
  author: {
    name: string;
    avatar: string;
    role?: string;
    bio?: string;
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return dataPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = dataPosts.find((p: any) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Vault of Tools Blog`,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
          {block.text}
        </p>
      );
    case "heading":
      return (
        <h2 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{block.text}</h2>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary bg-primary-muted/40 px-5 py-4 text-base italic text-gray-800 rounded-r-lg">
          &ldquo;{block.text}&rdquo;
          {block.cite && (
            <footer className="mt-2 text-sm font-medium not-italic text-muted-foreground">
              &mdash; {block.cite}
            </footer>
          )}
        </blockquote>
      );
    case "image":
      return (
        <figure>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-50">
            <Image src={block.src || ""} alt={block.alt || ""} fill unoptimized className="object-cover" />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-700 sm:text-lg">
          {block.items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

function RelatedCard({ post }: { post: BlogPost | null }) {
  if (!post) return null;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-md"
    >
      <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        <span className="inline-flex w-fit items-center rounded-md bg-primary-muted px-2 py-0.5 text-xs font-medium text-primary">
          {post.category}
        </span>
        <h3 className="mt-2 font-semibold leading-snug text-gray-900 text-sm line-clamp-2">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = dataPosts.find((p: any) => p.slug === slug);
  if (!post) notFound();

  const related = dataPosts
    .filter((p: any) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SiteNav />

      <article>
        <section className="border-b border-border bg-surface-soft">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            <span className="mt-6 inline-flex w-fit items-center rounded-md bg-primary-muted px-2.5 py-1 text-xs font-medium text-primary">
              {post.category}
            </span>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{post.excerpt}</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-100 bg-gray-100 shrink-0">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {post.author.name}
                  {post.author.role && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      &middot; {post.author.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.date)}
                  </span>
                  <span aria-hidden>&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 -mt-px sm:px-6 lg:px-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-50 mt-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              unoptimized
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {post.content?.map((block: any, i) => (
              <Block key={i} block={block as ContentBlock} />
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-100 bg-gray-100 shrink-0">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {post.author.name}
                </div>
                {post.author.bio && (
                  <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
                    {post.author.bio}
                  </p>
                )}
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-soft transition-colors sm:self-auto">
              <Share2 className="w-4 h-4" />
              Share article
            </button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface-soft py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">More from the blog</h2>
              <Link
                href="/blog"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((p) => (
                <RelatedCard key={p?.slug} post={p as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
