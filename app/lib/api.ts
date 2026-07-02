const API_BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vot_token");
}

function setToken(token: string) {
  localStorage.setItem("vot_token", token);
}

function clearToken() {
  localStorage.removeItem("vot_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed (${res.status})`) as any;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

type StaticNav = {
  navLinks: { label: string; href: string }[];
  footer: {
    platform: { label: string; href: string }[];
    community: { label: string; href: string }[];
    company: { label: string; href: string }[];
  };
};

export const api = {
  // Auth
  register: (data: { email: string; password: string; displayName?: string }) =>
    request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleAuth: (data: { email: string; displayName?: string; photoURL?: string; googleId: string }) =>
    request<{ token: string; user: any }>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{ user: any }>("/auth/me"),

  // Reviews
  getReviews: (params?: { tool?: string; rating?: number; search?: string; sort?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.tool) qs.set("tool", params.tool);
    if (params?.rating) qs.set("rating", String(params.rating));
    if (params?.search) qs.set("search", params.search);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<{ reviews: any[]; total: number; page: number; pages: number }>(`/reviews${q ? `?${q}` : ""}`);
  },

  getReviewStats: (tool?: string) => {
    const qs = tool ? `?tool=${tool}` : "";
    return request<{ average: number; total: number; breakdown: Record<string, number> }>(`/reviews/stats${qs}`);
  },

  createReview: (data: { toolSlug: string; toolName: string; category?: string; rating: number; text: string }) =>
    request<any>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteReview: (id: string) =>
    request<{ message: string }>(`/reviews/${id}`, { method: "DELETE" }),

  markHelpful: (id: string) =>
    request<any>(`/reviews/${id}/helpful`, { method: "PATCH" }),

  // Tools
  getTools: (params?: { category?: string; search?: string; sort?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.search) qs.set("search", params.search);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<{ tools: any[]; total: number; page: number; pages: number }>(`/tools${q ? `?${q}` : ""}`);
  },

  getTool: (slug: string) =>
    request<any>(`/tools/${slug}`),

  getCategories: () =>
    request<{ name: string; slug: string; count: number }[]>("/tools/categories"),

  // Submissions
  createSubmission: (data: {
    name: string; website: string; category: string; description: string;
    pricing?: string; founderName?: string; companyName?: string;
    launchYear?: string; email?: string;
  }) =>
    request<any>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMySubmissions: () =>
    request<any[]>("/submissions"),

  getAllSubmissions: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<any[]>(`/submissions/all${qs}`);
  },

  updateSubmissionStatus: (id: string, status: string) =>
    request<any>(`/submissions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Users
  getProfile: () =>
    request<{ user: any }>("/users/profile"),

  updateProfile: (data: { displayName?: string; bio?: string; photoURL?: string; website?: string; location?: string; company?: string }) =>
    request<{ user: any }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Consultations
  createConsultation: (data: { name: string; email: string; company?: string; message: string }) =>
    request<{ success: boolean; message: string }>("/consultations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Blog
  getBlogPosts: (params?: { category?: string; featured?: string; search?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.featured) qs.set("featured", params.featured);
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<{ posts: any[]; total: number; page: number; pages: number }>(`/blog/posts${q ? `?${q}` : ""}`);
  },

  getBlogPost: (slug: string) =>
    request<any>(`/blog/posts/${slug}`),

  createBlogPost: (data: any) =>
    request<any>("/blog/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBlogCategories: () =>
    request<{ name: string; count: number }[]>("/blog/categories"),

  subscribeNewsletter: (email: string) =>
    request<{ success: boolean; message: string }>("/blog/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Static / Content API
  getNavigation: () =>
    request<StaticNav>("/static/navigation"),

  getCategories: () =>
    request<any[]>("/static/categories"),

  getCategoryTools: (slug: string) =>
    request<any[]>(`/static/categories/${slug}/tools`),

  getExplorePopular: () =>
    request<any[]>("/static/explore/popular"),

  getExploreRecent: () =>
    request<any[]>("/static/explore/recent"),

  getExploreSearchTerms: () =>
    request<string[]>("/static/explore/search-terms"),

  getComparisons: () =>
    request<{ allComparisons: any[]; alternatives: any[]; filterTabs: string[]; howItWorks: any[] }>("/static/comparisons"),

  getComparisonDetail: (slug: string) =>
    request<any>(`/static/comparisons/${slug}`),

  getConsulting: () =>
    request<any>("/static/consulting"),

  getBlogStatic: () =>
    request<{ catIcons: any[]; trustFeatures: any[]; featuredArticle: any; popularComparisonsSidebar: string[]; trendingToolsSidebar: string[] }>("/static/blog/static"),

  getToolsStatic: () =>
    request<{ fallbackFeatures: string[]; fallbackPros: string[]; fallbackCons: string[]; trending: any[] }>("/static/tools/static"),

  getHomeStats: () =>
    request<{ value: string; suffix: string; label: string; icon: string }[]>("/static/home/stats"),

  getHomeComparisons: () =>
    request<{ label: string }[]>("/static/home/comparisons"),

  getHomeFaqs: () =>
    request<{ q: string; a: string }[]>("/static/home/faqs"),

  getHomeTrending: () =>
    request<any[]>("/static/home/trending"),

  // Token helpers
  setToken,
  getToken,
  clearToken,
};
