import express from "express";
import {  protectroute } from "../middleware/auth.middleware.js";
import { getNotifications, deleteNotification, sendCallInvite } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectroute, getNotifications);
router.post("/send-call-invite", protectroute, sendCallInvite);
router.delete("/:id", protectroute, deleteNotification);

export default router;
