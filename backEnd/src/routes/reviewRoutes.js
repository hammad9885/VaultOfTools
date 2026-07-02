const express = require("express");
const rateLimit = require("express-rate-limit");
const { getReviews, getStats, createReview, deleteReview, markHelpful } = require("../controllers/reviewController");
const { authenticate, optionalAuth } = require("../middleware/auth");

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many reviews submitted, please try again later." },
});

router.get("/", optionalAuth, getReviews);
router.get("/stats", getStats);
router.post("/", authenticate, submitLimiter, createReview);
router.delete("/:id", authenticate, deleteReview);
router.patch("/:id/helpful", markHelpful);

module.exports = router;
