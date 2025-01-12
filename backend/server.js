import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authroute.js";
import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/userroute.js";
import postRoutes from "./routes/postroute.js";
import notificationsRoutes from "./routes/notificationsroute.js";
import connectionsRoutes from "./routes/connectionroute.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser()); // Should print your JWT if cookie is being sent

dotenv.config();

const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: "5mb" })); // parse json body
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/connections", connectionsRoutes);
app.listen(PORT, () => {
  console.log("server running on port " + PORT);
  connectDB();
});
