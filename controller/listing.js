const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };


module.exports.NewListing=  (req, res) => {
    res.render("listings/new.ejs");
  };


module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"review",populate:{path:"author"}}).populate("owner");
  if(!listing){
    req.flash("error","Listing don't exist");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res,next) => {
    let response = await geocodingClient.forwardGeocode({
     query: req.body.listing.location,
     limit: 1
   })
     .send()

  if(!req.body.listing){
    throw new expressError(404,"send vaild data for listing");
  }
  let url = req.file.path;
  let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};

  newListing.geometry = response.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("sucess","New listing added sucessfully");
  res.redirect("/listings");
}

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing don't exist");
    res.redirect("/listings");
  }
  let orignalUrl = listing.image.url;
  orignalUrl = orignalUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,orignalUrl });
};


module.exports.updateListing = async (req, res) => {
  if(!req.body.listing){
    throw new expressError(404,"send vaild data for listing");
  }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
if(typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url,filename};
  await listing.save();
}
  req.flash("sucess","Update sucessfully");
  res.redirect(`/listings/${id}`);
}


module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("sucess","Listing deleted sucessfully");
  res.redirect("/listings");
}