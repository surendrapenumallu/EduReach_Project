import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowLeft,
  User,
  Briefcase,
  Sparkles,
  ShieldCheck,
  KeyRound,
  X,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import { loginUser, forgotPassword, verifyOtp } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import { images } from "../data/content";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"student" | "faculty">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // 2FA Challenge state on Login
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load Remember Me credentials on mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem("remember_user");
    if (savedIdentifier) {
      setEmail(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const handleTabChange = (tab: "student" | "faculty") => {
    setActiveTab(tab);
    if (!rememberMe) {
      setEmail("");
      setPassword("");
    }
  };

  const handleDemoLogin = async (role: "student" | "faculty") => {
    const demoEmail = role === "faculty" ? "faculty@edureach.edu" : "student@edureach.edu";
    const demoPassword = "password123";
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const data = await loginUser({ email: demoEmail, password: demoPassword, role });

      if (rememberMe) {
        localStorage.setItem("remember_user", demoEmail);
      } else {
        localStorage.removeItem("remember_user");
      }

      login(data.token, data.user);
      toast.success(`Welcome ${role === "faculty" ? "Prof. Sharma (Faculty Portal)" : "Alex (Student Portal)"}!`);
      if (role === "faculty") {
        navigate("/faculty");
      } else {
        navigate("/results");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email, password, role: activeTab });

      // Check if 2FA is enabled for this user
      if (data.user?.is2FAEnabled) {
        setPendingUser(data);
        setShow2FAModal(true);
        setLoading(false);
        return;
      }

      completeLoginSession(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const completeLoginSession = (data: any) => {
    if (rememberMe) {
      localStorage.setItem("remember_user", email);
    } else {
      localStorage.removeItem("remember_user");
    }

    login(data.token, data.user);
    toast.success("Welcome back!");

    const role = data.user?.role || activeTab;
    if (role === "faculty") {
      navigate("/faculty");
    } else if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/results");
    }
  };

  const handle2FAVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode !== "123456" && twoFACode.length < 6) {
      toast.error("Invalid 2FA Authenticator Code. Demo code is 123456.");
      return;
    }
    toast.success("2FA Authentication Verified!");
    setShow2FAModal(false);
    if (pendingUser) {
      completeLoginSession(pendingUser);
    }
  };

  // Forgot Password Handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast.success("Verification OTP code sent to your email! (Demo OTP: 123456)");
      setForgotStep(2);
    } catch (err) {
      toast.error("Could not send OTP code.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      toast.error("Please enter OTP and new password.");
      return;
    }
    setForgotLoading(true);
    try {
      await verifyOtp({ email: forgotEmail, otp: otpCode, newPassword });
      toast.success("Password reset successfully! You can now sign in.");
      setShowForgotModal(false);
      setPassword(newPassword);
      setForgotStep(1);
      setForgotEmail("");
      setOtpCode("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP verification code.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Banner */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={images.students} alt="EduReach Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-maroon/70 to-maroon/40 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-10 h-10 text-amber-300" />
            <span className="font-heading text-2xl font-bold tracking-wide">EduReach</span>
          </div>

          <div className="max-w-md">
            <span className="inline-block bg-white/20 backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full mb-4 text-amber-200">
              Faculty & Student Intelligence Portal
            </span>
            <h2 className="font-heading text-4xl font-bold mb-4 leading-tight">
              Secure Role-Based Portal Access
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Login using Faculty ID or Email to manage semester grade cards, upload academic marks, view student rosters, and access profile security settings.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300" /> JWT Encrypted Session
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-300" /> 2FA Verification Support
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-cream">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-maroon transition-colors duration-200 mb-6 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-1">EduReach Portal Login</h1>
          <p className="text-gray-500 text-sm mb-6">Select your account type to proceed</p>

          {/* Student vs Faculty Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("student")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "student"
                  ? "bg-maroon text-white shadow-md"
                  : "text-gray-600 hover:text-maroon hover:bg-white/60"
              }`}
            >
              <User className="w-4 h-4" /> Student Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("faculty")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "faculty"
                  ? "bg-maroon text-white shadow-md"
                  : "text-gray-600 hover:text-maroon hover:bg-white/60"
              }`}
            >
              <Briefcase className="w-4 h-4" /> Faculty Login
            </button>
          </div>

          {/* Quick Demo Credentials Banner */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="text-xs text-amber-900">
              <span className="font-bold">Fast Preview Mode:</span>
              <br />
              Log in instantly with sample data
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin(activeTab)}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> Quick Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                {activeTab === "faculty" ? "Faculty ID / Official Email" : "Student Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === "faculty" ? "FAC-1002 or faculty@edureach.edu" : "student@edureach.edu"}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-maroon hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-colors"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-maroon focus:ring-maroon accent-maroon"
                />
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-3.5 rounded-xl font-semibold hover:bg-maroon-dark disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  {activeTab === "faculty" ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  Sign In as {activeTab === "faculty" ? "Faculty Member" : "Student"}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-maroon font-bold hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal (OTP Verification Flow) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-maroon" />
                <h3 className="font-heading text-lg font-bold text-gray-900">Reset Password</h3>
              </div>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-gray-500">
                  Enter your registered faculty or student email address. We will send a 6-digit verification code.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@edureach.edu"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-maroon text-white py-2.5 rounded-xl font-semibold hover:bg-maroon-dark text-sm"
                >
                  {forgotLoading ? "Sending Code..." : "Send Verification OTP"}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <span className="font-bold">OTP Sent!</span> Demo Verification OTP is: <span className="font-mono font-bold">123456</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono text-center font-bold tracking-widest focus:outline-none focus:border-maroon"
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
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-maroon text-white py-2.5 rounded-xl font-semibold hover:bg-maroon-dark text-sm"
                >
                  {forgotLoading ? "Resetting Password..." : "Verify OTP & Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Challenge Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-gray-900">Two-Factor Security Verification</h3>
            <p className="text-xs text-gray-500">
              This faculty account has 2FA enabled. Enter the 6-digit code from your authenticator app (Demo Code: <span className="font-bold text-maroon font-mono">123456</span>).
            </p>

            <form onSubmit={handle2FAVerify} className="space-y-4 pt-2">
              <input
                type="text"
                maxLength={6}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="123456"
                className="w-full p-3 border border-gray-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-maroon"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="w-1/2 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-maroon text-white rounded-xl font-semibold text-sm hover:bg-maroon-dark shadow-md"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
