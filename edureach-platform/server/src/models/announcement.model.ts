import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  targetAudience: "all" | "students" | "faculty";
  priority: "normal" | "urgent" | "info";
  senderName: string;
  senderRole: string;
  isActive: boolean;
  created_at: Date;
}

const AnnouncementSchema: Schema<IAnnouncement> = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    enum: ["all", "students", "faculty"],
    default: "all",
  },
  priority: {
    type: String,
    enum: ["normal", "urgent", "info"],
    default: "normal",
  },
  senderName: {
    type: String,
    default: "Office of the Dean / Administrator",
  },
  senderRole: {
    type: String,
    default: "admin",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Announcement = mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
export default Announcement;

