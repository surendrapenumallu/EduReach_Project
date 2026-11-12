import mongoose, { Schema, Document } from "mongoose";

export interface IOTPVerification extends Document {
  email: string;
  otpHash: string;
  purpose: "email_verification" | "password_reset" | "two_factor";
  expiresAt: Date;
  attempts: number;
  created_at: Date;
}

const OTPVerificationSchema: Schema<IOTPVerification> = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset", "two_factor"],
      default: "email_verification",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: document auto-deletes when expiresAt is reached
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "otp_verifications",
  }
);

const OTPVerification = mongoose.model<IOTPVerification>("OTPVerification", OTPVerificationSchema);
export default OTPVerification;

