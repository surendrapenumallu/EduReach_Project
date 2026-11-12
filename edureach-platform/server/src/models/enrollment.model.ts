import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentRollNo: string;
  courseId: mongoose.Types.ObjectId;
  courseCode: string;
  courseTitle: string;
  department: string;
  semester: string;
  instructorName: string;
  enrolledDate: Date;
  status: "active" | "completed" | "dropped";
  grade: string;
  attendancePercentage: number;
  progressPercentage: number;
}

const EnrollmentSchema: Schema<IEnrollment> = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  studentRollNo: {
    type: String,
    default: "22CSE0104",
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
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
  semester: {
    type: String,
    default: "Semester 4",
  },
  instructorName: {
    type: String,
    default: "Prof. Rajesh Sharma",
  },
  enrolledDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "completed", "dropped"],
    default: "active",
  },
  grade: {
    type: String,
    default: "In Progress",
  },
  attendancePercentage: {
    type: Number,
    default: 88,
  },
  progressPercentage: {
    type: Number,
    default: 75,
  },
});

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
export default Enrollment;

