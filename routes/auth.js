import { Router } from "express";
import { confirmAccount, login, signUp } from "../controllers/auth.js";
const router = Router();
router.post("/auth/signup", signUp);
router.post("/auth/login", login);
router.get("/auth/confirm/:confirmationToken", confirmAccount);
export default router;
