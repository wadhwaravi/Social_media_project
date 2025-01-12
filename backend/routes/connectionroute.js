import express from "express";
import { protectRoute } from "../middleware/authmiddleware.js";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getUserConnection,
  removeConnection,
  getConnectionStatus,
} from "../controllers/connectionController.js";
const router = express.Router();

router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.put("/accept/:userId", protectRoute, acceptConnectionRequest);
router.put("/reject/:userId", protectRoute, rejectConnectionRequest);
router.get("/requests", protectRoute, getConnectionRequests);
router.get("/", protectRoute, getUserConnection);
router.delete("/:userId", protectRoute, removeConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);

export default router;
