import { connectDB, isDBConnected } from "@/app/lib/config/db";
import Tool from "@/app/lib/models/Tool";
import memoryStore from "@/app/lib/data/memoryStore";
import { requireSuperAdmin, errorResponse } from "@/app/lib/admin/auth";
import { logActivity } from "@/app/lib/admin/activity";
import {
  asBool,
  asNumber,
  asStringArray,
  asCompareData,
  asNumberOrNull,
  clampPage,
  slugify,
} from "@/app/lib/admin/utils";

export const dynamic = "force-dynamic";

type ToolRequestBody = {
  name?: unknown;
  slug?: unknown;
  desc?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  fullDescription?: unknown;
  website?: unknown;
  url?: unknown;
  category?: unknown;
  categoryId?: unknown;
  subcategory?: unknown;
  toolType?: unknown;
  logo?: unknown;
  logoUrl?: unknown;
  bannerUrl?: unknown;
  imageUrl?: unknown;
  pricing?: unknown;
  startingPrice?: unknown;
  billingPeriod?: unknown;
  freePlan?: unknown;
  freeTrial?: unknown;
  trialDuration?: unknown;
  rating?: unknown;
  reviews?: unknown;
  features?: unknown;
  pros?: unknown;
  cons?: unknown;
  bestFor?: unknown;
  useCases?: unknown;
  tags?: unknown;
  searchKeywords?: unknown;
  alternatives?: unknown;
  videoUrl?: unknown;
  screenshots?: unknown;
  compare?: unknown;
  featured?: unknown;
  featuredOrder?: unknown;
  sponsored?: unknown;
  sponsorName?: unknown;
  sponsorStartDate?: unknown;
  sponsorEndDate?: unknown;
  sponsorPriority?: unknown;
  sponsorActive?: unknown;
  trending?: unknown;
  editorsChoice?: unknown;
  verified?: unknown;
  displayOrder?: unknown;
  seoTitle?: unknown;
  seoDescription?: unknown;
  ogImage?: unknown;
  status?: unknown;
  publishDate?: unknown;
};

function buildToolPayload(
  body: ToolRequestBody,
  name: string,
  slug: string
) {
  const shortDescription = String(
    body.shortDescription || body.desc || ""
  ).trim();

  const description = String(
    body.description ||
      body.fullDescription ||
      shortDescription
  ).trim();

  const website = String(
    body.website || body.url || ""
  ).trim();

  const statusValue = String(body.status || "");

  return {
    slug,
    name,
    category: String(body.category || "Uncategorized").trim(),
    categoryId: body.categoryId || null,
    subcategory: String(body.subcategory || "").trim(),
    toolType: String(body.toolType || "").trim(),
    logo: body.logo || body.logoUrl || undefined,
    logoUrl: body.logoUrl || body.logo || null,
    bannerUrl: body.bannerUrl || null,
    imageUrl: body.imageUrl || null,
    url: website || (body.url ? String(body.url) : null),
    website: website || undefined,
    shortDescription,
    fullDescription: body.fullDescription
      ? String(body.fullDescription)
      : description,
    description,
    desc: shortDescription || description,
    pricing: body.pricing ? String(body.pricing) : "Free",
    startingPrice: body.startingPrice
      ? String(body.startingPrice).trim()
      : "",
    billingPeriod: body.billingPeriod
      ? String(body.billingPeriod).trim()
      : "",
    freePlan: asBool(body.freePlan),
    freeTrial: asBool(body.freeTrial),
    trialDuration: body.trialDuration
      ? String(body.trialDuration).trim()
      : "",
    rating: asNumber(body.rating, 0),
    reviews: asNumber(body.reviews, 0),
    features: asStringArray(body.features),
    pros: asStringArray(body.pros),
    cons: asStringArray(body.cons),
    bestFor: body.bestFor
      ? String(body.bestFor).trim()
      : "",
    useCases: asStringArray(body.useCases),
    tags: asStringArray(body.tags),
    searchKeywords: asStringArray(body.searchKeywords),
    alternatives: asStringArray(body.alternatives),
    videoUrl: body.videoUrl
      ? String(body.videoUrl).trim()
      : "",
    screenshots: asStringArray(body.screenshots),
    compare: asCompareData(body.compare),
    featured: asBool(body.featured),
    featuredOrder: asNumberOrNull(body.featuredOrder),
    sponsored: asBool(body.sponsored),
    sponsorName: body.sponsorName
      ? String(body.sponsorName).trim()
      : null,
    sponsorStartDate: body.sponsorStartDate
      ? new Date(String(body.sponsorStartDate))
      : null,
    sponsorEndDate: body.sponsorEndDate
      ? new Date(String(body.sponsorEndDate))
      : null,
    sponsorPriority: asNumberOrNull(body.sponsorPriority),
    sponsorActive: asBool(body.sponsorActive),
    trending: asBool(body.trending),
    editorsChoice: asBool(body.editorsChoice),
    verified: asBool(body.verified),
    displayOrder: asNumberOrNull(body.displayOrder),
    seoTitle: body.seoTitle
      ? String(body.seoTitle).trim()
      : null,
    seoDescription: body.seoDescription
      ? String(body.seoDescription).trim()
      : null,
    ogImage: body.ogImage
      ? String(body.ogImage).trim()
      : null,
    status: ["draft", "published", "archived"].includes(
      statusValue
    )
      ? statusValue
      : "published",
    publishDate: body.publishDate
      ? new Date(String(body.publishDate))
      : new Date(),
  };
}

type SiteTool = {
  _id?: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  toolType?: string;
  logo?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  website?: string;
  url?: string | null;
  shortDescription?: string;
  desc?: string;
  description?: string;
  pricing: string;
  startingPrice?: string;
  billingPeriod?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  trialDuration?: string;
  rating: number;
  reviews: number;
  features?: string[];
  pros?: string[];
  cons?: string[];
  bestFor?: string;
  useCases?: string[];
  tags?: string[];
  searchKeywords?: string[];
  alternatives?: string[];
  videoUrl?: string;
  screenshots?: string[];
  compare?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  featured?: boolean;
  featuredOrder?: number | null;
  sponsored?: boolean;
  sponsorName?: string | null;
  sponsorStartDate?: string | Date | null;
  sponsorEndDate?: string | Date | null;
  sponsorPriority?: number | null;
  sponsorActive?: boolean;
  trending?: boolean;
  editorsChoice?: boolean;
  verified?: boolean;
  displayOrder?: number | null;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    await connectDB();

    const url = new URL(request.url);

    const search =
      url.searchParams.get("search")?.trim() || "";

    const status =
      url.searchParams.get("status")?.trim() || "";

    const featured =
      url.searchParams.get("featured")?.trim() || "";

    const sponsored =
      url.searchParams.get("sponsored")?.trim() || "";

    const page = Math.max(
      1,
      Number(url.searchParams.get("page")) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(url.searchParams.get("limit")) || 10
      )
    );

    const { getMergedSiteTools } =
      await import("@/app/lib/data/public-tools");

    let all = (await getMergedSiteTools({
      publishedOnly: false,
    })) as SiteTool[];

    if (search) {
      const q = search.toLowerCase();

      all = all.filter(
        (tool) =>
          tool.name.toLowerCase().includes(q) ||
          tool.slug.toLowerCase().includes(q) ||
          tool.category.toLowerCase().includes(q)
      );
    }

    if (
      status &&
      ["draft", "published", "archived"].includes(status)
    ) {
      all = all.filter(
        (tool) =>
          (tool.status || "published") === status
      );
    }

    if (featured === "true") {
      all = all.filter((tool) => Boolean(tool.featured));
    }

    if (featured === "false") {
      all = all.filter((tool) => !tool.featured);
    }

    if (sponsored === "true") {
      all = all.filter((tool) => Boolean(tool.sponsored));
    }

    if (sponsored === "false") {
      all = all.filter((tool) => !tool.sponsored);
    }

    all.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime() ||
        a.name.localeCompare(b.name)
    );

    const total = all.length;
    const pages = Math.max(
      1,
      Math.ceil(total / limit)
    );

    const safePage = clampPage(page, pages);

    const items = all
      .slice(
        (safePage - 1) * limit,
        safePage * limit
      )
      .map((tool) => ({
        _id: tool._id || `site-${tool.slug}`,
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        subcategory: tool.subcategory || "",
        toolType: tool.toolType || "",
        logo: tool.logo,
        logoUrl: tool.logoUrl || null,
        bannerUrl: tool.bannerUrl || null,
        imageUrl: tool.imageUrl || null,
        website: tool.website || null,
        url: tool.url || null,
        shortDescription:
          tool.shortDescription || tool.desc || "",
        description:
          tool.description || tool.desc || "",
        pricing: tool.pricing,
        startingPrice:
          tool.startingPrice || "",
        billingPeriod:
          tool.billingPeriod || "",
        freePlan: Boolean(tool.freePlan),
        freeTrial: Boolean(tool.freeTrial),
        trialDuration:
          tool.trialDuration || "",
        rating: tool.rating,
        reviews: tool.reviews,
        features: tool.features || [],
        pros: tool.pros || [],
        cons: tool.cons || [],
        bestFor: tool.bestFor || "",
        useCases: tool.useCases || [],
        tags: tool.tags || [],
        searchKeywords:
          tool.searchKeywords || [],
        alternatives:
          tool.alternatives || [],
        videoUrl: tool.videoUrl || "",
        screenshots:
          tool.screenshots || [],
        compare: tool.compare || null,
        seoTitle: tool.seoTitle || null,
        seoDescription:
          tool.seoDescription || null,
        ogImage: tool.ogImage || null,
        featured: Boolean(tool.featured),
        featuredOrder:
          tool.featuredOrder ?? null,
        sponsored: Boolean(tool.sponsored),
        sponsorName:
          tool.sponsorName ?? null,
        sponsorStartDate:
          tool.sponsorStartDate ?? null,
        sponsorEndDate:
          tool.sponsorEndDate ?? null,
        sponsorPriority:
          tool.sponsorPriority ?? null,
        sponsorActive:
          Boolean(tool.sponsorActive),
        trending: Boolean(tool.trending),
        editorsChoice:
          Boolean(tool.editorsChoice),
        verified: Boolean(tool.verified),
        displayOrder:
          tool.displayOrder ?? null,
        status:
          tool.status || "published",
        createdAt: tool.createdAt
          ? new Date(tool.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: tool.updatedAt
          ? new Date(tool.updatedAt).toISOString()
          : tool.createdAt
            ? new Date(tool.createdAt).toISOString()
            : new Date().toISOString(),
      }));

    return Response.json({
      items,
      total,
      page: safePage,
      pages,
    });
  } catch (err: unknown) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin(request);
    await connectDB();

    const body =
      (await request.json()) as ToolRequestBody;

    const name = String(body.name || "").trim();

    if (!name) {
      return Response.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const rawSlug = String(body.slug || "").trim();

    const slug = rawSlug
      ? rawSlug
      : slugify(name);

    if (!slug) {
      return Response.json(
        {
          error:
            "Valid name or slug is required",
        },
        { status: 400 }
      );
    }

    const payload = buildToolPayload(
      body,
      name,
      slug
    );

    if (!isDBConnected()) {
      const existing =
        await memoryStore.getToolBySlug(slug);

      if (existing) {
        return Response.json(
          {
            error: `A tool with slug "${slug}" already exists`,
          },
          { status: 409 }
        );
      }

      const tool =
        await memoryStore.createTool(payload);

      await logActivity(
        user.email || "",
        "created",
        `tool:${tool.slug}`,
        { name: tool.name }
      );

      return Response.json(tool, {
        status: 201,
      });
    }

    const existing =
      await Tool.findOne({ slug });

    if (existing) {
      return Response.json(
        {
          error: `A tool with slug "${slug}" already exists`,
        },
        { status: 409 }
      );
    }

    const tool =
      await Tool.create(payload);

    await logActivity(
      user.email || "",
      "created",
      `tool:${tool.slug}`,
      { name: tool.name }
    );

    return Response.json(tool, {
      status: 201,
    });
  } catch (err: unknown) {
    return errorResponse(err);
  }
}