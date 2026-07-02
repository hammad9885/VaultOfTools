const User = require("../models/User");

exports.getProfile = async (req, res) => {
  res.json({ user: req.user.toProfile() });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, photoURL, website, location, company } = req.body;

    if (displayName !== undefined) req.user.displayName = displayName.trim().slice(0, 80);
    if (bio !== undefined) req.user.bio = bio.trim().slice(0, 500);
    if (photoURL !== undefined) req.user.photoURL = photoURL;
    if (website !== undefined) req.user.website = website.trim().slice(0, 200);
    if (location !== undefined) req.user.location = location.trim().slice(0, 100);
    if (company !== undefined) req.user.company = company.trim().slice(0, 100);

    await req.user.save();
    res.json({ user: req.user.toProfile() });
  } catch (err) {
    next(err);
  }
};
