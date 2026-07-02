const { isDBConnected } = require("../config/db");
const { posts: dataPosts } = require("../data/blog");

async function getStore() {
  if (isDBConnected()) {
    const BlogPost = require("../models/BlogPost");
    const NewsletterSubscriber = require("../models/NewsletterSubscriber");
    return { type: "mongo", BlogPost, NewsletterSubscriber };
  }
  return { type: "memory", store: require("../lib/memoryStore") };
}

function normalizePost(p) {
  return { ...p, id: p._id || p.id };
}

/* ----- Posts ----- */

exports.getPosts = async (req, res, next) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const db = await getStore();
    let posts, total;

    if (db.type === "mongo") {
      const skip = (Number(page) - 1) * Number(limit);
      [posts, total] = await Promise.all([
        db.BlogPost.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
        db.BlogPost.countDocuments(filter),
      ]);
    } else {
      let all = await db.store.getPosts(filter);
      if (all.length === 0) {
        all = dataPosts.filter((p) => {
          if (filter.category && p.category !== filter.category) return false;
          if (filter.featured && !p.featured) return false;
          if (filter.search) {
            const q = filter.search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
          }
          return true;
        });
      }
      total = all.length;
      const skip = (Number(page) - 1) * Number(limit);
      posts = all.slice(skip, skip + Number(limit)).map(normalizePost);
    }

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const db = await getStore();
    let post;

    if (db.type === "mongo") {
      post = await db.BlogPost.findOne({ slug: req.params.slug });
    } else {
      post = await db.store.getPostBySlug(req.params.slug);
      if (!post) post = dataPosts.find((p) => p.slug === req.params.slug) || null;
    }

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, slug, excerpt, category, coverImage, date, readTime, featured, author, content } = req.body;
    if (!title || !slug || !category) {
      return res.status(400).json({ error: "title, slug and category are required" });
    }
    const db = await getStore();
    let post;

    if (db.type === "mongo") {
      post = await db.BlogPost.create({
        title, slug, excerpt, category, coverImage, date, readTime, featured, author, content,
      });
    } else {
      post = await db.store.createPost({
        title, slug, excerpt, category, coverImage, date, readTime, featured, author, content,
      });
    }

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/* ----- Categories ----- */

exports.getCategories = async (req, res, next) => {
  try {
    const db = await getStore();
    let cats;

    if (db.type === "mongo") {
      cats = await db.BlogPost.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
      ]);
    } else {
      cats = await db.store.getCategories();
      if (cats.length === 0) {
        const map = {};
        for (const p of dataPosts) {
          map[p.category] = (map[p.category] || 0) + 1;
        }
        cats = Object.entries(map).map(([name, count]) => ({ name, count }));
      }
    }

    res.json(cats);
  } catch (err) {
    next(err);
  }
};

/* ----- Newsletter ----- */

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const db = await getStore();

    if (db.type === "mongo") {
      const existing = await db.NewsletterSubscriber.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(200).json({ success: true, message: "Already subscribed" });
      await db.NewsletterSubscriber.create({ email });
    } else {
      const existing = await db.store.findSubscriber(email);
      if (existing) return res.status(200).json({ success: true, message: "Already subscribed" });
      await db.store.addSubscriber(email);
    }

    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    next(err);
  }
};
