import Notification from "../models/Notification.js";

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read (optional, for future use)
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Send call invitation
export const sendCallInvite = async (req, res) => {
  try {
    const { recipientId, callId } = req.body;
    const senderId = req.user._id;

    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: "call_invite",
      metadata: { callId },
    });
    
    res.status(200).json({ message: "Invite sent" });
  } catch (error) {
    console.error("Error sending call invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};
