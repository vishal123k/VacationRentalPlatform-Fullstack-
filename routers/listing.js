const express = require("express");
const router = express.Router();
const warpashyc = require("../utils/wrapAachyc.js");
const expressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");
const {isloggedin,isOwner} = require("../middleware.js");
const listingController = require("../controller/listing.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(warpashyc(listingController.index))
.post(isloggedin,upload.single("listing[image]"), warpashyc(listingController.createListing));

router.get("/new", isloggedin,(listingController.NewListing));

router.route("/:id")
  .get(warpashyc(listingController.showListing))
  .put(isloggedin,isOwner,upload.single("listing[image]"), warpashyc(listingController.updateListing))
  .delete(isloggedin,isOwner, warpashyc(listingController.deleteListing));

router.get("/:id/edit", isloggedin,isOwner,warpashyc(listingController.editListing));

module.exports = router;
