import express from "express";
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import notificationRoutes from "./routes/notification.route.js";
import gamificationRoutes from "./routes/gamification.route.js";
import momentRoutes from "./routes/moment.route.js";
import aiRoutes from "./routes/ai.route.js";
import { connectDB } from "./lib/db.js";
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import morgan from "morgan";
import chatRoutes from "./routes/chat.route.js";
dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser())
app.use(morgan("dev")); // Request logging
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173"
  ],
  credentials: true,
}));
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use("/api/notifications", notificationRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/moments", momentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect DB", err);
    process.exit(1);
  }
};

startServer();
