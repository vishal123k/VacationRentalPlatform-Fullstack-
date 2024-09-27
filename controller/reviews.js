const Listing = require("../models/listing");
const review = require("../models/review");

module.exports.createReview = async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newreview = new review(req.body.review);
    newreview.author = req.user._id;
    console.log(newreview);
    listing.review.push(newreview);
   await newreview.save();
   await listing.save();
   req.flash("sucess"," Submit review");
  res.redirect(`/listings/${listing._id}`);
  }

module.exports.destroyReview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    await review.findByIdAndDelete(reviewId);
    console.log(req.params.id);
    req.flash("sucess","Delete review");
    res.redirect(`/listings/${id}`);
  }
