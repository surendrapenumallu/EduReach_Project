import type { Request, Response, NextFunction } from "express";
import User, { type IUser } from "../models/user.model";
import AuditLog from "../models/audit-log.model";

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: IUser;
}

export const requireAdmin = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: No valid authentication session found.",
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access Denied: Administrative authorization is required.",
      });
      return;
    }

    if (user.status === "inactive" || user.status === "suspended") {
      res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the System Superadministrator.`,
      });
      return;
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal security authorization failure.",
    });
  }
};

export const logAdminAction = async (
  admin: IUser,
  action: string,
  targetType: "User" | "Course" | "Assessment" | "Enrollment" | "Resource" | "Announcement" | "Setting" | "Security",
  targetId?: string,
  targetName?: string,
  details?: string,
  ipAddress?: string
) => {
  try {
    await AuditLog.create({
      adminId: admin._id.toString(),
      adminName: admin.name,
      adminEmail: admin.email,
      action,
      targetType,
      targetId: targetId || undefined,
      targetName: targetName || undefined,
      details: details || "",
      ipAddress: ipAddress || "127.0.0.1",
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

