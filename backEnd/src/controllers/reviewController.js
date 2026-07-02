const Review = require("../models/Review");

const SORT_MAP = {
  newest: { createdAt: -1 },
  helpful: { helpful: -1 },
  rating: { rating: -1 },
};

exports.getReviews = async (req, res, next) => {
  try {
    const { tool, rating, search, sort = "newest", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (tool) filter.toolSlug = tool;
    if (rating) filter.rating = Number(rating);
    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: "i" } },
        { toolName: { $regex: search, $options: "i" } },
      ];
    }

    const numericLimit = Number(limit);
    const skip = (Number(page) - 1) * numericLimit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(SORT_MAP[sort] || SORT_MAP.newest)
        .skip(skip)
        .limit(numericLimit)
        .populate("userId", "displayName photoURL email"),
      Review.countDocuments(filter),
    ]);

    const mapped = reviews.map((r) => ({
      id: r._id,
      toolSlug: r.toolSlug,
      toolName: r.toolName,
      category: r.category,
      userId: r.userId?._id,
      rating: r.rating,
      text: r.text,
      helpful: r.helpful,
      createdAt: r.createdAt,
      user: r.userId
        ? {
            displayName: r.userId.displayName || r.userId.email?.split("@")[0],
            photoURL: r.userId.photoURL,
          }
        : null,
    }));

    res.json({
      reviews: mapped,
      total,
      page: Number(page),
      pages: Math.ceil(total / numericLimit),
    });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { tool } = req.query;
    const match = tool ? { toolSlug: tool } : {};

    const [agg] = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          total: { $sum: 1 },
          five: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          four: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          three: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          two: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          one: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
    ]);

    if (!agg) {
      return res.json({ average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    }

    res.json({
      average: Math.round(agg.average * 10) / 10,
      total: agg.total,
      breakdown: { 5: agg.five, 4: agg.four, 3: agg.three, 2: agg.two, 1: agg.one },
    });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { toolSlug, toolName, category, rating, text } = req.body;

    if (!toolSlug || !toolName || !rating || !text) {
      return res.status(400).json({ error: "toolSlug, toolName, rating and text are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    const existing = await Review.findOne({ userId: req.user._id, toolSlug });
    if (existing) {
      return res.status(400).json({ error: "You already reviewed this tool" });
    }

    const review = await Review.create({
      toolSlug,
      toolName,
      category,
      userId: req.user._id,
      rating,
      text,
    });

    const populated = await review.populate("userId", "displayName photoURL email");

    res.status(201).json({
      id: populated._id,
      toolSlug: populated.toolSlug,
      toolName: populated.toolName,
      category: populated.category,
      userId: populated.userId?._id,
      rating: populated.rating,
      text: populated.text,
      helpful: populated.helpful,
      createdAt: populated.createdAt,
      user: populated.userId
        ? {
            displayName: populated.userId.displayName || populated.userId.email?.split("@")[0],
            photoURL: populated.userId.photoURL,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    next(err);
  }
};
