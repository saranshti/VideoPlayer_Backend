import { Router } from "express";
import {
  createSubscription,
  removeSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

subscription;
const router = Router();

router.route("/subscription-create").post(verifyJWT, createSubscription);
router.route("/subscription-remove").post(verifyJWT, removeSubscription);
export default router;
