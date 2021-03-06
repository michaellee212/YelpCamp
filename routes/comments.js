var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// COMMENTS ROUTES
// =====================
// comments new
router.get("/new", middleware.isLoggedIn, (req, res) =>{
    // find campground by id
    Campground.findById(req.params.id, (err, campground) =>{
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: campground});
        }
    })
})

// Creates comment
router.post("/", middleware.isLoggedIn, (req, res) =>{
    // lookup campground usisng ID
    Campground.findById(req.params.id, (err, campground) =>{
        if(err){
            req.flash("error", "Comment not found");
            res.redirect("/campgrounds");
        }else{
            // create new comment
            Comment.create(req.body.comment, (err, comment) =>{
                if(err){
                    console.log(err);
                }else{
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save id
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id); 
                }
            })
        }
    })
})

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) =>{
    Campground.findById(req.params.id, (err, foundCampground) =>{
        if(err || !foundCampground){
            req.flash("error", "No campground found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) =>{
            if(err){
                res.redirect("back");
            }else{
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    // Removes any script tags in the body
    // req.body.comment.body = req.sanitize(req.body.comment.body);
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) =>{
        if(err){
            res.redirect("back");
            console.log(err);
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) =>{
    Comment.findByIdAndRemove(req.params.comment_id, (err) =>{
        if(err){
            res.redirect("back");
            console.log(err);
        }else{
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});



module.exports = router;