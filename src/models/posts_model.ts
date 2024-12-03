import mongoose from "mongoose";

export interface IPost{
  title: string;
  content: string;
  owner: string;
}

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

const Post = mongoose.model<IPost>("posts", postSchema);

export default Post;