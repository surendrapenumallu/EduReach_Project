import type { Request, Response, NextFunction } from "express";
import { uploadBufferToCloudinary } from "../config/cloudinary.config";

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No image file provided." });
      return;
    }

    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "edureach/images",
      "image"
    );

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url: result.url,
        publicId: result.publicId,
        size: result.bytes,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No document file provided." });
      return;
    }

    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      "edureach/documents",
      "auto"
    );

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      data: {
        url: result.url,
        publicId: result.publicId,
        size: result.bytes,
        originalName: req.file.originalname,
      },
    });
  } catch (error) {
    next(error);
  }
};
