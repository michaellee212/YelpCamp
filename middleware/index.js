var Campground = require("../models/campground");
var Comment = require("../models/comment");


// All the middleware functions

var middlewareObj = {};

// Checks to see if user has campground ownership - middleware
middlewareObj.checkCampgroundOwnership = (req, res, next) =>{
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err || !foundCampground){
                req.flash("error", "Campground not found");
                res.redirect("back");
            }else{
                // if logged in, is user the author, if not redirect
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "Please login first!");
        res.redirect("back");
    }
}

// Checks to see if user has comment ownership - middleware
middlewareObj.checkCommentOwnership = (req, res, next) =>{
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            }else{
                // if logged in, is user the author, if not redirect
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "Please login first!");
        res.redirect("back");
    }
}


// Check if the user is logged in 
// middleware
middlewareObj.isLoggedIn = (req, res, next) =>{
    if(req.isAuthenticated()){
        return next();
    }
    // if not logged in, redirect to login page
    req.flash("error", "Please login first!");
    res.redirect("/login");
}


module.exports = middlewareObj;