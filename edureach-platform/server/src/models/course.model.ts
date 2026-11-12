import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface ICourse extends Document {
  code: string;
  title: string;
  department: string;
  semester: string;
  credits: number;
  instructorId?: mongoose.Types.ObjectId;
  instructorName: string;
  instructorEmail?: string;
  description: string;
  schedule: string;
  room: string;
  category: string;
  isPublished: boolean;
  status: "active" | "archived" | "draft";
  maxSeats: number;
  enrolledCount: number;
  imageUrl?: string;
  created_at: Date;
}

const CourseSchema: Schema<ICourse> = new Schema({
  code: {
    type: String,
    required: [true, "Course code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  title: {
    type: String,
    required: [true, "Course title is required"],
    trim: true,
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true,
    default: "Computer Science & Engineering",
  },
  semester: {
    type: String,
    required: true,
    default: "Semester 4",
  },
  credits: {
    type: Number,
    required: true,
    default: 4,
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  instructorName: {
    type: String,
    required: true,
    default: "Prof. Rajesh Sharma",
  },
  instructorEmail: {
    type: String,
    default: "faculty@edureach.edu",
  },
  description: {
    type: String,
    default: "",
  },
  schedule: {
    type: String,
    default: "Mon, Wed, Fri (10:00 AM - 11:30 AM)",
  },
  room: {
    type: String,
    default: "Lab Block 3 - Room 302",
  },
  category: {
    type: String,
    default: "Core Engineering",
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ["active", "archived", "draft"],
    default: "active",
  },
  maxSeats: {
    type: Number,
    default: 60,
  },
  enrolledCount: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model<ICourse>("Course", CourseSchema);
export default Course;

