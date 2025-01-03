import { Router } from "express";
import {
  createSubscription,
  removeSubscription,
  getSubscriberById,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/subscription-get/:id").get(verifyJWT, getSubscriberById);
router.route("/subscription-create").post(verifyJWT, createSubscription);
router.route("/subscription-remove/:id").post(verifyJWT, removeSubscription);
export default router;
