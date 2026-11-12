import "dotenv/config";
import { describe, it, expect } from "vitest";
import { uploadBufferToCloudinary } from "../src/config/cloudinary.config";

describe("Cloudinary / Media Storage Service", () => {
  it("should upload image buffer and return asset URL with metadata", async () => {
    // Create a mock 1x1 GIF / PNG byte buffer
    const mockImageBuffer = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    const result = await uploadBufferToCloudinary(
      mockImageBuffer,
      "edureach/test-avatars",
      "image"
    );

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(typeof result.url).toBe("string");
    expect(result.url.length).toBeGreaterThan(10);
    expect(result.bytes).toBe(mockImageBuffer.length);
  });

  it("should upload document buffer and return document URL with metadata", async () => {
    const mockPdfBuffer = Buffer.from("%PDF-1.4 mock pdf document bytes here");

    const result = await uploadBufferToCloudinary(
      mockPdfBuffer,
      "edureach/test-docs",
      "auto"
    );

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(typeof result.url).toBe("string");
    expect(result.bytes).toBe(mockPdfBuffer.length);
  });
});
