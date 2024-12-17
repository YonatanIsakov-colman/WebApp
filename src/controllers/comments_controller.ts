import CommentsModel,{IComment} from "../models/comments_model";
import createController from "./base_controller";

const commentsController = createController<IComment>(CommentsModel);


export default commentsController;