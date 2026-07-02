const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, google, me } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts, please try again later." },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/google", authLimiter, google);
router.get("/me", authenticate, me);

module.exports = router;
