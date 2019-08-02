const mongoose = require('mongoose');



// Schema Setup
var commentSchema = new mongoose.Schema({
    text: String,
    author: String
});

module.exports = mongoose.model("Comment", commentSchema);