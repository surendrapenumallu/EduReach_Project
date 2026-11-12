import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "admission";
  isRead: boolean;
  relatedApplicationId?: mongoose.Types.ObjectId;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "admission"],
      default: "admission",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedApplicationId: {
      type: Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "notifications",
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;

