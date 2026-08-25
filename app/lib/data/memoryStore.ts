import bcrypt from "bcryptjs";

class MemoryStore {
  users: Map<string, any> = new Map();
  consultations: any[] = [];
  blogPosts: any[] = [];
  subscribers: any[] = [];
  _idCounter: number = 1;

  async createUser(data: any) {
    const _id = String(this._idCounter++);
    const hashed = await bcrypt.hash(data.password, 12);
    const user = {
      _id,
      email: data.email.toLowerCase(),
      password: hashed,
      displayName: data.displayName || data.email.split("@")[0],
      photoURL: data.photoURL || null,
      bio: data.bio || null,
      website: data.website || null,
      location: data.location || null,
      company: data.company || null,
      role: data.role || "user",
      googleId: data.googleId || null,
      createdAt: new Date(),
    };
    this.users.set(user.email, user);
    if (user.googleId) this.users.set(`google:${user.googleId}`, user);
    return user;
  }

  async findUserByEmail(email: string) {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findUserByGoogleId(googleId: string) {
    return this.users.get(`google:${googleId}`) || null;
  }

  async findUserById(id: string) {
    for (const u of this.users.values()) {
      if (u._id === id) return u;
    }
    return null;
  }

  async comparePassword(user: any, candidate: string) {
    return bcrypt.compare(candidate, user.password);
  }

  async updatePassword(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;
    user.password = await bcrypt.hash(password, 12);
    user.updatedAt = new Date();
    return user;
  }

  toProfile(user: any) {
    return {
      id: user._id,
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL,
      bio: user.bio,
      website: user.website || null,
      location: user.location || null,
      company: user.company || null,
      role: user.role,
    };
  }

  async createConsultation(data: any) {
    const _id = String(this._idCounter++);
    const entry = {
      _id,
      name: data.name,
      email: data.email.toLowerCase(),
      company: data.company || "",
      message: data.message,
      status: "new",
      createdAt: new Date(),
    };
    this.consultations.push(entry);
    return entry;
  }

  async getConsultations(filter: any = {}) {
    const list = this.consultations.slice().reverse();
    if (filter.status) return list.filter((c: any) => c.status === filter.status);
    return list;
  }

  async updateConsultationStatus(id: string, status: string) {
    const idx = this.consultations.findIndex((c: any) => c._id === id);
    if (idx === -1) return null;
    this.consultations[idx].status = status;
    return this.consultations[idx];
  }

  async createPost(data: any) {
    const _id = String(this._idCounter++);
    const post = {
      _id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || "",
      category: data.category,
      coverImage: data.coverImage || "",
      date: data.date || new Date().toISOString().split("T")[0],
      readTime: data.readTime || "",
      featured: data.featured || false,
      author: data.author || { name: "Vault of Tools", avatar: "" },
      content: data.content || [],
      createdAt: new Date(),
    };
    this.blogPosts.push(post);
    return post;
  }

  async getPosts(filter: any = {}) {
    let list = this.blogPosts.slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter.category) list = list.filter((p: any) => p.category === filter.category);
    if (filter.featured === "true") list = list.filter((p: any) => p.featured);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((p: any) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    }
    return list;
  }

  async getPostBySlug(slug: string) {
    return this.blogPosts.find((p: any) => p.slug === slug) || null;
  }

  async getBlogCategories() {
    const map: Record<string, number> = {};
    for (const p of this.blogPosts) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  async addSubscriber(email: string) {
    const entry = {
      _id: String(this._idCounter++),
      email: email.toLowerCase(),
      name: null as string | null,
      active: true,
      status: "subscribed",
      createdAt: new Date(),
    };
    this.subscribers.push(entry);
    return entry;
  }

  async findSubscriber(email: string) {
    return this.subscribers.find((s: any) => s.email === email.toLowerCase()) || null;
  }

  // ── Tool ──────────────────────────────────────────────

  tools: any[] = [];

  async getTools(filter: any = {}) {
    let list = this.tools.slice();
    if (filter.category) list = list.filter((t: any) => t.category === filter.category);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((t: any) =>
        t.name.toLowerCase().includes(q) ||
        (t.desc && t.desc.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(q)))
      );
    }
    if (filter.sort === "newest") list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (filter.sort === "name") list.sort((a: any, b: any) => a.name.localeCompare(b.name));
    else list.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    return list;
  }

  async getToolBySlug(slug: string) {
    return this.tools.find((t: any) => t.slug === slug) || null;
  }

  async getCategories() {
    const map: Record<string, number> = {};
    for (const t of this.tools) {
      if (t.category) map[t.category] = (map[t.category] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async createTool(data: any) {
    const existing = this.tools.find((t: any) => t.slug === data.slug);
    if (existing) {
      const err: any = new Error(`A tool with slug "${data.slug}" already exists`);
      err.status = 409;
      throw err;
    }
    const _id = String(this._idCounter++);
    const shortDescription = data.shortDescription || data.desc || data.description || "";
    const description = data.description || data.fullDescription || shortDescription;
    const tool = {
      _id,
      slug: data.slug,
      name: data.name,
      category: data.category || "Uncategorized",
      categoryId: data.categoryId || null,
      logo: data.logo || data.logoUrl || null,
      logoUrl: data.logoUrl || data.logo || null,
      bannerUrl: data.bannerUrl || null,
      imageUrl: data.imageUrl || null,
      url: data.url || data.website || null,
      website: data.website || data.url || null,
      shortDescription,
      fullDescription: data.fullDescription || description,
      description,
      desc: shortDescription || description,
      pricing: data.pricing || "Free",
      rating: data.rating || 0,
      reviews: data.reviews || 0,
      clicks: data.clicks || 0,
      upvotes: data.upvotes || 0,
      features: data.features || [],
      pros: data.pros || [],
      cons: data.cons || [],
      tags: data.tags || [],
      featured: Boolean(data.featured),
      sponsored: Boolean(data.sponsored),
      status: data.status || "published",
      publishDate: data.publishDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tools.push(tool);
    return tool;
  }

  async updateTool(id: string, patch: Record<string, any>) {
    const idx = this.tools.findIndex((t: any) => String(t._id) === String(id));
    if (idx === -1) return null;
    if (patch.slug) {
      const dup = this.tools.find(
        (t: any) => t.slug === patch.slug && String(t._id) !== String(id)
      );
      if (dup) {
        const err: any = new Error(`A tool with slug "${patch.slug}" already exists`);
        err.status = 409;
        throw err;
      }
    }
    const current = this.tools[idx];
    const next = { ...current, ...patch, updatedAt: new Date() };
    if (
      "shortDescription" in patch ||
      "description" in patch ||
      "fullDescription" in patch ||
      "desc" in patch
    ) {
      const shortDescription = String(
        next.shortDescription || next.desc || next.description || ""
      ).trim();
      const description = String(
        next.description || next.fullDescription || shortDescription
      ).trim();
      next.shortDescription = shortDescription;
      next.description = description;
      next.desc = shortDescription || description;
    }
    if ("logoUrl" in patch && !("logo" in patch) && next.logoUrl) next.logo = next.logoUrl;
    if ("logo" in patch && !next.logoUrl) next.logoUrl = next.logo || null;
    this.tools[idx] = next;
    return next;
  }

  async deleteTool(id: string) {
    const idx = this.tools.findIndex((t: any) => String(t._id) === String(id));
    if (idx === -1) return null;
    const [removed] = this.tools.splice(idx, 1);
    return removed;
  }

  async getToolById(id: string) {
    return this.tools.find((t: any) => String(t._id) === String(id)) || null;
  }

  async getAdminTools(filter: any = {}) {
    let list = this.tools.slice();
    if (filter.search) {
      const q = String(filter.search).toLowerCase();
      list = list.filter(
        (t: any) =>
          t.name?.toLowerCase().includes(q) ||
          t.slug?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }
    if (filter.status) list = list.filter((t: any) => t.status === filter.status);
    if (filter.featured === true) list = list.filter((t: any) => t.featured);
    if (filter.featured === false) list = list.filter((t: any) => !t.featured);
    if (filter.sponsored === true) list = list.filter((t: any) => t.sponsored);
    if (filter.sponsored === false) list = list.filter((t: any) => !t.sponsored);
    list.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return list;
  }

  // ── Saved tools ───────────────────────────────────────

  savedTools: any[] = [];

  async getSavedTools(userId: string) {
    return this.savedTools
      .filter((s: any) => s.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async toggleSavedTool(userId: string, tool: any) {
    const idx = this.savedTools.findIndex(
      (s: any) => s.userId === userId && s.slug === tool.slug
    );
    if (idx !== -1) {
      this.savedTools.splice(idx, 1);
      return { saved: false };
    }
    this.savedTools.push({
      _id: String(this._idCounter++),
      userId,
      slug: tool.slug,
      name: tool.name,
      desc: tool.desc || null,
      logo: tool.logo || null,
      category: tool.category || null,
      tags: tool.tags || [],
      createdAt: new Date(),
    });
    return { saved: true };
  }

  // ── Review ────────────────────────────────────────────

  reviews: any[] = [];

  async getReviews(filter: any = {}) {
    let list = this.reviews.slice();
    if (filter.toolSlug) list = list.filter((r: any) => r.toolSlug === filter.toolSlug);
    if (filter.rating) list = list.filter((r: any) => r.rating === Number(filter.rating));
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((r: any) =>
        (r.text && r.text.toLowerCase().includes(q)) ||
        (r.toolName && r.toolName.toLowerCase().includes(q))
      );
    }
    if (filter.sort === "helpful") list.sort((a: any, b: any) => (b.helpful || 0) - (a.helpful || 0));
    else if (filter.sort === "rating") list.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    else list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  async getReviewStats(toolSlug?: string) {
    const list = toolSlug
      ? this.reviews.filter((r: any) => r.toolSlug === toolSlug)
      : this.reviews;
    const total = list.length;
    if (total === 0) return { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    const sum = list.reduce((acc: number, r: any) => acc + r.rating, 0);
    const breakdown: Record<string, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of list) breakdown[String(r.rating)] = (breakdown[String(r.rating)] || 0) + 1;
    return {
      average: Math.round((sum / total) * 10) / 10,
      total,
      breakdown,
    };
  }

  async createReview(data: any) {
    const existing = this.reviews.find(
      (r: any) => r.userId === data.userId && r.toolSlug === data.toolSlug
    );
    if (existing) return null;
    const _id = String(this._idCounter++);
    const review = {
      _id,
      toolSlug: data.toolSlug,
      toolName: data.toolName,
      category: data.category || null,
      userId: data.userId,
      rating: data.rating,
      text: data.text,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.push(review);
    return review;
  }

  async deleteReview(id: string, userId: string, userRole: string) {
    const idx = this.reviews.findIndex((r: any) => r._id === id);
    if (idx === -1) return null;
    const review = this.reviews[idx];
    if (review.userId !== userId && userRole !== "admin") return { unauthorized: true };
    this.reviews.splice(idx, 1);
    return review;
  }

  async incrementHelpful(id: string) {
    const review = this.reviews.find((r: any) => r._id === id);
    if (!review) return null;
    review.helpful = (review.helpful || 0) + 1;
    return review;
  }

  // ── Submission ────────────────────────────────────────

  submissions: any[] = [];

  async createSubmission(data: any) {
    const _id = String(this._idCounter++);
    const submission = {
      _id,
      userId: data.userId,
      name: data.name,
      website: data.website,
      category: data.category,
      description: data.description || null,
      pricing: data.pricing || null,
      founderName: data.founderName || null,
      companyName: data.companyName || null,
      launchYear: data.launchYear || null,
      email: data.email || null,
      status: data.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.submissions.push(submission);
    return submission;
  }

  async getUserSubmissions(userId: string) {
    return this.submissions
      .filter((s: any) => s.userId === userId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllSubmissions(filter: any = {}) {
    let list = this.submissions.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filter.status) list = list.filter((s: any) => s.status === filter.status);
    return list;
  }

  async updateSubmissionStatus(id: string, status: string) {
    const idx = this.submissions.findIndex((s: any) => s._id === id);
    if (idx === -1) return null;
    this.submissions[idx].status = status;
    this.submissions[idx].updatedAt = new Date();
    return this.submissions[idx];
  }
}

const memoryStore: MemoryStore =
  (globalThis as any).__votMemoryStore ||
  ((globalThis as any).__votMemoryStore = new MemoryStore());

// Keep HMR-safe: existing singleton should always use the latest class methods.
Object.setPrototypeOf(memoryStore, MemoryStore.prototype);

export default memoryStore;
