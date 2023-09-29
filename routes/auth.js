import { Router } from "express";
import { confirmAccount, login, signUp } from "../controllers/auth.js";
const router = Router();
router.post("/signup", signUp);
router.post("/login", login);
router.get("/confirm/:confirmationToken", confirmAccount);
export default router;
