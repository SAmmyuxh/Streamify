import mongoose from "mongoose";

const MomentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    media: {
      type: String, // Cloudinary URL
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      index: { expires: "0s" }, // MongoDB TTL Index
    },
  },
  { timestamps: true }
);

const Moment = mongoose.model("Moment", MomentSchema);

export default Moment;
