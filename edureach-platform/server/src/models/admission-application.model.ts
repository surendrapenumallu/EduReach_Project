import mongoose, { Schema, Document } from "mongoose";

export type AdmissionStatus =
  | "Submitted"
  | "Under Review"
  | "Documents Required"
  | "Shortlisted"
  | "Approved"
  | "Rejected";

export interface IApplicationDocument {
  documentName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: Date;
}

export interface IApplicationDetails {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth?: Date;
  gender?: string;
  previousEducation?: string;
  academicPercentage?: number;
  address?: string;
}

export interface IAdmissionApplication extends Document {
  applicationId: string;
  userId: mongoose.Types.ObjectId;
  admissionSession: string;
  course: string;
  applicationDetails: IApplicationDetails;
  documents: IApplicationDocument[];
  status: AdmissionStatus;
  adminRemarks?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const ApplicationDocumentSchema = new Schema<IApplicationDocument>(
  {
    documentName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "application/pdf" },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ApplicationDetailsSchema = new Schema<IApplicationDetails>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: "Not Specified" },
    previousEducation: { type: String, default: "" },
    academicPercentage: { type: Number, default: null },
    address: { type: String, default: "" },
  },
  { _id: false }
);

const AdmissionApplicationSchema: Schema<IAdmissionApplication> = new Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    admissionSession: {
      type: String,
      required: true,
      default: "2024–25",
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    applicationDetails: {
      type: ApplicationDetailsSchema,
      required: true,
    },
    documents: {
      type: [ApplicationDocumentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Documents Required", "Shortlisted", "Approved", "Rejected"],
      default: "Submitted",
      index: true,
    },
    adminRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "submittedAt", updatedAt: "updatedAt" },
    collection: "admission_applications",
  }
);

// Prevent duplicate applications for the same student and admission session
AdmissionApplicationSchema.index({ userId: 1, admissionSession: 1 }, { unique: true });

const AdmissionApplication = mongoose.model<IAdmissionApplication>(
  "AdmissionApplication",
  AdmissionApplicationSchema
);
export default AdmissionApplication;

