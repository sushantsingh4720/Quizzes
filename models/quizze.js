import mongoose from "mongoose";
import User from "../models/user.js";
const quizzeSchema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    options: [
      {
        text: String,
      },
    ],
    startDate: Date,
    endDate: Date,
    rightAnswer: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["inactive", "active", "finished"],
      default: "inactive",
    },
  },

  { timestamps: true }
);

export default mongoose.model("Quizze", quizzeSchema);
