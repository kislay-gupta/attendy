import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// middlewares
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API is working");
});

// routes

import photoRoutes from "./routes/photos.routes.js";
import userRoutes from "./routes/users.routes.js";
import orgRoutes from "./routes/organizations.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
app.use("/api/v1/upload", photoRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/org", orgRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
export { app };
