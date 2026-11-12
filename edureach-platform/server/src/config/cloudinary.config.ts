import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log("☁️  Cloudinary configured successfully for media storage.");
} else {
  console.log("ℹ️  Cloudinary credentials not set in .env — using fallback storage.");
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder = "edureach",
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<UploadResult> => {
  if (isConfigured) {
    try {
      const uploadResult = await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format || "bin",
              bytes: result.bytes,
            });
          }
        );
        uploadStream.end(buffer);
      });
      return uploadResult;
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed or credentials invalid, using fallback data URI:", cloudErr);
    }
  }

  // Graceful fallback for local development or when Cloudinary keys are inactive:
  // Converts to data URI so avatar and documents render immediately without cloud dependence
  const base64Data = buffer.toString("base64");
  const mimeType = resourceType === "image" ? "image/jpeg" : "application/pdf";
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUri,
    publicId: `local_${Date.now()}`,
    format: resourceType === "image" ? "jpg" : "pdf",
    bytes: buffer.length,
  };
};

export default cloudinary;
