const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createConsultation,
  getAllConsultations,
  updateConsultationStatus,
} = require("../controllers/consultationController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please try again later." },
});

router.post("/", contactLimiter, createConsultation);
router.get("/", authenticate, getAllConsultations);
router.patch("/:id/status", authenticate, updateConsultationStatus);

module.exports = router;
