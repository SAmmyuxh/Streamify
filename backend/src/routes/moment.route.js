import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createMoment, getMomentsFeed, deleteMoment } from "../controllers/moment.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createMoment);
router.get("/", protectRoute, getMomentsFeed);
router.delete("/:id", protectRoute, deleteMoment);

export default router;
