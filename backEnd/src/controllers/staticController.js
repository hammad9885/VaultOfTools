const { categories, categoryToolMap, popularTools, recentTools, popularSearchTerms } = require("../data/categories");
const { navigation, popularComparisonsSidebar, trendingToolsSidebar } = require("../data/navigation");
const { allComparisons, alternatives, filterTabs, howItWorks, comparisonDetails } = require("../data/comparisons");
const { consulting } = require("../data/consulting");
const { catIcons, trustFeatures, featuredArticle, posts } = require("../data/blog");
const { fallbackFeatures, fallbackPros, fallbackCons } = require("../data/tools");
const { stats, comparisons, faqs, trending } = require("../data/home");

exports.getNavigation = (req, res) => res.json(navigation);

exports.getCategories = (req, res) => res.json(categories);

exports.getCategoryTools = (req, res) => {
  const { slug } = req.params;
  const tools = categoryToolMap[slug] || [];
  res.json(tools);
};

exports.getExplorePopular = (req, res) => res.json(popularTools);

exports.getExploreRecent = (req, res) => res.json(recentTools);

exports.getExploreSearchTerms = (req, res) => res.json(popularSearchTerms);

exports.getComparisons = (req, res) => res.json({ allComparisons, alternatives, filterTabs, howItWorks });

exports.getComparisonDetail = (req, res) => {
  const detail = comparisonDetails[req.params.slug];
  if (!detail) return res.status(404).json({ error: "Comparison not found" });
  res.json(detail);
};

exports.getConsulting = (req, res) => res.json(consulting);

exports.getBlogStatic = (req, res) => {
  res.json({ catIcons, trustFeatures, featuredArticle, popularComparisonsSidebar, trendingToolsSidebar });
};

exports.getToolsStatic = (req, res) => {
  res.json({ fallbackFeatures, fallbackPros, fallbackCons, trending });
};

exports.getHomeStats = (req, res) => res.json(stats);

exports.getHomeComparisons = (req, res) => res.json(comparisons);

exports.getHomeFaqs = (req, res) => res.json(faqs);

exports.getHomeTrending = (req, res) => res.json(trending);
