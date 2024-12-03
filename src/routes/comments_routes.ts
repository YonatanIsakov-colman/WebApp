import express from 'express';
const router = express.Router();
import CommentsController from '../controllers/comments_controllers';

router.get("/",CommentsController.getAllObjects.bind(CommentsController));
router.get("/:id", CommentsController.getObjectById.bind(CommentsController));

router.post("/", CommentsController.createObject.bind(CommentsController));

router.delete("/:id",CommentsController.deleteObject.bind(CommentsController));

export default router;