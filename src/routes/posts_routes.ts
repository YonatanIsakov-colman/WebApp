import express from 'express';
const router = express.Router();
import PostsController from '../controllers/posts_controllers';

router.get("/",PostsController.getAllObjects.bind(PostsController));
router.get("/:id", PostsController.getObjectById.bind(PostsController));

router.post("/", PostsController.createObject.bind(PostsController));

router.delete("/:id",PostsController.deleteObject.bind(PostsController));

export default router;