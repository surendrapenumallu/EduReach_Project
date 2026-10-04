import type { Request, Response, NextFunction } from "express";
import Result from "../models/result.model";

// Demo initial data to seed if DB has no results
const DEMO_RESULTS = [
  {
    studentName: "Alex Rivera",
    studentEmail: "student@edureach.edu",
    rollNo: "22CSE0104",
    department: "Computer Science & Engineering",
    course: "B.Tech - Computer Science & Engineering (CSE)",
    semester: "Semester 4",
    academicYear: "2025-2026",
    subjects: [
      { code: "CS401", name: "Data Structures & Algorithms", internalMarks: 28, externalMarks: 62, totalMarks: 90, maxMarks: 100, grade: "A+", credits: 4 },
      { code: "CS402", name: "Database Management Systems", internalMarks: 27, externalMarks: 58, totalMarks: 85, maxMarks: 100, grade: "A", credits: 4 },
      { code: "CS403", name: "Operating Systems", internalMarks: 25, externalMarks: 53, totalMarks: 78, maxMarks: 100, grade: "B+", credits: 3 },
      { code: "CS404", name: "Computer Networks", internalMarks: 29, externalMarks: 63, totalMarks: 92, maxMarks: 100, grade: "O", credits: 4 },
      { code: "CS405", name: "Full Stack Web Development", internalMarks: 30, externalMarks: 65, totalMarks: 95, maxMarks: 100, grade: "O", credits: 3 },
    ],
    totalMarks: 440,
    maxTotalMarks: 500,
    percentage: 88.0,
    sgpa: 9.12,
    cgpa: 8.95,
    status: "Pass",
    publishedBy: "Prof. Rajesh Sharma (HOD CSE)",
  },
  {
    studentName: "Priya Patel",
    studentEmail: "priya.patel@edureach.edu",
    rollNo: "22CSE0112",
    department: "Computer Science & Engineering",
    course: "B.Tech - Computer Science & Engineering (CSE)",
    semester: "Semester 4",
    academicYear: "2025-2026",
    subjects: [
      { code: "CS401", name: "Data Structures & Algorithms", internalMarks: 25, externalMarks: 55, totalMarks: 80, maxMarks: 100, grade: "A", credits: 4 },
      { code: "CS402", name: "Database Management Systems", internalMarks: 26, externalMarks: 59, totalMarks: 85, maxMarks: 100, grade: "A", credits: 4 },
      { code: "CS403", name: "Operating Systems", internalMarks: 24, externalMarks: 50, totalMarks: 74, maxMarks: 100, grade: "B+", credits: 3 },
      { code: "CS404", name: "Computer Networks", internalMarks: 27, externalMarks: 60, totalMarks: 87, maxMarks: 100, grade: "A+", credits: 4 },
      { code: "CS405", name: "Full Stack Web Development", internalMarks: 28, externalMarks: 62, totalMarks: 90, maxMarks: 100, grade: "A+", credits: 3 },
    ],
    totalMarks: 416,
    maxTotalMarks: 500,
    percentage: 83.2,
    sgpa: 8.65,
    cgpa: 8.70,
    status: "Pass",
    publishedBy: "Prof. Rajesh Sharma (HOD CSE)",
  },
];

// Seed results helper
const ensureResultsSeeded = async () => {
  const count = await Result.countDocuments();
  if (count === 0) {
    await Result.insertMany(DEMO_RESULTS);
  }
};

// GET /api/results/my-results
export const getMyResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await ensureResultsSeeded();
    const currentUser = (req as any).user;
    const userEmail = currentUser?.email?.toLowerCase();

    let results = await Result.find({ studentEmail: userEmail }).sort({ created_at: -1 });

    // Fallback: if student has no exact match by email, return demo results for student preview
    if (results.length === 0) {
      results = await Result.find().sort({ created_at: -1 });
    }

    res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/results/all (Faculty / Admin view)
export const getAllResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await ensureResultsSeeded();
    const results = await Result.find().sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/results (Faculty publish new student result)
export const createResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      studentName,
      studentEmail,
      rollNo,
      department,
      course,
      semester,
      academicYear,
      subjects,
      publishedBy,
    } = req.body;

    if (!studentName || !studentEmail || !rollNo || !subjects || !Array.isArray(subjects)) {
      res.status(400).json({ success: false, message: "Required fields missing (studentName, studentEmail, rollNo, subjects)." });
      return;
    }

    // Calculate totals, SGPA, CGPA
    let totalMarks = 0;
    let maxTotalMarks = 0;
    subjects.forEach((sub: any) => {
      sub.totalMarks = (sub.internalMarks || 0) + (sub.externalMarks || 0);
      totalMarks += sub.totalMarks;
      maxTotalMarks += sub.maxMarks || 100;
    });

    const percentage = Number(((totalMarks / maxTotalMarks) * 100).toFixed(1));
    const sgpa = Number((percentage / 10).toFixed(2));
    const cgpa = Number(((sgpa + 8.5) / 2).toFixed(2));
    const status = percentage >= 40 ? "Pass" : "Fail";

    const newResult = await Result.create({
      studentName,
      studentEmail: studentEmail.toLowerCase(),
      rollNo,
      department: department || "Computer Science & Engineering",
      course: course || "B.Tech - Computer Science & Engineering (CSE)",
      semester: semester || "Semester 4",
      academicYear: academicYear || "2025-2026",
      subjects,
      totalMarks,
      maxTotalMarks,
      percentage,
      sgpa,
      cgpa,
      status,
      publishedBy: publishedBy || "Faculty Member",
    });

    res.status(201).json({
      success: true,
      message: "Student result published successfully.",
      data: { result: newResult },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/results/:id
export const updateResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Result.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, message: "Result not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Result updated successfully.",
      data: { result: updated },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/results/:id
export const deleteResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await Result.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Result record deleted.",
    });
  } catch (error) {
    next(error);
  }
};
