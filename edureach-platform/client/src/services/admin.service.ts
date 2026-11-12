import API from "./api";

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalAssessments: number;
  activeUsers: number;
  studentGrowthPercentage?: number;
  courseCompletionRate?: number;
}

export interface StudentRecord {
  _id: string;
  name: string;
  email: string;
  rollNo?: string;
  phone?: string;
  department?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  enrolledCount?: number;
  cgpa?: number;
  attendanceAvg?: number;
}

export interface TeacherRecord {
  _id: string;
  name: string;
  email: string;
  facultyId?: string;
  phone?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  officeHours?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  coursesCount?: number;
  resourcesCount?: number;
}

export interface CourseRecord {
  _id: string;
  code: string;
  title: string;
  department: string;
  semester: string;
  credits: number;
  instructorName: string;
  instructorEmail?: string;
  description: string;
  schedule?: string;
  room?: string;
  category?: string;
  isPublished: boolean;
  status: "active" | "archived" | "draft";
  maxSeats: number;
  enrolledCount: number;
  created_at: string;
}

export interface ResourceRecord {
  _id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  unit: string;
  type: "pdf" | "ppt" | "video" | "note" | "link";
  fileUrl: string;
  fileSize: string;
  isRestricted: boolean;
  uploadedBy: string;
  created_at: string;
}

export interface AssessmentRecord {
  _id: string;
  title: string;
  type: "quiz" | "assignment" | "exam" | "lab";
  courseCode: string;
  courseTitle: string;
  department: string;
  totalMarks: number;
  passingMarks: number;
  dueDate: string;
  status: "active" | "draft" | "closed";
  submissionsCount: number;
  averageScore: number;
  instructions?: string;
  created_by?: string;
  created_at: string;
}

export interface EnrollmentRecord {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRollNo?: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  department?: string;
  semester?: string;
  status: "active" | "completed" | "dropped";
  grade?: string;
  attendancePercentage: number;
  progressPercentage: number;
  enrolledDate: string;
}

export interface AuditLogRecord {
  _id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  ipAddress?: string;
  created_at: string;
}

export interface AnnouncementRecord {
  _id: string;
  title: string;
  content: string;
  targetAudience: "all" | "students" | "faculty";
  priority: "normal" | "urgent" | "info";
  senderName: string;
  senderRole: string;
  isActive: boolean;
  created_at: string;
}

export interface PlatformSettings {
  _id?: string;
  institutionName: string;
  academicYear: string;
  maintenanceMode: boolean;
  studentRegistrationOpen: boolean;
  facultyRegistrationOpen: boolean;
  aiTutorEnabled: boolean;
  maxEnrollmentsPerStudent: number;
  contactEmail: string;
  portalAnnouncement: string;
}

export const adminService = {
  // Stats & Analytics
  getDashboardStats: async (): Promise<{ success: boolean; data: AdminStats; recentActivities?: any[] }> => {
    const res = await API.get("/admin/stats");
    return res.data;
  },

  getAnalytics: async () => {
    const res = await API.get("/admin/analytics");
    return res.data;
  },

  // Students Management
  getStudents: async (params?: { search?: string; department?: string; status?: string; page?: number; limit?: number }) => {
    const res = await API.get("/admin/students", { params });
    return res.data;
  },

  getStudentDetails: async (id: string) => {
    const res = await API.get(`/admin/students/${id}`);
    return res.data;
  },

  updateStudentStatus: async (id: string, status: "active" | "inactive" | "suspended") => {
    const res = await API.patch(`/admin/students/${id}/status`, { status });
    return res.data;
  },

  updateStudent: async (id: string, data: Partial<StudentRecord>) => {
    const res = await API.put(`/admin/students/${id}`, data);
    return res.data;
  },

  deleteStudent: async (id: string) => {
    const res = await API.delete(`/admin/students/${id}`);
    return res.data;
  },

  // Teachers / Faculty Management
  getTeachers: async (params?: { search?: string; department?: string; status?: string }) => {
    const res = await API.get("/admin/teachers", { params });
    return res.data;
  },

  createTeacher: async (data: any) => {
    const res = await API.post("/admin/teachers", data);
    return res.data;
  },

  updateTeacherStatus: async (id: string, status: "active" | "inactive" | "suspended") => {
    const res = await API.patch(`/admin/teachers/${id}/status`, { status });
    return res.data;
  },

  updateTeacher: async (id: string, data: any) => {
    const res = await API.put(`/admin/teachers/${id}`, data);
    return res.data;
  },

  // Courses Management
  getCourses: async (params?: { search?: string; department?: string; status?: string }) => {
    const res = await API.get("/admin/courses", { params });
    return res.data;
  },

  createCourse: async (data: Partial<CourseRecord>) => {
    const res = await API.post("/admin/courses", data);
    return res.data;
  },

  updateCourse: async (id: string, data: Partial<CourseRecord>) => {
    const res = await API.put(`/admin/courses/${id}`, data);
    return res.data;
  },

  toggleCoursePublish: async (id: string) => {
    const res = await API.patch(`/admin/courses/${id}/publish`);
    return res.data;
  },

  deleteCourse: async (id: string) => {
    const res = await API.delete(`/admin/courses/${id}`);
    return res.data;
  },

  // Resources Management
  getResources: async (params?: { courseCode?: string; type?: string }) => {
    const res = await API.get("/admin/resources", { params });
    return res.data;
  },

  createResource: async (data: Partial<ResourceRecord>) => {
    const res = await API.post("/admin/resources", data);
    return res.data;
  },

  toggleResourceRestricted: async (id: string) => {
    const res = await API.patch(`/admin/resources/${id}/restricted`);
    return res.data;
  },

  deleteResource: async (id: string) => {
    const res = await API.delete(`/admin/resources/${id}`);
    return res.data;
  },

  // Assessments Management
  getAssessments: async (params?: { courseCode?: string; type?: string }) => {
    const res = await API.get("/admin/assessments", { params });
    return res.data;
  },

  createAssessment: async (data: Partial<AssessmentRecord>) => {
    const res = await API.post("/admin/assessments", data);
    return res.data;
  },

  updateAssessmentStatus: async (id: string, status: "active" | "draft" | "closed") => {
    const res = await API.patch(`/admin/assessments/${id}/status`, { status });
    return res.data;
  },

  deleteAssessment: async (id: string) => {
    const res = await API.delete(`/admin/assessments/${id}`);
    return res.data;
  },

  // Enrollments Management
  getEnrollments: async (params?: { courseCode?: string; status?: string }) => {
    const res = await API.get("/admin/enrollments", { params });
    return res.data;
  },

  createEnrollment: async (data: { studentEmail: string; courseCode: string }) => {
    const res = await API.post("/admin/enrollments", data);
    return res.data;
  },

  updateEnrollment: async (id: string, data: { status?: string; grade?: string; attendancePercentage?: number; progressPercentage?: number }) => {
    const res = await API.patch(`/admin/enrollments/${id}`, data);
    return res.data;
  },

  dropEnrollment: async (id: string) => {
    const res = await API.delete(`/admin/enrollments/${id}`);
    return res.data;
  },

  // Announcements Management
  getAnnouncements: async () => {
    const res = await API.get("/admin/announcements");
    return res.data;
  },

  createAnnouncement: async (data: Partial<AnnouncementRecord>) => {
    const res = await API.post("/admin/announcements", data);
    return res.data;
  },

  deleteAnnouncement: async (id: string) => {
    const res = await API.delete(`/admin/announcements/${id}`);
    return res.data;
  },

  // Platform Settings & Audit Logs
  getSettings: async (): Promise<{ success: boolean; data: PlatformSettings }> => {
    const res = await API.get("/admin/settings");
    return res.data;
  },

  updateSettings: async (settings: Partial<PlatformSettings>) => {
    const res = await API.put("/admin/settings", settings);
    return res.data;
  },

  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    const res = await API.get("/admin/audit-logs", { params });
    return res.data;
  },

  // CSV Report Exports
  downloadExportCsvUrl: (entity: "students" | "teachers" | "courses" | "enrollments" | "audit-logs") => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";
    const token = localStorage.getItem("token") || "";
    return `${baseURL}/admin/reports/export/${entity}?token=${encodeURIComponent(token)}`;
  },
};

export default adminService;

