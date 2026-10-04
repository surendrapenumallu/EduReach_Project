import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface ISubjectMark {
  code: string;
  name: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  credits: number;
}

export interface IResult extends Document {
  studentName: string;
  studentEmail: string;
  rollNo: string;
  department: string;
  course: string;
  semester: string;
  academicYear: string;
  subjects: ISubjectMark[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  sgpa: number;
  cgpa: number;
  status: "Pass" | "Fail";
  publishedBy: string;
  created_at: Date;
}

const SubjectMarkSchema = new Schema<ISubjectMark>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  internalMarks: { type: Number, required: true, default: 0 },
  externalMarks: { type: Number, required: true, default: 0 },
  totalMarks: { type: Number, required: true, default: 0 },
  maxMarks: { type: Number, required: true, default: 100 },
  grade: { type: String, required: true, default: "A" },
  credits: { type: Number, required: true, default: 3 },
});

const ResultSchema: Schema<IResult> = new Schema({
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true, lowercase: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, default: "2025-2026" },
  subjects: [SubjectMarkSchema],
  totalMarks: { type: Number, required: true },
  maxTotalMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  sgpa: { type: Number, required: true },
  cgpa: { type: Number, required: true },
  status: { type: String, enum: ["Pass", "Fail"], default: "Pass" },
  publishedBy: { type: String, default: "Faculty Examination Cell" },
  created_at: { type: Date, default: Date.now },
});

const Result = mongoose.model<IResult>("Result", ResultSchema);
export default Result;
