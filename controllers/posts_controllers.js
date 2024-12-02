const Post = require("../models/posts_model");

const getAllPosts = async (req, res) => {
  const ownerFilter = req.query.owner;
  try {
    if (ownerFilter) {
      const posts = await Post.find({ owner: ownerFilter });
      res.status(200).send(posts);
    } else {
      const posts = await Post.find();
      res.status(200).send(posts);
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

getPostById = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id);
    if(post === null)
      res.status(404).send("Post not found");
    else
      res.status(200).send(post);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

const createPost = async (req, res) => {
  console.log(req.body);
  try {
    const post = await Post.create(req.body);
    res.status(201).send(post);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

const deletePost = async(req,res) => {
  const id = req.params.id;
  try{
    const post = await Post.deleteOne({_id:id});
    if(post.deletedCount === 0)
      res.status(404).send("Post not found");
    else
    res.status(201).send(post);
  }catch(err){
    res.status(400);
    res.send(err);
  }
}

module.exports = { getAllPosts, createPost, getPostById,deletePost };