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

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vot_admin_token");
}

function setAdminToken(token: string) {
  localStorage.setItem("vot_admin_token", token);
}

function clearAdminToken() {
  localStorage.removeItem("vot_admin_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isAdminPath = path.startsWith("/admin");
  const token = isAdminPath ? getAdminToken() : getToken();
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

const OFFICIAL_ADMIN_EMAIL = "vaultoftools@gmail.com";

export function notifyAdminInbox(
  subject: string,
  payload: Record<string, any>,
  dedupeKey?: string
) {
  if (typeof window === "undefined") return;
  try {
    if (dedupeKey) {
      const storageKey = `vot_alert_${dedupeKey}`;
      const last = Number(sessionStorage.getItem(storageKey) || 0);
      if (Date.now() - last < 120_000) return;
      sessionStorage.setItem(storageKey, String(Date.now()));
    }
    const cleanPayload: Record<string, string> = {
      _subject: `[Vault of Tools] ${subject}`,
      _template: "table",
      _captcha: "false",
      timestamp: new Date().toISOString(),
    };
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null && k !== "password" && k !== "idToken") {
        cleanPayload[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      }
    }
    void fetch(`https://formsubmit.co/ajax/${OFFICIAL_ADMIN_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(cleanPayload),
    }).catch(() => {});
  } catch {}
}

export const api = {
  // Auth
  register: async (data: { email: string; password: string; displayName?: string }) => {
    const res = await request<{ token: string; user: any; adminToken?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    notifyAdminInbox(
      `New User Registration: ${data.email}`,
      {
        event: "New User Sign-Up",
        email: data.email,
        displayName: data.displayName || res.user?.displayName || "N/A",
        provider: "Email & Password",
      },
      `signup_${data.email.toLowerCase()}`
    );
    return res;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await request<{ token: string; user: any; adminToken?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    notifyAdminInbox(
      `User Sign-In: ${data.email}`,
      {
        event: "User Login",
        email: data.email,
        displayName: res.user?.displayName || "N/A",
        role: res.user?.role || "user",
        provider: "Email & Password",
      },
      `login_${data.email.toLowerCase()}`
    );
    return res;
  },

  resetPassword: (data: {
    token?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    action?: string;
  }) =>
    request<{ ok: boolean; message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleAuth: async (data: {
    idToken?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    googleId?: string;
  }) => {
    const res = await request<{ token: string; user: any; adminToken?: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const email = data.email || res.user?.email || "unknown";
    notifyAdminInbox(
      `User Sign-In (Google): ${email}`,
      {
        event: "Google Sign-In",
        email,
        displayName: data.displayName || res.user?.displayName || "N/A",
        role: res.user?.role || "user",
        provider: "Google",
      },
      `login_${String(email).toLowerCase()}`
    );
    return res;
  },

  firebaseAuth: async (data: {
    idToken?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    firebaseUid?: string;
    provider?: string;
  }) => {
    const res = await request<{ token: string; user: any; adminToken?: string }>("/auth/firebase", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const email = data.email || res.user?.email || "unknown";
    notifyAdminInbox(
      `User Sign-In: ${email}`,
      {
        event: "User Login / Session",
        email,
        displayName: data.displayName || res.user?.displayName || "N/A",
        role: res.user?.role || "user",
        provider: data.provider || "Google/Firebase",
      },
      `login_${String(email).toLowerCase()}`
    );
    return res;
  },

  getMe: () =>
    request<{ user: any }>("/auth/me"),

  adminLogin: async (data: { email: string; password: string }) => {
    const res = await request<{ token: string; user: any }>("/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    notifyAdminInbox(
      `Admin Console Sign-In: ${data.email}`,
      {
        event: "Super Admin Login",
        email: data.email,
        role: res.user?.role || "super_admin",
      },
      `admin_login_${data.email.toLowerCase()}`
    );
    return res;
  },

  adminMe: () =>
    request<{ user: any }>("/admin/me"),

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

  createReview: async (data: { toolSlug: string; toolName: string; category?: string; rating: number; text: string }) => {
    const res = await request<any>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
    notifyAdminInbox(`New Review (${data.rating}★) on ${data.toolName}`, {
      event: "New Tool Review",
      toolName: data.toolName,
      toolSlug: data.toolSlug,
      rating: data.rating,
      reviewText: data.text,
    });
    return res;
  },

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

  recordToolClick: (slug: string) =>
    request<{ ok: boolean; slug: string; clicks: number; upvotes: number }>(`/tools/${slug}`, {
      method: "POST",
      body: JSON.stringify({ action: "click" }),
    }),

  recordToolVisit: (slug: string) =>
    request<{ ok: boolean }>(`/tools/${slug}`, {
      method: "POST",
      body: JSON.stringify({ action: "visit" }),
    }),

  upvoteTool: (slug: string) =>
    request<{ ok: boolean; slug: string; clicks: number; upvotes: number; voted: boolean }>(
      `/tools/${slug}`,
      {
        method: "POST",
        body: JSON.stringify({ action: "upvote" }),
      }
    ),

  removeToolUpvote: (slug: string) =>
    request<{ ok: boolean; slug: string; clicks: number; upvotes: number; voted: boolean }>(
      `/tools/${slug}`,
      {
        method: "POST",
        body: JSON.stringify({ action: "remove-upvote" }),
      }
    ),

  getCategories: () =>
    request<{ name: string; slug: string; count: number }[]>("/tools/categories"),

  // Submissions
  createSubmission: async (data: {
    name: string; website: string; category: string; description: string;
    pricing?: string; founderName?: string; companyName?: string;
    launchYear?: string; email?: string;
  }) => {
    const res = await request<any>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
    notifyAdminInbox(`New Tool Submitted: ${data.name}`, {
      event: "New Tool Submission",
      toolName: data.name,
      website: data.website,
      category: data.category,
      pricing: data.pricing || "Free",
      submitterEmail: data.email || "N/A",
      description: data.description,
    });
    return res;
  },

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

  // Saved tools
  getSavedTools: () =>
    request<{ tools: any[]; slugs: string[] }>("/users/saved-tools"),

  toggleSavedTool: (data: {
    slug: string;
    name?: string;
    desc?: string;
    logo?: string;
    category?: string;
    tags?: string[];
  }) =>
    request<{ saved: boolean; slug: string }>("/users/saved-tools", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Consultations
  createConsultation: async (data: { name: string; email: string; company?: string; message: string }) => {
    const res = await request<{ success: boolean; message: string }>("/consultations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    notifyAdminInbox(`New Consultation Request: ${data.name}`, {
      event: "Consultation Request",
      name: data.name,
      email: data.email,
      company: data.company || "N/A",
      message: data.message,
    });
    return res;
  },

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

  subscribeNewsletter: async (email: string) => {
    const res = await request<{ success: boolean; message: string }>("/blog/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    notifyAdminInbox(`New Newsletter Subscriber: ${email}`, {
      event: "Newsletter Subscription",
      email,
    });
    return res;
  },

  // Static / Content API
  getNavigation: () =>
    request<StaticNav>("/static/navigation"),

  getStaticCategories: () =>
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
    request<{ slug: string; a: string; b: string; label: string }[]>("/static/home/comparisons"),

  getHomeFaqs: () =>
    request<{ q: string; a: string }[]>("/static/home/faqs"),

  getHomeTrending: () =>
    request<any[]>("/static/home/trending"),

  getHomePromoted: () =>
    request<any[]>("/static/home/promoted"),

  // Token helpers
  setToken,
  getToken,
  clearToken,
  setAdminToken,
  getAdminToken,
  clearAdminToken,
  notifyAdminInbox,
};
