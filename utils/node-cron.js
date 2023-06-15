import cron from "node-cron";
import Quizze from "../models/quizze.js";
const startQuizStatusUpdateJob = (req, res) => {
  // Schedule the cron job to run every minute

  cron.schedule("* * * * *", async (req, res) => {
    try {
      // Get the current time
      const currentTime = new Date();

      // Find quizzes that have an inactive status and start time less than or equal to the current time
      const quizzes = await Quizze.find({
        status: "inactive",
        startDate: { $lte: currentTime },
      });
      // Update the status of found quizzes to "active"
      for (const quiz of quizzes) {
        quiz.status = "active";
        await quiz.save();
        // console.log(`Quiz "${quiz.question}" status changed to active.`);
      }

      // Find quizzes that have an active status and endDate less than the current time
      const activeQuizzes = await Quizze.find({
        status: "active",
        endDate: { $lt: currentTime },
      });

      // Update the status of found quizzes to "finished"
      for (const quiz of activeQuizzes) {
        quiz.status = "finished";
        await quiz.save();
        // console.log(`Quiz "${quiz.question}" status changed to finished.`);
      }
    } catch (error) {
      // console.error("Error updating quiz statuses:", error);
      res.status(500).json({ error: true, message: error });
    }
  });
};
export default startQuizStatusUpdateJob;
