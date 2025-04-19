import express, { response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./utils/logger.js";
import morgan from "morgan";
const app = express();

const allowedOrigins = [
  // Production URLs
  "https://mnc.iistbihar.com",
  "https://app.mdh-ngo-connect.com", // Add your production app URL
  "mdh-ngo-connect://", // For production mobile app deep linking

  // Development URLs
  ...(process.env.NODE_ENV === "development"
    ? [
        "http://localhost:3000",
        "http://localhost:19000",
        "exp://localhost:19000",
        "http://localhost:19006",
        "http://127.0.0.1:19000",
        "exp://127.0.0.1:19000",
      ]
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
