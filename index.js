import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { task } from "./service.js";
dotenv.config({
  path: "./env",
});
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!", err);
  });

task.start();
