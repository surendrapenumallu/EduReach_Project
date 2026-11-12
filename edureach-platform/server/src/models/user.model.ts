import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "student" | "faculty" | "admin";
  status: "active" | "inactive" | "suspended";
  isEmailVerified: boolean;
  rollNo?: string;
  department?: string;
  facultyId?: string;
  designation?: string;
  qualification?: string;
  officeHours?: string;
  profilePhoto?: string;
  is2FAEnabled?: boolean;
  otpCode?: string;
  otpExpires?: Date;
  created_at: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  phone: {
    type: String,
    trim: true,
    default: null,
  },
  role: {
    type: String,
    enum: ["student", "faculty", "admin"],
    default: "student",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  rollNo: {
    type: String,
    trim: true,
    default: null,
  },
  department: {
    type: String,
    trim: true,
    default: "Computer Science & Engineering",
  },
  facultyId: {
    type: String,
    trim: true,
    default: null,
  },
  designation: {
    type: String,
    trim: true,
    default: "Associate Professor",
  },
  qualification: {
    type: String,
    trim: true,
    default: "Ph.D. in Computer Science",
  },
  officeHours: {
    type: String,
    trim: true,
    default: "Mon-Fri: 10:00 AM - 12:00 PM",
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  is2FAEnabled: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

UserSchema.virtual("fullName").get(function () {
  return this.name;
});

UserSchema.virtual("mobile").get(function () {
  return this.phone;
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
