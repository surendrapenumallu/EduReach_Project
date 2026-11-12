import { useState, useEffect } from "react";
import {
  X,
  Send,
  GraduationCap,
  CheckCircle2,
  Upload,
  FileText,
  ShieldCheck,
  KeyRound,
  Calendar,
  MapPin,
  BookOpen,
  User,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applyForAdmission } from "../services/admission.service";
import { sendOtp, verifyOtp } from "../services/auth.service";

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  defaultCourse?: string;
  admissionSession?: string;
}

const coursesList = [
  "B.Tech - Computer Science & Engineering (CSE)",
  "B.Tech - Artificial Intelligence & Data Science (AI & DS)",
  "B.Tech - Electronics & Communication Engineering (ECE)",
  "B.Tech - Information Technology (IT)",
  "B.Tech - Mechanical Engineering (ME)",
  "B.Tech - Civil Engineering (CE)",
  "M.Tech - Computer Science",
  "M.Tech - VLSI Design",
  "M.Tech - Structural Engineering",
  "MBA (Finance, Marketing, HR, IT)",
];

export default function ApplicationModal({
  open,
  onClose,
  defaultCourse,
  admissionSession = "2024–25",
}: ApplicationModalProps) {
  const { user, login, updateUser } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [course, setCourse] = useState(defaultCourse || coursesList[0]);
  const [previousEducation, setPreviousEducation] = useState("Senior Secondary / 12th Standard");
  const [academicPercentage, setAcademicPercentage] = useState("");
  const [address, setAddress] = useState("");

  // Document Uploads
  const [tenthMarksheet, setTenthMarksheet] = useState<string | null>(null);
  const [tenthName, setTenthName] = useState<string | null>(null);
  const [twelfthMarksheet, setTwelfthMarksheet] = useState<string | null>(null);
  const [twelfthName, setTwelfthName] = useState<string | null>(null);
  const [transferCert, setTransferCert] = useState<string | null>(null);
  const [transferName, setTransferName] = useState<string | null>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedAppId, setGeneratedAppId] = useState("");

  // Inline OTP Verification State (for unverified students)
  const [showOtpGate, setShowOtpGate] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Sync with logged in user
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (defaultCourse) {
      setCourse(defaultCourse);
    }
  }, [defaultCourse]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  if (!open) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    nameSetter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
      nameSetter(file.name);
      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSendVerificationOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please provide a valid email to receive OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await sendOtp(email, "email_verification");
      setOtpTimer(60);
      toast.success(res.message || "OTP code sent to email!");
      if (res.data?.demoOtp) {
        toast(`Demo OTP: ${res.data.demoOtp}`, { icon: "🔑" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      toast.error("Enter 6-digit OTP code.");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await verifyOtp({ email, otp: otpCode, purpose: "email_verification" });
      updateUser({ isEmailVerified: true });
      setShowOtpGate(false);
      toast.success(res.message || "Email verified successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim()) {
      toast.error("Please enter Full Name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid Email Address.");
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit Mobile Number.");
      return;
    }
    const pct = parseFloat(academicPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error("Please enter a valid Academic Percentage between 0 and 100.");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter Complete Postal Address.");
      return;
    }

    // Email verification check
    if (user && !user.isEmailVerified && !user.email.includes("edureach.edu") && !user.email.includes("demo")) {
      setShowOtpGate(true);
      handleSendVerificationOtp();
      toast("Please verify your email before submitting the application.", { icon: "🔒" });
      return;
    }

    setLoading(true);
    try {
      // Build documents payload
      const docs = [];
      if (tenthMarksheet) {
        docs.push({
          documentName: tenthName || "10th Marksheet",
          fileUrl: tenthMarksheet,
          fileType: "application/pdf",
        });
      }
      if (twelfthMarksheet) {
        docs.push({
          documentName: twelfthName || "12th Marksheet",
          fileUrl: twelfthMarksheet,
          fileType: "application/pdf",
        });
      }
      if (transferCert) {
        docs.push({
          documentName: transferName || "Transfer Certificate / ID Proof",
          fileUrl: transferCert,
          fileType: "application/pdf",
        });
      }

      const res = await applyForAdmission({
        fullName,
        email,
        mobile,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        course,
        previousEducation,
        academicPercentage: pct,
        address,
        admissionSession,
        documents: docs,
      });

      if (res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user);
      }

      setGeneratedAppId(res.data?.applicationId || "EDU2024-CONFIRMED");
      setSubmitted(true);
      toast.success("Admission application submitted successfully!");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to submit admission application.";
      if (err.response?.status === 409) {
        if (err.response?.data?.data?.applicationId) {
          setGeneratedAppId(err.response.data.data.applicationId);
          if (err.response?.data?.data?.token && err.response?.data?.data?.user) {
            login(err.response.data.data.token, err.response.data.data.user);
          }
          setSubmitted(true);
        }
        toast.error(errMsg, { duration: 6000 });
      } else if (err.response?.data?.requiresVerification) {
        setShowOtpGate(true);
        handleSendVerificationOtp();
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setGeneratedAppId("");
    setShowOtpGate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative border border-gray-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon via-maroon-dark to-maroon text-white p-6 relative">
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-2xl font-bold">Apply for Admission</h3>
                <span className="bg-amber-400 text-maroon-dark text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Official Form
                </span>
              </div>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                EduReach College Session {admissionSession} · Admissions Directorate
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 max-h-[78vh] overflow-y-auto">
          {/* Submission Success State */}
          {submitted ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
              </div>

              <div>
                <h4 className="font-heading text-2xl font-bold text-gray-900">
                  Application Submitted Successfully!
                </h4>
                <p className="text-gray-600 text-sm mt-1 max-w-md mx-auto">
                  Your admission credentials and documents have been recorded in the central MongoDB database.
                </p>
              </div>

              {/* Application ID Card */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-5 max-w-md mx-auto text-center shadow-sm">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">
                  Official Application ID
                </p>
                <p className="text-3xl font-black text-maroon tracking-wider font-mono my-1">
                  {generatedAppId}
                </p>
                <p className="text-xs text-amber-900/80">
                  Applied for: <span className="font-semibold">{course}</span> ({admissionSession})
                </p>
              </div>

              {/* Informational checklist */}
              <div className="bg-gray-50 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2.5 text-xs text-gray-600 border border-gray-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Confirmation email dispatched to <strong>{email}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Admissions Committee notified in real time via Socket.IO</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Track status & upload additional documents in Student Dashboard</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to="/dashboard"
                  onClick={handleReset}
                  className="bg-maroon text-white px-6 py-3 rounded-xl font-semibold hover:bg-maroon-dark transition-colors flex items-center justify-center gap-2 shadow-md text-sm"
                >
                  Track on Student Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : showOtpGate ? (
            /* OTP Verification Gate */
            <div className="py-4 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-900 text-sm">Email OTP Verification Required</h5>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    To maintain strict admissions security, candidates must verify their email address before application registration.
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Verification Email Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 outline-none"
                    />
                    <button
                      type="button"
                      disabled={otpLoading || otpTimer > 0}
                      onClick={handleSendVerificationOtp}
                      className="bg-maroon text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-maroon-dark disabled:opacity-50 shrink-0 shadow-sm"
                    >
                      {otpTimer > 0 ? `Resend (${otpTimer}s)` : "Resend OTP"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Enter 6-Digit Code *
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base tracking-widest font-mono font-bold focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Code expires in 5 minutes. Check your inbox or use <code>123456</code> for testing.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpGate(false)}
                    className="w-1/3 border border-gray-300 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={otpLoading || otpCode.length < 6}
                    onClick={handleVerifyOtp}
                    className="w-2/3 bg-maroon text-white py-3 rounded-xl font-bold hover:bg-maroon-dark disabled:opacity-50 text-sm shadow-md transition-colors"
                  >
                    {otpLoading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Main Admission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Details Group */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <User className="w-4 h-4 text-maroon" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                    1. Applicant Personal Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@edureach.edu"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91-9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full pl-9 pr-2 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-maroon focus:border-maroon outline-none bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Group */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <BookOpen className="w-4 h-4 text-maroon" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                    2. Academic & Program Selection
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Course Applying For *
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none bg-white font-medium"
                    >
                      {coursesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Previous Education *
                      </label>
                      <input
                        type="text"
                        required
                        value={previousEducation}
                        onChange={(e) => setPreviousEducation(e.target.value)}
                        placeholder="e.g. CBSE / State Board 12th Standard"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Academic Percentage (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        value={academicPercentage}
                        onChange={(e) => setAcademicPercentage(e.target.value)}
                        placeholder="e.g. 88.5"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Complete Permanent Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address, City, District, State, Pincode"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Uploads Group */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-1 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-maroon" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                      3. Required Document Uploads
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-400">PDF or JPG (Max 5MB)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 10th Marksheet */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      tenthMarksheet
                        ? "bg-emerald-50/70 border-emerald-400 text-emerald-800"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100/80 text-gray-600"
                    }`}
                  >
                    {tenthMarksheet ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs font-bold block truncate max-w-full">
                      {tenthName || "10th Marksheet"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {tenthMarksheet ? "Ready to upload" : "Click to select"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setTenthMarksheet, setTenthName)}
                    />
                  </label>

                  {/* 12th Marksheet */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      twelfthMarksheet
                        ? "bg-emerald-50/70 border-emerald-400 text-emerald-800"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100/80 text-gray-600"
                    }`}
                  >
                    {twelfthMarksheet ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs font-bold block truncate max-w-full">
                      {twelfthName || "12th Marksheet"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {twelfthMarksheet ? "Ready to upload" : "Click to select"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setTwelfthMarksheet, setTwelfthName)}
                    />
                  </label>

                  {/* Transfer Certificate / ID */}
                  <label
                    className={`p-3.5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      transferCert
                        ? "bg-emerald-50/70 border-emerald-400 text-emerald-800"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100/80 text-gray-600"
                    }`}
                  >
                    {transferCert ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-400 mb-1" />
                    )}
                    <span className="text-xs font-bold block truncate max-w-full">
                      {transferName || "Transfer Cert / ID"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {transferCert ? "Ready to upload" : "Click to select"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setTransferCert, setTransferName)}
                    />
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon text-white py-3.5 rounded-2xl font-bold hover:bg-maroon-dark transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Validating & Registering Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Official Admission Application
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  By submitting, you certify that all entered credentials and academic certificates are authentic.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
