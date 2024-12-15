import { Router } from "express";
import {
  createTweet,
  getCurrentUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router
  .route("/tweet-create")
  .post(
    verifyJWT,
    upload.fields([{ name: "postImage", maxCount: 1 }]),
    createTweet
  );
router.route("/current-User-tweet").get(verifyJWT, getCurrentUserTweets);
router.route("/tweet-update/:id").patch(verifyJWT, updateTweet);
router.route("/tweet-delete/:id").delete(verifyJWT, deleteTweet);

export default router;
