const express = require('express');
const router = express.Router();
const Post = require("../controllers/posts_controllers");

router.get("/",Post.getAllPosts);
router.get("/:id", Post.getPostById);

router.post("/", Post.createPost);

router.delete("/:id",Post.deletePost);

module.exports = router;