import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IResource extends Document {
  title: string;
  courseCode: string;
  courseTitle: string;
  unit: string;
  type: "pdf" | "ppt" | "video" | "note" | "link";
  fileUrl: string;
  fileSize: string;
  isRestricted: boolean;
  uploadedBy: string;
  created_at: Date;
}

const ResourceSchema: Schema<IResource> = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
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
  unit: {
    type: String,
    default: "Unit 1",
  },
  type: {
    type: String,
    enum: ["pdf", "ppt", "video", "note", "link"],
    default: "pdf",
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: String,
    default: "2.4 MB",
  },
  isRestricted: {
    type: Boolean,
    default: false,
  },
  uploadedBy: {
    type: String,
    default: "Admin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
export default Resource;

