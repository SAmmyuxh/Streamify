import express from "express";
import { protectroute } from "../middleware/auth.middleware.js";
import {
  getRecommendedUsers,
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  getAllPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get recommended users
router.get("/recommended", protectroute, getRecommendedUsers);

// Get friends
router.get("/friends", protectroute, getFriends);

// Send friend request
router.post("/send-request/:recipientId", protectroute, sendFriendRequest);

// Get pending requests (received only)
router.get("/friend-requests", protectroute, getPendingRequests);

// Get all pending requests (sent and received) - for filtering
router.get("/friend-requests/pending", protectroute, getAllPendingRequests);

// Accept friend request
router.post("/friend-requests/accept/:requestId", protectroute, acceptFriendRequest);

// Reject friend request
router.post("/friend-requests/reject/:requestId", protectroute, rejectFriendRequest);

export default router;