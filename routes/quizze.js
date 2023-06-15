import { Router } from "express";
import {
  createQuiz,
  getActiveQuizzes,
  allQuizzes,
  getResultOfQuize,
} from "../controllers/quizze.js";

const router = Router();
router.post("/quizzes", createQuiz);
router.get("/quizzes/active", getActiveQuizzes);
router.get("/quizzes/all", allQuizzes);
router.get("/quizzes/:id/result", getResultOfQuize);
export default router;
