import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Download,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  LogOut,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/auth.service";
import adminService, {
  type AdminStats,
  type StudentRecord,
  type TeacherRecord,
  type CourseRecord,
  type ResourceRecord,
  type AssessmentRecord,
  type EnrollmentRecord,
  type AuditLogRecord,
  type AnnouncementRecord,
  type PlatformSettings,
} from "../services/admin.service";
import {
  getAdminAdmissions,
  getAdminAdmissionById,
  updateAdminAdmissionStatus,
  type AdmissionApplicationData,
  type StatusHistoryItem,
} from "../services/admission.service";
import { getSocket, joinRoleRoom } from "../services/socket.service";

export default function AdminDashboard() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [adminEmailInput, setAdminEmailInput] = useState("admin@edureach.edu");
  const [adminPasswordInput, setAdminPasswordInput] = useState("password123");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "students"
    | "teachers"
    | "courses"
    | "resources"
    | "assessments"
    | "enrollments"
    | "analytics"
    | "announcements"
    | "reports"
    | "settings"
    | "applications"
  >("dashboard");

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats & Analytics State
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalAssessments: 0,
    activeUsers: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Students State
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Teachers State
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: "",
    email: "",
    password: "password123",
    department: "Computer Science & Engineering",
    designation: "Assistant Professor",
    qualification: "Ph.D. in Computer Science",
    phone: "",
  });

  // Courses State
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    code: "",
    title: "",
    department: "Computer Science & Engineering",
    semester: "Semester 4",
    credits: 4,
    maxSeats: 60,
    instructorName: "Dr. Rajesh Sharma",
    description: "",
  });

  // Resources State
  const [resources, setResources] = useState<ResourceRecord[]>([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [newResourceForm, setNewResourceForm] = useState({
    courseCode: "CS201",
    courseTitle: "Data Structures & Algorithms",
    title: "",
    unit: "Unit 1",
    type: "pdf" as "pdf" | "ppt" | "video" | "note" | "link",
    fileUrl: "https://edureach-cloud.storage.com/resources/sample.pdf",
    fileSize: "3.2 MB",
  });

  // Assessments State
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
  const [newAssessmentForm, setNewAssessmentForm] = useState({
    courseCode: "CS201",
    courseTitle: "Data Structures & Algorithms",
    title: "",
    type: "quiz" as "quiz" | "assignment" | "exam" | "lab",
    totalMarks: 25,
    passingMarks: 10,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  // Enrollments State
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [showAddEnrollmentModal, setShowAddEnrollmentModal] = useState(false);
  const [newEnrollmentForm, setNewEnrollmentForm] = useState({
    studentEmail: "",
    courseCode: "CS201",
  });

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    title: "",
    content: "",
    targetAudience: "all" as "all" | "students" | "faculty",
    priority: "normal" as "normal" | "urgent" | "info",
  });

  // Settings & Audit Logs State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    institutionName: "EduReach Institute of Technology",
    academicYear: "2026-2027",
    maintenanceMode: false,
    studentRegistrationOpen: true,
    facultyRegistrationOpen: true,
    aiTutorEnabled: true,
    maxEnrollmentsPerStudent: 8,
    contactEmail: "admin@edureach.edu",
    portalAnnouncement: "",
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // Comprehensive Admission Management State
  const [admissions, setAdmissions] = useState<AdmissionApplicationData[]>([]);
  const [admissionStats, setAdmissionStats] = useState<Record<string, number>>({
    Total: 0,
    Submitted: 0,
    "Under Review": 0,
    "Documents Required": 0,
    Shortlisted: 0,
    Approved: 0,
    Rejected: 0,
  });
  const [admissionFilterSession, setAdmissionFilterSession] = useState("all");
  const [admissionFilterCourse, setAdmissionFilterCourse] = useState("all");
  const [admissionFilterStatus, setAdmissionFilterStatus] = useState("all");
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplicationData | null>(null);
  const [selectedAdmissionHistory, setSelectedAdmissionHistory] = useState<StatusHistoryItem[]>([]);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>("Under Review");
  const [adminRemarksText, setAdminRemarksText] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newAdmissionAlert, setNewAdmissionAlert] = useState<any>(null);

  const loadAdminAdmissions = async () => {
    try {
      const data = await getAdminAdmissions({
        session: admissionFilterSession,
        course: admissionFilterCourse,
        status: admissionFilterStatus,
        search: admissionSearch,
      });
      setAdmissions(data.applications || []);
      if (data.stats) setAdmissionStats(data.stats);
    } catch (err) {
      console.warn("Failed to load admissions:", err);
    }
  };

  const openAdmissionDetail = async (appId: string) => {
    try {
      const data = await getAdminAdmissionById(appId);
      setSelectedAdmission(data.application);
      setSelectedAdmissionHistory(data.history || []);
      setTargetStatus(data.application.status || "Under Review");
      setAdminRemarksText(data.application.adminRemarks || "");
      setAdmissionModalOpen(true);
    } catch (err) {
      toast.error("Failed to load admission details.");
    }
  };

  const handleUpdateStatusAndRemarks = async () => {
    if (!selectedAdmission) return;
    setStatusUpdateLoading(true);
    try {
      await updateAdminAdmissionStatus(selectedAdmission.applicationId, targetStatus, adminRemarksText);
      toast.success(`Application updated to ${targetStatus}! Email & real-time notification sent.`);
      setAdmissionModalOpen(false);
      loadAdminAdmissions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const toArray = (val: any, fieldName: string): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val[fieldName] && Array.isArray(val[fieldName])) return val[fieldName];
    return [];
  };

  // Initial Fetch
  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load stats
      const statsRes = await adminService.getDashboardStats();
      if (statsRes && statsRes.success) {
        const raw = (statsRes.data as any)?.cards || statsRes.data || {};
        setStats({
          totalStudents: raw.totalStudents || 0,
          totalTeachers: raw.totalTeachers || 0,
          totalCourses: raw.totalCourses || 0,
          totalEnrollments: raw.totalEnrollments || 0,
          totalAssessments: raw.totalAssessments || 0,
          activeUsers: raw.activeUsers || 1,
        });
        if ((statsRes.data as any)?.recentAuditLogs) {
          setRecentActivities((statsRes.data as any).recentAuditLogs);
        }
      }

      // Load analytics
      const analyticsRes = await adminService.getAnalytics();
      if (analyticsRes && analyticsRes.success) {
        setAnalyticsData(analyticsRes.data);
      }

      // Load collections
      const [stRes, tcRes, crRes, rsRes, asRes, enRes, anRes, stgRes, lgRes] = await Promise.allSettled([
        adminService.getStudents(),
        adminService.getTeachers(),
        adminService.getCourses(),
        adminService.getResources(),
        adminService.getAssessments(),
        adminService.getEnrollments(),
        adminService.getAnnouncements(),
        adminService.getSettings(),
        adminService.getAuditLogs(),
      ]);

      if (stRes.status === "fulfilled" && stRes.value?.success) setStudents(toArray(stRes.value.data, "students"));
      if (tcRes.status === "fulfilled" && tcRes.value?.success) setTeachers(toArray(tcRes.value.data, "teachers"));
      if (crRes.status === "fulfilled" && crRes.value?.success) setCourses(toArray(crRes.value.data, "courses"));
      if (rsRes.status === "fulfilled" && rsRes.value?.success) setResources(toArray(rsRes.value.data, "resources"));
      if (asRes.status === "fulfilled" && asRes.value?.success) setAssessments(toArray(asRes.value.data, "assessments"));
      if (enRes.status === "fulfilled" && enRes.value?.success) setEnrollments(toArray(enRes.value.data, "enrollments"));
      if (anRes.status === "fulfilled" && anRes.value?.success) setAnnouncements(toArray(anRes.value.data, "announcements"));
      if (stgRes.status === "fulfilled" && stgRes.value?.success) {
        if (stgRes.value.data) setPlatformSettings(stgRes.value.data);
      }
      if (lgRes.status === "fulfilled" && lgRes.value?.success) setAuditLogs(toArray(lgRes.value.data, "logs"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadAllData();
      loadAdminAdmissions();

      // Connect Socket.IO for real-time administrator alerts
      const socket = getSocket();
      joinRoleRoom("admin");

      const handleNewAdmission = (alert: any) => {
        setNewAdmissionAlert(alert);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-slate-900 text-white shadow-2xl rounded-2xl p-4 border border-amber-400 flex items-start gap-3 pointer-events-auto`}
            >
              <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  New Admission Application Received!
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {alert.studentName} ({alert.applicationId})
                </p>
                <p className="text-xs text-slate-300">
                  Course: {alert.course} · Session {alert.session}
                </p>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  setActiveTab("applications");
                }}
                className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-amber-300 self-center"
              >
                Review
              </button>
            </div>
          ),
          { duration: 8000 }
        );

        loadAdminAdmissions();
      };

      socket.on("admission:new", handleNewAdmission);
      socket.on("application:new", loadAdminAdmissions);

      return () => {
        socket.off("admission:new", handleNewAdmission);
        socket.off("application:new", loadAdminAdmissions);
      };
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadAdminAdmissions();
    }
  }, [admissionFilterSession, admissionFilterCourse, admissionFilterStatus, admissionSearch]);

  // Handlers for Students
  const handleStudentStatusChange = async (id: string, newStatus: "active" | "inactive" | "suspended") => {
    try {
      await adminService.updateStudentStatus(id, newStatus);
      toast.success(`Student status updated to ${newStatus}`);
      setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await adminService.deleteStudent(id);
      toast.success("Student removed successfully.");
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setStats((prev) => ({ ...prev, totalStudents: Math.max(0, prev.totalStudents - 1) }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove student.");
    }
  };

  // Handlers for Teachers
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createTeacher(newTeacherForm);
      toast.success("Faculty member created successfully!");
      setShowAddTeacherModal(false);
      setNewTeacherForm({
        name: "",
        email: "",
        password: "password123",
        department: "Computer Science & Engineering",
        designation: "Assistant Professor",
        qualification: "Ph.D. in Computer Science",
        phone: "",
      });
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create faculty member.");
    }
  };

  const handleTeacherStatusChange = async (id: string, newStatus: "active" | "inactive" | "suspended") => {
    try {
      await adminService.updateTeacherStatus(id, newStatus);
      toast.success(`Faculty status updated to ${newStatus}`);
      setTeachers((prev) => prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update faculty status.");
    }
  };

  // Handlers for Courses
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCourse(newCourseForm);
      toast.success("Course added to academic catalog!");
      setShowAddCourseModal(false);
      setNewCourseForm({
        code: "",
        title: "",
        department: "Computer Science & Engineering",
        semester: "Semester 4",
        credits: 4,
        maxSeats: 60,
        instructorName: "Dr. Rajesh Sharma",
        description: "",
      });
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create course.");
    }
  };

  const handleToggleCoursePublish = async (id: string) => {
    try {
      const res = await adminService.toggleCoursePublish(id);
      toast.success(res.message);
      setCourses((prev) => prev.map((c) => (c._id === id ? { ...c, isPublished: !c.isPublished } : c)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDeleteCourse = async (id: string, code: string) => {
    if (!window.confirm(`Delete course ${code}? Enrolled students will remain intact.`)) return;
    try {
      await adminService.deleteCourse(id);
      toast.success("Course deleted.");
      setCourses((prev) => prev.filter((c) => c._id !== id));
      setStats((prev) => ({ ...prev, totalCourses: Math.max(0, prev.totalCourses - 1) }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete course.");
    }
  };

  // Handlers for Resources
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createResource(newResourceForm);
      toast.success("Academic resource published!");
      setShowAddResourceModal(false);
      setNewResourceForm({
        courseCode: "CS201",
        courseTitle: "Data Structures & Algorithms",
        title: "",
        unit: "Unit 1",
        type: "pdf",
        fileUrl: "https://edureach-cloud.storage.com/resources/sample.pdf",
        fileSize: "3.2 MB",
      });
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add resource.");
    }
  };

  const handleToggleResourceRestricted = async (id: string) => {
    try {
      const res = await adminService.toggleResourceRestricted(id);
      toast.success(res.message);
      setResources((prev) => prev.map((r) => (r._id === id ? { ...r, isRestricted: !r.isRestricted } : r)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update resource.");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this academic resource file?")) return;
    try {
      await adminService.deleteResource(id);
      toast.success("Resource deleted.");
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete resource.");
    }
  };

  // Handlers for Assessments
  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAssessment(newAssessmentForm);
      toast.success("Assessment created and scheduled!");
      setShowAddAssessmentModal(false);
      setNewAssessmentForm({
        courseCode: "CS201",
        courseTitle: "Data Structures & Algorithms",
        title: "",
        type: "quiz",
        totalMarks: 25,
        passingMarks: 10,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create assessment.");
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!window.confirm("Delete this assessment?")) return;
    try {
      await adminService.deleteAssessment(id);
      toast.success("Assessment deleted.");
      setAssessments((prev) => prev.filter((a) => a._id !== id));
      setStats((prev) => ({ ...prev, totalAssessments: Math.max(0, prev.totalAssessments - 1) }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete assessment.");
    }
  };

  // Handlers for Enrollments
  const handleAddEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createEnrollment(newEnrollmentForm);
      toast.success("Student enrolled in course!");
      setShowAddEnrollmentModal(false);
      setNewEnrollmentForm({ studentEmail: "", courseCode: "CS201" });
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to enroll student.");
    }
  };

  const handleDropEnrollment = async (id: string) => {
    if (!window.confirm("Drop this student enrollment?")) return;
    try {
      await adminService.dropEnrollment(id);
      toast.success("Enrollment dropped.");
      setEnrollments((prev) => prev.filter((e) => e._id !== id));
      setStats((prev) => ({ ...prev, totalEnrollments: Math.max(0, prev.totalEnrollments - 1) }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to drop enrollment.");
    }
  };

  // Handlers for Announcements
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAnnouncement(newAnnouncementForm);
      toast.success("Broadcast announcement sent!");
      setShowAddAnnouncementModal(false);
      setNewAnnouncementForm({
        title: "",
        content: "",
        targetAudience: "all",
        priority: "normal",
      });
      loadAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post announcement.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await adminService.deleteAnnouncement(id);
      toast.success("Announcement deleted.");
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete announcement.");
    }
  };

  // Handlers for Platform Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateSettings(platformSettings);
      toast.success("Platform settings saved and applied.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update platform settings.");
    }
  };

  // Filtered Students
  const filteredStudents = Array.isArray(students)
    ? students.filter((st) => {
        const name = (st?.name || "").toLowerCase();
        const email = (st?.email || "").toLowerCase();
        const roll = (st?.rollNo || "").toLowerCase();
        const search = (studentSearch || "").toLowerCase();
        const matchesSearch = name.includes(search) || email.includes(search) || roll.includes(search);
        const matchesStatus = studentStatusFilter === "All" || st.status === studentStatusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const handleAdminDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    try {
      const data = await loginUser({
        email: adminEmailInput,
        password: adminPasswordInput,
        role: "admin",
      });
      if (data.user?.role !== "admin") {
        toast.error("This account is not authorized as an Administrator.");
        setAdminLoginLoading(false);
        return;
      }
      login(data.token, data.user);
      toast.success("Administrator session verified!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Admin authentication failed.");
    } finally {
      setAdminLoginLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Verifying Administrator Authorization...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-800 flex items-center justify-center font-bold text-white text-xl shadow-lg mb-3">
              ER
            </div>
            <h2 className="text-xl font-bold text-slate-900">EduReach Admin Portal</h2>
            <p className="text-xs text-slate-500 mt-1">Authorized institutional personnel only</p>
          </div>

          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-amber-900 mb-2">
              <span className="font-bold flex items-center gap-1">
                ⭐ 1-Click Demo Administrator Access:
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                setAdminEmailInput("admin@edureach.edu");
                setAdminPasswordInput("password123");
                setAdminLoginLoading(true);
                try {
                  const data = await loginUser({
                    email: "admin@edureach.edu",
                    password: "password123",
                    role: "admin",
                  });
                  login(data.token, data.user);
                  toast.success("Welcome Dr. Vance (Administrator)!");
                } catch (err: any) {
                  toast.error("Demo login failed.");
                } finally {
                  setAdminLoginLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              Sign In with 1-Click Admin Demo →
            </button>
          </div>

          <form onSubmit={handleAdminDirectLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                Master Password
              </label>
              <input
                type="password"
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-red-800"
              />
            </div>
            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all text-xs"
            >
              {adminLoginLoading ? "Verifying..." : "Authenticate Administrator"}
            </button>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-slate-100">
            <a href="/" className="text-xs text-slate-500 hover:text-red-800 font-semibold">
              ← Return to EduReach Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {/* ================= SECTION 14: COLLAPSIBLE ENTERPRISE SIDEBAR ================= */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-slate-900 text-slate-200 transition-all duration-300 flex flex-col shrink-0 border-r border-slate-800 z-30 min-h-screen sticky top-0`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-700 flex items-center justify-center font-bold text-white shadow-md shrink-0">
              ER
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-bold text-white tracking-wide">EduReach</div>
                <div className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">
                  Admin Portal
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Tabs List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "students", label: "Students", icon: Users },
            { id: "teachers", label: "Faculty", icon: GraduationCap },
            { id: "courses", label: "Courses", icon: BookOpen },
            { id: "resources", label: "Resources", icon: FolderOpen },
            { id: "assessments", label: "Assessments", icon: ClipboardList },
            { id: "enrollments", label: "Enrollments", icon: Layers },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
            { id: "announcements", label: "Broadcasts", icon: Bell },
            { id: "reports", label: "CSV Reports", icon: Download },
            { id: "settings", label: "Settings & Logs", icon: Settings },
            { id: "applications", label: "Admissions", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-red-800 to-amber-700 text-white shadow-md font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title={tab.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                {!collapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Administrator Profile Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-900 border border-indigo-700 text-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">Dr. Catherine Vance</div>
                <div className="text-[10px] text-slate-400 truncate">admin@edureach.edu</div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              {activeTab === "dashboard" && <BarChart3 className="w-5 h-5 text-red-800" />}
              {activeTab === "students" && <Users className="w-5 h-5 text-red-800" />}
              {activeTab === "teachers" && <GraduationCap className="w-5 h-5 text-red-800" />}
              {activeTab === "courses" && <BookOpen className="w-5 h-5 text-red-800" />}
              {activeTab === "resources" && <FolderOpen className="w-5 h-5 text-red-800" />}
              {activeTab === "assessments" && <ClipboardList className="w-5 h-5 text-red-800" />}
              {activeTab === "enrollments" && <Layers className="w-5 h-5 text-red-800" />}
              {activeTab === "analytics" && <TrendingUp className="w-5 h-5 text-red-800" />}
              {activeTab === "announcements" && <Bell className="w-5 h-5 text-red-800" />}
              {activeTab === "reports" && <Download className="w-5 h-5 text-red-800" />}
              {activeTab === "settings" && <Settings className="w-5 h-5 text-red-800" />}
              {activeTab === "applications" && <FileText className="w-5 h-5 text-red-800" />}
              <span>{activeTab === "dashboard" ? "Central Command Overview" : activeTab}</span>
            </h1>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold border border-slate-200">
              MongoDB Atlas Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <div className="text-xs text-right hidden sm:block">
              <div className="font-semibold text-slate-800">Academic Session 2026-2027</div>
              <div className="text-[11px] text-emerald-600 font-medium">All Microservices Operational</div>
            </div>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* ================= 1. TAB: DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* 6 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { label: "Students", val: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Faculty", val: stats.totalTeachers, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Courses", val: stats.totalCourses, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Enrollments", val: stats.totalEnrollments, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Assessments", val: stats.totalAssessments, icon: ClipboardList, color: "text-rose-600", bg: "bg-rose-50" },
                  { label: "Active Users", val: stats.activeUsers, icon: UserCheck, color: "text-teal-600", bg: "bg-teal-50" },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                        <div className={`p-2 rounded-xl ${kpi.bg}`}>
                          <Icon className={`w-4 h-4 ${kpi.color}`} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{kpi.val}</div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Synced with MongoDB
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Analytical Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registration Trends */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Student Registration Trends</h3>
                      <p className="text-xs text-slate-500">Monthly student signups throughout academic cycle</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +14.2% Growth
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          analyticsData?.registrationTrends || [
                            { month: "Jan", students: 12, faculty: 2 },
                            { month: "Feb", students: 18, faculty: 3 },
                            { month: "Mar", students: 24, faculty: 1 },
                            { month: "Apr", students: 35, faculty: 4 },
                            { month: "May", students: 48, faculty: 2 },
                            { month: "Jun", students: 62, faculty: 5 },
                          ]
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" />
                        <YAxis fontSize={11} stroke="#94a3b8" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="students" name="Students" fill="#800000" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="faculty" name="Faculty" fill="#d97706" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Course Popularity */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Course Popularity & Enrollments</h3>
                      <p className="text-xs text-slate-500">Highest enrolled courses across all departments</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={
                          (Array.isArray(courses) ? courses : []).slice(0, 5).map((c) => ({
                            name: c.code || "Course",
                            enrolled: c.enrolledCount || 0,
                            seats: c.maxSeats || 60,
                          }))
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                        <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={60} />
                        <Tooltip />
                        <Bar dataKey="enrolled" name="Enrolled Seats" fill="#2563eb" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Audit Activities */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Recent Platform Administrative Actions</h3>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="text-xs text-red-800 font-semibold hover:underline"
                  >
                    View All Audit Logs →
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {act.action}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800">{act.adminName}</span>
                            <span className="text-slate-500"> — {act.details || act.targetName}</span>
                          </div>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs py-4 text-center">No recent administrative actions.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. TAB: STUDENTS ================= */}
          {activeTab === "students" && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student by name, roll no, or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                    />
                  </div>
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Registered</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">{st.rollNo || "22CSE0104"}</td>
                        <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                        <td className="p-3.5 text-slate-600">{st.email}</td>
                        <td className="p-3.5 text-slate-600">{st.department || "Computer Science"}</td>
                        <td className="p-3.5">
                          <select
                            value={st.status}
                            onChange={(e) => handleStudentStatusChange(st._id, e.target.value as any)}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                              st.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : st.status === "suspended"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {new Date(st.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedStudent(st)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="View Student Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st._id, st.name)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                            title="Remove Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. TAB: TEACHERS ================= */}
          {activeTab === "teachers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Faculty Registry</div>
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 text-white font-semibold text-xs hover:bg-red-900 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Faculty Member
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Faculty ID</th>
                      <th className="p-3.5">Faculty Name</th>
                      <th className="p-3.5">Official Email</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Designation</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map((tc) => (
                      <tr key={tc._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">{tc.facultyId || "FAC-1002"}</td>
                        <td className="p-3.5 font-bold text-slate-900">{tc.name}</td>
                        <td className="p-3.5 text-slate-600">{tc.email}</td>
                        <td className="p-3.5 text-slate-600">{tc.department || "Computer Science"}</td>
                        <td className="p-3.5 text-slate-600">{tc.designation || "Associate Professor"}</td>
                        <td className="p-3.5">
                          <select
                            value={tc.status}
                            onChange={(e) => handleTeacherStatusChange(tc._id, e.target.value as any)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toast.success(`Viewing courses taught by ${tc.name}`)}
                            className="text-xs text-red-800 font-semibold hover:underline"
                          >
                            View Courses →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 4. TAB: COURSES ================= */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Academic Course Catalog</div>
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 text-white font-semibold text-xs hover:bg-red-900 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Course
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((cr) => (
                  <div key={cr._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                          {cr.code}
                        </span>
                        <button
                          onClick={() => handleToggleCoursePublish(cr._id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cr.isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {cr.isPublished ? "PUBLISHED" : "DRAFT"}
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{cr.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{cr.description}</p>
                      <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Instructor:</span>
                          <span className="font-semibold">{cr.instructorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Department:</span>
                          <span>{cr.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Credits:</span>
                          <span className="font-bold">{cr.credits} Credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Seats:</span>
                          <span className="font-bold text-blue-600">
                            {cr.enrolledCount} / {cr.maxSeats}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                      <button
                        onClick={() => toast.success(`Viewing syllabus for ${cr.code}`)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        Syllabus & Units
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(cr._id, cr.code)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. TAB: RESOURCES ================= */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Curriculum Educational Resources</div>
                <button
                  onClick={() => setShowAddResourceModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 text-white font-semibold text-xs hover:bg-red-900 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Upload Learning Resource
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Course</th>
                      <th className="p-3.5">Resource Title</th>
                      <th className="p-3.5">Unit</th>
                      <th className="p-3.5">Format</th>
                      <th className="p-3.5">Uploaded By</th>
                      <th className="p-3.5">Access</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map((rs) => (
                      <tr key={rs._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-red-800">{rs.courseCode}</td>
                        <td className="p-3.5 font-bold text-slate-900">{rs.title}</td>
                        <td className="p-3.5 text-slate-600">{rs.unit}</td>
                        <td className="p-3.5">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {rs.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{rs.uploadedBy}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleResourceRestricted(rs._id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rs.isRestricted
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {rs.isRestricted ? "RESTRICTED" : "PUBLIC"}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <a
                            href={rs.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-red-800 font-semibold hover:underline"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handleDeleteResource(rs._id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold ml-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. TAB: ASSESSMENTS ================= */}
          {activeTab === "assessments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Academic Assessments & Quizzes</div>
                <button
                  onClick={() => setShowAddAssessmentModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 text-white font-semibold text-xs hover:bg-red-900 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Create Assessment
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Course</th>
                      <th className="p-3.5">Assessment Title</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Total Marks</th>
                      <th className="p-3.5">Submissions</th>
                      <th className="p-3.5">Average Score</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assessments.map((as) => (
                      <tr key={as._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-red-800">{as.courseCode}</td>
                        <td className="p-3.5 font-bold text-slate-900">{as.title}</td>
                        <td className="p-3.5">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                            {as.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700">{as.totalMarks} pts</td>
                        <td className="p-3.5 font-bold text-slate-900">{as.submissionsCount}</td>
                        <td className="p-3.5 font-bold text-emerald-600">{as.averageScore || "N/A"}</td>
                        <td className="p-3.5 text-slate-500">{new Date(as.dueDate).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteAssessment(as._id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 7. TAB: ENROLLMENTS ================= */}
          {activeTab === "enrollments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Student Course Enrollments</div>
                <button
                  onClick={() => setShowAddEnrollmentModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 text-white font-semibold text-xs hover:bg-red-900 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> New Student Enrollment
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Course Code</th>
                      <th className="p-3.5">Course Title</th>
                      <th className="p-3.5">Attendance</th>
                      <th className="p-3.5">Progress</th>
                      <th className="p-3.5">Grade</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollments.map((en) => (
                      <tr key={en._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{en.studentName}</div>
                          <div className="text-[10px] text-slate-400">{en.studentEmail}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-red-800">{en.courseCode}</td>
                        <td className="p-3.5 text-slate-700">{en.courseTitle}</td>
                        <td className="p-3.5 font-bold text-slate-900">{en.attendancePercentage}%</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full"
                                style={{ width: `${en.progressPercentage}%` }}
                              />
                            </div>
                            <span className="font-semibold text-[11px]">{en.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-indigo-700">{en.grade || "A"}</td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {en.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDropEnrollment(en._id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Drop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 8. TAB: ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Attendance Percentage Distribution</h3>
                  <p className="text-xs text-slate-500 mb-4">Institutional student attendance metrics</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Above 85% (Distinction)", value: 45 },
                            { name: "75% - 85% (Eligible)", value: 35 },
                            { name: "Below 75% (At-Risk)", value: 20 },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          <Cell fill="#059669" />
                          <Cell fill="#d97706" />
                          <Cell fill="#e11d48" />
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">CGPA & Grade Distribution</h3>
                  <p className="text-xs text-slate-500 mb-4">Student academic grading breakdown</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { grade: "A+ (9.0-10)", students: 18 },
                          { grade: "A (8.0-8.9)", students: 28 },
                          { grade: "B+ (7.0-7.9)", students: 22 },
                          { grade: "B (6.0-6.9)", students: 14 },
                          { grade: "C (<6.0)", students: 6 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="grade" fontSize={11} stroke="#94a3b8" />
                        <YAxis fontSize={11} stroke="#94a3b8" />
                        <Tooltip />
                        <Bar dataKey="students" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* At-Risk Alert Banner */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-xs">Automated At-Risk Student Monitoring</h4>
                  <p className="text-xs text-rose-700 mt-1">
                    System monitors attendance below 75% and CGPA below 6.0 according to UGC/AICTE criteria.
                    Counselors and faculty advisors are alerted automatically for early academic intervention.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. TAB: ANNOUNCEMENTS ================= */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">Campus Announcements & Broadcasts</div>
                <button
                  onClick={() => setShowAddAnnouncementModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800 text-white font-semibold text-xs hover:bg-red-900 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Broadcast Announcement
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((an) => (
                  <div key={an._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            an.priority === "urgent"
                              ? "bg-rose-100 text-rose-800"
                              : an.priority === "info"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {an.priority}
                        </span>
                        <span className="text-xs text-slate-400">Target: {an.targetAudience.toUpperCase()}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{an.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{an.content}</p>
                      <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(an.created_at).toLocaleString()} by {an.senderName}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(an._id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 10. TAB: CSV REPORTS ================= */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Official Institutional Reports & Exports</h3>
                <p className="text-xs text-slate-500">Download clean CSV spreadsheets generated directly from MongoDB records</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "students", title: "Students Master Registry", desc: "Names, emails, roll numbers, status, and departments" },
                  { id: "teachers", title: "Faculty Master Registry", desc: "Designations, departments, contact emails, and courses taught" },
                  { id: "courses", title: "Curriculum Course Catalog", desc: "Course codes, credit values, instructor mappings, and enrollment capacity" },
                  { id: "enrollments", title: "Enrollment & Attendance Data", desc: "Individual student course progress, attendance percentages, and final grades" },
                  { id: "audit-logs", title: "Security & Administrative Audit Logs", desc: "Complete timestamped audit trail of all administrative actions" },
                ].map((rep) => (
                  <div key={rep.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center font-bold mb-3">
                        <Download className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{rep.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{rep.desc}</p>
                    </div>
                    <a
                      href={adminService.downloadExportCsvUrl(rep.id as any)}
                      download
                      className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-800 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 11. TAB: SETTINGS & AUDIT LOGS ================= */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Settings Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Platform Governance & Security Switches</h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
                      <input
                        type="text"
                        value={platformSettings.institutionName}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, institutionName: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={platformSettings.academicYear}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, academicYear: e.target.value })
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={platformSettings.studentRegistrationOpen}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, studentRegistrationOpen: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-800"
                      />
                      <span className="text-xs font-semibold text-slate-800">Student Signups Open</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={platformSettings.facultyRegistrationOpen}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, facultyRegistrationOpen: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-800"
                      />
                      <span className="text-xs font-semibold text-slate-800">Faculty Signups Open</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        checked={platformSettings.aiTutorEnabled}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, aiTutorEnabled: e.target.checked })
                        }
                        className="w-4 h-4 accent-red-800"
                      />
                      <span className="text-xs font-semibold text-slate-800">AI Tutor Engine Enabled</span>
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Save Governance Policy
                    </button>
                  </div>
                </form>
              </div>

              {/* Audit Logs Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Immutable Administrative Audit Trail</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Administrator</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Entity Type</th>
                        <th className="p-3">Details</th>
                        <th className="p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/80">
                          <td className="p-3 text-slate-400 font-mono text-[11px]">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{log.adminName}</td>
                          <td className="p-3">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{log.targetType}</td>
                          <td className="p-3 text-slate-700">{log.details || log.targetName || "—"}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-400">{log.ipAddress || "127.0.0.1"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 12. TAB: APPLICATIONS (Central Admission Application Management) ================= */}
          {activeTab === "applications" && (
            <div className="space-y-5">
              {/* Top Banner Alert if new application received via Socket.IO */}
              {newAdmissionAlert && (
                <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        New Application Received: {newAdmissionAlert.applicationId}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Candidate <strong>{newAdmissionAlert.studentName}</strong> applied for {newAdmissionAlert.course} ({newAdmissionAlert.session})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      openAdmissionDetail(newAdmissionAlert.applicationId);
                      setNewAdmissionAlert(null);
                    }}
                    className="bg-maroon text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-maroon-dark transition-colors shadow-sm shrink-0"
                  >
                    Open Application
                  </button>
                </div>
              )}

              {/* Status Summary Cards (All 6 Statuses + Total) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: "Total Applications", count: admissionStats.Total || admissions.length, color: "text-slate-900", bg: "bg-white" },
                  { label: "Submitted", count: admissionStats.Submitted || 0, color: "text-blue-700", bg: "bg-blue-50/50" },
                  { label: "Under Review", count: admissionStats["Under Review"] || 0, color: "text-indigo-700", bg: "bg-indigo-50/50" },
                  { label: "Docs Required", count: admissionStats["Documents Required"] || 0, color: "text-amber-700", bg: "bg-amber-50/50" },
                  { label: "Shortlisted", count: admissionStats.Shortlisted || 0, color: "text-purple-700", bg: "bg-purple-50/50" },
                  { label: "Approved", count: admissionStats.Approved || 0, color: "text-emerald-700", bg: "bg-emerald-50/50" },
                  { label: "Rejected", count: admissionStats.Rejected || 0, color: "text-rose-700", bg: "bg-rose-50/50" },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} p-3.5 rounded-2xl border border-slate-200 shadow-xs`}>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
                    <div className={`text-xl font-extrabold ${s.color} mt-1`}>{s.count}</div>
                  </div>
                ))}
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={admissionSearch}
                    onChange={(e) => setAdmissionSearch(e.target.value)}
                    placeholder="Search ID, student name, email..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-maroon outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Session Filter */}
                  <select
                    value={admissionFilterSession}
                    onChange={(e) => setAdmissionFilterSession(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 outline-none"
                  >
                    <option value="all">All Sessions</option>
                    <option value="2024–25">Session 2024–25</option>
                    <option value="2026–27">Session 2026–27</option>
                  </select>

                  {/* Course Filter */}
                  <select
                    value={admissionFilterCourse}
                    onChange={(e) => setAdmissionFilterCourse(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 outline-none max-w-[180px] truncate"
                  >
                    <option value="all">All Courses</option>
                    <option value="B.Tech - Computer Science & Engineering (CSE)">B.Tech CSE</option>
                    <option value="B.Tech - Artificial Intelligence & Data Science (AI & DS)">B.Tech AI & DS</option>
                    <option value="B.Tech - Electronics & Communication Engineering (ECE)">B.Tech ECE</option>
                    <option value="B.Tech - Information Technology (IT)">B.Tech IT</option>
                    <option value="B.Tech - Mechanical Engineering (ME)">B.Tech ME</option>
                    <option value="B.Tech - Civil Engineering (CE)">B.Tech CE</option>
                    <option value="M.Tech - Computer Science">M.Tech CS</option>
                    <option value="MBA (Finance, Marketing, HR, IT)">MBA</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={admissionFilterStatus}
                    onChange={(e) => setAdmissionFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Documents Required">Documents Required</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <button
                    onClick={loadAdminAdmissions}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Refresh List"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Admissions Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Application ID</th>
                      <th className="p-3.5">Candidate Details</th>
                      <th className="p-3.5">Target Course & Session</th>
                      <th className="p-3.5 text-center">12th Score</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Submitted Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No admission applications found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      admissions.map((app) => {
                        const statusColors: Record<string, string> = {
                          Submitted: "bg-blue-100 text-blue-800 border-blue-200",
                          "Under Review": "bg-indigo-100 text-indigo-800 border-indigo-200",
                          "Documents Required": "bg-amber-100 text-amber-900 border-amber-300 animate-pulse",
                          Shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
                          Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
                          Rejected: "bg-rose-100 text-rose-800 border-rose-200",
                        };

                        return (
                          <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5">
                              <span
                                onClick={() => openAdmissionDetail(app.applicationId)}
                                className="font-mono font-bold text-maroon hover:underline cursor-pointer"
                              >
                                {app.applicationId}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">{app.applicationDetails.fullName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{app.applicationDetails.email}</div>
                              <div className="text-[10px] text-slate-400">{app.applicationDetails.mobile}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-semibold text-slate-800 truncate max-w-[200px]">{app.course}</div>
                              <div className="text-[10px] text-slate-400">Session: {app.admissionSession}</div>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                                {app.applicationDetails.academicPercentage}%
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                                  statusColors[app.status] || "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-3.5 text-right space-x-1.5">
                              <button
                                onClick={() => openAdmissionDetail(app.applicationId)}
                                className="bg-maroon text-white px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-maroon-dark transition-colors shadow-xs"
                              >
                                Review & Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* Admission Application Review & Status Management Modal */}
      {admissionModalOpen && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Official Admission Dossier
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">Session {selectedAdmission.admissionSession}</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
                  {selectedAdmission.applicationId}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Applied for: <strong className="text-maroon">{selectedAdmission.course}</strong>
                </p>
              </div>

              <button
                onClick={() => setAdmissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto py-5 space-y-6 text-xs flex-1 pr-1">
              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                    Candidate Profile
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Full Name</span>
                    <strong className="text-slate-900">{selectedAdmission.applicationDetails.fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-800 font-mono">{selectedAdmission.applicationDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile</span>
                    <span className="text-slate-800 font-mono">{selectedAdmission.applicationDetails.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender</span>
                    <span className="text-slate-800">{selectedAdmission.applicationDetails.gender || "Not Specified"}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 block mb-0.5">Permanent Address:</span>
                    <span className="text-slate-800 leading-relaxed block">{selectedAdmission.applicationDetails.address || "—"}</span>
                  </div>
                </div>

                {/* Academic Background */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                    Academic Background
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Previous Qualification</span>
                    <span className="text-slate-800 font-semibold">{selectedAdmission.applicationDetails.previousEducation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">12th Marks / Percentage</span>
                    <strong className="text-emerald-700 text-sm font-extrabold">
                      {selectedAdmission.applicationDetails.academicPercentage}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status</span>
                    <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      {selectedAdmission.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted On</span>
                    <span className="text-slate-700">
                      {new Date(selectedAdmission.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Verification Documents */}
              <div className="space-y-2">
                <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                  Submitted Verification Documents ({selectedAdmission.documents.length})
                </h4>
                {selectedAdmission.documents.length === 0 ? (
                  <p className="text-slate-400 italic">No document attachments uploaded.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedAdmission.documents.map((doc, idx) => (
                      <div
                        key={doc._id || idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-maroon shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{doc.documentName}</span>
                        </div>
                        {doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                          >
                            Preview
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">File unavailable</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status History Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                  Official Status Audit History
                </h4>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 max-h-40 overflow-y-auto space-y-3">
                  {selectedAdmissionHistory.length === 0 ? (
                    <p className="text-slate-400">No prior status transitions recorded.</p>
                  ) : (
                    selectedAdmissionHistory.map((h, i) => (
                      <div key={h._id || i} className="flex items-start gap-3 border-b border-slate-200/50 pb-2 last:border-none">
                        <div className="w-2 h-2 rounded-full bg-maroon shrink-0 mt-1.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              {h.previousStatus} → <strong className="text-maroon">{h.newStatus}</strong>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(h.updatedAt).toLocaleString()}
                            </span>
                          </div>
                          {h.remarks && <p className="text-slate-600 mt-0.5 italic">"{h.remarks}"</p>}
                          {h.updatedBy && (
                            <span className="text-[10px] text-slate-400">Action taken by: {h.updatedBy.name}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Status Management & Remarks Action Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Update Application Status & Send Student Notification
                </h4>

                {/* Quick Status Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus("Under Review");
                      setAdminRemarksText("Your application has been picked up for thorough committee verification.");
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                      targetStatus === "Under Review" ? "bg-indigo-600 text-white shadow-xs" : "bg-white border text-indigo-800 hover:bg-indigo-50"
                    }`}
                  >
                    Mark Under Review
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus("Documents Required");
                      setAdminRemarksText("Please upload clear copies of your 10th/12th marksheets via the student dashboard.");
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                      targetStatus === "Documents Required" ? "bg-amber-600 text-white shadow-xs" : "bg-white border text-amber-800 hover:bg-amber-50"
                    }`}
                  >
                    Request Documents
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus("Shortlisted");
                      setAdminRemarksText("Congratulations! Your academic profile meets our merit criteria and you have been shortlisted for counseling.");
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                      targetStatus === "Shortlisted" ? "bg-purple-600 text-white shadow-xs" : "bg-white border text-purple-800 hover:bg-purple-50"
                    }`}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus("Approved");
                      setAdminRemarksText("Congratulations! Your admission to EduReach College has been officially APPROVED. Please complete fee enrollment.");
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                      targetStatus === "Approved" ? "bg-emerald-600 text-white shadow-xs" : "bg-white border text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    Approve Admission
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetStatus("Rejected");
                      setAdminRemarksText("Thank you for your application. Due to quota limitations, we are unable to offer admission for the selected session.");
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                      targetStatus === "Rejected" ? "bg-rose-600 text-white shadow-xs" : "bg-white border text-rose-800 hover:bg-rose-50"
                    }`}
                  >
                    Reject Application
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wide text-[11px] mb-1">
                      Target Status *
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-xs text-slate-800 outline-none"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Documents Required">Documents Required</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wide text-[11px] mb-1">
                      Admissions Committee Remarks
                    </label>
                    <input
                      type="text"
                      value={adminRemarksText}
                      onChange={(e) => setAdminRemarksText(e.target.value)}
                      placeholder="Add official notes dispatched to student..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={handleUpdateStatusAndRemarks}
                  className="w-full bg-maroon text-white py-3 rounded-xl font-bold text-xs hover:bg-maroon-dark transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {statusUpdateLoading ? "Updating Status & Dispatching Emails..." : "Commit Status Change & Dispatch Student Alerts"}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setAdmissionModalOpen(false)}
                className="px-5 py-2.5 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Add Faculty Member</h3>
            <form onSubmit={handleAddTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newTeacherForm.email}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                  placeholder="ramesh@edureach.edu"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newTeacherForm.department}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newTeacherForm.designation}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, designation: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white font-bold rounded-xl"
                >
                  Create Faculty Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Add Curriculum Course</h3>
            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS402"
                    value={newCourseForm.code}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, code: e.target.value })}
                    className="w-full p-2.5 border rounded-xl uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    required
                    value={newCourseForm.credits}
                    onChange={(e) => setNewCourseForm({ ...newCourseForm, credits: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newCourseForm.department}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, department: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm({ ...newCourseForm, description: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white font-bold rounded-xl"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Upload Learning Resource</h3>
            <form onSubmit={handleAddResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={newResourceForm.courseCode}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, courseCode: e.target.value })}
                  className="w-full p-2.5 border rounded-xl uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Deep Learning Architecture Slides"
                  value={newResourceForm.title}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newResourceForm.unit}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, unit: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={newResourceForm.type}
                    onChange={(e) => setNewResourceForm({ ...newResourceForm, type: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PowerPoint Slide</option>
                    <option value="video">Video Lecture</option>
                    <option value="note">Notes</option>
                    <option value="link">Web Link</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white font-bold rounded-xl"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assessment Modal */}
      {showAddAssessmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Schedule Academic Assessment</h3>
            <form onSubmit={handleAddAssessment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={newAssessmentForm.courseCode}
                  onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, courseCode: e.target.value })}
                  className="w-full p-2.5 border rounded-xl uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Lab Exam"
                  value={newAssessmentForm.title}
                  onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newAssessmentForm.type}
                    onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, type: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="lab">Lab Practicum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={newAssessmentForm.totalMarks}
                    onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, totalMarks: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAssessmentModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white font-bold rounded-xl"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Enrollment Modal */}
      {showAddEnrollmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Enroll Student in Course</h3>
            <form onSubmit={handleAddEnrollment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@edureach.edu"
                  value={newEnrollmentForm.studentEmail}
                  onChange={(e) => setNewEnrollmentForm({ ...newEnrollmentForm, studentEmail: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Course Code</label>
                <select
                  value={newEnrollmentForm.courseCode}
                  onChange={(e) => setNewEnrollmentForm({ ...newEnrollmentForm, courseCode: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-white"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEnrollmentModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white font-bold rounded-xl"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Broadcast Campus Announcement</h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Mid-Term Exams"
                  value={newAnnouncementForm.title}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, title: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={newAnnouncementForm.targetAudience}
                    onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, targetAudience: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="all">Everyone (All)</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newAnnouncementForm.priority}
                    onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, priority: e.target.value as any })}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="info">Info / Notice</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type your official announcement here..."
                  value={newAnnouncementForm.content}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, content: e.target.value })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="px-3.5 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-800 text-white font-bold rounded-xl"
                >
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="font-bold text-slate-900 text-base">Student Academic Dossier</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-sm">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{selectedStudent.name}</div>
                    <div className="text-slate-500">{selectedStudent.email}</div>
                    <div className="text-[11px] font-mono text-slate-400">Roll: {selectedStudent.rollNo || "22CSE0104"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Department</div>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedStudent.department || "Computer Science"}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Status</div>
                    <div className="font-bold text-emerald-600 mt-0.5 uppercase">{selectedStudent.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Registered Date</div>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {new Date(selectedStudent.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-400 text-[10px] uppercase font-bold">Active Courses</div>
                    <div className="font-bold text-blue-600 mt-0.5">
                      {enrollments.filter((e) => e.studentEmail === selectedStudent.email).length} Enrolled
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-bold text-slate-900 mb-2">Enrolled Courses & Attendance</h4>
                  <div className="space-y-2">
                    {enrollments
                      .filter((e) => e.studentEmail === selectedStudent.email)
                      .map((en) => (
                        <div key={en._id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                          <div>
                            <span className="font-mono font-bold text-red-800">{en.courseCode}</span>
                            <div className="text-slate-600 text-[11px]">{en.courseTitle}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{en.attendancePercentage}%</span>
                            <div className="text-[10px] text-emerald-600 font-semibold">Grade: {en.grade || "A"}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
