import PostsModel, { IPost } from "../models/posts_model";
import { BaseController } from "./base_controller";
import { Request, Response } from "express";

class PostsController extends BaseController<IPost> {
    constructor() {
        super(PostsModel);
    }

    async createObject(req: Request, res: Response) {
        const userId = req.query.userId;
        console.log(userId);
        const post = {
            ...req.body,
            owner: userId
        }
        req.body = post;
        super.createObject(req, res);
    };
}


export default new PostsController();