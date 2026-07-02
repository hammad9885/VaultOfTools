const jwt = require("jsonwebtoken");
const { isDBConnected } = require("../config/db");

async function findUser(id) {
  if (isDBConnected()) {
    const User = require("../models/User");
    return User.findById(id);
  }
  const store = require("../lib/memoryStore");
  const user = await store.findUserById(id);
  return user;
}

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUser(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("auth error:", err?.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await findUser(decoded.id);
    next();
  } catch {
    req.user = null;
    next();
  }
}

module.exports = { authenticate, optionalAuth };
