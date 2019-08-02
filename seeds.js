const mongoose = require('mongoose');
var Campground = require("./models/campground");
var Comment   = require("./models/comment");


var data = [
    {
        name: "Humpy Hill",
        image: "https://images.unsplash.com/photo-1526491109672-74740652b963?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Love the Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Lectus proin nibh nisl condimentum id venenatis a condimentum. Sit amet mauris commodo quis imperdiet massa tincidunt. Faucibus nisl tincidunt eget nullam non. Feugiat vivamus at augue eget arcu dictum varius duis at. Sed id semper risus in hendrerit. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Ultrices tincidunt arcu non sodales neque sodales ut. Posuere sollicitudin aliquam ultrices sagittis orci a. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Non odio euismod lacinia at quis risus. Sed felis eget velit aliquet sagittis. Condimentum vitae sapien pellentesque habitant morbi tristique. Purus gravida quis blandit turpis cursus in hac."
    },
    {
        name: "Paradiso",
        image: "https://images.unsplash.com/photo-1510277861473-16b27b39c47a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Lectus proin nibh nisl condimentum id venenatis a condimentum. Sit amet mauris commodo quis imperdiet massa tincidunt. Faucibus nisl tincidunt eget nullam non. Feugiat vivamus at augue eget arcu dictum varius duis at. Sed id semper risus in hendrerit. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Ultrices tincidunt arcu non sodales neque sodales ut. Posuere sollicitudin aliquam ultrices sagittis orci a. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Non odio euismod lacinia at quis risus. Sed felis eget velit aliquet sagittis. Condimentum vitae sapien pellentesque habitant morbi tristique. Purus gravida quis blandit turpis cursus in hac.!!"
    },
    {
        name: "Swan Lake",
        image: "https://images.unsplash.com/photo-1547706276-da514c3f4ad6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Dolor sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Lectus proin nibh nisl condimentum id venenatis a condimentum. Sit amet mauris commodo quis imperdiet massa tincidunt. Faucibus nisl tincidunt eget nullam non. Feugiat vivamus at augue eget arcu dictum varius duis at. Sed id semper risus in hendrerit. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et. Ultrices tincidunt arcu non sodales neque sodales ut. Posuere sollicitudin aliquam ultrices sagittis orci a. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Non odio euismod lacinia at quis risus. Sed felis eget velit aliquet sagittis. Condimentum vitae sapien pellentesque habitant morbi tristique. Purus gravida quis blandit turpis cursus in hac."
    }
]


// Async + Await version of seedDB()
async function seedDB(){
    try{
        await Campground.remove({});
        console.log("Campground removed");
        await Comment.remove({});
        console.log("Comment removed");
        for(const seed of data) {
            let campground = await Campground.create(seed);
            console.log("Campground created");
            let comment = await Comment.create(
                {
                    text: "Wow So Cool!!!",
                    author: "Homer"
                }
            )
            console.log("Comment created");
            campground.comments.push(comment);
            campground.save();
            console.log("Comment added to campground");
        }
    }catch(err){
        console.log(err);
    }
}



// function seedDB(){
//     // Remove all campgrounds
//     Campground.remove({}, (err) =>{
//         if(err){
//             console.log(err);
//         }
//         console.log("REMOVED CAMPGROUNDS");
//         // Add new campgrounds
//         data.forEach(seed =>{
//             Campground.create(seed, (err, campground) =>{
//                 if(err){
//                     console.log(err);
//                 }else{
//                     console.log("Added new campground");
//                     // Create new comment
//                     Comment.create(
//                         {
//                             text: "Wow So Cool!!!",
//                             author: "Homer"
//                         }, function(err, comment){
//                             if(err){
//                                 console.log(err);
//                             } else {
//                                 campground.comments.push(comment);
//                                 campground.save();
//                                 console.log("Created new comment");
//                             }
//                         });
//                 }
//             })
//         })
//     });
// }

module.exports = seedDB;
