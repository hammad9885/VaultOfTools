export const SUPER_ADMIN = "super_admin";

export type Role = "user" | "admin" | "moderator" | "super_admin";
export type UserStatus = "active" | "suspended";

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: Role;
  status: UserStatus;
}

export interface CompareAttributeRow {
  label: string;
  value: string;
}

export interface ToolCompareData {
  overallRating?: number | null;
  easeOfUse?: number | null;
  featuresScore?: number | null;
  valueForMoney?: number | null;
  aiPowered?: boolean;
  apiAvailable?: boolean;
  teamCollaboration?: boolean;
  customerSupport?: string;
  platforms?: string[];
  integrations?: string[];
  attributes?: CompareAttributeRow[];
}

export interface ToolRow {
  _id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  toolType?: string;
  logo?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  url?: string | null;
  website?: string | null;
  shortDescription?: string;
  fullDescription?: string;
  description?: string;
  pricing: string;
  startingPrice?: string;
  billingPeriod?: string;
  freePlan?: boolean;
  freeTrial?: boolean;
  trialDuration?: string;
  rating: number;
  reviews: number;
  clicks?: number;
  upvotes?: number;
  saves?: number;
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
  compare?: ToolCompareData;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  featured: boolean;
  sponsored: boolean;
  trending?: boolean;
  editorsChoice?: boolean;
  verified?: boolean;
  displayOrder?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRow {
  _id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
}

export interface TagRow {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface ReviewRow {
  _id: string;
  toolSlug: string;
  toolName: string;
  userName: string | null;
  rating: number;
  text: string;
  status: string;
  helpful: number;
  createdAt: string;
}

export interface UserRow {
  _id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastSeen?: string;
}

export interface PostRow {
  _id: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  featured: boolean;
  createdAt: string;
  source?: "database" | "site";
}

export interface SubmissionRow {
  _id: string;
  name: string;
  website: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface SubscriberRow {
  _id: string;
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
}

export interface ConsultationRow {
  _id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface ActivityRow {
  _id: string;
  actor: string;
  action: string;
  target: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface OverviewData {
  stats: {
    tools: number;
    publishedTools?: number;
    users: number;
    reviews: number;
    toolReviewsListed?: number;
    categories: number;
    tags: number;
    posts: number;
    featuredPosts?: number;
    subscribers: number;
    submissions: number;
    consultations: number;
    views?: number;
    upvotes?: number;
    saves?: number;
  };
  pending: {
    reviews: number;
    submissions: number;
  };
  toolStatus: { draft: number; published: number; archived: number };
  featuredCount: number;
  sponsoredCount: number;
  categoryChart: { name: string; count: number }[];
  pricingChart?: { name: string; count: number }[];
  recentTools: ToolRow[];
  topViewedTools?: ToolRow[];
  topUpvotedTools?: ToolRow[];
  recentUsers: UserRow[];
  recentReviews: ReviewRow[];
  recentSubmissions: SubmissionRow[];
  recentPosts: PostRow[];
  activity: ActivityRow[];
  dataSource?: string;
}

export interface AdminSettings {
  general: {
    siteName: string;
    tagline: string;
    supportEmail: string;
    timezone: string;
    itemsPerPage: number;
    maintenanceMode: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImageUrl: string;
    canonicalUrl: string;
    robotsIndex: boolean;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    accentColor: string;
  };
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    heroCtaLabel: string;
    heroCtaUrl: string;
    featuredCount: number;
    showNewsletter: boolean;
  };
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    github: string;
    youtube: string;
  };
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    facebookPixelId: string;
    hotjarId: string;
  };
}
