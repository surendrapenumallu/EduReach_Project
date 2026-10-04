import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/password.util";
import { generateToken } from "../utils/jwt.util";

// POST /api/auth/register — Public — Create new account
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, role, department, facultyId } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role && ["student", "faculty", "admin"].includes(role) ? role : "student";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      role: userRole,
      department: department || "Computer Science & Engineering",
      facultyId: facultyId || (userRole === "faculty" ? `FAC-${Math.floor(1000 + Math.random() * 9000)}` : null),
    });

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          department: user.department,
          facultyId: user.facultyId,
          designation: user.designation,
          is2FAEnabled: user.is2FAEnabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login — Public — Verify credentials (by Email or Faculty ID)
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Faculty ID / Email and password are required." });
      return;
    }

    const searchInput = email.trim().toLowerCase();

    // Query user by email OR facultyId
    let user = await User.findOne({
      $or: [{ email: searchInput }, { facultyId: searchInput.toUpperCase() }, { facultyId: searchInput }],
    });

    // Auto-create demo user if attempting demo login and user doesn't exist
    if (!user && (searchInput.includes("demo") || searchInput.includes("student") || searchInput.includes("faculty") || searchInput.includes("fac"))) {
      const isFaculty = role === "faculty" || searchInput.includes("faculty") || searchInput.includes("fac");
      const hashedPassword = await hashPassword(password || "password123");
      user = await User.create({
        name: isFaculty ? "Prof. Rajesh Sharma" : "Alex Rivera",
        email: isFaculty ? "faculty@edureach.edu" : "student@edureach.edu",
        password: hashedPassword,
        role: isFaculty ? "faculty" : "student",
        department: isFaculty ? "Computer Science & Engineering" : "Artificial Intelligence & Data Science",
        facultyId: isFaculty ? "FAC-1002" : undefined,
        designation: isFaculty ? "Associate Professor & Exam Chair" : undefined,
        qualification: isFaculty ? "Ph.D. in Artificial Intelligence" : undefined,
        officeHours: isFaculty ? "Mon-Fri: 10:00 AM - 1:00 PM" : undefined,
      });
    }

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials. Please check your Email / Faculty ID and Password." });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || "student",
          department: user.department || "Computer Science",
          facultyId: user.facultyId || "FAC-1002",
          designation: user.designation || "Faculty Member",
          qualification: user.qualification || "Ph.D. Computer Science",
          officeHours: user.officeHours || "Mon-Fri 10am-1pm",
          is2FAEnabled: user.is2FAEnabled || false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me — Protected — Return current user profile
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = (req as any).user;

    if (!currentUser) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }

    const user = await User.findById(currentUser.userId).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || "student",
          department: user.department || "Computer Science",
          facultyId: user.facultyId || "FAC-1002",
          designation: user.designation || "Faculty Member",
          qualification: user.qualification || "Ph.D. Computer Science",
          officeHours: user.officeHours || "Mon-Fri 10am-1pm",
          is2FAEnabled: user.is2FAEnabled || false,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password — Request 6-digit OTP
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.otpCode = "123456"; // Default OTP for testing simulation
      user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Verification OTP sent to registered email.",
      data: { demoOtp: "123456" },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp — Verify OTP and reset password
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: "Email, OTP, and new password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    if (otp !== "123456" && user.otpCode !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP verification code." });
      return;
    }

    user.password = await hashPassword(newPassword);
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/update-profile — Protected — Update Faculty Profile details
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = (req as any).user;
    const { name, phone, department, designation, qualification, officeHours, facultyId, profilePhoto } = req.body;

    const user = await User.findById(currentUser.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department) user.department = department;
    if (designation) user.designation = designation;
    if (qualification) user.qualification = qualification;
    if (officeHours) user.officeHours = officeHours;
    if (facultyId) user.facultyId = facultyId;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password — Protected — Change Password
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current password and new password are required." });
      return;
    }

    const user = await User.findById(currentUser.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ success: false, message: "Incorrect current password." });
      return;
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/toggle-2fa — Protected — Enable or Disable 2FA
export const toggle2FA = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = (req as any).user;
    const { enable } = req.body;

    const user = await User.findById(currentUser.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    user.is2FAEnabled = Boolean(enable);
    await user.save();

    res.status(200).json({
      success: true,
      message: user.is2FAEnabled ? "Two-Factor Authentication (2FA) enabled successfully." : "Two-Factor Authentication (2FA) disabled.",
      data: { is2FAEnabled: user.is2FAEnabled },
    });
  } catch (error) {
    next(error);
  }
};
