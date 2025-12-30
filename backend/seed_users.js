import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const dummyUsers = [
      {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        nativeLanguage: "English",
        learningLanguage: "Spanish",
        isOnboarded: true,
        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        bio: "Love learning languages!",
        location: "New York, USA",
        interests: ["Travel", "Music", "Coding"],
        coordinates: { lat: 40.7128, lng: -74.0060 }, // NYC
      },
      {
        fullName: "Maria Garcia",
        email: "maria@example.com",
        password: "password123",
        nativeLanguage: "Spanish",
        learningLanguage: "English",
        isOnboarded: true,
        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
        bio: "Hola! I want to practice English.",
        location: "Madrid, Spain",
        interests: ["Cooking", "Dancing", "Movies"],
        coordinates: { lat: 40.4168, lng: -3.7038 }, // Madrid
      },
      {
        fullName: "Yuki Tanaka",
        email: "yuki@example.com",
        password: "password123",
        nativeLanguage: "Japanese",
        learningLanguage: "English",
        isOnboarded: true,
        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
        bio: "Let's exchange languages!",
        location: "Tokyo, Japan",
        interests: ["Anime", "Tech", "Reading"],
        coordinates: { lat: 35.6762, lng: 139.6503 }, // Tokyo
      },
      {
        fullName: "Hans Müller",
        email: "hans@example.com",
        password: "password123",
        nativeLanguage: "German",
        learningLanguage: "French",
        isOnboarded: true,
        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hans",
        bio: "Guten Tag!",
        location: "Berlin, Germany",
        interests: ["Football", "Beer", "Cars"],
        coordinates: { lat: 52.5200, lng: 13.4050 }, // Berlin
      },
      {
        fullName: "Sophie Dubois",
        email: "sophie@example.com",
        password: "password123",
        nativeLanguage: "French",
        learningLanguage: "German",
        isOnboarded: true,
        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
        bio: "Bonjour!",
        location: "Paris, France",
        interests: ["Fashion", "Art", "Wine"],
        coordinates: { lat: 48.8566, lng: 2.3522 }, // Paris
      },
    ];

    for (const user of dummyUsers) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`Created user: ${user.fullName}`);
      } else {
        // Update existing user to ensure they have interests and isOnboarded
        existingUser.interests = user.interests;
        existingUser.isOnboarded = true;
        existingUser.location = user.location;
        existingUser.bio = user.bio;
        existingUser.coordinates = user.coordinates;
        await existingUser.save();
        console.log(`Updated existing user: ${user.fullName}`);
      }
    }

    console.log("Seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
