const Submission = require("../models/Submission");
const Tool = require("../models/Tool");

exports.createSubmission = async (req, res, next) => {
  try {
    const { name, website, category, description, pricing, founderName, companyName, launchYear, email } = req.body;

    if (!name || !website || !category || !description) {
      return res.status(400).json({ error: "name, website, category and description are required" });
    }

    const submission = await Submission.create({
      userId: req.user._id,
      name,
      website,
      category,
      description,
      pricing,
      founderName,
      companyName,
      launchYear,
      email: email || req.user.email,
    });

    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
};

exports.getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

exports.getAllSubmissions = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "displayName email");

    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

exports.updateSubmissionStatus = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (status === "approved") {
      const slug = submission.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const existing = await Tool.findOne({ slug });
      if (!existing) {
        await Tool.create({
          slug,
          name: submission.name,
          category: submission.category,
          pricing: submission.pricing || "Free",
          desc: submission.description,
          website: submission.website,
          tags: [submission.category.toLowerCase().replace(/\s+/g, "-")],
        });
      }
    }

    res.json(submission);
  } catch (err) {
    next(err);
  }
};
