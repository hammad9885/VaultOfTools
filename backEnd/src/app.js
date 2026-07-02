const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const toolRoutes = require("./routes/toolRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const userRoutes = require("./routes/userRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const blogRoutes = require("./routes/blogRoutes");
const staticRoutes = require("./routes/staticRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/static", staticRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  const msg = err?.message || err?.toString() || "Server error";
  const isDB = /mongoose|mongo|connect|timeout/i.test(msg) && !/route/i.test(msg);
  res.status(err?.status || (isDB ? 503 : 500)).json({
    error: isDB ? "Database unavailable — start MongoDB to enable this feature" : msg,
  });
});

module.exports = app;
