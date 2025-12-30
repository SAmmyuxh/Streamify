import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getLeaderboard, updateStreak } from "../controllers/gamification.controller.js";

const router = express.Router();

router.get("/leaderboard", protectRoute, getLeaderboard);
router.post("/update-streak", protectRoute, updateStreak);

export default router;
