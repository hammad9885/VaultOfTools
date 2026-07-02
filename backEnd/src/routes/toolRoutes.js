const express = require("express");
const { getTools, getTool, getCategories } = require("../controllers/toolController");

const router = express.Router();

router.get("/", getTools);
router.get("/categories", getCategories);
router.get("/:slug", getTool);

module.exports = router;
