import { Router } from "express";
import {
  createQuiz,
  getActiveQuizzes,
  allQuizzes,
  getResultOfQuize,
} from "../controllers/quizze.js";

const router = Router();
router.post("/", createQuiz);
router.get("/active", getActiveQuizzes);
router.get("/all", allQuizzes);
router.get("/:id/result", getResultOfQuize);
export default router;
