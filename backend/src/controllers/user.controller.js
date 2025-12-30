import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";

// Get recommended users (excluding friends and users with pending requests)
export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("friends");
    
    // Get all pending requests (both sent and received)
    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: req.user._id, status: "pending" },
        { recipient: req.user._id, status: "pending" }
      ]
    }).select("sender recipient");

    // Extract user IDs to exclude
    const excludeIds = [
      req.user._id,
      ...currentUser.friends,
      ...pendingRequests.map(req => req.sender.toString()),
      ...pendingRequests.map(req => req.recipient.toString())
    ];

    const recommendedUsers = await User.find({
      _id: { $nin: excludeIds }
    })
      .select("-password")
      .limit(20);

    res.json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's friends
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "fullName profilePic nativeLanguage learningLanguage location"
    );
    res.json(user.friends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const senderId = req.user._id;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(recipientId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ],
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
    });

    // Create notification for recipient
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: "friend_request_received",
      relatedId: friendRequest._id,
    });

    res.status(201).json({ 
      message: "Friend request sent successfully",
      request: friendRequest 
    });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending friend requests (received)
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    })
      .populate("sender", "fullName profilePic nativeLanguage learningLanguage")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all pending requests (both sent and received) for filtering
export const getAllPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      $or: [
        { sender: req.user._id, status: "pending" },
        { recipient: req.user._id, status: "pending" }
      ]
    })
      .populate("sender", "fullName profilePic")
      .populate("recipient", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error in getAllPendingRequests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Delete the 'received' notification
    await Notification.findOneAndDelete({
      recipient: req.user._id,
      relatedId: friendRequest._id,
      type: "friend_request_received",
    });

    // Create notification for the original sender that their request was accepted
    await Notification.create({
      recipient: friendRequest.sender,
      sender: req.user._id,
      type: "friend_request_accepted",
      relatedId: friendRequest._id,
    });

    // Add both users to each other's friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the request
    await FriendRequest.findByIdAndDelete(requestId);

    // Delete the associated notification
    await Notification.findOneAndDelete({
      recipient: req.user._id,
      relatedId: requestId,
      type: "friend_request_received",
    });

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get users for map (users with coordinates)
export const getMapUsers = async (req, res) => {
  try {
    const users = await User.find({
      "coordinates.lat": { $ne: 0 },
      "coordinates.lng": { $ne: 0 },
      _id: { $ne: req.user._id } // Exclude self
    })
    .select("fullName profilePic nativeLanguage learningLanguage location coordinates")
    .limit(50);

    res.json(users);
  } catch (error) {
    console.error("Error in getMapUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};