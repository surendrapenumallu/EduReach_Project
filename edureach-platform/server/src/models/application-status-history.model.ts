import mongoose, { Schema, Document } from "mongoose";

export interface IApplicationStatusHistory extends Document {
  applicationId: mongoose.Types.ObjectId;
  previousStatus: string;
  newStatus: string;
  remarks?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const ApplicationStatusHistorySchema: Schema<IApplicationStatusHistory> = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "application_status_histories",
  }
);

const ApplicationStatusHistory = mongoose.model<IApplicationStatusHistory>(
  "ApplicationStatusHistory",
  ApplicationStatusHistorySchema
);
export default ApplicationStatusHistory;

