const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/StoreownerController");

// Get all ratings for stores owned by this owner
router.get("/:ownerId/ratings", ownerController.getOwnerRatings);

// Get summary (total + avg ratings per store)
router.get("/:ownerId/summary", ownerController.getOwnerSummary);

module.exports = router;
