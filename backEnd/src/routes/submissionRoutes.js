const express = require("express");
const rateLimit = require("express-rate-limit");
const { createSubmission, getMySubmissions, getAllSubmissions, updateSubmissionStatus } = require("../controllers/submissionController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many submissions, please try again later." },
});

router.post("/", authenticate, submitLimiter, createSubmission);
router.get("/", authenticate, getMySubmissions);
router.get("/all", authenticate, getAllSubmissions);
router.patch("/:id/status", authenticate, updateSubmissionStatus);

module.exports = router;
