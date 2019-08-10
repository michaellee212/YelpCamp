var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - Show all campgrounds
router.get("/", (req, res) => {
    // Fuzzy Search
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({
            name: regex
        }, (err, allCampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    req.flash("error", "No campgrounds match that search, please try again.");
                    return res.redirect("back");
                }
                res.render("campgrounds/index", {
                    campgrounds: allCampgrounds,
                    page: 'campgrounds',
                });
            }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, (err, allCampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {
                    campgrounds: allCampgrounds,
                    page: 'campgrounds'
                });
            }
        });
    }
});

// CREATE - Add new campgrounds to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {
        name: name,
        price: price,
        image: image,
        description: desc,
        author: author
    }
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, createdCampground) => {
        if (err) {
            console.log(err);
        } else {
            // Redirect back to list of campgrounds
            res.redirect("/campgrounds");
        }
    })
});


// NEW - Show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});


// SHOW - Shows more info about one campground
router.get("/:id", (req, res) => {
    // Find campground with provided ID
    Campground.findById(req.params.id).populate("comments likes").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {
                campground: foundCampground
            });
        }
    });
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {
            campground: foundCampground
        });
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    // Removes any script tags in the body
    // req.body.campground.body = req.sanitize(req.body.campground.body);
    // Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    //     if (err) {
    //         res.redirect("/campgrounds")
    //         console.log(err);
    //     } else {
    //         res.redirect("/campgrounds/" + req.params.id);
    //     }
    // })
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.image = req.body.campground.image;
            campground.save(function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});


// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect("/campgrounds");
            console.log(err);
        } else {
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    })
});

// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }
        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;