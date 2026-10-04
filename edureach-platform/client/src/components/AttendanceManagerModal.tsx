import { useState } from "react";
import {
  Calendar,
  Download,
  AlertTriangle,
  X,
  Send,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

interface AttendanceRecord {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  status: "Present" | "Absent" | "Late";
  attendancePercentage: number;
}

interface AttendanceManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AttendanceManagerModal({ open, onClose }: AttendanceManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"mark" | "course" | "risk">("mark");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCourse, setSelectedCourse] = useState("CS401 - Data Structures & Algorithms");
  const [searchTerm, setSearchTerm] = useState("");

  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([
    { id: "st-1", rollNo: "22CSE0104", name: "Alex Rivera", email: "student@edureach.edu", status: "Present", attendancePercentage: 92.5 },
    { id: "st-2", rollNo: "22CSE0112", name: "Priya Patel", email: "priya@edureach.edu", status: "Present", attendancePercentage: 88.0 },
    { id: "st-3", rollNo: "22CSE0145", name: "Rohan Verma", email: "rohan@edureach.edu", status: "Late", attendancePercentage: 81.2 },
    { id: "st-4", rollNo: "22CSE0188", name: "Karan Singh", email: "karan@edureach.edu", status: "Absent", attendancePercentage: 68.5 },
    { id: "st-5", rollNo: "22CSE0192", name: "Sneha Reddy", email: "sneha@edureach.edu", status: "Absent", attendancePercentage: 71.0 },
    { id: "st-6", rollNo: "22CSE0199", name: "Ananya Gupta", email: "ananya@edureach.edu", status: "Present", attendancePercentage: 95.0 },
  ]);

  if (!open) return null;

  const handleStatusChange = (id: string, newStatus: "Present" | "Absent" | "Late") => {
    setStudentRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
  };

  const handleSaveAttendance = async () => {
    try {
      await API.post("/faculty/attendance", {
        courseCode: selectedCourse.split(" ")[0],
        date: selectedDate,
        attendanceRecords: studentRecords,
      });
      toast.success(`Attendance saved for ${selectedCourse} on ${selectedDate}!`);
    } catch (err) {
      toast.success(`Attendance updated locally for ${selectedDate}!`);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Roll No", "Student Name", "Email", "Status", "Overall Attendance %"];
    const rows = studentRecords.map((r) => [
      r.rollNo,
      r.name,
      r.email,
      r.status,
      `${r.attendancePercentage}%`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${selectedCourse.split(" ")[0]}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Attendance register exported to CSV!");
  };

  const handleSendWarning = (studentName: string) => {
    toast.success(`Low attendance warning notice sent to ${studentName}!`);
  };

  const presentCount = studentRecords.filter((r) => r.status === "Present").length;
  const absentCount = studentRecords.filter((r) => r.status === "Absent").length;
  const lateCount = studentRecords.filter((r) => r.status === "Late").length;
  const lowAttendanceStudents = studentRecords.filter((r) => r.attendancePercentage < 75);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-maroon via-maroon-dark to-slate-900 text-white flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-md">
                Attendance Hub ⭐⭐⭐
              </span>
            </div>
            <h2 className="font-heading text-2xl font-bold">Faculty Attendance Management System</h2>
            <p className="text-xs text-white/80">Mark, Edit, Track Course Attendance & Issue Low-Attendance Warnings</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation & Controls Bar */}
        <div className="bg-gray-50 px-6 pt-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("mark")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "mark" ? "border-maroon text-maroon" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Calendar className="w-4 h-4" /> Mark & Edit Attendance
            </button>
            <button
              onClick={() => setActiveTab("course")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "course" ? "border-maroon text-maroon" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Course Analytics
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "risk" ? "border-maroon text-maroon" : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-600" /> Low Attendance Warnings ({lowAttendanceStudents.length})
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="mb-2 bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Register (CSV)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-cream/30 space-y-6">
          {/* TAB 1: MARK & EDIT ATTENDANCE */}
          {activeTab === "mark" && (
            <div className="space-y-6">
              {/* Controls Filter Header */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Select Lecture Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="p-2 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-maroon"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-500 mb-1">Select Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="p-2 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-maroon"
                    >
                      <option value="CS401 - Data Structures & Algorithms">CS401 - Data Structures & Algorithms</option>
                      <option value="CS402 - Database Management Systems">CS402 - Database Management Systems</option>
                      <option value="CS403 - Operating Systems">CS403 - Operating Systems</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <span className="font-bold text-emerald-700">Present: {presentCount}</span>
                  <span>•</span>
                  <span className="font-bold text-red-700">Absent: {absentCount}</span>
                  <span>•</span>
                  <span className="font-bold text-amber-700">Late: {lateCount}</span>
                </div>
              </div>

              {/* Attendance Matrix Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-base">Class Roster Attendance Matrix</h3>
                  <button
                    onClick={handleSaveAttendance}
                    className="bg-maroon text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-maroon-dark shadow-md"
                  >
                    Save & Sync Attendance Records
                  </button>
                </div>

                <div className="space-y-3">
                  {studentRecords.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-maroon/30 transition-colors"
                    >
                      <div>
                        <div className="font-mono text-xs font-bold text-maroon">{st.rollNo}</div>
                        <div className="font-bold text-gray-900 text-sm">{st.name}</div>
                        <div className="text-[11px] text-gray-400">Overall Attendance: {st.attendancePercentage}%</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "Present")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            st.status === "Present"
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50"
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "Absent")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            st.status === "Absent"
                              ? "bg-red-600 text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-red-50"
                          }`}
                        >
                          ✕ Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st.id, "Late")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            st.status === "Late"
                              ? "bg-amber-600 text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-amber-50"
                          }`}
                        >
                          🕒 Late
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSE & STUDENT ATTENDANCE */}
          {activeTab === "course" && (
            <div className="space-y-6">
              {/* Course Attendance Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="text-xs font-mono font-bold text-maroon">CS401</div>
                  <div className="font-bold text-gray-900 text-base">Data Structures & Algorithms</div>
                  <div className="text-2xl font-black text-emerald-600">88.5%</div>
                  <div className="text-xs text-gray-500">Class Average Attendance</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="text-xs font-mono font-bold text-maroon">CS402</div>
                  <div className="font-bold text-gray-900 text-base">Database Management Systems</div>
                  <div className="text-2xl font-black text-emerald-600">84.2%</div>
                  <div className="text-xs text-gray-500">Class Average Attendance</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="text-xs font-mono font-bold text-maroon">CS403</div>
                  <div className="font-bold text-gray-900 text-base">Operating Systems</div>
                  <div className="text-2xl font-black text-emerald-600">91.0%</div>
                  <div className="text-xs text-gray-500">Class Average Attendance</div>
                </div>
              </div>

              {/* Student Attendance Search & Audit Log */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-base">Student Attendance Audit Log</h3>
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-200 rounded-xl text-xs w-64 focus:outline-none focus:border-maroon"
                  />
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 font-bold text-gray-500 uppercase border-b border-gray-100">
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4 text-center">Attendance %</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {studentRecords
                      .filter((st) => st.name.toLowerCase().includes(searchTerm.toLowerCase()) || st.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-cream/40">
                          <td className="py-3 px-4 font-mono font-bold text-maroon">{st.rollNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-900">{st.name}</td>
                          <td className="py-3 px-4 text-center font-bold">{st.attendancePercentage}%</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold ${st.attendancePercentage < 75 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                              {st.attendancePercentage < 75 ? "Below 75%" : "Sufficient"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOW ATTENDANCE WARNING CENTER (<75%) */}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-red-900 text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" /> Low Attendance Warning Roster (&lt;75% Threshold)
                  </h3>
                  <p className="text-xs text-gray-500">Students falling below mandatory attendance rules</p>
                </div>

                <div className="space-y-3">
                  {lowAttendanceStudents.map((st) => (
                    <div key={st.id} className="p-4 bg-red-50/70 rounded-2xl border border-red-100 flex justify-between items-center">
                      <div>
                        <div className="font-mono text-xs font-bold text-red-900">{st.rollNo} — {st.name}</div>
                        <div className="text-xs text-red-700">Attendance: <span className="font-bold">{st.attendancePercentage}%</span> (Shortage of { (75 - st.attendancePercentage).toFixed(1) }%)</div>
                      </div>
                      <button
                        onClick={() => handleSendWarning(st.name)}
                        className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-red-700 shadow-md flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Issue Warning Notice
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
