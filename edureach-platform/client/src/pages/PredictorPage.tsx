import { useState } from "react";
import {
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Bot,
  GraduationCap,
  Award,
} from "lucide-react";
import { getAdmissionPrediction, type PredictionResult } from "../services/predictor.service";
import ApplicationModal from "../components/ApplicationModal";
import toast from "react-hot-toast";

export default function PredictorPage() {
  const [entranceExam, setEntranceExam] = useState("TS EAMCET");
  const [entranceRank, setEntranceRank] = useState("4500");
  const [twelfthPercentage, setTwelfthPercentage] = useState("88.5");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [selectedApplyCourse, setSelectedApplyCourse] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twelfthPercentage) {
      toast.error("Please enter your 12th Board Percentage.");
      return;
    }

    setLoading(true);
    try {
      const resData = await getAdmissionPrediction({
        entranceExam,
        entranceRank: entranceRank ? parseInt(entranceRank) : undefined,
        twelfthPercentage: parseFloat(twelfthPercentage),
        category,
      });
      setResult(resData);
      toast.success("AI Admission prediction generated!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate prediction.");
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityBadge = (prob: "High" | "Moderate" | "Low") => {
    switch (prob) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Probability
          </span>
        );
      case "Moderate":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5" /> Moderate Chance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-gray-300">
            <XCircle className="w-3.5 h-3.5 text-gray-500" /> Management Quota Only
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream/60 via-white to-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-maroon/10 text-maroon text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> AI Cutoff & Branch Predictor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900">
            Predict Your EduReach Admission & Branch Allotment
          </h1>
          <p className="text-gray-600 text-sm">
            Enter your entrance exam rank and 12th board marks to calculate your probability of securing seats across CSE, AI&DS, ECE, IT, ME, CE, and MBA programs.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl max-w-3xl mx-auto">
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Select Entrance Exam *
                </label>
                <select
                  value={entranceExam}
                  onChange={(e) => setEntranceExam(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none bg-white"
                >
                  <option value="TS EAMCET">TS EAMCET</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="ICET">TS ICET (for MBA)</option>
                  <option value="Direct">Direct / 12th Marks Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Entrance Rank / Percentile
                </label>
                <input
                  type="number"
                  value={entranceRank}
                  onChange={(e) => setEntranceRank(e.target.value)}
                  placeholder="e.g. 4500 (or 92 for JEE %tile)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  12th Board Aggregate Percentage *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={twelfthPercentage}
                  onChange={(e) => setTwelfthPercentage(e.target.value)}
                  placeholder="e.g. 88.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Reservation Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none bg-white"
                >
                  <option value="General">General / Open Competition</option>
                  <option value="OBC">OBC / BC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-maroon text-white font-bold rounded-xl text-base hover:bg-maroon-dark shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Calculator className="w-5 h-5" />
              {loading ? "Analyzing Cutoffs..." : "Predict Admission Chances"}
            </button>
          </form>
        </div>

        {/* Results Display */}
        {result && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Insight Card */}
            <div className="bg-gradient-to-r from-slate-900 via-maroon-dark to-maroon text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-amber-300 text-xs font-semibold mb-2">
                    <Bot className="w-4 h-4" /> AI Admissions Counselor Advice
                  </div>
                  <h2 className="text-2xl font-bold font-heading">
                    Recommended Choice: <span className="text-amber-300">{result.recommendedBranch}</span>
                  </h2>
                  <p className="text-white/80 text-sm mt-2 leading-relaxed max-w-3xl">
                    {result.aiCounselorInsight}
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center flex-shrink-0 backdrop-blur-sm">
                  <div className="text-xs text-white/70">Overall Eligibility</div>
                  <div className="text-lg font-extrabold text-emerald-300 mt-0.5">{result.overallEligibility}</div>
                </div>
              </div>
            </div>

            {/* Branch Cards Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 font-heading flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-maroon" /> Branch-wise Allotment Probability Breakdown
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.predictions.map((pred) => (
                  <div
                    key={pred.id}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-maroon/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-base">{pred.branchName}</h3>
                        <div>{getProbabilityBadge(pred.probability)}</div>
                      </div>

                      {/* Match progress */}
                      <div className="space-y-1 my-3">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-500">Admission Probability Match</span>
                          <span className="text-maroon">{pred.matchPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              pred.probability === "High"
                                ? "bg-emerald-500"
                                : pred.probability === "Moderate"
                                ? "bg-amber-500"
                                : "bg-gray-400"
                            }`}
                            style={{ width: `${pred.matchPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 font-medium">
                          <Award className="w-3.5 h-3.5 text-maroon" />
                          <span className="font-semibold text-gray-800">Seat Category:</span> {pred.quotaType}
                        </div>
                        <div className="text-gray-500">{pred.closingRankBenchmark}</div>
                        <p className="text-gray-700 italic mt-1 border-t border-gray-200/60 pt-1">
                          "{pred.recommendationReason}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedApplyCourse(pred.branchName)}
                      className="w-full bg-maroon/10 text-maroon hover:bg-maroon hover:text-white py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      Apply for {pred.branchName.split("(")[0]} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Modal */}
      <ApplicationModal
        open={!!selectedApplyCourse}
        defaultCourse={selectedApplyCourse || undefined}
        onClose={() => setSelectedApplyCourse(null)}
      />
    </div>
  );
}
