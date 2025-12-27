import e from "express";
import { protectroute } from "../middleware/auth.middleware.js";
import { getStreamToken, ensureStreamUser } from "../controllers/chat.controller.js";

const router = e.Router();

router.get('/token', protectroute, getStreamToken);
router.post('/ensure-user/:userId', protectroute, ensureStreamUser);

export default router;