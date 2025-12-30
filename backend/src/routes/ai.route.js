import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { chatWithAI, transcribeAudio } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", protectRoute, chatWithAI);
router.post("/transcribe", protectRoute, transcribeAudio);

export default router;
