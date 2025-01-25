import { Router } from "express";
import {
  createVideo,
  getCurrentUserVideos,
  getVideoById,
  streamVideo,
  viewVideo,
  getAllVideos,
  updateVideoDetails,
  deleteVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadVideo } from "../middleware/upload.multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/video-create").post(
  verifyJWT,
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo
);
router.route("/video-read-current-user").get(verifyJWT, getCurrentUserVideos);
router.route("/video-get").get(verifyJWT, getAllVideos);
router.route("/video-get/:id").get(verifyJWT, getVideoById);
router.route("/video-view/:id").patch(verifyJWT, viewVideo);
router.route("/video-stream/:id").get(verifyJWT, streamVideo);
router.route("/video-update/:id").patch(verifyJWT, updateVideoDetails);
router.route("/video-delete/:id").delete(verifyJWT, deleteVideo);

export default router;
