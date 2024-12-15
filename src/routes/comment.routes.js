import { Router } from "express";
import {
  createComment,
  getCurrentVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/comment-create").post(verifyJWT, createComment);
router
  .route("/current-video-comment/:id")
  .get(verifyJWT, getCurrentVideoComments);
router.route("/comment-update/:id").patch(verifyJWT, updateComment);
router.route("/comment-delete/:id").delete(verifyJWT, deleteComment);

export default router;
