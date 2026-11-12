import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import AdmissionApplication from "../models/admission-application.model";
import StudentProfile from "../models/student-profile.model";
import AdmissionDocument from "../models/admission-document.model";
import ApplicationStatusHistory from "../models/application-status-history.model";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import { hashPassword } from "../utils/password.util";
import { generateToken } from "../utils/jwt.util";
import {
  sendApplicationConfirmationEmail,
} from "../services/email.service";
import {
  emitAdminAdmissionAlert,
  emitNewApplication,
  emitStudentNotification,
} from "../socket";

/**
 * Generate a unique Application ID in format EDU2026-XXXXX
 */
const generateApplicationId = async (sessionPrefix = "EDU2026"): Promise<string> => {
  let isUnique = false;
  let candidateId = "";

  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    candidateId = `${sessionPrefix}-${randomNum}`;
    const existing = await AdmissionApplication.findOne({ applicationId: candidateId });
    if (!existing) {
      isUnique = true;
    }
  }

  return candidateId;
};

// POST /api/admissions/apply — Submit Admission Application
export const applyForAdmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      fullName,
      studentName,
      email,
      mobile,
      phone,
      dateOfBirth,
      gender,
      course,
      previousEducation,
      academicPercentage,
      address,
      admissionSession = "2024–25",
      documents = [],
    } = req.body;

    const applicantName = (fullName || studentName || "").trim();
    const applicantEmail = (email || "").toLowerCase().trim();
    const applicantMobile = (mobile || phone || "").trim();
    const targetCourse = (course || "").trim();
    const pct = Number(academicPercentage);

    // Strict validation
    if (!applicantName) {
      res.status(400).json({ success: false, message: "Full Name is required." });
      return;
    }
    if (!applicantEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) {
      res.status(400).json({ success: false, message: "A valid email address is required." });
      return;
    }
    if (!applicantMobile || applicantMobile.replace(/\D/g, "").length < 10) {
      res.status(400).json({ success: false, message: "A valid 10-digit mobile number is required." });
      return;
    }
    if (!targetCourse) {
      res.status(400).json({ success: false, message: "Course Applying For is required." });
      return;
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      res.status(400).json({ success: false, message: "Academic percentage must be a valid number between 0 and 100." });
      return;
    }

    // Resolve or Auto-Create User Account
    let user: any = null;
    const currentUserId = req.user?.userId;

    if (currentUserId) {
      user = await User.findById(currentUserId);
    }
    if (!user) {
      user = await User.findOne({ email: applicantEmail });
    }

    if (!user) {
      // Auto-create student account for guest admission submissions
      const defaultPassword = await hashPassword("student123");
      user = await User.create({
        name: applicantName,
        email: applicantEmail,
        password: defaultPassword,
        phone: applicantMobile,
        role: "student",
        isEmailVerified: true,
        department: targetCourse.includes("CSE") || targetCourse.includes("Computer") ? "Computer Science & Engineering" : "Engineering & Technology",
      });
    } else {
      // Ensure student email is marked verified when submitting official application with credentials
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        if (!user.phone && applicantMobile) user.phone = applicantMobile;
        await user.save();
      }
    }

    // Generate JWT token so the applicant is automatically authenticated
    const token = generateToken({ userId: user._id.toString(), email: user.email });

    // Check duplicate applications for this student and admission session
    const existingApp = await AdmissionApplication.findOne({
      userId: user._id,
      admissionSession,
    });

    if (existingApp) {
      res.status(409).json({
        success: false,
        message: `You have already submitted an application for Admission Session ${admissionSession}. Your Application ID is ${existingApp.applicationId}.`,
        data: {
          applicationId: existingApp.applicationId,
          status: existingApp.status,
          submittedAt: existingApp.submittedAt,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
      return;
    }

    // Generate unique Application ID
    const yearPrefix = admissionSession.includes("2024") ? "EDU2024" : "EDU2026";
    const applicationId = await generateApplicationId(yearPrefix);

    // Normalize documents
    const formattedDocs = Array.isArray(documents)
      ? documents.map((doc: any) => ({
          documentName: doc.documentName || doc.name || "Academic Document",
          fileUrl: doc.fileUrl || doc.url || doc.content || "",
          fileType: doc.fileType || "application/pdf",
          fileSize: doc.fileSize || 0,
          uploadedAt: new Date(),
        }))
      : [];

    // Parse DOB safely
    let parsedDob: Date | undefined = undefined;
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (!isNaN(d.getTime())) parsedDob = d;
    }

    // Save AdmissionApplication in MongoDB
    const application = await AdmissionApplication.create({
      applicationId,
      userId: user._id,
      admissionSession,
      course: targetCourse,
      applicationDetails: {
        fullName: applicantName,
        email: applicantEmail,
        mobile: applicantMobile,
        dateOfBirth: parsedDob,
        gender: gender || "Not Specified",
        previousEducation: previousEducation || "Higher Secondary / 12th Grade",
        academicPercentage: pct,
        address: address || "",
      },
      documents: formattedDocs,
      status: "Submitted",
      adminRemarks: "",
      submittedAt: new Date(),
    });

    // Save individual AdmissionDocument records
    for (const doc of formattedDocs) {
      if (doc.fileUrl) {
        await AdmissionDocument.create({
          applicationId: application._id,
          documentName: doc.documentName,
          fileUrl: doc.fileUrl,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          uploadedAt: doc.uploadedAt,
        }).catch((err) => console.warn("AdmissionDocument save warning:", err));
      }
    }

    // Upsert StudentProfile
    await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        dateOfBirth: parsedDob,
        gender: gender || "Other",
        address: address || "",
        previousEducation: previousEducation || "",
        academicPercentage: pct,
      },
      { upsert: true, new: true }
    );

    // Create Initial Status History Record
    await ApplicationStatusHistory.create({
      applicationId: application._id,
      previousStatus: "None",
      newStatus: "Submitted",
      remarks: "Application successfully submitted by candidate.",
      updatedBy: user._id,
      updatedAt: new Date(),
    });

    // Save Student Notification in MongoDB
    const notification = await Notification.create({
      userId: user._id,
      title: "Admission Application Submitted Successfully",
      message: `Your application has been submitted successfully. Your Application ID is ${applicationId}. You can track your application status through your dashboard.`,
      type: "admission",
      relatedApplicationId: application._id,
      actionUrl: "/dashboard",
      isRead: false,
      createdAt: new Date(),
    });

    // Real-time Socket.IO broadcasts
    try {
      emitStudentNotification(user._id.toString(), notification);
      emitAdminAdmissionAlert(application);
      emitNewApplication(application);
    } catch (e) {
      console.warn("Socket notification warning:", e);
    }

    // Send confirmation email asynchronously
    sendApplicationConfirmationEmail(
      applicantEmail,
      applicantName,
      applicationId,
      targetCourse,
      admissionSession
    ).catch((err) => console.warn("Email confirmation warning:", err));

    res.status(201).json({
      success: true,
      message: "Admission application submitted successfully!",
      data: {
        applicationId,
        application,
        notification,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admissions/my-application — Current Student's Application
export const getMyApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const application = await AdmissionApplication.findOne({ userId: currentUserId }).sort({ submittedAt: -1 });

    if (!application) {
      res.status(200).json({
        success: true,
        data: { application: null, history: [] },
      });
      return;
    }

    const history = await ApplicationStatusHistory.find({ applicationId: application._id })
      .sort({ updatedAt: 1 })
      .populate("updatedBy", "name role");

    const profile = await StudentProfile.findOne({ userId: currentUserId });

    res.status(200).json({
      success: true,
      data: {
        application,
        history,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admissions/:applicationId — Get Single Application by Application ID
export const getApplicationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appId = String(req.params.applicationId);
    const currentUserId = req.user?.userId;
    const currentUserRole = (req.user as any)?.role;

    const application = await AdmissionApplication.findOne({
      $or: [
        { applicationId: appId },
        ...(mongoose.Types.ObjectId.isValid(appId) ? [{ _id: appId }] : []),
      ],
    }).populate("userId", "name email phone isEmailVerified");

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    // Check authorization: Owner student OR admin/faculty
    if (
      currentUserRole !== "admin" &&
      currentUserRole !== "faculty" &&
      application.userId?._id?.toString() !== currentUserId
    ) {
      res.status(403).json({ success: false, message: "Access denied to this application." });
      return;
    }

    const history = await ApplicationStatusHistory.find({ applicationId: application._id })
      .sort({ updatedAt: 1 })
      .populate("updatedBy", "name role");

    const documents = await AdmissionDocument.find({ applicationId: application._id });

    res.status(200).json({
      success: true,
      data: {
        application,
        history,
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admissions/:applicationId/documents — Upload Additional Documents
export const uploadAdditionalDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appId = String(req.params.applicationId);
    const currentUserId = req.user?.userId;
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      res.status(400).json({ success: false, message: "Please provide valid documents to upload." });
      return;
    }

    const application = await AdmissionApplication.findOne({
      $or: [
        { applicationId: appId },
        ...(mongoose.Types.ObjectId.isValid(appId) ? [{ _id: appId }] : []),
      ],
    });

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    if (application.userId.toString() !== currentUserId && (req.user as any)?.role !== "admin") {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    const newDocs = documents.map((doc: any) => ({
      documentName: doc.documentName || doc.name || "Supplementary Document",
      fileUrl: doc.fileUrl || doc.url || doc.content || "",
      fileType: doc.fileType || "application/pdf",
      fileSize: doc.fileSize || 0,
      uploadedAt: new Date(),
    }));

    application.documents.push(...newDocs);

    // If status was 'Documents Required', move to 'Under Review' upon document submission
    let statusChanged = false;
    if (application.status === "Documents Required") {
      application.status = "Under Review";
      statusChanged = true;
    }

    await application.save();

    for (const doc of newDocs) {
      await AdmissionDocument.create({
        applicationId: application._id,
        documentName: doc.documentName,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
      });
    }

    if (statusChanged) {
      await ApplicationStatusHistory.create({
        applicationId: application._id,
        previousStatus: "Documents Required",
        newStatus: "Under Review",
        remarks: "Candidate submitted required supplementary documents.",
        updatedBy: currentUserId,
        updatedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Additional documents uploaded successfully.",
      data: {
        applicationId: application.applicationId,
        status: application.status,
        documents: application.documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admissions/:applicationId/status — Fast Status Check
export const getApplicationStatus = async (
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
    }).select("applicationId course admissionSession status adminRemarks submittedAt updatedAt");

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    const history = await ApplicationStatusHistory.find({ applicationId: application._id })
      .sort({ updatedAt: 1 })
      .select("previousStatus newStatus remarks updatedAt");

    res.status(200).json({
      success: true,
      data: {
        applicationId: application.applicationId,
        status: application.status,
        course: application.course,
        admissionSession: application.admissionSession,
        adminRemarks: application.adminRemarks,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};
