import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["friend_request_received", "friend_request_accepted", "new_message", "call_invite"],
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // ID of the FriendRequest or Message
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object,
    default: null,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
