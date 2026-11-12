import { Router } from "express";
import {
  getMyResults,
  getAllResults,
  createResult,
  updateResult,
  deleteResult,
  downloadResultPDF,
} from "../controllers/result.controller";
import authMiddleware from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createResultSchema } from "../schemas/result.schema";

const router = Router();

router.get("/my-results", authMiddleware, getMyResults);
router.get("/all", authMiddleware, getAllResults);
router.get("/:id/pdf", downloadResultPDF);
router.post("/", authMiddleware, validateBody(createResultSchema), createResult);
router.put("/:id", authMiddleware, updateResult);
router.delete("/:id", authMiddleware, deleteResult);

export default router;
