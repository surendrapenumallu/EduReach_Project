import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IAuditLog extends Document {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  ipAddress?: string;
  created_at: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema({
  adminId: {
    type: String,
    required: true,
  },
  adminName: {
    type: String,
    required: true,
    default: "Administrator",
  },
  adminEmail: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
    enum: ["User", "Course", "Assessment", "Enrollment", "Resource", "Announcement", "Setting", "Security", "Admission"],
  },
  targetId: {
    type: String,
    default: null,
  },
  targetName: {
    type: String,
    default: null,
  },
  details: {
    type: String,
    default: "",
  },
  ipAddress: {
    type: String,
    default: "127.0.0.1",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

AuditLogSchema.index({ created_at: -1 });

const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;

