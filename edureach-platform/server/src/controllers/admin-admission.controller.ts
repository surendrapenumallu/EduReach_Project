import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import AdmissionApplication, { type AdmissionStatus } from "../models/admission-application.model";
import ApplicationStatusHistory from "../models/application-status-history.model";
import AdmissionDocument from "../models/admission-document.model";
import StudentProfile from "../models/student-profile.model";
import Notification from "../models/notification.model";
import AuditLog from "../models/audit-log.model";
import { sendApplicationStatusUpdateEmail } from "../services/email.service";
import { emitApplicationStatusUpdate, emitStudentNotification } from "../socket";

// GET /api/admin/admissions — Filtered & Paginated Admissions List
export const getAdminAdmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const { session, course, status, search } = req.query;

    const filter: Record<string, any> = {};

    if (session && session !== "all") {
      filter.admissionSession = session;
    }
    if (course && course !== "all") {
      filter.course = course;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      const searchRegex = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { applicationId: searchRegex },
        { "applicationDetails.fullName": searchRegex },
        { "applicationDetails.email": searchRegex },
        { "applicationDetails.mobile": searchRegex },
        { course: searchRegex },
      ];
    }

    const [applications, total] = await Promise.all([
      AdmissionApplication.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email phone isEmailVerified"),
      AdmissionApplication.countDocuments(filter),
    ]);

    // Fast status stats
    const stats = await AdmissionApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statMap: Record<string, number> = {
      Submitted: 0,
      "Under Review": 0,
      "Documents Required": 0,
      Shortlisted: 0,
      Approved: 0,
      Rejected: 0,
      Total: await AdmissionApplication.countDocuments(),
    };

    stats.forEach((s) => {
      statMap[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      data: {
        applications,
        stats: statMap,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/admissions/:applicationId — Single Application Details
export const getAdminAdmissionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appId = String(req.params.applicationId);

    const application = await AdmissionApplication.findOne({
      $or: [
        { applicationId: appId },
        ...(mongoose.Types.ObjectId.isValid(appId) ? [{ _id: appId }] : []),
      ],
    }).populate("userId", "name email phone isEmailVerified created_at");

    if (!application) {
      res.status(404).json({ success: false, message: "Admission application not found." });
      return;
    }

    const [history, documents, profile] = await Promise.all([
      ApplicationStatusHistory.find({ applicationId: application._id })
        .sort({ updatedAt: 1 })
        .populate("updatedBy", "name role"),
      AdmissionDocument.find({ applicationId: application._id }),
      StudentProfile.findOne({ userId: application.userId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        application,
        history,
        documents,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/admissions/:applicationId/status — Update Application Status
export const updateAdminAdmissionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appId = String(req.params.applicationId);
    const { status, remarks } = req.body;
    const adminUser = (req as any).user;

    const validStatuses: AdmissionStatus[] = [
      "Submitted",
      "Under Review",
      "Documents Required",
      "Shortlisted",
      "Approved",
      "Rejected",
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const application = await AdmissionApplication.findOne({
      $or: [
        { applicationId: appId },
        ...(mongoose.Types.ObjectId.isValid(appId) ? [{ _id: appId }] : []),
      ],
    });

    if (!application) {
      res.status(404).json({ success: false, message: "Admission application not found." });
      return;
    }

    const previousStatus = application.status;
    application.status = status;
    if (remarks !== undefined) {
      application.adminRemarks = remarks;
    }
    await application.save();

    // Record Status History
    await ApplicationStatusHistory.create({
      applicationId: application._id,
      previousStatus,
      newStatus: status,
      remarks: remarks || "",
      updatedBy: adminUser.userId,
      updatedAt: new Date(),
    });

    // Create Audit Log
    await AuditLog.create({
      adminId: adminUser.userId,
      adminName: adminUser.email || "Administrator",
      adminEmail: adminUser.email || "admin@edureach.edu",
      action: "UPDATE_ADMISSION_STATUS",
      targetType: "Admission",
      targetId: application._id.toString(),
      targetName: application.applicationId,
      details: JSON.stringify({
        applicationId: application.applicationId,
        previousStatus,
        newStatus: status,
        remarks,
      }),
    }).catch((e) => console.warn("Audit log warning:", e));

    // Create Notification for Student
    const notification = await Notification.create({
      userId: application.userId,
      title: `Admission Status Updated: ${status}`,
      message: `Your application (${application.applicationId}) has been moved to ${status}.${
        remarks ? ` Remarks: ${remarks}` : ""
      }`,
      type: status === "Approved" ? "success" : status === "Rejected" ? "error" : "admission",
      relatedApplicationId: application._id,
      actionUrl: "/dashboard",
      isRead: false,
      createdAt: new Date(),
    });

    // Emit Real-time Socket.IO notification
    try {
      emitStudentNotification(application.userId.toString(), notification);
      emitApplicationStatusUpdate(application);
    } catch (e) {
      console.warn("Socket notification warning:", e);
    }

    // Send Status Update Email
    const studentEmail = application.applicationDetails.email;
    const studentName = application.applicationDetails.fullName;

    sendApplicationStatusUpdateEmail(
      studentEmail,
      studentName,
      application.applicationId,
      status,
      remarks
    ).catch((e) => console.warn("Status update email warning:", e));

    res.status(200).json({
      success: true,
      message: `Application status successfully updated to ${status}.`,
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/admissions/:applicationId/remarks — Add remarks
export const updateAdminAdmissionRemarks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appId = String(req.params.applicationId);
    const { remarks } = req.body;

    const application = await AdmissionApplication.findOneAndUpdate(
      {
        $or: [
          { applicationId: appId },
          ...(mongoose.Types.ObjectId.isValid(appId) ? [{ _id: appId }] : []),
        ],
      },
      { adminRemarks: remarks || "" },
      { new: true }
    );

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Remarks updated successfully.",
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/admissions/statistics — Admission Analytics
export const getAdminAdmissionStatistics = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, statusBreakdown, sessionBreakdown, courseBreakdown] = await Promise.all([
      AdmissionApplication.countDocuments(),
      AdmissionApplication.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      AdmissionApplication.aggregate([
        { $group: { _id: "$admissionSession", count: { $sum: 1 } } },
      ]),
      AdmissionApplication.aggregate([
        { $group: { _id: "$course", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        statusBreakdown,
        sessionBreakdown,
        courseBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
