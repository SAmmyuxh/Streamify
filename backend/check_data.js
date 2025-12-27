import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Total Users: ${users.length}`);
    
    users.forEach(u => {
        console.log(`User: ${u.fullName} | Email: ${u.email} | Onboarded: ${u.isOnboarded} | Interests: ${u.interests?.length || 0} | Friends: ${u.friends?.length || 0}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error checking data:", error);
    mongoose.connection.close();
  }
};

checkData();
