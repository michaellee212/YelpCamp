var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// ROOT ROUTE
router.get("/", (req, res) => {
    res.render("landing");
});

// AUTH ROUTES
// ==============

// REGISTER ROUTE - shows register form
router.get("/register", (req, res) =>{
    res.render("register");
})

// handles user sign up
router.post("/register", (req, res) =>{
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) =>{
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// LOGIN ROUTES
// show login form
router.get("/login", (req, res) => {
    res.render("login"); 
 });

// router.post("/login", 'middleware', 'callback')
// login logic - middleware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}) ,
// callback
    (req, res) => {
});

// LOGOUT ROUTE
router.get("/logout", (req, res) =>{
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});


module.exports = router;