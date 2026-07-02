const crypto = require("crypto");
const bcrypt = require("bcryptjs");

class MemoryStore {
  constructor() {
    this.users = new Map();
    this._idCounter = 1;
  }

  async createUser(data) {
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

  async findUserByEmail(email) {
    return this.users.get(email.toLowerCase()) || null;
  }

  async findUserByGoogleId(googleId) {
    return this.users.get(`google:${googleId}`) || null;
  }

  async findUserById(id) {
    for (const u of this.users.values()) {
      if (u._id === id) return u;
    }
    return null;
  }

  async comparePassword(user, candidate) {
    return bcrypt.compare(candidate, user.password);
  }

  toProfile(user) {
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

  /* ----- consultations ----- */

  async createConsultation(data) {
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
    this.consultations = this.consultations || [];
    this.consultations.push(entry);
    return entry;
  }

  async getConsultations(filter = {}) {
    const list = (this.consultations || []).slice().reverse();
    if (filter.status) return list.filter((c) => c.status === filter.status);
    return list;
  }

  async updateConsultationStatus(id, status) {
    const list = this.consultations || [];
    const idx = list.findIndex((c) => c._id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    return list[idx];
  }

  /* ----- blog posts ----- */

  async createPost(data) {
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
    this.blogPosts = this.blogPosts || [];
    this.blogPosts.push(post);
    return post;
  }

  async getPosts(filter = {}) {
    let list = (this.blogPosts || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filter.category) list = list.filter((p) => p.category === filter.category);
    if (filter.featured === "true") list = list.filter((p) => p.featured);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    }
    return list;
  }

  async getPostBySlug(slug) {
    return (this.blogPosts || []).find((p) => p.slug === slug) || null;
  }

  async getCategories() {
    const map = {};
    for (const p of this.blogPosts || []) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /* ----- newsletter ----- */

  async addSubscriber(email) {
    this.subscribers = this.subscribers || [];
    const entry = { email: email.toLowerCase(), active: true, createdAt: new Date() };
    this.subscribers.push(entry);
    return entry;
  }

  async findSubscriber(email) {
    return (this.subscribers || []).find((s) => s.email === email.toLowerCase()) || null;
  }
}

module.exports = new MemoryStore();
