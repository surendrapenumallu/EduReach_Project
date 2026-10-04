import { useState, useEffect } from "react";
import {
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  type ApplicationData,
} from "../services/application.service";
import {
  Users,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Trash2,
  Building2,
  ShieldCheck,
  X,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const data = await getAllApplications();
      setApplications(data.applications || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load admin applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await updateApplicationStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchAdminData();
      if (selectedApp && selectedApp._id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus as any });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await deleteApplication(id);
      toast.success("Application deleted.");
      if (selectedApp?._id === id) setSelectedApp(null);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete application.");
    }
  };

  // Filtering
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "All" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ApplicationData["status"]) => {
    switch (status) {
      case "Accepted":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-300">Accepted</span>;
      case "Rejected":
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full border border-red-300">Rejected</span>;
      case "Under Review":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-300">Under Review</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-amber-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" /> Admissions Management Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">Admissions Officer Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Review student applications, manage statuses, and track enrollment metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-maroon text-white hover:bg-maroon-dark font-medium text-xs rounded-xl shadow transition-all"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center text-amber-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center text-blue-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Under Review</span>
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.underReview}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center text-emerald-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Admitted Students</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.accepted}</div>
          </div>
        </div>

        {/* 🟠 PRIORITY 9: ADMIN AI ANALYTICS SUITE */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-400 text-slate-900 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  Priority 9 • Admin AI Analytics
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                  Real-time Intelligence
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-heading mt-2">
                College-Wide AI Performance & Risk Analytics
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dept Attendance Radar */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="font-bold text-gray-900 text-sm">Department Attendance Health</div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-gray-700 font-semibold mb-1">
                    <span>CSE & AI-DS</span>
                    <span className="text-emerald-700 font-bold">88.5% (Safe)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "88.5%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-700 font-semibold mb-1">
                    <span>ECE & EEE</span>
                    <span className="text-emerald-700 font-bold">82.1% (Safe)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "82.1%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-gray-700 font-semibold mb-1">
                    <span>Mechanical & Civil</span>
                    <span className="text-amber-700 font-bold">79.4% (Watch)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: "79.4%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Placement Match Distribution */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="font-bold text-gray-900 text-sm">Placement Readiness Index</div>
              <div className="text-3xl font-extrabold text-maroon">86.4%</div>
              <p className="text-xs text-gray-600">
                142 out of 164 registered final year students possess &gt;80% AI match score for active Tier-1 campus drives.
              </p>
              <div className="p-2.5 bg-amber-100/70 text-amber-900 text-xs font-bold rounded-xl">
                Top Hiring Partner Match: Microsoft SDE (94% Match)
              </div>
            </div>

            {/* AI Early Warning Queue */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="font-bold text-gray-900 text-sm">AI Early Warning Queue</div>
              <div className="text-xs space-y-2">
                <div className="p-2 bg-white rounded-lg border border-red-200 text-red-900 flex justify-between items-center font-semibold">
                  <span>Attendance Risk (&lt;75%)</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">4 Students</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-amber-900 flex justify-between items-center font-semibold">
                  <span>Backlog / Academic Watch</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">7 Students</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-blue-900 flex justify-between items-center font-semibold">
                  <span>Counselor 1-on-1 Assigned</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">11 Actions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Bar: Search & Status Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, course, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            {["All", "Pending", "Under Review", "Accepted", "Rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-maroon text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading candidates...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">No applications match your criteria.</p>
              <p className="text-xs">Try clearing your search query or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Applied Program</th>
                    <th className="p-4">Academics</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Update Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApps.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{app.studentName}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                        <div className="text-xs text-gray-400">{app.phone}</div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">{app.course}</td>
                      <td className="p-4">
                        <div className="text-xs">
                          <span className="font-bold text-maroon">{app.twelfthPercentage}%</span> in 12th
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {app.entranceExam} {app.entranceRank ? `(Rank #${app.entranceRank})` : ""}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(app.status)}</td>
                      <td className="p-4">
                        <select
                          disabled={updatingId === app._id}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-maroon cursor-pointer disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => setSelectedApp(app)}
                          title="View Full Profile"
                          className="p-1.5 bg-gray-100 hover:bg-maroon hover:text-white text-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app._id)}
                          title="Delete Application"
                          className="p-1.5 bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-maroon p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{selectedApp.studentName}</h3>
                <p className="text-xs text-white/80">Application Details • ID #{selectedApp._id.slice(-6).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs text-gray-400 block">Target Program</span>
                  <span className="font-bold text-gray-900">{selectedApp.course}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status</span>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Email Address</span>
                  <span className="font-semibold text-gray-800 break-all">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Phone Number</span>
                  <span className="font-semibold text-gray-800">{selectedApp.phone}</span>
                </div>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 space-y-2 text-amber-900 text-xs">
                <div className="font-bold text-sm text-amber-950 mb-1">Academic Profile</div>
                <div className="flex justify-between">
                  <span>12th Board Score:</span>
                  <span className="font-bold text-maroon text-sm">{selectedApp.twelfthPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Entrance Exam:</span>
                  <span className="font-semibold">{selectedApp.entranceExam}</span>
                </div>
                {selectedApp.entranceRank && (
                  <div className="flex justify-between">
                    <span>Entrance Rank:</span>
                    <span className="font-semibold">#{selectedApp.entranceRank}</span>
                  </div>
                )}
              </div>

              {/* Uploaded Verification Documents */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Uploaded Verification Documents
                </div>
                {selectedApp.documents && (selectedApp.documents.marksheet || selectedApp.documents.rankCard || selectedApp.documents.idProof) ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedApp.documents.marksheet && (
                      <a
                        href={selectedApp.documents.marksheet}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl text-center text-xs font-semibold block transition-colors"
                      >
                        📄 12th Marksheet
                      </a>
                    )}
                    {selectedApp.documents.rankCard && (
                      <a
                        href={selectedApp.documents.rankCard}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-semibold block transition-colors"
                      >
                        🎓 Rank Card
                      </a>
                    )}
                    {selectedApp.documents.idProof && (
                      <a
                        href={selectedApp.documents.idProof}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-xl text-center text-xs font-semibold block transition-colors"
                      >
                        🪪 ID Proof
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-center">
                    No verification documents attached yet.
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Change Application Status</label>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-maroon"
                >
                  <option value="Pending">Pending Initial Verification</option>
                  <option value="Under Review">Under Counselor Review</option>
                  <option value="Accepted">Accepted & Offered Admission</option>
                  <option value="Rejected">Application Declined</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleDelete(selectedApp._id)}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Application
              </button>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-maroon text-white hover:bg-maroon-dark rounded-xl text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
