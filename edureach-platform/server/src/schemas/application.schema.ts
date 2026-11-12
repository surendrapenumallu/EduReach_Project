import { z } from "zod";

export const createApplicationSchema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  course: z.string().min(2, "Course selection is required"),
  twelfthPercentage: z.coerce.number().min(0, "Percentage must be >= 0").max(100, "Percentage cannot exceed 100"),
  entranceExam: z.string().optional().default("Direct"),
  entranceRank: z.coerce.number().optional().nullable(),
  documents: z
    .object({
      marksheet10th: z.string().optional(),
      marksheet12th: z.string().optional(),
      idProof: z.string().optional(),
    })
    .optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["Pending", "Under Review", "Accepted", "Rejected"]),
});
