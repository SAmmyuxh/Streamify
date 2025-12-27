import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/models/User.js";
import { upsertStreamUser } from "./src/lib/stream.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const syncUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users to sync.`);

    for (const user of users) {
      try {
        await upsertStreamUser({
          id: user._id.toString(),
          name: user.fullName,
          image: user.profilePic || "",
        });
        console.log(`Synced user: ${user.fullName}`);
      } catch (err) {
        console.error(`Failed to sync user ${user.fullName}:`, err.message);
      }
    }

    console.log("Sync completed.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error syncing users:", error);
    mongoose.connection.close();
  }
};

syncUsers();
