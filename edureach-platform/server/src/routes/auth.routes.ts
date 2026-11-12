import { Router } from "express";
import {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile,
  changePassword,
  toggle2FA,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authMiddleware, getMe);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.put("/update-profile", authMiddleware, validateBody(updateProfileSchema), updateProfile);
router.post("/change-password", authMiddleware, validateBody(changePasswordSchema), changePassword);
router.post("/toggle-2fa", authMiddleware, toggle2FA);

export default router;
