import { useState, useEffect } from "react";
import {
  FileText,
  XCircle,
  Upload,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyAdmissionApplication,
  uploadAdditionalDocuments,
  type AdmissionApplicationData,
  type StatusHistoryItem,
} from "../services/admission.service";
import { getSocket } from "../services/socket.service";

interface AdmissionStatusTrackerProps {
  onOpenApplyModal?: () => void;
}

const statusSteps = [
  { key: "Submitted", label: "Submitted" },
  { key: "Under Review", label: "Under Review" },
  { key: "Documents Required", label: "Docs Check" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Approved", label: "Approved" },
];

export default function AdmissionStatusTracker({ onOpenApplyModal }: AdmissionStatusTrackerProps) {
  const [application, setApplication] = useState<AdmissionApplicationData | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Additional Document Upload State
  const [supplementaryDoc, setSupplementaryDoc] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const data = await getMyAdmissionApplication();
      setApplication(data.application);
      setHistory(data.history || []);
    } catch (err) {
      console.warn("Failed to fetch student admission:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationData();

    const socket = getSocket();
    const handleStatusChanged = (update: any) => {
      toast.success(`Application Status Updated: ${update.status}`);
      fetchApplicationData();
    };

    socket.on("admission:status_changed", handleStatusChanged);
    return () => {
      socket.off("admission:status_changed", handleStatusChanged);
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSupplementaryDoc(reader.result as string);
      if (!docName) setDocName(file.name);
      toast.success("Document attached ready to submit.");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSupplementary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application || !supplementaryDoc) {
      toast.error("Please select a document file to upload.");
      return;
    }

    setUploadingDoc(true);
    try {
      await uploadAdditionalDocuments(application.applicationId, [
        {
          documentName: docName || "Requested Additional Certificate",
          fileUrl: supplementaryDoc,
          fileType: "application/pdf",
        },
      ]);

      toast.success("Supplementary document submitted! Status updated to Under Review.");
      setSupplementaryDoc(null);
      setDocName("");
      fetchApplicationData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Shortlisted":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Documents Required":
        return "bg-amber-100 text-amber-900 border-amber-300 animate-pulse";
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="w-8 h-8 border-3 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading admission application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-gradient-to-br from-cream to-amber-50/50 rounded-3xl p-8 border border-amber-200/60 shadow-sm text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-200/40">
          <FileText className="w-8 h-8 text-maroon" />
        </div>
        <h3 className="font-heading text-xl font-bold text-gray-900">
          No Admission Application Submitted Yet
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto mt-1 mb-6">
          Admissions are open for EduReach College Session 2024–25. Submit your credentials to secure your seat.
        </p>
        <button
          onClick={onOpenApplyModal}
          className="bg-maroon text-white px-7 py-3 rounded-2xl font-semibold hover:bg-maroon-dark transition-all shadow-md text-sm inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Apply for Admission (Session 2024–25)
        </button>
      </div>
    );
  }

  const isRejected = application.status === "Rejected";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tracker Header */}
      <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Application Tracker
            </span>
            <span className="text-white/40">·</span>
            <span className="text-xs text-white/70">Session {application.admissionSession}</span>
          </div>
          <h3 className="font-heading text-2xl font-bold tracking-wide mt-0.5">
            {application.applicationId}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Applied Course: <strong className="text-amber-200">{application.course}</strong>
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(
              application.status
            )}`}
          >
            {application.status}
          </span>
          <span className="text-[11px] text-white/60">
            Submitted: {new Date(application.submittedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Admission Lifecycle
        </p>

        {isRejected ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Application Status: Rejected</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {application.adminRemarks || "The admissions committee was unable to approve this application for the current academic session."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {statusSteps.map((step, idx) => {
              const currentIdx = statusSteps.findIndex((s) => s.key === application.status);
              const isCompleted = idx <= (currentIdx >= 0 ? currentIdx : 0);
              const isCurrent = step.key === application.status;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? "bg-maroon text-white border-maroon shadow-md"
                      : isCompleted
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                    Step 0{idx + 1}
                  </div>
                  <div className="text-xs font-bold truncate">{step.label}</div>
                  <div className="text-[10px] mt-1 font-semibold">
                    {isCurrent ? "In Progress" : isCompleted ? "Completed" : "Pending"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Required: Additional Documents Requested */}
      {application.status === "Documents Required" && (
        <div className="p-6 bg-amber-50 border-b border-amber-200/80 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Action Required: Supplementary Document Submission</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                The admissions committee has requested supplementary verification documents.
                {application.adminRemarks && (
                  <span className="block font-semibold mt-1">
                    Admissions Remark: "{application.adminRemarks}"
                  </span>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleUploadSupplementary} className="space-y-3 bg-white p-4 rounded-2xl border border-amber-200 shadow-sm max-w-lg">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Document Description / Certificate Name *
              </label>
              <input
                type="text"
                required
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Corrected 12th Marksheet / Migration Certificate"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-maroon outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Select File (PDF / Image) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-maroon file:text-white hover:file:bg-maroon-dark cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadingDoc || !supplementaryDoc}
              className="bg-maroon text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-maroon-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadingDoc ? "Uploading Document..." : "Submit Requested Document"}
            </button>
          </form>
        </div>
      )}

      {/* Main Details & History Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Application Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Applicant & Academic Credentials
          </h4>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-xs border border-gray-100">
            <div className="flex justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Applicant Name</span>
              <strong className="text-gray-800">{application.applicationDetails.fullName}</strong>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Contact Email</span>
              <span className="text-gray-800 font-mono">{application.applicationDetails.email}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Mobile Phone</span>
              <span className="text-gray-800 font-mono">{application.applicationDetails.mobile}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Previous Education</span>
              <span className="text-gray-800 font-medium">{application.applicationDetails.previousEducation}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200/60">
              <span className="text-gray-500">Academic Percentage</span>
              <strong className="text-emerald-700 font-bold">{application.applicationDetails.academicPercentage}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Permanent Address</span>
              <span className="text-gray-800 max-w-[200px] text-right truncate">{application.applicationDetails.address}</span>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div>
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Uploaded Certificates ({application.documents.length})
            </h5>
            <div className="space-y-1.5">
              {application.documents.map((doc, i) => (
                <div
                  key={doc._id || i}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-maroon shrink-0" />
                    <span className="font-semibold text-gray-800 truncate">{doc.documentName}</span>
                  </div>
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-maroon font-bold text-[11px] hover:underline flex items-center gap-0.5 shrink-0"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Status Timeline & Remarks */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Official Status Timeline
          </h4>

          {/* Admin Remarks callout */}
          {application.adminRemarks && (
            <div className="p-4 bg-maroon/5 border-l-4 border-maroon rounded-r-2xl">
              <p className="text-[11px] font-bold uppercase text-maroon tracking-wider">
                Admissions Committee Remarks
              </p>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                {application.adminRemarks}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3 relative pl-4 border-l-2 border-gray-200">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400">Initial submission recorded.</p>
            ) : (
              history.map((item, i) => (
                <div key={item._id || i} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-maroon ring-4 ring-white" />
                  <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                    <span>Status: {item.newStatus}</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {item.remarks && (
                    <p className="text-[11px] text-gray-600 mt-0.5">{item.remarks}</p>
                  )}
                  {item.updatedBy && (
                    <p className="text-[10px] text-gray-400">Updated by: {item.updatedBy.name}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
