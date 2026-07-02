const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getPosts,
  getPost,
  createPost,
  getCategories,
  subscribe,
} = require("../controllers/blogController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many subscription attempts, please try again later." },
});

router.get("/posts", getPosts);
router.get("/posts/:slug", getPost);
router.post("/posts", authenticate, createPost);
router.get("/categories", getCategories);
router.post("/subscribe", subscribeLimiter, subscribe);

module.exports = router;
