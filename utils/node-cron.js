import cron from "node-cron";
import Quizze from "../models/quizze.js";
const startQuizStatusUpdateJob = (req, res) => {
  // Schedule the cron job to run every minute

  cron.schedule("* * * * *", async (req, res) => {
    try {
      // Get the current time
      const currentTime = new Date();

      // Find quizzes that have an inactive status and start time less than or equal to the current time
      await Quizze.updateMany(
        {
          $and: [
            {
              status: "inactive",
            },
            {
              startDate: { $lte: currentTime },
            },
          ],
        },
        { status: "active" }
      );

      // Find quizzes that have an active status and endDate less than the current time
      await Quizze.updateMany(
        {
          $and: [
            {
              status: "active",
            },
            {
              endDateDate: { $lte: currentTime },
            },
          ],
        },
        { status: "finished" }
      );
    } catch (error) {
      // console.error("Error updating quiz statuses:", error);
      res.status(500).json({ error: true, message: error });
    }
  });
};
export default startQuizStatusUpdateJob;
