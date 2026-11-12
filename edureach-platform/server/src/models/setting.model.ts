import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  institutionName: string;
  academicYear: string;
  currentSemester: string;
  maintenanceMode: boolean;
  allowStudentRegistration: boolean;
  allowFacultyRegistration: boolean;
  emailNotifications: boolean;
  maxCourseEnrollmentPerStudent: number;
  minAttendanceThreshold: number;
  updated_at: Date;
  updated_by: string;
}

const SettingSchema: Schema<ISetting> = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: "edureach_platform_settings",
  },
  institutionName: {
    type: String,
    default: "EduReach College of Engineering & Technology",
  },
  academicYear: {
    type: String,
    default: "2026-2027",
  },
  currentSemester: {
    type: String,
    default: "Even Semester (IV & VI)",
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  allowStudentRegistration: {
    type: Boolean,
    default: true,
  },
  allowFacultyRegistration: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  maxCourseEnrollmentPerStudent: {
    type: Number,
    default: 8,
  },
  minAttendanceThreshold: {
    type: Number,
    default: 75,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  updated_by: {
    type: String,
    default: "System Admin",
  },
});

const Setting = mongoose.model<ISetting>("Setting", SettingSchema);
export default Setting;

