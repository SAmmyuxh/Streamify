import { generatestreamtoken, upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";

// Endpoint to ensure a user exists in Stream Chat
export const ensureStreamUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("fullName profilePic _id");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName || "User",
        image: user.profilePic || "",
      });
      console.log(`Ensured Stream user exists: ${user.fullName} (${user._id.toString()})`);
      res.status(200).json({ success: true, message: "User synced to Stream Chat" });
    } catch (upsertError) {
      console.error('Error ensuring Stream user:', upsertError);
      res.status(500).json({ 
        message: "Failed to sync user to Stream Chat",
        error: process.env.NODE_ENV === "development" ? upsertError.message : undefined
      });
    }
  } catch (error) {
    console.error('Error in ensureStreamUser:', error);
    res.status(500).json({ 
      message: error.message || "Internal Server Error"
    });
  }
};

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Ensure user exists in Stream before generating token
    // This is critical - Stream requires users to be created before connecting
    try {
      const userIdStr = userId.toString();
      const userData = {
        id: userIdStr,
        name: req.user.fullName || "User",
      };
      
      // Only add image if it exists
      if (req.user.profilePic) {
        userData.image = req.user.profilePic;
      }
      
      await upsertStreamUser(userData);
      console.log(`Stream user upserted for token generation: ${req.user.fullName} (${userIdStr})`);
    } catch (upsertError) {
      console.error('Error upserting user to Stream:', upsertError);
      // Don't fail - continue with token generation as user might already exist
      // Stream will validate on connection
    }

    const token = generatestreamtoken(userId);
    
    if (!token) {
      return res.status(500).json({ message: "Failed to generate authentication token" });
    }

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({ 
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}