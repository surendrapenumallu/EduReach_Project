import { Router } from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  updateProfile,
  changePassword,
  toggle2FA,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.put("/update-profile", authMiddleware, updateProfile);
router.post("/change-password", authMiddleware, changePassword);
router.post("/toggle-2fa", authMiddleware, toggle2FA);

export default router;
