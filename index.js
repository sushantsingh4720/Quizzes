import express from "express";
import rateLimit from "express-rate-limit";
import cacheService from "express-api-cache";
import { config } from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import authRoute from "./routes/auth.js";
import quizzeRoute from "./routes/quizze.js";
import authMiddleware from "./middleware/authMiddleware.js";
import startQuizStatusUpdateJob from "./utils/node-cron.js";
const app = express();
const cache = cacheService.cache;

config();
dbConnect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 10000,
  message: "Too many request from this IP, please try again after an hour.",
});
// Apply the rate limiting middleware to API calls only
app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is working" });
});

//Implement cron jop
startQuizStatusUpdateJob();

//Implement caching to reduce the response time of frequently accessed data.
app.use(cache("10 minutes"));
app.use("/api", authRoute);
app.use(authMiddleware);
app.use("/api/quizzes", quizzeRoute);
const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`Server Listening on port ${port}...`);
});
