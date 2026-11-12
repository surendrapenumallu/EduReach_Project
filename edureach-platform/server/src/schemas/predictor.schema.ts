import { z } from "zod";

export const predictorSchema = z.object({
  entranceExam: z.string().optional().default("TS EAMCET"),
  entranceRank: z.coerce.number().optional(),
  twelfthPercentage: z.coerce.number().min(0).max(100, "12th percentage must be between 0 and 100"),
  category: z.string().optional().default("General"),
});
