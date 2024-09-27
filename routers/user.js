const express = require("express");
const router = express.Router();    
const User = require("../models/user.js");
const warpashyc = require("../utils/wrapAachyc.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const usercontroller = require("../controller/users.js");

router.route("/signup")
.get((usercontroller.renderSignupFrom))
.post(warpashyc(usercontroller.signup));

router.route("/login")
.get((usercontroller.renderLoginFrom))
.post(
    saveRedirectUrl,
    passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash: true
}),
usercontroller.login
);

router.get("/logout",(usercontroller.logout));

module.exports = router;