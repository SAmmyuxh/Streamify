import express from "express";
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"
import notificationRoutes from "./routes/notification.route.js"
import { connectDB } from "./lib/db.js";
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import morgan from "morgan";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev")); // Request logging
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}))
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/notifications',notificationRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`)
    connectDB()
})