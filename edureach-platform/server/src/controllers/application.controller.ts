import type { Request, Response, NextFunction } from "express";
import Application from "../models/application.model";

// POST /api/applications — Submit new admission application
export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      studentName,
      email,
      phone,
      course,
      twelfthPercentage,
      entranceExam,
      entranceRank,
      documents,
    } = req.body;

    if (!studentName || !email || !phone || !course || twelfthPercentage === undefined) {
      res.status(400).json({
        success: false,
        message: "Student name, email, phone, course, and 12th percentage are required.",
      });
      return;
    }

    const userId = req.user?.userId;

    const newApp = await Application.create({
      userId: userId || undefined,
      studentName,
      email: email.toLowerCase(),
      phone,
      course,
      twelfthPercentage: Number(twelfthPercentage),
      entranceExam: entranceExam || "Direct",
      entranceRank: entranceRank || null,
      documents: documents || undefined,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Admission application submitted successfully!",
      data: { application: newApp },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/my — Get applications of current user
export const getMyApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const apps = await Application.find({ userId }).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: { applications: apps },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/all — Get all applications (Admin / Overview)
export const getAllApplications = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apps = await Application.find().sort({ created_at: -1 });
    const pendingCount = apps.filter((a) => a.status === "Pending").length;
    const underReviewCount = apps.filter((a) => a.status === "Under Review").length;
    const acceptedCount = apps.filter((a) => a.status === "Accepted").length;
    const rejectedCount = apps.filter((a) => a.status === "Rejected").length;

    res.status(200).json({
      success: true,
      data: {
        count: apps.length,
        stats: {
          total: apps.length,
          pending: pendingCount,
          underReview: underReviewCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
        },
        applications: apps,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/applications/:id/status — Update status of application (Admin)
export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Under Review", "Accepted", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status value provided.",
      });
      return;
    }

    const updatedApp = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: { application: updatedApp },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/applications/:id — Delete application (Admin)
export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedApp = await Application.findByIdAndDelete(id);

    if (!deletedApp) {
      res.status(404).json({ success: false, message: "Application not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

