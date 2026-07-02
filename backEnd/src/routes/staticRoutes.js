const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/staticController");

router.get("/navigation", ctrl.getNavigation);
router.get("/categories", ctrl.getCategories);
router.get("/categories/:slug/tools", ctrl.getCategoryTools);
router.get("/explore/popular", ctrl.getExplorePopular);
router.get("/explore/recent", ctrl.getExploreRecent);
router.get("/explore/search-terms", ctrl.getExploreSearchTerms);
router.get("/comparisons", ctrl.getComparisons);
router.get("/comparisons/:slug", ctrl.getComparisonDetail);
router.get("/consulting", ctrl.getConsulting);
router.get("/blog/static", ctrl.getBlogStatic);
router.get("/tools/static", ctrl.getToolsStatic);
router.get("/home/stats", ctrl.getHomeStats);
router.get("/home/comparisons", ctrl.getHomeComparisons);
router.get("/home/faqs", ctrl.getHomeFaqs);
router.get("/home/trending", ctrl.getHomeTrending);

module.exports = router;
