import { Router } from "express";
import { createLike, removeLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/like-create").post(verifyJWT, createLike);
router.route("/like-remove/:id").post(verifyJWT, removeLike);
export default router;
