import { Router } from "express";
import multer from "multer";
import { uploadImage, uploadDocument } from "../controllers/upload.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// Configure Multer memory storage (up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/upload/image — Upload profile picture or avatar
router.post("/image", upload.single("image"), uploadImage);

// POST /api/upload/document — Upload PDF resume, marksheet, or ID proof
router.post("/document", upload.single("document"), uploadDocument);

export default router;
