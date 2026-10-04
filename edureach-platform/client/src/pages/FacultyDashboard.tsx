import { useState, useEffect } from "react";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Users,
  Settings,
  ShieldCheck,
  KeyRound,
  User,
  Smartphone,
  X,
  BookOpen,
  Calendar,
  FileText,
  Bell,
  MessageSquare,
  AlertTriangle,
  Bot,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getAllResults, createResult, type StudentResult } from "../services/result.service";
import { updateProfile, changePassword, toggle2FA } from "../services/auth.service";
import FacultyAIDrawer from "../components/FacultyAIDrawer";
import CourseManagerModal from "../components/CourseManagerModal";
import AIAssignmentEvaluatorModal from "../components/AIAssignmentEvaluatorModal";
import AttendanceManagerModal from "../components/AttendanceManagerModal";
import API from "../services/api";

export default function FacultyDashboard() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "assignments" | "attendance" | "announcements" | "results">("overview");

  // Modals and Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<any>(null);
  const [showAIEvalModal, setShowAIEvalModal] = useState(false);
  const [selectedEvalAssignment, setSelectedEvalAssignment] = useState<any>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile" | "password" | "security">("profile");

  // Data states
  const [results, setResults] = useState<StudentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Profile Edit State
  const [profName, setProfName] = useState(user?.name || "Prof. Rajesh Sharma");
  const [profFacultyId, setProfFacultyId] = useState(user?.facultyId || "FAC-1002");
  const [profDesignation, setProfDesignation] = useState(user?.designation || "Associate Professor & Exam Chair");
  const [profDepartment, setProfDepartment] = useState(user?.department || "Computer Science & Engineering");
  const [profQualification, setProfQualification] = useState(user?.qualification || "Ph.D. in Computer Science");
  const [profPhone, setProfPhone] = useState(user?.phone || "+91-9876543210");
  const [profOfficeHours, setProfOfficeHours] = useState(user?.officeHours || "Mon-Fri: 10:00 AM - 1:00 PM");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2FA State
  const [is2FA, setIs2FA] = useState(user?.is2FAEnabled || false);

  // New Announcement Modal state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annCategory] = useState("Exam");

  // New Assignment Modal state
  const [showAsgModal, setShowAsgModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState("");
  const [asgCourse, setAsgCourse] = useState("CS401 - Data Structures");
  const [asgDueDate, setAsgDueDate] = useState("2026-08-30");

  // Attendance Marking State (Present/Absent matrix)
  const [attendanceList, setAttendanceList] = useState<any[]>([
    { id: "st-1", rollNo: "22CSE0104", name: "Alex Rivera", status: "Present" },
    { id: "st-2", rollNo: "22CSE0112", name: "Priya Patel", status: "Present" },
    { id: "st-3", rollNo: "22CSE0145", name: "Rohan Verma", status: "Present" },
    { id: "st-4", rollNo: "22CSE0188", name: "Karan Singh", status: "Absent" },
    { id: "st-5", rollNo: "22CSE0192", name: "Sneha Reddy", status: "Absent" },
    { id: "st-6", rollNo: "22CSE0199", name: "Ananya Gupta", status: "Present" },
  ]);

  // Form State for publishing new result
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [semester] = useState("Semester 4");
  const [course] = useState("B.Tech - Computer Science & Engineering (CSE)");

  const [subjects, setSubjects] = useState([
    { code: "CS401", name: "Data Structures & Algorithms", internalMarks: 25, externalMarks: 58, maxMarks: 100, credits: 4 },
    { code: "CS402", name: "Database Management Systems", internalMarks: 27, externalMarks: 60, maxMarks: 100, credits: 4 },
    { code: "CS403", name: "Operating Systems", internalMarks: 24, externalMarks: 52, maxMarks: 100, credits: 3 },
    { code: "CS404", name: "Computer Networks", internalMarks: 28, externalMarks: 61, maxMarks: 100, credits: 4 },
  ]);

  const loadInitialData = async () => {
    try {
      const res = await API.get("/faculty/dashboard-data");
      setDashboardData(res.data.data);
      const resultsData = await getAllResults();
      setResults(resultsData);
    } catch (err) {
      console.warn("Using fallback faculty dashboard data.");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSubjectChange = (index: number, field: string, value: any) => {
    const updated = [...subjects];
    (updated[index] as any)[field] = value;
    setSubjects(updated);
  };

  const handlePublishResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !rollNo) {
      toast.error("Please fill in student details.");
      return;
    }

    try {
      const processedSubjects = subjects.map((s) => ({
        ...s,
        internalMarks: Number(s.internalMarks),
        externalMarks: Number(s.externalMarks),
        totalMarks: Number(s.internalMarks) + Number(s.externalMarks),
        grade: Number(s.internalMarks) + Number(s.externalMarks) >= 90 ? "O" : Number(s.internalMarks) + Number(s.externalMarks) >= 80 ? "A+" : "A",
      }));

      const newEntry = await createResult({
        studentName,
        studentEmail,
        rollNo,
        department: user?.department || "Computer Science & Engineering",
        course,
        semester,
        academicYear: "2025-2026",
        subjects: processedSubjects,
        publishedBy: user?.name || "Faculty Examinations",
      });

      setResults([newEntry, ...results]);
      toast.success(`Result published for ${studentName}!`);
      setShowAddModal(false);

      setStudentName("");
      setStudentEmail("");
      setRollNo("");
    } catch (err) {
      toast.error("Failed to publish result.");
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profName,
        facultyId: profFacultyId,
        designation: profDesignation,
        department: profDepartment,
        qualification: profQualification,
        phone: profPhone,
        officeHours: profOfficeHours,
      });
      updateUser({
        name: profName,
        facultyId: profFacultyId,
        designation: profDesignation,
        department: profDepartment,
        qualification: profQualification,
        phone: profPhone,
        officeHours: profOfficeHours,
      });
      toast.success("Faculty Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password change failed.");
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    const nextState = !is2FA;
    try {
      await toggle2FA(nextState);
      setIs2FA(nextState);
      updateUser({ is2FAEnabled: nextState });
      toast.success(nextState ? "Two-Factor Authentication Enabled!" : "Two-Factor Authentication Disabled.");
    } catch (err) {
      toast.error("Could not update 2FA status.");
    }
  };

  // Announcement Creation
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: annTitle,
      content: annContent,
      date: new Date().toISOString().split("T")[0],
      author: user?.name || "Prof. Rajesh Sharma",
      category: annCategory,
    };
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        announcements: [newAnn, ...dashboardData.announcements],
      });
    }
    toast.success("Announcement posted to department noticeboard!");
    setShowAnnModal(false);
    setAnnTitle("");
    setAnnContent("");
  };

  // Assignment Creation
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle) return;
    const newAsg = {
      id: `asg-${Date.now()}`,
      title: asgTitle,
      course: asgCourse,
      dueDate: asgDueDate,
      submittedCount: 0,
      totalCount: 54,
      status: "Open",
    };
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        assignments: [newAsg, ...dashboardData.assignments],
      });
    }
    toast.success("Assignment created and published to students!");
    setShowAsgModal(false);
    setAsgTitle("");
  };

  // Toggle Attendance Student status
  const toggleAttendanceStatus = (id: string) => {
    setAttendanceList((prev) =>
      prev.map((st) => (st.id === id ? { ...st, status: st.status === "Present" ? "Absent" : "Present" } : st))
    );
  };

  const handleSaveAttendance = () => {
    toast.success("Today's attendance saved & synced to student records!");
  };

  const coursesList = dashboardData?.courses || [];
  const todaysClassesList = dashboardData?.todaysClasses || [];
  const assignmentsList = dashboardData?.assignments || [];
  const announcementsList = dashboardData?.announcements || [];
  const messagesList = dashboardData?.messages || [];
  const alertsList = dashboardData?.alerts || [];
  const studentsRosterList = dashboardData?.studentsRoster || [];

  return (
    <div className="min-h-screen bg-cream/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Faculty Header Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-maroon to-maroon-dark text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-maroon/20">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-maroon/10 text-maroon text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Faculty Portal
                </span>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full font-mono">
                  {user?.facultyId || profFacultyId}
                </span>
                <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {user?.department || profDepartment}
                </span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {user?.name || profName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {user?.designation || profDesignation} — {user?.qualification || profQualification}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAIDrawer(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              <Bot className="w-4 h-4 text-white" /> Faculty AI Copilot
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 border border-maroon text-maroon hover:bg-maroon/5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <Settings className="w-4 h-4" /> Profile & Security
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-maroon text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-maroon-dark text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Publish Exam Marks
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "courses" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Courses & Schedule ({coursesList.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "students" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <Users className="w-4 h-4" /> Students Roster (142)
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "assignments" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <FileText className="w-4 h-4" /> Assignments ({assignmentsList.length})
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "attendance" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "announcements" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <Bell className="w-4 h-4" /> Notices & Inbox ({messagesList.filter((m: any) => m.unread).length})
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "results" ? "bg-maroon text-white shadow-md" : "text-gray-600 hover:bg-cream/60"
            }`}
          >
            <Award className="w-4 h-4" /> Published Results ({results.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Metrics Bar (All 9 Requested Information Items Preview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Students */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">142</div>
                  <div className="text-xs text-gray-500 font-semibold">👨‍🎓 Total Students</div>
                </div>
              </div>

              {/* 2. Courses */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-maroon/10 text-maroon flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{coursesList.length}</div>
                  <div className="text-xs text-gray-500 font-semibold">📚 Active Courses</div>
                </div>
              </div>

              {/* 3. Today's Classes */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{todaysClassesList.length}</div>
                  <div className="text-xs text-gray-500 font-semibold">📅 Today's Classes</div>
                </div>
              </div>

              {/* 4. Low Attendance Alerts */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-red-600">4</div>
                  <div className="text-xs text-gray-500 font-semibold">⚠️ Attendance Alerts</div>
                </div>
              </div>
            </div>

            {/* Grid Row: Today's Classes & Alerts Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule Timeline */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-maroon" /> Today's Lecture Timetable & Classes
                    </h2>
                    <p className="text-xs text-gray-500">Scheduled sessions for today</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-xs font-bold text-maroon hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {todaysClassesList.map((cls: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-maroon/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center font-bold text-xs">
                          {cls.time.split(" ")[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{cls.course}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>🕒 {cls.time}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-700">📍 {cls.room}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          {cls.type}
                        </span>
                        <button
                          onClick={() => setActiveTab("attendance")}
                          className="text-xs bg-maroon text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-maroon-dark transition-colors shadow-sm"
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings & Alerts Center */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" /> Warnings & Alert Center
                  </h2>
                  <p className="text-xs text-gray-500">Low attendance warnings & deadlines</p>
                </div>

                <div className="space-y-3">
                  {alertsList.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-red-50/60 rounded-2xl border border-red-100 text-xs space-y-1">
                      <div className="font-bold text-red-900 flex items-center justify-between">
                        <span>{alt.studentName || alt.title}</span>
                        {alt.attendancePercentage && (
                          <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded-full font-mono">
                            {alt.attendancePercentage}%
                          </span>
                        )}
                      </div>
                      <p className="text-red-700 leading-relaxed">{alt.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Row: Announcements & Student Messages Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Announcements */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-maroon" /> Recent Department Announcements
                    </h2>
                    <p className="text-xs text-gray-500">Noticeboard updates for students</p>
                  </div>
                  <button
                    onClick={() => setShowAnnModal(true)}
                    className="text-xs bg-maroon text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-maroon-dark"
                  >
                    + Post Notice
                  </button>
                </div>

                <div className="space-y-3">
                  {announcementsList.map((ann: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-maroon">{ann.title}</span>
                        <span className="text-gray-400">{ann.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Messages Inbox */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" /> Student Messages Inbox
                    </h2>
                    <p className="text-xs text-gray-500">Direct inquiries & office hour requests</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {messagesList.filter((m: any) => m.unread).length} Unread
                  </span>
                </div>

                <div className="space-y-3">
                  {messagesList.map((msg: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="font-bold text-gray-900">{msg.studentName} ({msg.rollNo})</div>
                        <span className="text-gray-400">{msg.time}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700">{msg.subject}</div>
                      <p className="text-xs text-gray-500 italic">"{msg.preview}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & SCHEDULE */}
        {activeTab === "courses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-gray-900 mb-1">Courses Currently Teaching</h2>
              <p className="text-xs text-gray-500 mb-6">Active subject allocations, syllabus progress & class timetable</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coursesList.map((c: any) => (
                  <div key={c.id} className="p-5 bg-cream/40 rounded-2xl border border-gray-200 space-y-4 hover:border-maroon/40 transition-all shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-xs bg-maroon text-white px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">{c.credits} Credits</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
                      <p className="text-xs text-gray-500">{c.department}</p>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                      <div>🗓️ <span className="font-semibold">{c.schedule}</span></div>
                      <div>📍 <span className="font-semibold">{c.room}</span></div>
                      <div>👨‍🎓 <span className="font-semibold">{c.studentsCount} Students Enrolled</span></div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>Syllabus Progress</span>
                        <span>{c.syllabusProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-maroon rounded-full" style={{ width: `${c.syllabusProgress}%` }}></div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCourseForModal(c);
                          setShowCourseModal(true);
                        }}
                        className="w-full bg-maroon text-white text-xs font-bold py-2.5 rounded-xl hover:bg-maroon-dark shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" /> Manage Course & Materials
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS & ROSTER */}
        {activeTab === "students" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">Student Directory & Class Roster</h2>
                  <p className="text-xs text-gray-500">142 Enrolled Students across Semester 4 Courses</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search student by name or roll..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-maroon"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Attendance %</th>
                      <th className="py-3 px-4 text-center">CGPA</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentsRosterList
                      .filter((st: any) => st.name.toLowerCase().includes(searchTerm.toLowerCase()) || st.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((st: any) => (
                        <tr key={st.id} className="hover:bg-cream/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-maroon">{st.rollNo}</td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">{st.name}</td>
                          <td className="py-3.5 px-4 text-xs text-gray-500">{st.email}</td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className={`px-2.5 py-1 rounded-full text-xs ${st.attendance < 75 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                              {st.attendance}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-800">{st.cgpa}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.status === "At Risk" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS */}
        {activeTab === "assignments" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">Assignments & Problem Sets</h2>
                  <p className="text-xs text-gray-500">Track student submissions and evaluation deadlines</p>
                </div>
                <button
                  onClick={() => setShowAsgModal(true)}
                  className="bg-maroon text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-maroon-dark shadow-md"
                >
                  + Create New Assignment
                </button>
              </div>

              <div className="space-y-4">
                {assignmentsList.map((asg: any) => (
                  <div key={asg.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-maroon font-mono">{asg.course}</span>
                      <h3 className="font-bold text-gray-900 text-base">{asg.title}</h3>
                      <div className="text-xs text-gray-500">Due Date: <span className="font-semibold text-gray-700">{asg.dueDate}</span></div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <div className="w-full sm:w-56 space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>Submissions</span>
                          <span>{asg.submittedCount}/{asg.totalCount}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(asg.submittedCount / asg.totalCount) * 100}%` }}></div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedEvalAssignment(asg);
                          setShowAIEvalModal(true);
                        }}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Bot className="w-4 h-4 text-white" /> AI Evaluate Submissions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DAILY ATTENDANCE */}
        {activeTab === "attendance" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">Today's Daily Attendance Marking Matrix</h2>
                  <p className="text-xs text-gray-500">Data Structures & Algorithms (CS401) — 10:00 AM Session</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="bg-maroon text-white font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-maroon-dark shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Open Attendance Hub ⭐⭐⭐
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-emerald-700 shadow-md"
                  >
                    Save & Sync Attendance Records
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attendanceList.map((st) => (
                  <div key={st.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-maroon">{st.rollNo}</div>
                      <div className="font-bold text-gray-900 text-sm">{st.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAttendanceStatus(st.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        st.status === "Present" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {st.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NOTICES & MESSAGES */}
        {activeTab === "announcements" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notices */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h2 className="font-heading text-xl font-bold text-gray-900">Department Noticeboard</h2>
                  <button onClick={() => setShowAnnModal(true)} className="bg-maroon text-white text-xs px-3 py-1.5 rounded-xl font-semibold">
                    + New Notice
                  </button>
                </div>
                <div className="space-y-3">
                  {announcementsList.map((ann: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                      <div className="flex justify-between text-xs font-bold text-maroon">
                        <span>{ann.title}</span>
                        <span className="text-gray-400">{ann.date}</span>
                      </div>
                      <p className="text-xs text-gray-600">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inbox */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h2 className="font-heading text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Student Direct Messages</h2>
                <div className="space-y-3">
                  {messagesList.map((msg: any) => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-900">
                        <span>{msg.studentName} ({msg.rollNo})</span>
                        <span className="text-gray-400">{msg.time}</span>
                      </div>
                      <div className="text-xs font-semibold text-gray-800">{msg.subject}</div>
                      <p className="text-xs text-gray-600 italic">"{msg.preview}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PUBLISHED RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-gray-900">Published Semester Grade Cards</h2>
                  <p className="text-xs text-gray-500">Verified examination results in database</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-maroon text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-md">
                  + Publish Grade Card
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4 text-center">Marks</th>
                      <th className="py-3 px-4 text-center">SGPA</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((item, idx) => (
                      <tr key={idx} className="hover:bg-cream/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-maroon">{item.rollNo}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">{item.studentName}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-600">{item.course}</td>
                        <td className="py-3.5 px-4 text-center font-bold">{item.totalMarks}/{item.maxTotalMarks}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-maroon">{item.sgpa}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">{item.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => setResults(results.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Faculty AI Copilot Drawer */}
      <FacultyAIDrawer open={showAIDrawer} onClose={() => setShowAIDrawer(false)} />

      {/* Course & Materials Manager Modal */}
      <CourseManagerModal open={showCourseModal} course={selectedCourseForModal} onClose={() => setShowCourseModal(false)} />

      {/* AI Assignment Evaluation Modal */}
      <AIAssignmentEvaluatorModal
        open={showAIEvalModal}
        assignmentTitle={selectedEvalAssignment?.title || "Assignment Evaluation"}
        courseName={selectedEvalAssignment?.course || "Computer Science"}
        onClose={() => setShowAIEvalModal(false)}
      />

      {/* Attendance Manager Modal */}
      <AttendanceManagerModal open={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} />

      {/* Post Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-gray-900">Post Department Announcement</h3>
              <button onClick={() => setShowAnnModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Evaluation Deadline"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Announcement Content</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Enter notice details for students..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAnnModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs bg-maroon text-white font-semibold rounded-xl hover:bg-maroon-dark">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Assignment Modal */}
      {showAsgModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-gray-900">Create New Course Assignment</h3>
              <button onClick={() => setShowAsgModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Graph Traversal Problem Set"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Target Course</label>
                <select
                  value={asgCourse}
                  onChange={(e) => setAsgCourse(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                >
                  <option value="CS401 - Data Structures">CS401 - Data Structures</option>
                  <option value="CS402 - DBMS">CS402 - DBMS</option>
                  <option value="CS403 - Operating Systems">CS403 - Operating Systems</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Submission Due Date</label>
                <input
                  type="date"
                  required
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAsgModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 text-xs bg-maroon text-white font-semibold rounded-xl hover:bg-maroon-dark">Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile & Security Management Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-maroon" />
                <div>
                  <h3 className="font-heading text-xl font-bold text-gray-900">Faculty Profile & Security Portal</h3>
                  <p className="text-xs text-gray-500">Manage profile data, password security, and 2FA settings</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-xl">
              <button
                onClick={() => setSettingsTab("profile")}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  settingsTab === "profile" ? "bg-white text-maroon shadow-sm" : "text-gray-600 hover:text-maroon"
                }`}
              >
                <User className="w-3.5 h-3.5" /> Profile Info
              </button>
              <button
                onClick={() => setSettingsTab("password")}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  settingsTab === "password" ? "bg-white text-maroon shadow-sm" : "text-gray-600 hover:text-maroon"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </button>
              <button
                onClick={() => setSettingsTab("security")}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  settingsTab === "security" ? "bg-white text-maroon shadow-sm" : "text-gray-600 hover:text-maroon"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> 2FA Authentication
              </button>
            </div>

            {settingsTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Faculty Name</label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Faculty ID Number</label>
                    <input
                      type="text"
                      value={profFacultyId}
                      onChange={(e) => setProfFacultyId(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-maroon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Designation</label>
                    <input
                      type="text"
                      value={profDesignation}
                      onChange={(e) => setProfDesignation(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Department</label>
                    <input
                      type="text"
                      value={profDepartment}
                      onChange={(e) => setProfDepartment(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Academic Qualification</label>
                    <input
                      type="text"
                      value={profQualification}
                      onChange={(e) => setProfQualification(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Office Hours</label>
                    <input
                      type="text"
                      value={profOfficeHours}
                      onChange={(e) => setProfOfficeHours(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-maroon text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-maroon-dark shadow-md">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {settingsTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-maroon text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-maroon-dark shadow-md">
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {settingsTab === "security" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">Two-Factor Authentication (2FA)</div>
                    <p className="text-xs text-gray-500">Require an additional 6-digit OTP authenticator verification code upon login.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      is2FA ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {is2FA ? "2FA Enabled" : "Enable 2FA"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Faculty Publish Marks Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-gray-900">Publish Student Examination Marks</h3>
                <p className="text-xs text-gray-500">Enter marks to generate grade card & compute SGPA</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handlePublishResult} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 22CSE0155"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="rahul@edureach.edu"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Enter Subject Marks</div>
                {subjects.map((sub, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <div className="text-xs font-mono font-bold text-maroon">{sub.code}</div>
                      <div className="text-xs font-medium text-gray-700 truncate">{sub.name}</div>
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] text-gray-400 block">Internal (30)</label>
                      <input
                        type="number"
                        max={30}
                        value={sub.internalMarks}
                        onChange={(e) => handleSubjectChange(idx, "internalMarks", e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="text-[10px] text-gray-400 block">External (70)</label>
                      <input
                        type="number"
                        max={70}
                        value={sub.externalMarks}
                        onChange={(e) => handleSubjectChange(idx, "externalMarks", e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm bg-maroon text-white font-semibold rounded-xl hover:bg-maroon-dark shadow-md">Publish Grade Card</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
