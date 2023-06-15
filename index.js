import express from "express";
import { config } from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import authRoute from "./routes/auth.js";
import quizzeRoute from "./routes/quizze.js";
import authMiddleware from "./middleware/authMiddleware.js";
import startQuizStatusUpdateJob from "./utils/node-cron.js";
const app = express();
config();
dbConnect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is working" });
});
startQuizStatusUpdateJob();
app.use("/api", authRoute);
app.use(authMiddleware);
app.use("/api/quizzes", quizzeRoute);
const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`Server Listening on port ${port}...`);
});
