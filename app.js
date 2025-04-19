import express, { response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./utils/logger.js";
import morgan from "morgan";
const app = express();

const allowedOrigins = [
  "https://mnc.iistbihar.com",
  "https://k4soswsc0okwcckgggw8c4kg.iistbihar.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server requests (no origin)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".iistbihar.com")
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // Cache preflight response for 10 minutes
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
