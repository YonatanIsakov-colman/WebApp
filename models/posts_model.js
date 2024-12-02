const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: String,
  owner: {
    type: String,
    required: true
  }
});

const Post = mongoose.model("posts", postSchema);

module.exports = Post;