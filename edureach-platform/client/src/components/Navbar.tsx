import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  GraduationCap,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Home,
  BookOpen,
  User,
  LogIn,
  Briefcase,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { navLinks } from "../data/content";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const isFaculty = user?.role === "faculty";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-maroon" />
          <span className="font-heading text-xl font-bold text-maroon">EduReach</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-maroon transition-colors">
            Home
          </Link>
          {!isFaculty && (
            <Link
              to="/predictor"
              className="text-sm font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI Cutoff Predictor
            </Link>
          )}
          <Link
            to="/results"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" /> Exam Results
          </Link>
          {user?.role === "admin" ? (
            <Link
              to="/admin"
              className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" /> Admin Portal
            </Link>
          ) : isFaculty ? (
            <Link
              to="/faculty"
              className="text-sm font-semibold text-maroon flex items-center gap-1.5 bg-maroon/10 px-3 py-1 rounded-full hover:bg-maroon/20 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-maroon" /> Faculty Portal
            </Link>
          ) : (
            <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-maroon transition-colors">
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Side: Account Actions & Hamburger Menu Button */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                to={user.role === "admin" ? "/admin" : isFaculty ? "/faculty" : "/dashboard"}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  user.role === "admin"
                    ? "bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100"
                    : isFaculty
                    ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                    : "bg-cream text-gray-700 border-maroon/20 hover:bg-maroon/5"
                }`}
                title={user.role === "admin" ? "Administrator Portal" : isFaculty ? "Faculty Member Portal" : "Student Dashboard"}
              >
                {user.role === "admin" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                ) : isFaculty ? (
                  <Briefcase className="w-3.5 h-3.5 text-maroon" />
                ) : (
                  <User className="w-3.5 h-3.5 text-maroon" />
                )}
                <span className="max-w-[110px] truncate">
                  {user.role === "admin"
                    ? `Admin: ${user.name.split(" ")[0]}`
                    : isFaculty
                    ? `Faculty: ${user.name.split(" ")[0]}`
                    : `Hi, ${user.name.split(" ")[0]}`}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl border border-red-200 transition-colors"
                title="Logout Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-maroon border border-maroon/30 hover:bg-maroon/5 px-3 py-1.5 rounded-xl transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-maroon hover:bg-maroon-dark px-3 py-1.5 sm:px-3.5 rounded-xl shadow-sm transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-700 hover:text-maroon hover:bg-cream/60 rounded-xl transition-all border border-gray-200"
            title="Toggle Navigation Menu"
          >
            {menuOpen ? <X className="w-6 h-6 text-maroon" /> : <Menu className="w-6 h-6 text-maroon" />}
          </button>
        </div>
      </div>

      {/* Expanded Dropdown Menu */}
      {menuOpen && (
        <div className="bg-white border-b border-gray-200 shadow-2xl px-6 py-6 animate-fadeIn">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Navigation */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Main Pages</div>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-maroon font-medium text-sm p-2 rounded-lg hover:bg-cream/50 transition-colors"
              >
                <Home className="w-4 h-4 text-maroon" /> Home Page
              </Link>
              <Link
                to="/results"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-emerald-800 font-semibold text-sm p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Award className="w-4 h-4 text-emerald-600" /> Student Examination Results
              </Link>
              {!isFaculty && (
                <Link
                  to="/predictor"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-amber-800 font-semibold text-sm p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" /> AI Cutoff Predictor
                </Link>
              )}
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-maroon font-semibold text-sm p-2 rounded-lg bg-maroon/5 hover:bg-maroon/10 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-maroon" /> Student Dashboard
              </Link>
              <Link
                to="/faculty"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-amber-900 font-semibold text-sm p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-amber-700" /> Faculty Member Portal
              </Link>
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-slate-800 font-semibold text-sm p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-maroon" /> Admin Portal
              </Link>
            </div>

            {/* Section Anchors */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Explore Sections</div>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-maroon text-sm p-1.5 rounded-lg hover:bg-cream/40 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" /> {link.label}
                </a>
              ))}
            </div>

            {/* Account & Action */}
            <div className="space-y-3 pt-2 md:pt-0 md:border-l md:border-gray-100 md:pl-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Status</div>
              {user ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-[11px] font-bold text-maroon capitalize mt-1">
                      Role: {user.role || "student"}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 py-2.5 rounded-xl font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 text-sm border border-maroon text-maroon hover:bg-maroon/5 py-2 rounded-xl font-semibold transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Student & Faculty Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-maroon text-white hover:bg-maroon-dark py-2.5 rounded-xl font-semibold shadow-md transition-colors"
                  >
                    <User className="w-4 h-4" /> Register Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
