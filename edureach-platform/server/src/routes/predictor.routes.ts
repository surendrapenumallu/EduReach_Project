import { Router, Request, Response, NextFunction } from "express";
import { predictAdmissions } from "../services/predictor.service";

const router = Router();

// POST /api/predictor/predict — Predict admission chances
router.post("/predict", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { entranceExam, entranceRank, twelfthPercentage, category } = req.body;

    if (twelfthPercentage === undefined || typeof Number(twelfthPercentage) !== "number") {
      res.status(400).json({
        success: false,
        message: "12th percentage is required for prediction.",
      });
      return;
    }

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
