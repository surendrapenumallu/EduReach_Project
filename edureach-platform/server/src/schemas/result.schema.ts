import { z } from "zod";

export const subjectMarkSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  internalMarks: z.number().min(0).max(40),
  externalMarks: z.number().min(0).max(60),
  totalMarks: z.number().min(0).max(100),
  maxMarks: z.number().default(100),
  grade: z.string(),
  credits: z.number().min(1).max(6),
});

export const createResultSchema = z.object({
  studentName: z.string().min(2),
  studentEmail: z.string().email(),
  rollNo: z.string().min(3),
  department: z.string().min(2),
  course: z.string().min(2),
  semester: z.string().min(2),
  academicYear: z.string().min(4),
  subjects: z.array(subjectMarkSchema).min(1, "At least one subject required"),
  totalMarks: z.number(),
  maxTotalMarks: z.number(),
  percentage: z.number(),
  sgpa: z.number(),
  cgpa: z.number(),
  status: z.enum(["Pass", "Fail", "Withheld"]).default("Pass"),
  publishedBy: z.string().optional(),
});
