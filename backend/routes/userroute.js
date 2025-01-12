import express, { Router } from "express";
import { protectRoute } from "../middleware/authmiddleware.js";
import {
  getSuggestedConnections,
  getPublicProfile,
  updateProfile,
} from "../controllers/userController.js";
const router = express.Router();

router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile);
router.put("/profile", protectRoute, updateProfile);
export default router;
