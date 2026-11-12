import mongoose, { Schema, Document } from "mongoose";

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: "Male" | "Female" | "Other" | string;
  address?: string;
  previousEducation?: string;
  academicPercentage?: number;
  emergencyContact?: string;
  created_at: Date;
  updated_at: Date;
}

const StudentProfileSchema: Schema<IStudentProfile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    previousEducation: {
      type: String,
      trim: true,
      default: "",
    },
    academicPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "student_profiles",
  }
);

const StudentProfile = mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
export default StudentProfile;

