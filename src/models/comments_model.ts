import mongoose from "mongoose";

export interface IComment {
  comment: string;
  postId: string;
  owner: string;
}


const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'posts' 
},
  owner: {
    type: String,
    required: true
  }
});

const commentsModel = mongoose.model<IComment>("comments", commentSchema);

export default commentsModel;