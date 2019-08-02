const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
var app = express();
var Campground = require("./models/campground");
var seedDB = require("./seeds");
var Comment = require("./models/comment");
// var User = require("./models/user");
const port = 3000;

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
seedDB();


// var campgrounds = [
//     {name: "Bear Creek", image: "https://pixabay.com/get/57e0d6424954ac14f6da8c7dda793f7f1636dfe2564c704c732b7dd7914ac65e_340.jpg"},
//     {name: "Billie Hill", image: "https://pixabay.com/get/55e1d7464e57ae14f6da8c7dda793f7f1636dfe2564c704c732b7ed19744cc51_340.jpg"},
//     {name: "Goat Ranch", image: "https://pixabay.com/get/54e6dc414a57a414f6da8c7dda793f7f1636dfe2564c704c732b7ed19744c35f_340.jpg"},
//     {name: "Lakeside Park", image: "https://pixabay.com/get/54e7d14a4d55a414f6da8c7dda793f7f1636dfe2564c704c732b7dd7914bc258_340.jpg"},
//     {name: "Mook River", image: "https://pixabay.com/get/54e2d6424a54ab14f6da8c7dda793f7f1636dfe2564c704c732b7dd7914bc258_340.jpg"},
//     {name: "Sunset Rest", image: "https://pixabay.com/get/57e4d64a4a54ad14f6da8c7dda793f7f1636dfe2564c704c732b7dd4974bc15a_340.jpg"}
// ]

app.get("/", (req, res) => {
    res.send("Homepage");
});

app.get("/landing", (req, res) => {
    res.render("landing");
});

// INDEX - Show all campgrounds
app.get("/campgrounds", (req, res) => {
    // Get all campgrounds
    Campground.find({}, (err, allCampgrounds) =>{
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});


// CREATE - Add new campgrounds to DB
app.post("/campgrounds", (req, res) => {
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc}
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, createdCampground) =>{
        if(err){
            console.log(err);
        }else{
            // Redirect back to list of campgrounds
            res.redirect("/campgrounds");
        }
    })
});


// NEW - Show form to create new campground
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});


// SHOW - Shows more info about one campground
app.get("/campgrounds/:id", (req, res) => {
    // Find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


// COMMENTS ROUTES
// =====================
app.get("/campgrounds/:id/comments/new", (req, res) =>{
    // find campground by id
    Campground.findById(req.params.id, (err, campground) =>{
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground: campground});
        }
    })
})

app.post("/campgrounds/:id/comments", (req, res) =>{
    // lookup campground usisng ID
    Campground.findById(req.params.id, (err, campground) =>{
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, (err, comment) =>{
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    })
    // create new comment
    // connect new comment to campground
    // redirect campground show page
})


// Express listens for requests (Start server)
app.listen(port, () => console.log(`YelpCAmp starting on port ${port}!`))