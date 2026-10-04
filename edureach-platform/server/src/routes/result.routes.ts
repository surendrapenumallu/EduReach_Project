import { Router } from "express";
import {
  getMyResults,
  getAllResults,
  createResult,
  updateResult,
  deleteResult,
} from "../controllers/result.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.get("/my-results", authMiddleware, getMyResults);
router.get("/all", authMiddleware, getAllResults);
router.post("/", authMiddleware, createResult);
router.put("/:id", authMiddleware, updateResult);
router.delete("/:id", authMiddleware, deleteResult);

export default router;
