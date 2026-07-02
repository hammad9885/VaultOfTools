const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { isDBConnected } = require("../config/db");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

async function getStore() {
  if (isDBConnected()) {
    const User = require("../models/User");
    return { type: "mongo", User };
  }
  return { type: "memory", store: require("../lib/memoryStore") };
}

exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const db = await getStore();
    let user;

    if (db.type === "mongo") {
      const existing = await db.User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ error: "Email already in use" });
      user = await db.User.create({ email, password, displayName });
    } else {
      const existing = await db.store.findUserByEmail(email);
      if (existing) return res.status(400).json({ error: "Email already in use" });
      user = await db.store.createUser({ email, password, displayName });
    }

    const token = signToken(user);
    const profile = db.type === "mongo" ? user.toProfile() : db.store.toProfile(user);
    res.status(201).json({ token, user: profile });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = await getStore();
    let user;

    if (db.type === "mongo") {
      user = await db.User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ error: "No account found with this email" });
      const valid = await user.comparePassword(password);
      if (!valid) return res.status(401).json({ error: "Incorrect password" });
    } else {
      user = await db.store.findUserByEmail(email);
      if (!user) return res.status(401).json({ error: "No account found with this email" });
      const valid = await db.store.comparePassword(user, password);
      if (!valid) return res.status(401).json({ error: "Incorrect password" });
    }

    const token = signToken(user);
    const profile = db.type === "mongo" ? user.toProfile() : db.store.toProfile(user);
    res.json({ token, user: profile });
  } catch (err) {
    next(err);
  }
};

exports.google = async (req, res, next) => {
  try {
    const { email, displayName, photoURL, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: "Email and googleId are required" });
    }

    const db = await getStore();
    let user;

    if (db.type === "mongo") {
      user = await db.User.findOne({ googleId });
      if (!user) user = await db.User.findOne({ email: email.toLowerCase() });
      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
          if (photoURL) user.photoURL = photoURL;
          if (displayName && !user.displayName) user.displayName = displayName;
          await user.save();
        }
      } else {
        user = await db.User.create({
          email, displayName, photoURL, googleId,
          password: crypto.randomBytes(32).toString("hex"),
        });
      }
    } else {
      user = await db.store.findUserByGoogleId(googleId);
      if (!user) user = await db.store.findUserByEmail(email);
      if (!user) {
        user = await db.store.createUser({
          email, displayName, photoURL, googleId,
          password: crypto.randomBytes(32).toString("hex"),
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (photoURL) user.photoURL = photoURL;
        if (displayName && !user.displayName) user.displayName = displayName;
      }
    }

    const token = signToken(user);
    const profile = db.type === "mongo" ? user.toProfile() : db.store.toProfile(user);
    res.json({ token, user: profile });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  const db = await getStore();
  const profile = db.type === "mongo" ? req.user.toProfile() : db.store.toProfile(req.user);
  res.json({ user: profile });
};
