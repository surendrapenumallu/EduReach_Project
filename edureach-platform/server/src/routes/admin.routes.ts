import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import {
  checkAdminSetup,
  initAdmin,
  getDashboardStats,
  getAnalytics,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  updateTeacherStatus,
  getCourses,
  createCourse,
  updateCourse,
  toggleCoursePublish,
  deleteCourse,
  getResources,
  createResource,
  deleteResource,
  getAssessments,
  createAssessment,
  updateAssessmentStatus,
  deleteAssessment,
  getEnrollments,
  createEnrollment,
  deleteEnrollment,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getSettings,
  updateSettings,
  getAuditLogs,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  exportDataReport,
} from "../controllers/admin.controller";
import {
  getAdminAdmissions,
  getAdminAdmissionById,
  updateAdminAdmissionStatus,
  updateAdminAdmissionRemarks,
  getAdminAdmissionStatistics,
} from "../controllers/admin-admission.controller";

const router = Router();

// Public Initialization & Setup checks
router.get("/check-setup", checkAdminSetup);
router.post("/init", initAdmin);

// All protected administrative routes require valid JWT + admin role
router.use(authMiddleware as any);
router.use(requireAdmin as any);

// Dashboard & Analytics
router.get("/stats", getDashboardStats as any);
router.get("/dashboard-stats", getDashboardStats as any);
router.get("/analytics", getAnalytics as any);

// Admission Applications Management
router.get("/admissions", getAdminAdmissions as any);
router.get("/admissions/statistics", getAdminAdmissionStatistics as any);
router.get("/admissions/:applicationId", getAdminAdmissionById as any);
router.patch("/admissions/:applicationId/status", updateAdminAdmissionStatus as any);
router.patch("/admissions/:applicationId/remarks", updateAdminAdmissionRemarks as any);

// Student Management
router.get("/students", getStudents as any);
router.get("/students/:id", getStudentById as any);
router.put("/students/:id", updateStudent as any);
router.patch("/students/:id/status", updateStudentStatus as any);
router.delete("/students/:id", deleteStudent as any);

// Teacher / Faculty Management
router.get("/teachers", getTeachers as any);
router.get("/teachers/:id", getTeacherById as any);
router.post("/teachers", createTeacher as any);
router.put("/teachers/:id", updateTeacher as any);
router.patch("/teachers/:id/status", updateTeacherStatus as any);

// Course Management
router.get("/courses", getCourses as any);
router.post("/courses", createCourse as any);
router.put("/courses/:id", updateCourse as any);
router.patch("/courses/:id/publish", toggleCoursePublish as any);
router.delete("/courses/:id", deleteCourse as any);

// Educational Resource Management
router.get("/resources", getResources as any);
router.post("/resources", createResource as any);
router.delete("/resources/:id", deleteResource as any);

// Assessment Management
router.get("/assessments", getAssessments as any);
router.post("/assessments", createAssessment as any);
router.patch("/assessments/:id/status", updateAssessmentStatus as any);
router.delete("/assessments/:id", deleteAssessment as any);

// Enrollment Management
router.get("/enrollments", getEnrollments as any);
router.post("/enrollments", createEnrollment as any);
router.delete("/enrollments/:id", deleteEnrollment as any);

// Announcements & Broadcasts
router.get("/announcements", getAnnouncements as any);
router.post("/announcements", createAnnouncement as any);
router.delete("/announcements/:id", deleteAnnouncement as any);

// Platform Settings & Audit Logs
router.get("/settings", getSettings as any);
router.put("/settings", updateSettings as any);
router.get("/audit-logs", getAuditLogs as any);

// Profile & Security Management
router.get("/profile", getAdminProfile as any);
router.put("/profile", updateAdminProfile as any);
router.put("/change-password", changeAdminPassword as any);

// Reports & CSV Export
router.get("/reports/export/:type", exportDataReport as any);

export default router;

