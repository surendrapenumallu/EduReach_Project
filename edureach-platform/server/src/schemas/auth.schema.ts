import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["student", "faculty", "admin"]).optional(),
  department: z.string().optional(),
  facultyId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(3, "Email or Faculty ID is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["student", "faculty", "admin"]).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  officeHours: z.string().optional(),
  profilePhoto: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
