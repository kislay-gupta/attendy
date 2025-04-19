import express, { response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./utils/logger.js";
import morgan from "morgan";
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://mnc.iistbihar.com/",
      "http://anotherdomain.com",
    ],
    credentials: true,
  })
);
// middlewares
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";
app.get("/", (req, res) => {
  res.send("API is working");
});
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
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
