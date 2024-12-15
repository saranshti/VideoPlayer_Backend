import { Router } from "express";
import {
  createPlaylist,
  addVideos,
  removeVideos,
  getCurrentPlayist,
  getAllPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/playlist-create").post(verifyJWT, createPlaylist);
router.route("/playlist-add-videos/:id").patch(verifyJWT, addVideos);
router.route("/playlist-remove-videos/:id").patch(verifyJWT, removeVideos);
router.route("/playlist-all").get(verifyJWT, getAllPlaylist);
router.route("/playlist-curent/:id").get(verifyJWT, getCurrentPlayist);
router.route("/playlist-update/:id").patch(verifyJWT, updatePlaylist);
router.route("/playlist-delete/:id").delete(verifyJWT, deletePlaylist);

export default router;
