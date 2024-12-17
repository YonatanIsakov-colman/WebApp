import express from 'express';
const router = express.Router();
import CommentsController from '../controllers/comments_controller';
import { authMiddleware } from "../controllers/auth_controller";


router.get("/",CommentsController.getAllObjects.bind(CommentsController));
router.get("/:id", CommentsController.getObjectById.bind(CommentsController));

router.post("/", CommentsController.createObject.bind(CommentsController));

router.delete("/:id",authMiddleware,CommentsController.deleteObject.bind(CommentsController));

export default router;