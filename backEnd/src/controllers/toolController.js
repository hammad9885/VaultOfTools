const Tool = require("../models/Tool");

exports.getTools = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortObj = { rating: -1 };
    if (sort === "newest") sortObj = { createdAt: -1 };
    if (sort === "name") sortObj = { name: 1 };

    const numericLimit = Number(limit);
    const skip = (Number(page) - 1) * numericLimit;

    const [tools, total] = await Promise.all([
      Tool.find(filter).sort(sortObj).skip(skip).limit(numericLimit),
      Tool.countDocuments(filter),
    ]);

    res.json({ tools, total, page: Number(page), pages: Math.ceil(total / numericLimit) });
  } catch (err) {
    next(err);
  }
};

exports.getTool = async (req, res, next) => {
  try {
    const tool = await Tool.findOne({ slug: req.params.slug });
    if (!tool) return res.status(404).json({ error: "Tool not found" });
    res.json(tool);
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Tool.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          name: "$_id",
          slug: { $toLower: { $replaceAll: { input: "$_id", find: " ", replacement: "-" } } },
          count: 1,
          _id: 0,
        },
      },
    ]);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};
