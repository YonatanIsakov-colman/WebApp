import PostsModel,{IPost} from "../models/posts_model";
import createController from "./base_controller";

const postsController = createController<IPost>(PostsModel);

export default postsController;