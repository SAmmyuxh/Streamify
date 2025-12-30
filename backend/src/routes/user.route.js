import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getRecommendedUsers,
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  getAllPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getMapUsers, // Import new controller
} from "../controllers/user.controller.js";

const router = express.Router();

// Get map users
router.get("/map-users", protectRoute, getMapUsers);

// Get recommended users
router.get("/recommended", protectRoute, getRecommendedUsers);

// Get friends
router.get("/friends", protectRoute, getFriends);

// Send friend request
router.post("/send-request/:recipientId", protectRoute, sendFriendRequest);

// Get pending requests (received only)
router.get("/friend-requests", protectRoute, getPendingRequests);

// Get all pending requests (sent and received) - for filtering
router.get("/friend-requests/pending", protectRoute, getAllPendingRequests);

// Accept friend request
router.post("/friend-requests/accept/:requestId", protectRoute, acceptFriendRequest);

// Reject friend request
router.post("/friend-requests/reject/:requestId", protectRoute, rejectFriendRequest);

export default router;