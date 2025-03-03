import express from "express";
import { upload } from "./middlewares/multer.middleware.js";
import { uploadPhoto } from "./controllers/photos.controllers.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// middlewares

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
app.use("/api/v1/upload", photoRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/org", orgRoutes);
export { app };
