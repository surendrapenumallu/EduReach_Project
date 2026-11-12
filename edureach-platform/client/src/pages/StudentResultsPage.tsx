import { useState, useEffect } from "react";
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Printer,
  TrendingUp,
  User,
  Building,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getMyResults, type StudentResult } from "../services/result.service";

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyResults()
      .then((resData) => {
        setResults(resData);
        if (resData.length > 0) {
          setSelectedResult(resData[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to load results:", err);
        toast.error("Could not fetch exam results.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = () => {
    toast.success("Streaming Official Authenticated Grade Card PDF...");
    const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:5050";
    window.open(`${apiUrl}/api/results/${result?._id || "latest"}/pdf`, "_blank");
  };

  const handlePrint = () => {
    toast.success("Printing Grade Card...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-maroon animate-bounce mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading Student Semester Results...</p>
        </div>
      </div>
    );
  }

  const result = selectedResult || results[0];

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation & Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-maroon/10 text-maroon text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Student Examination Portal
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Official Result Published
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
              Semester Examination Marks & Grade Card
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              EduReach Autonomous Examination Board — Academic Year {result?.academicYear || "2025-2026"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm font-semibold bg-maroon text-white px-4 py-2.5 rounded-xl hover:bg-maroon-dark shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" /> Download Official PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-sm font-semibold bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Print Card
            </button>
          </div>
        </div>

        {/* Student Information Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Student Name</div>
              <div className="text-sm font-bold text-gray-800">{user?.name || result?.studentName || "Alex Rivera"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Roll Number</div>
              <div className="text-sm font-bold text-gray-800">{result?.rollNo || "22CSE0104"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Department</div>
              <div className="text-sm font-bold text-gray-800 truncate max-w-[180px]">
                {result?.department || "Computer Science"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase">Semester</div>
              <div className="text-sm font-bold text-gray-800">{result?.semester || "Semester 4"}</div>
            </div>
          </div>
        </div>

        {/* Academic Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SGPA Card */}
          <div className="bg-gradient-to-br from-maroon to-maroon-dark text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-10">
              <Award className="w-24 h-24" />
            </div>
            <div className="text-xs font-semibold uppercase text-white/70">Semester GPA (SGPA)</div>
            <div className="text-4xl font-extrabold mt-2 tracking-tight">{result?.sgpa || "9.12"}</div>
            <div className="text-xs text-white/80 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" /> Outstanding Academic Score
            </div>
          </div>

          {/* Cumulative CGPA Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold uppercase text-gray-400">Cumulative GPA (CGPA)</div>
            <div className="text-4xl font-extrabold text-gray-900 mt-2">{result?.cgpa || "8.95"}</div>
            <div className="text-xs text-emerald-600 mt-2 font-semibold">Top 5% of Department</div>
          </div>

          {/* Total Percentage Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold uppercase text-gray-400">Aggregate Marks</div>
            <div className="text-4xl font-extrabold text-gray-900 mt-2">
              {result?.totalMarks}/{result?.maxTotalMarks}
            </div>
            <div className="text-xs text-maroon font-semibold mt-2">{result?.percentage}% Overall Aggregate</div>
          </div>

          {/* Pass Status Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold uppercase text-gray-400">Result Status</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8" /> {result?.status || "Passed"}
            </div>
            <div className="text-xs text-gray-500 mt-2">First Class with Distinction</div>
          </div>
        </div>

        {/* Detailed Subject Marks Breakdown Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">Subject Performance & Credit Breakdown</h2>
              <p className="text-xs text-gray-500">Internal Continuous Evaluation (30) + External Term End (70)</p>
            </div>
            <div className="flex items-center gap-2">
              {results.map((resItem, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedResult(resItem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedResult?._id === resItem._id
                      ? "bg-maroon text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {resItem.semester}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-6">Subject Code</th>
                  <th className="py-3.5 px-6">Subject Title</th>
                  <th className="py-3.5 px-6 text-center">Credits</th>
                  <th className="py-3.5 px-6 text-center">Internal (30)</th>
                  <th className="py-3.5 px-6 text-center">External (70)</th>
                  <th className="py-3.5 px-6 text-center">Total (100)</th>
                  <th className="py-3.5 px-6 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {result?.subjects?.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-cream/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-maroon">{sub.code}</td>
                    <td className="py-4 px-6 font-semibold text-gray-800">{sub.name}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-600">{sub.credits}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{sub.internalMarks}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{sub.externalMarks}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-900">{sub.totalMarks}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                          sub.grade === "O" || sub.grade === "A+"
                            ? "bg-emerald-100 text-emerald-800"
                            : sub.grade === "A"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>Verified & Published by: <span className="font-semibold text-gray-700">{result?.publishedBy}</span></div>
            <div>Grade Key: O (Outstanding 90+), A+ (Excellent 80-89), A (Very Good 70-79), B+ (Good 60-69)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
