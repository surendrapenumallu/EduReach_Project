import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IAssessment extends Document {
  title: string;
  type: "quiz" | "assignment" | "exam" | "lab";
  courseCode: string;
  courseTitle: string;
  department: string;
  totalMarks: number;
  passingMarks: number;
  dueDate: Date;
  status: "active" | "draft" | "closed";
  submissionsCount: number;
  averageScore: number;
  instructions: string;
  created_by: string;
  created_at: Date;
}

const AssessmentSchema: Schema<IAssessment> = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["quiz", "assignment", "exam", "lab"],
    default: "quiz",
  },
  courseCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: "Computer Science & Engineering",
  },
  totalMarks: {
    type: Number,
    default: 100,
  },
  passingMarks: {
    type: Number,
    default: 40,
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  status: {
    type: String,
    enum: ["active", "draft", "closed"],
    default: "active",
  },
  submissionsCount: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  instructions: {
    type: String,
    default: "",
  },
  created_by: {
    type: String,
    default: "Admin / Faculty",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Assessment = mongoose.model<IAssessment>("Assessment", AssessmentSchema);
export default Assessment;

