import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const forceFriendship = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const myEmail = "samruddhsubhadarshi@gmail.com"; // Replace with actual logged in user email if different
    const friendEmail = "john@example.com";

    const me = await User.findOne({ email: myEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!me || !friend) {
      console.error("User not found");
      process.exit(1);
    }

    console.log(`Making ${me.fullName} and ${friend.fullName} friends.`);

    if (!me.friends.includes(friend._id)) {
      me.friends.push(friend._id);
      await me.save();
    }

    if (!friend.friends.includes(me._id)) {
      friend.friends.push(me._id);
      await friend.save();
    }

    console.log("Friendship established!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    mongoose.connection.close();
  }
};

forceFriendship();
