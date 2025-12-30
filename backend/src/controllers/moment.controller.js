import Moment from "../models/Moment.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export const createMoment = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user._id;
    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMoment = new Moment({
      userId,
      content,
      media: imageUrl,
    });

    await newMoment.save();

    res.status(201).json(newMoment);
  } catch (error) {
    console.error("Error in createMoment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMomentsFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const friends = user.friends;

    // Get moments from friends and self
    const moments = await Moment.find({
      userId: { $in: [...friends, userId] },
    })
      .populate("userId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(moments);
  } catch (error) {
    console.error("Error in getMomentsFeed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMoment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const moment = await Moment.findById(id);

    if (!moment) {
      return res.status(404).json({ message: "Moment not found" });
    }

    if (moment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (moment.media) {
         // Enhance: Delete from Cloudinary too (keeping it simple for now)
         const publicId = moment.media.split("/").pop().split(".")[0];
         await cloudinary.uploader.destroy(publicId);
    }

    await Moment.findByIdAndDelete(id);

    res.status(200).json({ message: "Moment deleted" });
  } catch (error) {
    console.error("Error in deleteMoment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
