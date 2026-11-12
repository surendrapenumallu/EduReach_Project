import type { Response, NextFunction } from "express";
import {
  User,
  Course,
  Enrollment,
  Assessment,
  Resource,
  Announcement,
  Setting,
  AuditLog,
  Application,
  Result,
} from "../models";
import { hashPassword, comparePassword } from "../utils/password.util";
import { generateToken } from "../utils/jwt.util";
import type { AuthenticatedAdminRequest } from "../middleware/admin.middleware";
import { logAdminAction } from "../middleware/admin.middleware";

// =========================================================================
// 1. ADMIN INITIALIZATION & AUTHENTICATION
// =========================================================================

export const checkAdminSetup = async (_req: any, res: Response): Promise<void> => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    res.status(200).json({
      success: true,
      data: {
        isInitialized: adminCount > 0,
        adminCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check admin status" });
  }
};

export const initAdmin = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Primary administrator is already initialized.",
      });
      return;
    }

    const { name, email, password, phone, department } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const admin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "+91 98765 00000",
      role: "admin",
      status: "active",
      department: department || "Central Academic Administration",
      designation: "Chief Administrative Officer",
    });

    // Initialize default platform settings
    const existingSetting = await Setting.findOne({ key: "edureach_platform_settings" });
    if (!existingSetting) {
      await Setting.create({
        key: "edureach_platform_settings",
        institutionName: "EduReach College of Engineering & Technology",
        academicYear: "2026-2027",
        currentSemester: "Even Semester (IV & VI)",
        updated_by: admin.name,
      });
    }

    const token = generateToken({ userId: admin._id.toString(), email: admin.email });

    res.status(201).json({
      success: true,
      message: "Primary Administrator created successfully.",
      data: {
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          department: admin.department,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 2. DASHBOARD SUMMARY & ANALYTICS
// =========================================================================

export const getDashboardStats = async (
  _req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalEnrollments,
      totalAssessments,
      activeUsers,
      totalApplications,
      pendingApplications,
      recentStudents,
      recentCourses,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Course.countDocuments({ status: { $ne: "archived" } }),
      Enrollment.countDocuments({ status: { $ne: "dropped" } }),
      Assessment.countDocuments(),
      User.countDocuments({ status: "active" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "pending" }),
      User.find({ role: "student" }).sort({ created_at: -1 }).limit(5).select("name email department status created_at rollNo"),
      Course.find({ status: "active" }).sort({ created_at: -1 }).limit(5).select("code title department credits enrolledCount instructorName"),
      AuditLog.find().sort({ created_at: -1 }).limit(8),
    ]);

    // Registration trends by month (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await User.aggregate([
      { $match: { created_at: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Department distribution of students
    const departmentDistribution = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalEnrollments,
          totalAssessments,
          activeUsers,
          totalApplications,
          pendingApplications,
        },
        monthlyTrends,
        departmentDistribution,
        recentStudents,
        recentCourses,
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (
  _req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ status: { $ne: "dropped" } });
    const assessments = await Assessment.find();

    const coursePopularity = await Enrollment.aggregate([
      { $group: { _id: "$courseTitle", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const gradeDistribution = await Enrollment.aggregate([
      { $match: { grade: { $ne: "In Progress" } } },
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Calculate overall average attendance & performance
    let avgAttendance = 85.5;
    let avgProgress = 76.2;
    if (enrollments.length > 0) {
      avgAttendance = Number(
        (enrollments.reduce((sum, e) => sum + (e.attendancePercentage || 0), 0) / enrollments.length).toFixed(1)
      );
      avgProgress = Number(
        (enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length).toFixed(1)
      );
    }

    const atRiskStudents = await Enrollment.find({
      $or: [{ attendancePercentage: { $lt: 75 } }, { progressPercentage: { $lt: 50 } }],
    }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        avgAttendance,
        avgProgress,
        coursePopularity,
        gradeDistribution,
        totalAssessments: assessments.length,
        atRiskCount: atRiskStudents.length,
        atRiskStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 3. STUDENT MANAGEMENT
// =========================================================================

export const getStudents = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, department, status, page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc" } = req.query;

    const filter: any = { role: "student" };
    if (department && department !== "All") filter.department = department;
    if (status && status !== "All") filter.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { email: regex }, { rollNo: regex }, { department: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;
    const sort: any = { [String(sortBy)]: sortOrder === "asc" ? 1 : -1 };

    const [students, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limitNum).select("-password"),
      User.countDocuments(filter),
    ]);

    // Attach enrolled courses count
    const studentIds = students.map((s) => s._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { studentId: { $in: studentIds }, status: "active" } },
      { $group: { _id: "$studentId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(enrollmentCounts.map((e) => [e._id.toString(), e.count]));
    const studentData = students.map((s) => ({
      ...s.toObject(),
      enrolledCoursesCount: countMap.get(s._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        students: studentData,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student || student.role !== "student") {
      res.status(404).json({ success: false, message: "Student record not found." });
      return;
    }

    const [enrollments, academicResult] = await Promise.all([
      Enrollment.find({ studentId: student._id }),
      Result.findOne({ studentEmail: student.email }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        student,
        enrollments,
        academicResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, department, rollNo, status } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      res.status(404).json({ success: false, message: "Student record not found." });
      return;
    }

    if (name) student.name = name.trim();
    if (phone !== undefined) student.phone = phone ? phone.trim() : null;
    if (department) student.department = department.trim();
    if (rollNo !== undefined) student.rollNo = rollNo ? rollNo.trim() : student.rollNo;
    if (status && ["active", "inactive", "suspended"].includes(status)) student.status = status;

    await student.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "STUDENT_UPDATED",
        "User",
        student._id.toString(),
        student.name,
        `Updated student profile. Status: ${student.status}`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: "Student record updated successfully.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentStatus = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      res.status(400).json({ success: false, message: "Valid status (active, inactive, suspended) is required." });
      return;
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") {
      res.status(404).json({ success: false, message: "Student record not found." });
      return;
    }

    student.status = status;
    await student.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        `STUDENT_STATUS_${status.toUpperCase()}`,
        "User",
        student._id.toString(),
        student.name,
        `Changed account status to ${status}`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: `Student account status set to ${status}.`,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") {
      res.status(404).json({ success: false, message: "Student record not found." });
      return;
    }

    const name = student.name;
    const email = student.email;
    await User.findByIdAndDelete(req.params.id);

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "STUDENT_DELETED",
        "User",
        String(req.params.id),
        name,
        `Removed student account (${email}) from system`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: `Student ${name} has been removed.`,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 4. TEACHER / FACULTY MANAGEMENT
// =========================================================================

export const getTeachers = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    const filter: any = { role: "faculty" };
    if (department && department !== "All") filter.department = department;
    if (status && status !== "All") filter.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ name: regex }, { email: regex }, { facultyId: regex }, { designation: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [teachers, total] = await Promise.all([
      User.find(filter).sort({ created_at: -1 }).skip(skip).limit(limitNum).select("-password"),
      User.countDocuments(filter),
    ]);

    // Attach active courses taught count
    const teacherNames = teachers.map((t) => t.name);
    const courseCounts = await Course.aggregate([
      { $match: { instructorName: { $in: teacherNames }, status: "active" } },
      { $group: { _id: "$instructorName", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(courseCounts.map((c) => [c._id, c.count]));
    const teacherData = teachers.map((t) => ({
      ...t.toObject(),
      coursesCount: countMap.get(t.name) || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        teachers: teacherData,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTeacherById = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teacher = await User.findById(req.params.id).select("-password");
    if (!teacher || teacher.role !== "faculty") {
      res.status(404).json({ success: false, message: "Faculty record not found." });
      return;
    }

    const courses = await Course.find({
      $or: [{ instructorId: teacher._id }, { instructorName: teacher.name }],
    });

    res.status(200).json({
      success: true,
      data: {
        teacher,
        courses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, department, designation, qualification, officeHours } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Name, email, and password are required." });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: "An account with this email already exists." });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const facultyId = `FAC-${Math.floor(1000 + Math.random() * 9000)}`;

    const teacher = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || null,
      role: "faculty",
      status: "active",
      facultyId,
      department: department || "Computer Science & Engineering",
      designation: designation || "Assistant Professor",
      qualification: qualification || "M.Tech / Ph.D.",
      officeHours: officeHours || "Mon-Fri: 11:00 AM - 1:00 PM",
    });

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "TEACHER_CREATED",
        "User",
        teacher._id.toString(),
        teacher.name,
        `Created faculty account ID: ${facultyId} (${teacher.email})`,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: "Faculty account created successfully.",
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, department, designation, qualification, officeHours, status } = req.body;
    const teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== "faculty") {
      res.status(404).json({ success: false, message: "Faculty member not found." });
      return;
    }

    if (name) teacher.name = name.trim();
    if (phone !== undefined) teacher.phone = phone ? phone.trim() : null;
    if (department) teacher.department = department.trim();
    if (designation) teacher.designation = designation.trim();
    if (qualification) teacher.qualification = qualification.trim();
    if (officeHours) teacher.officeHours = officeHours.trim();
    if (status && ["active", "inactive", "suspended"].includes(status)) teacher.status = status;

    await teacher.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "TEACHER_UPDATED",
        "User",
        teacher._id.toString(),
        teacher.name,
        `Updated faculty profile details`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: "Faculty profile updated successfully.",
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeacherStatus = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      res.status(400).json({ success: false, message: "Valid status (active, inactive, suspended) is required." });
      return;
    }

    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "faculty") {
      res.status(404).json({ success: false, message: "Faculty member not found." });
      return;
    }

    teacher.status = status;
    await teacher.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        `TEACHER_STATUS_${status.toUpperCase()}`,
        "User",
        teacher._id.toString(),
        teacher.name,
        `Changed faculty account status to ${status}`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: `Faculty account status updated to ${status}.`,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 5. COURSE MANAGEMENT
// =========================================================================

export const getCourses = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (department && department !== "All") filter.department = department;
    if (status && status !== "All") filter.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ code: regex }, { title: regex }, { instructorName: regex }, { category: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ code: 1 }).skip(skip).limit(limitNum),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, title, department, semester, credits, instructorName, instructorEmail, description, schedule, room, category, maxSeats } = req.body;

    if (!code || !title) {
      res.status(400).json({ success: false, message: "Course code and title are required." });
      return;
    }

    const existing = await Course.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: `Course code ${code} is already in use.` });
      return;
    }

    const course = await Course.create({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      department: department || "Computer Science & Engineering",
      semester: semester || "Semester 4",
      credits: Number(credits) || 4,
      instructorName: instructorName || "Prof. Rajesh Sharma",
      instructorEmail: instructorEmail || "faculty@edureach.edu",
      description: description || "",
      schedule: schedule || "Mon, Wed, Fri (10:00 AM - 11:30 AM)",
      room: room || "Academic Block Room 301",
      category: category || "Core Engineering",
      maxSeats: Number(maxSeats) || 60,
      isPublished: true,
      status: "active",
    });

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "COURSE_CREATED",
        "Course",
        course._id.toString(),
        `${course.code} - ${course.title}`,
        `Created course assigned to ${course.instructorName}`,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found." });
      return;
    }

    const { title, department, semester, credits, instructorName, description, schedule, room, category, maxSeats, status, isPublished } = req.body;

    if (title) course.title = title.trim();
    if (department) course.department = department.trim();
    if (semester) course.semester = semester.trim();
    if (credits !== undefined) course.credits = Number(credits);
    if (instructorName) course.instructorName = instructorName.trim();
    if (description !== undefined) course.description = description;
    if (schedule) course.schedule = schedule.trim();
    if (room) course.room = room.trim();
    if (category) course.category = category.trim();
    if (maxSeats !== undefined) course.maxSeats = Number(maxSeats);
    if (status) course.status = status;
    if (isPublished !== undefined) course.isPublished = Boolean(isPublished);

    await course.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "COURSE_UPDATED",
        "Course",
        course._id.toString(),
        course.code,
        `Updated course parameters`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCoursePublish = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found." });
      return;
    }

    course.isPublished = !course.isPublished;
    await course.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        course.isPublished ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
        "Course",
        course._id.toString(),
        course.code,
        `Changed publication status to ${course.isPublished}`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: `Course ${course.code} is now ${course.isPublished ? "Published" : "Unpublished"}.`,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: "Course not found." });
      return;
    }

    const code = course.code;
    const title = course.title;
    await Course.findByIdAndDelete(req.params.id);

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "COURSE_DELETED",
        "Course",
        String(req.params.id),
        `${code} - ${title}`,
        `Deleted course from curriculum catalog`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: `Course ${code} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 6. EDUCATIONAL RESOURCE MANAGEMENT
// =========================================================================

export const getResources = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseCode, type, search } = req.query;
    const filter: any = {};
    if (courseCode && courseCode !== "All") filter.courseCode = courseCode;
    if (type && type !== "All") filter.type = type;
    if (search) {
      filter.$or = [{ title: new RegExp(String(search), "i") }, { unit: new RegExp(String(search), "i") }];
    }

    const resources = await Resource.find(filter).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

export const createResource = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, courseCode, courseTitle, unit, type, fileUrl, fileSize, isRestricted } = req.body;
    if (!title || !courseCode || !fileUrl) {
      res.status(400).json({ success: false, message: "Title, course code, and file URL are required." });
      return;
    }

    const resource = await Resource.create({
      title: title.trim(),
      courseCode: courseCode.toUpperCase().trim(),
      courseTitle: courseTitle || courseCode,
      unit: unit || "Unit 1",
      type: type || "pdf",
      fileUrl: fileUrl.trim(),
      fileSize: fileSize || "1.5 MB",
      isRestricted: Boolean(isRestricted),
      uploadedBy: req.adminUser ? req.adminUser.name : "Administrator",
    });

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "RESOURCE_UPLOADED",
        "Resource",
        resource._id.toString(),
        resource.title,
        `Uploaded ${resource.type} resource to ${resource.courseCode}`,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: "Resource published successfully.",
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      res.status(404).json({ success: false, message: "Resource not found." });
      return;
    }

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "RESOURCE_DELETED",
        "Resource",
        String(req.params.id),
        resource.title,
        `Removed resource from course ${resource.courseCode}`,
        req.ip
      );
    }

    res.status(200).json({ success: true, message: "Resource deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 7. ASSESSMENT MANAGEMENT
// =========================================================================

export const getAssessments = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseCode, type, status } = req.query;
    const filter: any = {};
    if (courseCode && courseCode !== "All") filter.courseCode = courseCode;
    if (type && type !== "All") filter.type = type;
    if (status && status !== "All") filter.status = status;

    const assessments = await Assessment.find(filter).sort({ dueDate: -1 });
    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};

export const createAssessment = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, type, courseCode, courseTitle, department, totalMarks, passingMarks, dueDate, instructions } = req.body;
    if (!title || !courseCode) {
      res.status(400).json({ success: false, message: "Title and course code are required." });
      return;
    }

    const assessment = await Assessment.create({
      title: title.trim(),
      type: type || "quiz",
      courseCode: courseCode.toUpperCase().trim(),
      courseTitle: courseTitle || courseCode,
      department: department || "Computer Science & Engineering",
      totalMarks: Number(totalMarks) || 100,
      passingMarks: Number(passingMarks) || 40,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      instructions: instructions || "",
      created_by: req.adminUser ? req.adminUser.name : "Administrator",
      status: "active",
    });

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "ASSESSMENT_CREATED",
        "Assessment",
        assessment._id.toString(),
        assessment.title,
        `Created ${assessment.type} for course ${assessment.courseCode}`,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: "Assessment scheduled successfully.",
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssessmentStatus = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["active", "draft", "closed"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value." });
      return;
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      res.status(404).json({ success: false, message: "Assessment not found." });
      return;
    }

    assessment.status = status;
    await assessment.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        `ASSESSMENT_STATUS_${status.toUpperCase()}`,
        "Assessment",
        assessment._id.toString(),
        assessment.title,
        `Updated status to ${status}`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: `Assessment status updated to ${status}.`,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAssessment = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) {
      res.status(404).json({ success: false, message: "Assessment not found." });
      return;
    }

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "ASSESSMENT_DELETED",
        "Assessment",
        String(req.params.id),
        assessment.title,
        `Deleted assessment from course ${assessment.courseCode}`,
        req.ip
      );
    }

    res.status(200).json({ success: true, message: "Assessment deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 8. ENROLLMENT MANAGEMENT
// =========================================================================

export const getEnrollments = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseCode, status, search, page = 1, limit = 15 } = req.query;
    const filter: any = {};
    if (courseCode && courseCode !== "All") filter.courseCode = courseCode;
    if (status && status !== "All") filter.status = status;
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ studentName: regex }, { studentEmail: regex }, { studentRollNo: regex }, { courseTitle: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter).sort({ enrolledDate: -1 }).skip(skip).limit(limitNum),
      Enrollment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEnrollment = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      res.status(400).json({ success: false, message: "Student ID and Course ID are required." });
      return;
    }

    const [student, course] = await Promise.all([User.findById(studentId), Course.findById(courseId)]);
    if (!student || student.role !== "student") {
      res.status(404).json({ success: false, message: "Student record not found." });
      return;
    }
    if (!course) {
      res.status(404).json({ success: false, message: "Course record not found." });
      return;
    }

    const existing = await Enrollment.findOne({ studentId: student._id, courseId: course._id });
    if (existing) {
      res.status(409).json({ success: false, message: "Student is already enrolled in this course." });
      return;
    }

    const enrollment = await Enrollment.create({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      studentRollNo: student.rollNo || "22CSE0104",
      courseId: course._id,
      courseCode: course.code,
      courseTitle: course.title,
      department: course.department,
      semester: course.semester,
      instructorName: course.instructorName,
      status: "active",
      grade: "In Progress",
      attendancePercentage: 92,
      progressPercentage: 10,
    });

    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "ENROLLMENT_CREATED",
        "Enrollment",
        enrollment._id.toString(),
        `${student.name} -> ${course.code}`,
        `Enrolled student into ${course.code}`,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: `Enrolled ${student.name} in ${course.code} successfully.`,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEnrollment = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404).json({ success: false, message: "Enrollment record not found." });
      return;
    }

    await Course.findByIdAndUpdate(enrollment.courseId, { $inc: { enrolledCount: -1 } });
    await Enrollment.findByIdAndDelete(req.params.id);

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "ENROLLMENT_DROPPED",
        "Enrollment",
        String(req.params.id),
        `${enrollment.studentName} - ${enrollment.courseCode}`,
        `Dropped enrollment record`,
        req.ip
      );
    }

    res.status(200).json({ success: true, message: "Enrollment dropped successfully." });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 9. ANNOUNCEMENT & BROADCAST MANAGEMENT
// =========================================================================

export const getAnnouncements = async (
  _req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const announcements = await Announcement.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, targetAudience, priority } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: "Title and announcement content are required." });
      return;
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      targetAudience: targetAudience || "all",
      priority: priority || "normal",
      senderName: req.adminUser ? req.adminUser.name : "Central Administrator",
      senderRole: "admin",
      isActive: true,
    });

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "ANNOUNCEMENT_BROADCAST",
        "Announcement",
        announcement._id.toString(),
        announcement.title,
        `Sent ${announcement.priority} broadcast to ${announcement.targetAudience}`,
        req.ip
      );
    }

    res.status(201).json({
      success: true,
      message: "Announcement broadcasted successfully to all target users.",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      res.status(404).json({ success: false, message: "Announcement not found." });
      return;
    }

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "ANNOUNCEMENT_DELETED",
        "Announcement",
        String(req.params.id),
        announcement.title,
        "Removed announcement from feed",
        req.ip
      );
    }

    res.status(200).json({ success: true, message: "Announcement removed." });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 10. PLATFORM SETTINGS & AUDIT LOGS
// =========================================================================

export const getSettings = async (
  _req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await Setting.findOne({ key: "edureach_platform_settings" });
    if (!settings) {
      settings = await Setting.create({
        key: "edureach_platform_settings",
        institutionName: "EduReach College of Engineering & Technology",
        academicYear: "2026-2027",
        currentSemester: "Even Semester (IV & VI)",
      });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      institutionName,
      academicYear,
      currentSemester,
      maintenanceMode,
      allowStudentRegistration,
      allowFacultyRegistration,
      emailNotifications,
      minAttendanceThreshold,
    } = req.body;

    let settings = await Setting.findOne({ key: "edureach_platform_settings" });
    if (!settings) {
      settings = new Setting({ key: "edureach_platform_settings" });
    }

    if (institutionName) settings.institutionName = institutionName.trim();
    if (academicYear) settings.academicYear = academicYear.trim();
    if (currentSemester) settings.currentSemester = currentSemester.trim();
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);
    if (allowStudentRegistration !== undefined) settings.allowStudentRegistration = Boolean(allowStudentRegistration);
    if (allowFacultyRegistration !== undefined) settings.allowFacultyRegistration = Boolean(allowFacultyRegistration);
    if (emailNotifications !== undefined) settings.emailNotifications = Boolean(emailNotifications);
    if (minAttendanceThreshold !== undefined) settings.minAttendanceThreshold = Number(minAttendanceThreshold);

    settings.updated_at = new Date();
    settings.updated_by = req.adminUser ? req.adminUser.name : "Administrator";

    await settings.save();

    if (req.adminUser) {
      await logAdminAction(
        req.adminUser,
        "SETTINGS_UPDATED",
        "Setting",
        settings._id.toString(),
        "Platform Configurations",
        `Updated core platform policies & maintenance toggles`,
        req.ip
      );
    }

    res.status(200).json({
      success: true,
      message: "Platform settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter: any = {};
    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ action: regex }, { targetType: regex }, { targetName: regex }, { adminName: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ created_at: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 11. ADMIN PROFILE & SECURITY
// =========================================================================

export const getAdminProfile = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admin = await User.findById(req.user?.userId).select("-password");
    if (!admin || admin.role !== "admin") {
      res.status(404).json({ success: false, message: "Administrator record not found." });
      return;
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, department, designation } = req.body;
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== "admin") {
      res.status(404).json({ success: false, message: "Administrator record not found." });
      return;
    }

    if (name) admin.name = name.trim();
    if (phone !== undefined) admin.phone = phone ? phone.trim() : null;
    if (department) admin.department = department.trim();
    if (designation) admin.designation = designation.trim();

    await admin.save();

    await logAdminAction(admin, "PROFILE_UPDATED", "Security", admin._id.toString(), admin.name, "Updated personal profile information", req.ip);

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully.",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        department: admin.department,
        designation: admin.designation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changeAdminPassword = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Both current and new passwords are required." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
      return;
    }

    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== "admin") {
      res.status(404).json({ success: false, message: "Administrator record not found." });
      return;
    }

    const isMatch = await comparePassword(currentPassword, admin.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Current password does not match." });
      return;
    }

    admin.password = await hashPassword(newPassword);
    await admin.save();

    await logAdminAction(admin, "PASSWORD_CHANGED", "Security", admin._id.toString(), admin.name, "Updated security master password", req.ip);

    res.status(200).json({
      success: true,
      message: "Master password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 12. REPORTS & CSV EXPORT
// =========================================================================

export const exportDataReport = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.params;
    let csvHeader = "";
    let csvRows: string[] = [];
    let filename = `EduReach_${type}_Report_${Date.now()}.csv`;

    if (type === "students") {
      const students = await User.find({ role: "student" }).sort({ name: 1 });
      csvHeader = "ID,Name,Email,Phone,Department,RollNo,Status,RegisteredDate";
      csvRows = students.map((s) =>
        `"${s._id}","${s.name}","${s.email}","${s.phone || ""}","${s.department || ""}","${s.rollNo || ""}","${s.status}","${s.created_at.toISOString().split("T")[0]}"`
      );
    } else if (type === "teachers") {
      const teachers = await User.find({ role: "faculty" }).sort({ name: 1 });
      csvHeader = "ID,FacultyID,Name,Email,Department,Designation,Phone,Status";
      csvRows = teachers.map((t) =>
        `"${t._id}","${t.facultyId || ""}","${t.name}","${t.email}","${t.department || ""}","${t.designation || ""}","${t.phone || ""}","${t.status}"`
      );
    } else if (type === "courses") {
      const courses = await Course.find().sort({ code: 1 });
      csvHeader = "Code,Title,Department,Credits,Semester,Instructor,MaxSeats,Enrolled,Status,Published";
      csvRows = courses.map((c) =>
        `"${c.code}","${c.title}","${c.department}","${c.credits}","${c.semester}","${c.instructorName}","${c.maxSeats}","${c.enrolledCount}","${c.status}","${c.isPublished}"`
      );
    } else if (type === "enrollments") {
      const enrollments = await Enrollment.find().sort({ enrolledDate: -1 });
      csvHeader = "StudentID,StudentName,RollNo,CourseCode,CourseTitle,Status,Attendance%,Progress%,Grade,EnrolledDate";
      csvRows = enrollments.map((e) =>
        `"${e.studentId}","${e.studentName}","${e.studentRollNo}","${e.courseCode}","${e.courseTitle}","${e.status}","${e.attendancePercentage}%","${e.progressPercentage}%","${e.grade}","${e.enrolledDate.toISOString().split("T")[0]}"`
      );
    } else if (type === "audit-logs") {
      const logs = await AuditLog.find().sort({ created_at: -1 }).limit(500);
      csvHeader = "Timestamp,AdminName,AdminEmail,Action,TargetType,TargetName,Details,IPAddress";
      csvRows = logs.map((l) =>
        `"${l.created_at.toISOString()}","${l.adminName}","${l.adminEmail}","${l.action}","${l.targetType}","${l.targetName || ""}","${(l.details || "").replace(/"/g, '""')}","${l.ipAddress || ""}"`
      );
    } else {
      res.status(400).json({ success: false, message: "Invalid export report type." });
      return;
    }

    const csvContent = [csvHeader, ...csvRows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

