import mongoose, { Schema, Document } from "mongoose";

export interface IAdmissionDocument extends Document {
  applicationId: mongoose.Types.ObjectId;
  documentName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: Date;
}

const AdmissionDocumentSchema: Schema<IAdmissionDocument> = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: true,
      index: true,
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: "application/pdf",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "admission_documents",
  }
);

const AdmissionDocument = mongoose.model<IAdmissionDocument>("AdmissionDocument", AdmissionDocumentSchema);
export default AdmissionDocument;

