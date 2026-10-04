import { useState } from "react";
import { X, Send, GraduationCap, CheckCircle2, Upload, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { submitApplication } from "../services/application.service";

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  defaultCourse?: string;
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

export default function ApplicationModal({ open, onClose, defaultCourse }: ApplicationModalProps) {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [course, setCourse] = useState(defaultCourse || coursesList[0]);
  const [twelfthPercentage, setTwelfthPercentage] = useState("");
  const [entranceExam, setEntranceExam] = useState("TS EAMCET");
  const [entranceRank, setEntranceRank] = useState("");
  
  // Document Uploads
  const [marksheet, setMarksheet] = useState<string | null>(null);
  const [marksheetName, setMarksheetName] = useState<string | null>(null);
  const [rankCard, setRankCard] = useState<string | null>(null);
  const [rankCardName, setRankCardName] = useState<string | null>(null);
  const [idProof, setIdProof] = useState<string | null>(null);
  const [idProofName, setIdProofName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      toast.success(`${file.name} uploaded!`);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !email || !phone || !twelfthPercentage) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await submitApplication({
        studentName,
        email,
        phone,
        course,
        twelfthPercentage: parseFloat(twelfthPercentage),
        entranceExam,
        entranceRank: entranceRank || undefined,
        documents: {
          marksheet: marksheet || undefined,
          rankCard: rankCard || undefined,
          idProof: idProof || undefined,
        },
      });

      setSubmitted(true);
      toast.success("Application & Documents submitted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden relative border border-gray-100">
        {/* Header */}
        <div className="bg-maroon text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold">Apply for Admission</h3>
              <p className="text-white/80 text-xs">EduReach College Session 2024–25</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <h4 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                Application & Documents Received!
              </h4>
              <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
                Thank you for applying to <span className="font-semibold text-maroon">{course}</span>. Our admissions committee will verify your academic documents and contact you at <span className="font-medium text-gray-800">{email}</span>.
              </p>
              <button
                onClick={handleReset}
                className="bg-maroon text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-maroon-dark transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-9876543210"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Select Program / Course *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none bg-white"
                >
                  {coursesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    12th / Diploma % *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={twelfthPercentage}
                    onChange={(e) => setTwelfthPercentage(e.target.value)}
                    placeholder="85.5"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Entrance Exam
                  </label>
                  <select
                    value={entranceExam}
                    onChange={(e) => setEntranceExam(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none bg-white"
                  >
                    <option value="TS EAMCET">TS EAMCET</option>
                    <option value="JEE Main">JEE Main</option>
                    <option value="GATE">GATE</option>
                    <option value="ICET">TS ICET</option>
                    <option value="Direct">Direct / Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Exam Rank
                  </label>
                  <input
                    type="text"
                    value={entranceRank}
                    onChange={(e) => setEntranceRank(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-maroon focus:border-maroon outline-none"
                  />
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Upload Verification Documents (Optional)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Marksheet */}
                  <label className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    marksheet ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                  }`}>
                    {marksheet ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" /> : <Upload className="w-5 h-5 text-gray-400 mb-1" />}
                    <span className="text-xs font-semibold block truncate max-w-full">
                      {marksheetName ? marksheetName : "12th Marksheet"}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{marksheet ? "Uploaded" : "PDF / Image"}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setMarksheet, setMarksheetName)}
                    />
                  </label>

                  {/* Rank Card */}
                  <label className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    rankCard ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                  }`}>
                    {rankCard ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" /> : <FileText className="w-5 h-5 text-gray-400 mb-1" />}
                    <span className="text-xs font-semibold block truncate max-w-full">
                      {rankCardName ? rankCardName : "Entrance Rank Card"}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{rankCard ? "Uploaded" : "PDF / Image"}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setRankCard, setRankCardName)}
                    />
                  </label>

                  {/* ID Proof */}
                  <label className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    idProof ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600"
                  }`}>
                    {idProof ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" /> : <Upload className="w-5 h-5 text-gray-400 mb-1" />}
                    <span className="text-xs font-semibold block truncate max-w-full">
                      {idProofName ? idProofName : "Aadhaar / ID Proof"}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{idProof ? "Uploaded" : "PDF / Image"}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setIdProof, setIdProofName)}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon text-white py-3 rounded-xl font-semibold hover:bg-maroon-dark transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Submitting Application & Documents..." : "Submit Admission Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
