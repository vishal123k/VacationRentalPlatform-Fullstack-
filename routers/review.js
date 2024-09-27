const express = require("express");
const router = express.Router({mergeParams:true});
const warpashyc = require("../utils/wrapAachyc.js");
const expressError = require("../utils/expressError.js");
const review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {isloggedin,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controller/reviews.js");

router.post("/", isloggedin,warpashyc(reviewController.createReview));
  
  router.delete("/:reviewId",isloggedin,isReviewAuthor,warpashyc(reviewController.destroyReview));

  module.exports = router;