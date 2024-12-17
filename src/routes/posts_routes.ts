import express from 'express';
const router = express.Router();
import PostsController from '../controllers/posts_controller';
import {authMiddleware} from '../controllers/auth_controller';

router.get("/",PostsController.getAllObjects.bind(PostsController));
router.get("/:id", PostsController.getObjectById.bind(PostsController));


router.post("/", authMiddleware, PostsController.createObject.bind(PostsController));

router.delete("/:id",authMiddleware,PostsController.deleteObject.bind(PostsController));

export default router;