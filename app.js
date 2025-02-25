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

app.get("/", (req, res) => {
  res.send("API is working");
});

// routes

import photoRoutes from "./routes/photos.routes.js";

app.use("/api/v1/upload", photoRoutes);

export { app };
