var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var Review = require("../models/review");



//INDEX - Show all campgrounds
router.get("/", function (req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if (req.query.search) {
        // Fuzzy Search
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({
            name: regex
        }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({
                name: regex
            }).exec(function (err, count) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    // If fuzzy search not found
                    if (allCampgrounds.length < 1) {
                        req.flash("error", "No campgrounds match that search, please try again.");
                        return res.redirect("back");
                    }
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: false
                    });
                }
            });
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
            req.flash("error", err.message);
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
    Campground.findById(req.params.id).populate("comments likes").populate({
        path: "reviews",
        options: {
            sort: {
                createdAt: -1
            }
        }
    }).exec(function (err, foundCampground) {
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
    Campground.findById(req.params.id, function (err, campground) {
        delete req.body.campground.rating;
        if (err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.image = req.body.campground.image;
            campground.save(function (err) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({
                "_id": {
                    $in: campground.comments
                }
            }, function (err) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({
                    "_id": {
                        $in: campground.reviews
                    }
                }, function (err) {
                    if (err) {
                        req.flash("error", err.message);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
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
                req.flash("error", err.message);
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