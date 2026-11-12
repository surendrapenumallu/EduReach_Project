import "dotenv/config";
import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../src/utils/password.util";
import { generateToken, verifyToken } from "../src/utils/jwt.util";
import { registerSchema, loginSchema } from "../src/schemas/auth.schema";

process.env.JWT_SECRET = process.env.JWT_SECRET || "edureach_jwt_super_secret_2026";

describe("Authentication Utilities & Zod Schemas", () => {
  it("should securely hash passwords and verify them correctly", async () => {
    const rawPassword = "EduReachSecure2026!";
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);
    expect(hashed.length).toBeGreaterThan(20);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword("WrongPassword123", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("should generate and verify JWT payload", () => {
    const payload = { userId: "user_123456", email: "student@edureach.edu" };
    const token = generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it("should validate valid registration inputs with Zod", () => {
    const validRegistration = {
      name: "Sravan Reddy",
      email: "sravan@edureach.edu",
      password: "password123",
      role: "student",
      department: "Computer Science & Engineering",
    };

    const result = registerSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it("should reject invalid registration inputs with descriptive errors", () => {
    const invalidRegistration = {
      name: "S",
      email: "not-an-email",
      password: "123",
    };

    const result = registerSchema.safeParse(invalidRegistration);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Invalid email address");
      expect(messages).toContain("Password must be at least 6 characters");
    }
  });

  it("should validate valid login inputs with Zod", () => {
    const validLogin = {
      email: "FAC-1002",
      password: "password123",
    };

    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });
});
