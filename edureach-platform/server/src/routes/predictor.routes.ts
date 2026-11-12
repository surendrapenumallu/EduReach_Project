import { Router, Request, Response, NextFunction } from "express";
import { predictAdmissions } from "../services/predictor.service";
import { validateBody } from "../middleware/validate.middleware";
import { predictorSchema } from "../schemas/predictor.schema";

const router = Router();

// POST /api/predictor/predict — Predict admission chances
router.post("/predict", validateBody(predictorSchema), (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { entranceExam, entranceRank, twelfthPercentage, category } = req.body;

    const result = predictAdmissions({
      entranceExam: entranceExam || "TS EAMCET",
      entranceRank: entranceRank ? Number(entranceRank) : undefined,
      twelfthPercentage: Number(twelfthPercentage),
      category: category || "General",
    });

    res.status(200).json({
      success: true,
      message: "Admission prediction generated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
