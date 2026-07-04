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
      role: "user",
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
    const entry = { email: email.toLowerCase(), active: true, createdAt: new Date() };
    this.subscribers.push(entry);
    return entry;
  }

  async findSubscriber(email: string) {
    return this.subscribers.find((s: any) => s.email === email.toLowerCase()) || null;
  }
}

const memoryStore = new MemoryStore();
export default memoryStore;
