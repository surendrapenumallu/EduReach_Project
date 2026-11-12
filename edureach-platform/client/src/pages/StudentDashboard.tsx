import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getStudentPortalData,
  updateProfilePhoto,
  uploadImageFile,
  reviewResumeWithAI,
  getAIBriefing,
  calculateBunkSafety,
  type StudentPortalData,
  type AIResumeFeedback,
  type AIBriefingData,
  type BunkSafetyResult,
} from "../services/student.service";
import { getMyResults, type StudentResult } from "../services/result.service";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Bot,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Camera,
  Calendar,
  Award,
  CreditCard,
  Briefcase,
  Printer,
  AlertTriangle,
  RefreshCw,
  Check,
  Zap,
  Bell,
  HelpCircle,
  Target,
  ShieldCheck,
  Upload,
  Loader2,
} from "lucide-react";
import ApplicationModal from "../components/ApplicationModal";
import AdmissionStatusTracker from "../components/AdmissionStatusTracker";
import ChatDrawer from "../components/ChatDrawer";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { getSocket, joinUserRoom } from "../services/socket.service";

type ActiveTab = "overview" | "attendance" | "cgpa" | "exams" | "results" | "placements" | "timeline";

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [portalData, setPortalData] = useState<StudentPortalData | null>(null);
  const [aiBriefing, setAiBriefing] = useState<AIBriefingData | null>(null);
  const [bunkResults, setBunkResults] = useState<BunkSafetyResult[]>([]);
  const [, setResults] = useState<StudentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Modals & Drawers
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Priority 2: Attendance Bunk Query
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>("CS605");
  const [attendanceView, setAttendanceView] = useState<"course" | "day" | "intelligence">("course");

  // Priority 3: Timeline Filter
  const [timelineCategoryFilter, setTimelineCategoryFilter] = useState<string>("All");

  // Sub-tabs
  const [examSubTab, setExamSubTab] = useState<"hallticket" | "fees">("hallticket");
  const [placementSubTab, setPlacementSubTab] = useState<"jobs" | "resume" | "training">("jobs");

  // Priority 5: AI Resume State
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Development Engineer (SDE)");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIResumeFeedback | null>(null);

  // Target CGPA Calculator
  const [desiredCGPA, setDesiredCGPA] = useState("9.0");
  const [calculatedRequiredSGPA, setCalculatedRequiredSGPA] = useState<number | null>(null);

  // Preset avatars
  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  ];

  const fetchInitialData = async () => {
    try {
      const [pData, resData, briefingData] = await Promise.all([
        getStudentPortalData().catch(() => null),
        getMyResults().catch(() => []),
        getAIBriefing().catch(() => null),
      ]);
      if (pData) {
        setPortalData(pData);
        const bSafety = await calculateBunkSafety(pData.attendance.courseWise).catch(() => []);
        setBunkResults(bSafety);
      }
      if (resData && resData.length > 0) {
        setResults(resData);
        setSelectedResult(resData[0]);
      }
      if (briefingData) {
        setAiBriefing(briefingData);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Loaded offline data.");
    }
  };

  useEffect(() => {
    fetchInitialData();
    joinUserRoom("student", user?.id);

    const socket = getSocket();
    const handleStatusUpdate = (payload: any) => {
      toast.success(`Application update: ${payload.message}`, {
        icon: "📄",
        duration: 5000,
      });
      fetchInitialData();
    };

    const handleAttendanceWarning = (payload: any) => {
      toast.error(`Attendance Warning: ${payload.message || "Attendance dropped below safe mark!"}`, {
        duration: 6000,
      });
    };

    socket.on("application:status_updated", handleStatusUpdate);
    socket.on("attendance:warning", handleAttendanceWarning);

    return () => {
      socket.off("application:status_updated", handleStatusUpdate);
      socket.off("attendance:warning", handleAttendanceWarning);
    };
  }, [user?.id]);

  const handleRefreshBriefing = async () => {
    try {
      setBriefingLoading(true);
      const updatedBriefing = await getAIBriefing();
      setAiBriefing(updatedBriefing);
      toast.success("AI Student Briefing Updated!");
    } catch (err) {
      console.error(err);
      toast.error("Could not refresh AI briefing.");
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleUpdateProfilePhoto = async (url: string) => {
    if (!url.trim()) return;
    try {
      await updateProfilePhoto(url);
      updateUser({ profilePhoto: url });
      toast.success("Profile photo updated!");
      setIsPhotoModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile photo.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const toastId = toast.loading("Uploading image to Cloud storage...");
    try {
      setUploadingPhoto(true);
      const uploadedUrl = await uploadImageFile(file);
      toast.loading("Saving avatar to profile...", { id: toastId });
      await updateProfilePhoto(uploadedUrl);
      updateUser({ profilePhoto: uploadedUrl });
      setNewPhotoUrl(uploadedUrl);
      toast.success("Profile photo updated successfully!", { id: toastId });
      setIsPhotoModalOpen(false);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to upload image. Please try again.",
        { id: toastId }
      );
    } finally {
      setUploadingPhoto(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleAIResumeAnalysis = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 15) {
      toast.error("Please paste your resume text (min 15 characters).");
      return;
    }
    try {
      setAiLoading(true);
      const feedback = await reviewResumeWithAI(resumeText, targetRole);
      setAiFeedback(feedback);
      toast.success("AI Resume Review Complete!");
    } catch (err) {
      console.error(err);
      toast.error("AI analysis failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleProcessPayment = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setIsPaymentModalOpen(false);
      if (portalData) {
        setPortalData({
          ...portalData,
          exams: {
            ...portalData.exams,
            fees: {
              ...portalData.exams.fees,
              status: "Paid",
              transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              paymentDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            },
          },
        });
      }
      toast.success("Exam Fee Paid Successfully!");
    }, 1500);
  };

  const handleJobApply = (jobId: string) => {
    if (!portalData) return;
    const updatedJobs = portalData.placements.jobs.map((job) =>
      job.id === jobId ? { ...job, applied: true, status: "Applied - Under Review" } : job
    );
    setPortalData({
      ...portalData,
      placements: {
        ...portalData.placements,
        jobs: updatedJobs,
      },
    });
    toast.success("Application Submitted to Partner!");
  };

  const handleCalculateTargetCGPA = () => {
    if (!portalData) return;
    const target = parseFloat(desiredCGPA);
    if (isNaN(target) || target < 1 || target > 10) {
      toast.error("Please enter a valid target CGPA (1.0 to 10.0)");
      return;
    }
    const currentCGPA = portalData.cgpa.overallCGPA;
    const earnedCredits = portalData.cgpa.totalCreditsEarned;
    const totalCredits = portalData.cgpa.totalCreditsRequired;
    const remainingCredits = totalCredits - earnedCredits;

    const requiredSGPA = (target * totalCredits - currentCGPA * earnedCredits) / remainingCredits;
    setCalculatedRequiredSGPA(Math.min(10.0, Math.max(0.0, parseFloat(requiredSGPA.toFixed(2)))));
  };

  const userPhoto =
    user?.profilePhoto ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  const selectedBunkInfo = bunkResults.find((b) => b.code === selectedCourseCode) || bunkResults[0];

  const filteredDeadlines = (portalData?.deadlines || []).filter(
    (d: any) => timelineCategoryFilter === "All" || d.category === timelineCategoryFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/60 via-white to-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner with Profile & Notification Bell */}
        <div className="bg-gradient-to-r from-maroon via-maroon-dark to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              {/* Profile Photo Avatar */}
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                  id="student-avatar-input"
                />
                <img
                  src={userPhoto}
                  alt={user?.name || "Student"}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg group-hover:opacity-90 transition-all cursor-pointer"
                  onClick={() => setIsPhotoModalOpen(true)}
                  title="Click to view avatar options"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 p-2 bg-amber-400 text-slate-900 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform disabled:opacity-60 cursor-pointer"
                  title="Upload New Profile Photo (Direct to Cloud)"
                  id="avatar-camera-btn"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-medium mb-2 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Student Portal • Roll #{portalData?.profile.rollNo || "22CSE0104"}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">
                  {user?.name || "Alex Rivera"}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                  {portalData?.profile.department || "Computer Science & Engineering"} • {portalData?.profile.semester || "Semester 6"}
                </p>
                <div className="text-xs text-white/70 mt-1">
                  Faculty Mentor: <span className="font-semibold text-amber-200">{portalData?.profile.mentor || "Dr. Rajesh Sharma"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Priority 6: Notification Bell */}
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 backdrop-blur-sm transition-all"
                title="AI Notifications & Alerts"
              >
                <Bell className="w-5 h-5 text-amber-300" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  3
                </span>
              </button>

              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-4 py-2 bg-white text-maroon hover:bg-cream font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Admission App
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4 text-amber-300" /> AI Student Helper
              </button>
            </div>
          </div>
        </div>

        {/* Priority 6: AI Notification Drawer Dropdown */}
        {isNotificationOpen && (
          <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <Bell className="w-4 h-4 text-amber-500" /> AI-Generated Smart Alerts & Reminders
              </div>
              <button onClick={() => setIsNotificationOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">Attendance Alert: CS605 Web Technologies</span>
                  <p className="text-amber-800 mt-0.5">
                    Your attendance is 84.4%. You can safely miss at most 4 classes while staying above the 75% threshold.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-900">Placement Drive: Microsoft SDE (18.5 LPA)</span>
                  <p className="text-blue-800 mt-0.5">
                    Shortlisted for Online Assessment on March 28. Your AI Skill Match score is 94%!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">Exam Fee Payment Confirmed</span>
                  <p className="text-emerald-800 mt-0.5">
                    Semester 6 End Exam Fee (₹ 2,000) paid. Official Hall Ticket HT-2026-CSE-0104 issued.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Student Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
          {[
            { id: "overview", label: "Overview & AI Briefing", icon: FileText, highlight: true },
            { id: "attendance", label: "Attendance & Bunk Calc", icon: Calendar, badge: `${portalData?.attendance.overallPercentage || 88.5}%` },
            { id: "timeline", label: "Timeline & Deadlines", icon: Clock },
            { id: "cgpa", label: "Overall CGPA", icon: Award, badge: `${portalData?.cgpa.overallCGPA || 8.92}` },
            { id: "exams", label: "Hall Ticket & Fees", icon: CreditCard },
            { id: "results", label: "Exam Results", icon: GraduationCap },
            { id: "placements", label: "Placements & AI Match", icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? tab.highlight
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-md"
                      : "bg-maroon text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-maroon/10 text-maroon"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & PRIORITY 1: AI STUDENT BRIEFING */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 🔴 PRIORITY 1: AI STUDENT BRIEFING HERO CARD */}
            <div className="bg-gradient-to-br from-slate-900 via-maroon-dark to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>

              <div className="relative z-10 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-400 text-slate-900 rounded-2xl shadow-lg">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Priority 1 • AI Student Briefing
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold rounded-full">
                          Live Gemini AI
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                        {aiBriefing?.greeting || "Good morning, Alex! Here is your AI Briefing."}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={handleRefreshBriefing}
                    disabled={briefingLoading}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm self-end sm:self-center"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${briefingLoading ? "animate-spin" : ""}`} />
                    {briefingLoading ? "Generating..." : "Refresh AI Insights"}
                  </button>
                </div>

                {/* AI Briefing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Today's Focus */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase">
                      <Target className="w-4 h-4" /> Today's Focus Action
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {aiBriefing?.focusToday ||
                        "Prioritize Web Technologies Lab submission & review Graph Algorithms for Microsoft SDE drive."}
                    </p>
                  </div>

                  {/* Academic Strategy */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase">
                      <Award className="w-4 h-4" /> CGPA & Academic Insight
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {aiBriefing?.academicAdvice ||
                        "Your CGPA is 8.92. Securing a 9.10 SGPA in Sem 6 places you in top 3% of department."}
                    </p>
                  </div>

                  {/* Critical Action Alerts */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-red-300 text-xs font-bold uppercase">
                      <AlertTriangle className="w-4 h-4" /> Attendance & Deadline Alerts
                    </div>
                    <ul className="space-y-1 text-xs text-white/80">
                      {aiBriefing?.actionAlerts.map((alert, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-300 font-bold">•</span>
                          <span>{alert}</span>
                        </li>
                      )) || <li>Attendance Watch: CS605 Web Tech is at 84.4%.</li>}
                    </ul>
                  </div>

                  {/* Placement Match Insight */}
                  <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase">
                      <Briefcase className="w-4 h-4" /> Placement AI Match
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {aiBriefing?.careerInsight ||
                        "94% Match for Microsoft SDE (18.5 LPA). Practice System Design & DP questions today."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center font-bold text-xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{portalData?.cgpa.overallCGPA || "8.92"} / 10</div>
                  <div className="text-xs text-gray-500 font-medium">Cumulative CGPA</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{portalData?.attendance.overallPercentage || 88.5}%</div>
                  <div className="text-xs text-emerald-600 font-semibold">Attendance (Eligible)</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {portalData?.placements.jobs.filter((j) => j.applied).length || 2} Jobs Applied
                  </div>
                  <div className="text-xs text-amber-700 font-medium">Placement Drive Active</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {portalData?.exams.fees.status || "Paid"}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Sem 6 Exam Fee Status</div>
                </div>
              </div>
            </div>

            {/* Official Admission Application & Lifecycle Tracker */}
            <AdmissionStatusTracker onOpenApplyModal={() => setIsApplyModalOpen(true)} />
          </div>
        )}

        {/* TAB 2: ATTENDANCE & 🔴 PRIORITY 2: ATTENDANCE INTELLIGENCE */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-heading">Attendance Tracking & Intelligence</h2>
                <p className="text-xs text-gray-500">
                  Minimum required attendance threshold: <span className="font-bold text-maroon">75.0%</span> for exam eligibility
                </p>
              </div>

              {/* Sub-tab view toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setAttendanceView("intelligence")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    attendanceView === "intelligence" ? "bg-amber-500 text-slate-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ⚡ "How many classes can I miss?"
                </button>
                <button
                  onClick={() => setAttendanceView("course")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    attendanceView === "course" ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Course Breakdown
                </button>
                <button
                  onClick={() => setAttendanceView("day")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    attendanceView === "day" ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Day Log
                </button>
              </div>
            </div>

            {/* 🔴 PRIORITY 2: ATTENDANCE INTELLIGENCE BUNK CALCULATOR WIDGET */}
            {attendanceView === "intelligence" && (
              <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900/80">
                      Priority 2 • Attendance Intelligence
                    </span>
                    <h3 className="text-2xl font-bold font-heading">"How many classes can I miss?"</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Subject */}
                  <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl space-y-3">
                    <label className="text-xs font-bold text-gray-700 block">Select Registered Course</label>
                    <select
                      value={selectedCourseCode}
                      onChange={(e) => setSelectedCourseCode(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-300 font-bold text-xs focus:outline-none focus:border-maroon"
                    >
                      {bunkResults.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} - {b.title} ({b.percentage}%)
                        </option>
                      ))}
                    </select>

                    <div className="text-xs space-y-1 text-gray-700 pt-2 border-t border-gray-200">
                      <div>Total Classes Conducted: <span className="font-bold">{selectedBunkInfo?.total} Hours</span></div>
                      <div>Classes Attended: <span className="font-bold">{selectedBunkInfo?.attended} Hours</span></div>
                    </div>
                  </div>

                  {/* Calculated Answer Box */}
                  <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300 uppercase">Calculated Safe Leave Threshold</div>
                      <div className="text-3xl font-extrabold mt-1 text-white">
                        {selectedBunkInfo?.safeBunks > 0 ? (
                          <span className="text-emerald-400">Can safely miss {selectedBunkInfo.safeBunks} more class(es)</span>
                        ) : (
                          <span className="text-red-400">Must attend next {selectedBunkInfo?.requiredClasses || 0} class(es)</span>
                        )}
                      </div>
                      <p className="text-xs text-white/80 mt-2 leading-relaxed">
                        {selectedBunkInfo?.advice}
                      </p>
                    </div>

                    <div className="p-3 bg-white/10 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 shrink-0 text-amber-400" />
                      Formula enforced: Keeps your attendance above the mandatory 75.0% threshold.
                    </div>
                  </div>
                </div>

                {/* All Courses Quick Table */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-xs text-gray-700">
                    Course-by-Course Safe Leave Summary
                  </div>
                  <div className="divide-y divide-gray-100 text-xs">
                    {bunkResults.map((b) => (
                      <div key={b.code} className="p-4 flex items-center justify-between hover:bg-cream/30">
                        <div>
                          <span className="font-bold font-mono text-maroon">{b.code}</span> - {b.title}
                          <div className="text-[11px] text-gray-500">Current: {b.percentage}% ({b.attended}/{b.total})</div>
                        </div>
                        <div className="text-right">
                          {b.safeBunks > 0 ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full">
                              +{b.safeBunks} Bunks Safe
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-800 font-extrabold rounded-full">
                              Need +{b.requiredClasses} Classes
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Course-Wise Attendance View */}
            {attendanceView === "course" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Subject / Course-Wise Attendance Breakdown</h3>
                  <p className="text-xs text-gray-500">Real-time attendance calculation for each registered course</p>
                </div>

                {/* Visual Attendance Bar Chart */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Attendance Percentage by Course</span>
                    <span className="text-xs px-2.5 py-0.5 bg-maroon/10 text-maroon font-bold rounded-full">Mandatory Benchmark: 75%</span>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={portalData?.attendance.courseWise.map((c) => ({
                          code: c.code,
                          percentage: c.percentage,
                          subject: c.title,
                        })) || []}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                        <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                        <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Mandatory 75%", fill: "#ef4444", fontSize: 10 }} />
                        <Bar dataKey="percentage" fill="#7B1113" radius={[6, 6, 0, 0]} name="Attendance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {portalData?.attendance.courseWise.map((course) => {
                    const isEligible = course.percentage >= 75;
                    return (
                      <div key={course.code} className="p-6 hover:bg-gray-50/50 transition-colors space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-maroon/10 text-maroon text-xs font-mono font-bold rounded-md">
                                {course.code}
                              </span>
                              <h4 className="font-bold text-gray-900">{course.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Course Faculty: {course.faculty}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-600">
                              {course.attended} / {course.total} Hours
                            </span>
                            <span
                              className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                                isEligible
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800 flex items-center gap-1"
                              }`}
                            >
                              {isEligible ? (
                                `${course.percentage}% Eligible`
                              ) : (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5" /> {course.percentage}% Shortage
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isEligible ? "bg-emerald-500" : "bg-red-500"
                            }`}
                            style={{ width: `${course.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day-Wise Attendance View */}
            {attendanceView === "day" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 font-bold text-gray-900">Day-Wise Attendance Log</div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        <th className="py-3.5 px-6">Date & Day</th>
                        <th className="py-3.5 px-6">Time Slot</th>
                        <th className="py-3.5 px-6">Subject</th>
                        <th className="py-3.5 px-6">Classroom</th>
                        <th className="py-3.5 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                      {portalData?.attendance.dayWise.map((item, idx) => (
                        <tr key={idx} className="hover:bg-cream/30 transition-colors">
                          <td className="py-4 px-6 font-semibold text-gray-900">
                            {item.date} <span className="text-xs text-gray-400 font-normal">({item.day})</span>
                          </td>
                          <td className="py-4 px-6 text-gray-600 font-mono text-xs">{item.slot}</td>
                          <td className="py-4 px-6 font-bold text-gray-800">{item.subject}</td>
                          <td className="py-4 px-6 text-gray-600">{item.room}</td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                                item.status === "Present"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.status === "On Duty"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 🔴 PRIORITY 3: UNIFIED UPCOMING DEADLINES & TIMELINE */}
        {activeTab === "timeline" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-maroon uppercase tracking-wider">
                  Priority 3 • Master Unified Timeline
                </span>
                <h2 className="text-2xl font-bold text-gray-900 font-heading">Upcoming Deadlines & Academic Events</h2>
                <p className="text-xs text-gray-500 mt-0.5">Assignments + Exams + Fee Payments + Placement Drives in one place</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
                {["All", "Assignment", "Exam", "Fee", "Placement"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTimelineCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      timelineCategoryFilter === cat ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="relative border-l-2 border-maroon/20 ml-4 space-y-6 pl-6 py-2">
              {filteredDeadlines.map((item: any) => (
                <div key={item.id} className="relative group">
                  {/* Bullet Marker */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-md ${
                      item.urgency === "High" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  ></div>

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 hover:border-maroon/50 transition-all space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-maroon uppercase font-mono">{item.category}</span>
                      <span className="font-mono text-gray-500 font-bold">{item.date}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                    <p className="text-xs text-gray-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OVERALL CGPA */}
        {activeTab === "cgpa" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-maroon via-maroon-dark to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full uppercase tracking-wider">
                  Academic Performance
                </span>
                <h2 className="text-3xl font-bold font-heading mt-2">Cumulative Grade Point Average (CGPA)</h2>
                <p className="text-white/80 text-sm mt-1">
                  Classification: <span className="font-bold text-amber-300">{portalData?.cgpa.classification || "First Class with Distinction"}</span>
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center min-w-[200px]">
                <div className="text-xs text-white/70 uppercase font-semibold">Overall CGPA</div>
                <div className="text-5xl font-extrabold text-amber-300 mt-1">{portalData?.cgpa.overallCGPA || 8.92}</div>
                <div className="text-xs text-white/80 mt-1">Out of 10.0 Scale</div>
              </div>
            </div>

            {/* Recharts SGPA Progression Area Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Semester SGPA Progression Curve</h3>
                  <p className="text-xs text-gray-500">Continuous semester performance vs. Distinction target (8.0)</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg">
                  Target: 9.0+
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={portalData?.cgpa.semesterSGPA || [
                      { semester: "Semester 1", sgpa: 8.75, credits: 20 },
                      { semester: "Semester 2", sgpa: 8.90, credits: 20 },
                      { semester: "Semester 3", sgpa: 9.10, credits: 20 },
                      { semester: "Semester 4", sgpa: 9.12, credits: 20 },
                      { semester: "Semester 5", sgpa: 8.85, credits: 18 },
                      { semester: "Semester 6", sgpa: 8.95, credits: 14 },
                    ]}
                    margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="sgpaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7B1113" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7B1113" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="semester"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(val) => val.replace("Semester ", "Sem ")}
                    />
                    <YAxis domain={[7.5, 10]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <ReferenceLine
                      y={8.0}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: "Distinction (8.0)", fill: "#d97706", fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sgpa"
                      stroke="#7B1113"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#sgpaGradient)"
                      name="SGPA"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 🟠 PRIORITY 6: AI ACADEMIC RISK PREDICTION WIDGET */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900 text-lg">Priority 6 • AI Academic Risk & Early Warning Predictor</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Low Risk (Score: 12/100)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 block font-semibold">Detention Probability</span>
                  <span className="font-extrabold text-emerald-700 text-sm">0% (Fully Eligible)</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Backlog Risk</span>
                  <span className="font-bold text-gray-800 text-sm">Low (&lt; 3%)</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">CGPA Trajectory</span>
                  <span className="font-bold text-maroon text-sm">Upward (8.75 ➔ 8.92)</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Attendance Watch</span>
                  <span className="font-bold text-gray-800 text-sm">Safe (88.5% overall)</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">AI Recommended Intervention Actions:</span>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Attend the next 4 consecutive Web Tech (CS605) classes to push course attendance above 88%.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Maintain current study routine for AI & ML (CS601) to secure A+ grade in end semester exam.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Schedule 1-on-1 mock technical interview with mentor Dr. Rajesh Sharma before March 25.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Target CGPA Calculator Tool */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-maroon">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-lg">Target CGPA Projection Calculator</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-64">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Desired Target CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="10.0"
                    value={desiredCGPA}
                    onChange={(e) => setDesiredCGPA(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-maroon"
                  />
                </div>

                <button
                  onClick={handleCalculateTargetCGPA}
                  className="w-full sm:w-auto px-6 py-2.5 bg-maroon text-white font-bold text-sm rounded-xl hover:bg-maroon-dark shadow-md transition-all self-end"
                >
                  Calculate Required SGPA
                </button>
              </div>

              {calculatedRequiredSGPA !== null && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-gray-800">Required SGPA for Remaining Semesters:</span>
                  </div>
                  <div className="text-3xl font-extrabold text-maroon">{calculatedRequiredSGPA}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: EXAMS (HALL TICKET & FEES) */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-heading">Examination Center & Fee Payment</h2>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setExamSubTab("hallticket")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    examSubTab === "hallticket" ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Hall Ticket Admit Card
                </button>
                <button
                  onClick={() => setExamSubTab("fees")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    examSubTab === "fees" ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Exam Fee Payments
                </button>
              </div>
            </div>

            {examSubTab === "hallticket" && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-lg space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-7 h-7 text-maroon" />
                      <h3 className="text-2xl font-bold text-gray-900 font-heading">Official Examination Admit Card</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast.success("Streaming Official Hall Ticket PDF...");
                      const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:5050";
                      window.open(`${apiUrl}/api/student/hall-ticket/pdf`, "_blank");
                    }}
                    className="px-5 py-2.5 bg-maroon text-white font-bold rounded-xl text-xs hover:bg-maroon-dark shadow-md flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Download Official Hall Ticket PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block font-semibold">Hall Ticket Number</span>
                    <span className="text-sm font-extrabold text-maroon font-mono">{portalData?.exams.hallTicket.ticketNo}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Student Candidate</span>
                    <span className="text-sm font-bold text-gray-800">{portalData?.exams.hallTicket.studentName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Exam Center</span>
                    <span className="text-sm font-bold text-gray-800">{portalData?.exams.hallTicket.examCenter}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Seat Allotment</span>
                    <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                      Seat #{portalData?.exams.hallTicket.seatNo}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {examSubTab === "fees" && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 font-heading">Semester Examination Fee Ledger</h3>
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                    {portalData?.exams.fees.status}
                  </span>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span>Regular Fee</span>
                    <span className="font-bold">₹ {portalData?.exams.fees.regularFee}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span>Lab Fee</span>
                    <span className="font-bold">₹ {portalData?.exams.fees.labFee}</span>
                  </div>
                  <div className="flex justify-between py-2 text-base font-extrabold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-maroon">₹ {portalData?.exams.fees.totalAmount}</span>
                  </div>
                </div>

                {portalData?.exams.fees.status !== "Paid" && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full py-3 bg-maroon text-white font-bold rounded-xl text-sm"
                  >
                    Pay ₹ {portalData?.exams.fees.totalAmount} Online
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: RESULTS */}
        {activeTab === "results" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 font-heading">Semester Exam Grade Card</h2>
            {selectedResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-maroon text-white rounded-2xl">
                    <div className="text-xs text-white/70 uppercase">Semester SGPA</div>
                    <div className="text-3xl font-extrabold mt-1">{selectedResult.sgpa}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="text-xs text-gray-400 uppercase">Cumulative CGPA</div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">{selectedResult.cgpa}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PLACEMENTS & 🟠 PRIORITY 4: AI PLACEMENT MATCHING & 🟠 PRIORITY 5: AI RESUME ANALYZER */}
        {activeTab === "placements" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-heading">Campus Placement & AI Matching Hub</h2>
                <p className="text-xs text-gray-500">AI Match Scoring + Resume Optimization + Job Application Portal</p>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
                <button
                  onClick={() => setPlacementSubTab("jobs")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    placementSubTab === "jobs" ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🚀 Hiring Drives & AI Match
                </button>
                <button
                  onClick={() => setPlacementSubTab("resume")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    placementSubTab === "resume" ? "bg-amber-500 text-slate-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🤖 AI Resume Assistant
                </button>
                <button
                  onClick={() => setPlacementSubTab("training")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    placementSubTab === "training" ? "bg-maroon text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📚 Training & Attendance
                </button>
              </div>
            </div>

            {/* Sub-tab 1: 🟠 PRIORITY 4: AI PLACEMENT MATCHING DRIVES */}
            {placementSubTab === "jobs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portalData?.placements.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-maroon/50 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{job.company}</h3>
                            <p className="text-xs font-semibold text-maroon">{job.role}</p>
                          </div>
                        </div>

                        {/* 🟠 Priority 4: AI Match Score Badge */}
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> {job.matchScore || 90}% AI Match
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <div>Package: <span className="font-bold text-gray-900">{job.package}</span></div>
                        <div>📍 Location: <span className="font-semibold text-gray-800">{job.location}</span></div>
                        <div>📋 Criteria: <span className="font-semibold text-gray-800">{job.eligibility}</span></div>

                        {/* Required Skills tags */}
                        {job.requiredSkills && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            <span className="text-gray-400 font-semibold">Matched Skills:</span>
                            {job.requiredSkills.map((sk: string) => (
                              <span key={sk} className="px-2 py-0.5 bg-maroon/10 text-maroon text-[10px] font-bold rounded-md">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">{job.status}</span>
                      {job.applied ? (
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Application Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJobApply(job.id)}
                          className="px-5 py-2 bg-maroon text-white font-bold rounded-xl text-xs hover:bg-maroon-dark shadow-md transition-all flex items-center gap-1.5"
                        >
                          Apply Now <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-tab 2: 🟠 PRIORITY 5: AI RESUME ANALYZER */}
            {placementSubTab === "resume" && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-heading">AI Resume Review & ATS Score Optimizer</h3>
                    <p className="text-xs text-gray-500">Gemini AI resume skill extraction & placement drive match analysis</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Target Placement Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-maroon"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Paste Resume Content or Summary</label>
                      <textarea
                        rows={10}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your skills, work experience, projects, and education text here..."
                        className="w-full p-4 rounded-xl border border-gray-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-maroon"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleAIResumeAnalysis}
                      disabled={aiLoading}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold text-sm rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> AI Analyzing Resume...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Run Gemini AI Resume Review
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">AI Analysis Feedback</h4>

                    {aiFeedback ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold">ATS Compatibility Score</div>
                            <div className="text-xs text-gray-800 mt-0.5">{aiFeedback.verdict}</div>
                          </div>
                          <div className="text-4xl font-extrabold text-emerald-600">{aiFeedback.atsScore}/100</div>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-gray-700 mb-1">Top Key Strengths</div>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {aiFeedback.strengths.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-400 space-y-2">
                        <Bot className="w-10 h-10 mx-auto text-gray-300" />
                        <p className="text-xs">Paste your resume and click "Run Gemini AI Resume Review" to receive instant feedback.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Training & Attendance */}
            {placementSubTab === "training" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
                  <div>
                    <span className="text-xs text-emerald-200 uppercase font-bold">Placement Training Attendance</span>
                    <div className="text-3xl font-extrabold mt-1">{portalData?.placements.training.overallAttendance}% Overall</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portalData?.placements.training.modules.map((m) => (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm">{m.title}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {m.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">Instructor: <span className="font-semibold text-gray-700">{m.trainer}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE PHOTO MODAL */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 font-heading">Update Profile Photo</h3>
                <button onClick={() => setIsPhotoModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                  ✕
                </button>
              </div>

              <div className="text-center space-y-2">
                <img
                  src={newPhotoUrl || userPhoto}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-maroon shadow-md"
                />
                <p className="text-xs text-gray-500">Live Avatar Preview</p>
              </div>

              {/* Direct File Upload to Cloudinary */}
              <div className="p-4 bg-gradient-to-br from-cream/60 to-amber-50/40 rounded-2xl border border-amber-200/60 text-center space-y-2">
                <p className="text-xs font-bold text-gray-700">Upload from Device</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-maroon text-white font-semibold text-xs rounded-xl hover:bg-maroon-dark shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Choose File from Computer</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-500">Supports PNG, JPG, WebP up to 5MB</p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-[10px] uppercase font-bold tracking-wider">Or choose preset</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-2">Select Preset Avatar</label>
                <div className="flex items-center justify-center gap-3">
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNewPhotoUrl(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        newPhotoUrl === url ? "border-maroon scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Custom Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-maroon"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="w-1/2 py-2.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateProfilePhoto(newPhotoUrl || userPhoto)}
                  className="w-1/2 py-2.5 bg-maroon text-white font-bold text-xs rounded-xl hover:bg-maroon-dark shadow-md"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT MODAL */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 font-heading">Online Exam Fee Payment</h3>
                <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                  ✕
                </button>
              </div>

              <div className="bg-cream p-4 rounded-xl text-xs space-y-1">
                <div className="text-gray-500">Payable Amount:</div>
                <div className="text-3xl font-extrabold text-maroon">₹ {portalData?.exams.fees.totalAmount || 2000}</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["upi", "card", "netbanking"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-xl border font-bold uppercase transition-all ${
                        paymentMethod === m ? "border-maroon bg-maroon/10 text-maroon" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={paymentProcessing}
                className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Confirm & Pay ₹ {portalData?.exams.fees.totalAmount || 2000}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shared Modals */}
      <ApplicationModal
        open={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          fetchInitialData();
        }}
      />
      <ChatDrawer open={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
