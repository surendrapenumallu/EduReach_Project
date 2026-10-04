import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  userId?: mongoose.Types.ObjectId;
  studentName: string;
  email: string;
  phone: string;
  course: string;
  twelfthPercentage: number;
  entranceExam: string;
  entranceRank?: string;
  status: "Pending" | "Under Review" | "Accepted" | "Rejected";
  documents?: {
    marksheet?: string;
    rankCard?: string;
    idProof?: string;
  };
  created_at: Date;
}

const ApplicationSchema: Schema<IApplication> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Target course is required"],
      trim: true,
    },
    twelfthPercentage: {
      type: Number,
      required: [true, "12th percentage is required"],
      min: [0, "Percentage cannot be less than 0"],
      max: [100, "Percentage cannot exceed 100"],
    },
    entranceExam: {
      type: String,
      default: "Direct",
      trim: true,
    },
    entranceRank: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Accepted", "Rejected"],
      default: "Pending",
    },
    documents: {
      marksheet: { type: String, default: null },
      rankCard: { type: String, default: null },
      idProof: { type: String, default: null },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: true },
    collection: "applications",
  }
);

const Application = mongoose.model<IApplication>("Application", ApplicationSchema);
export default Application;
