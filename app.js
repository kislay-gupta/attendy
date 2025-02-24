import express from "express";
import { upload } from "./middlewares/multer.middleware.js";
const app = express();

app.get("/", (req, res) => {
  res.send("API is working");
});

app.post("/", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.send("File uploaded");
});

export { app };
