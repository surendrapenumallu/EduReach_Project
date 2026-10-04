import { useState } from "react";
import { X, BookOpen, Award, CheckCircle, GraduationCap, Building2, Briefcase } from "lucide-react";
import { COURSE_DETAILS } from "../data/courseDetails";

interface CourseDetailModalProps {
  courseId: string | null;
  onClose: () => void;
  onApplyNow: (courseName: string) => void;
}

export default function CourseDetailModal({
  courseId,
  onClose,
  onApplyNow,
}: CourseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "fees">("overview");

  if (!courseId) return null;
  const course = COURSE_DETAILS[courseId] || COURSE_DETAILS["btech-cse"];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-maroon to-maroon-dark p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            {course.category} • {course.duration}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">{course.title}</h2>
          <p className="text-white/80 text-sm mt-1">{course.degree}</p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/20 text-center">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="text-xs text-white/70">Highest Package</div>
              <div className="text-lg sm:text-xl font-bold text-amber-300">{course.highestPackage}</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="text-xs text-white/70">Average Package</div>
              <div className="text-lg sm:text-xl font-bold text-white">{course.averagePackage}</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="text-xs text-white/70">Placement Rate</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-300">{course.placementRate}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "overview"
                ? "border-maroon text-maroon bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Overview & Highlights
          </button>
          <button
            onClick={() => setActiveTab("syllabus")}
            className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "syllabus"
                ? "border-maroon text-maroon bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Syllabus & Curriculum
          </button>
          <button
            onClick={() => setActiveTab("fees")}
            className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "fees"
                ? "border-maroon text-maroon bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" /> Fee Structure
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Program Highlights */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-maroon" /> Department Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-maroon" /> Eligibility Criteria
                </h3>
                <ul className="space-y-2 bg-amber-50/60 border border-amber-200/60 p-4 rounded-xl text-sm text-amber-900">
                  {course.eligibility.map((crit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      {crit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Recruiters */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-maroon" /> Top Recruiting Companies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.topRecruiters.map((rec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg border border-gray-200"
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "syllabus" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-maroon" /> Semester-wise Subjects & Credits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.curriculum.semesters.map((sem) => (
                  <div key={sem.semNumber} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="font-bold text-maroon text-sm mb-3 border-b border-gray-200 pb-1 flex justify-between">
                      <span>Semester {sem.semNumber}</span>
                      <span className="text-xs text-gray-500 font-normal">
                        Total Credits: {sem.subjects.reduce((sum, s) => sum + s.credits, 0)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sem.subjects.map((sub) => (
                        <div key={sub.code} className="flex justify-between items-center text-xs">
                          <span className="font-mono text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">{sub.code}</span>
                          <span className="text-gray-800 font-medium flex-1 px-2">{sub.name}</span>
                          <span className="text-gray-600 font-semibold">{sub.credits} C</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-maroon" /> Annual Fee Structure Breakdown
              </h3>
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                    <tr>
                      <th className="p-3">Fee Component</th>
                      <th className="p-3">Frequency</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-3 font-medium text-gray-800">Tuition Fee</td>
                      <td className="p-3 text-gray-500 text-xs">Annual</td>
                      <td className="p-3 font-semibold text-right">{course.fee.tuitionFeePerYear}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-gray-800">Development & Lab Fee</td>
                      <td className="p-3 text-gray-500 text-xs">Annual</td>
                      <td className="p-3 font-semibold text-right">{course.fee.developmentFeePerYear}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-gray-800">Hostel & Mess Charges</td>
                      <td className="p-3 text-gray-500 text-xs">Annual (Optional)</td>
                      <td className="p-3 font-semibold text-right">{course.fee.hostelAndMessFeePerYear}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-gray-800">Caution Deposit</td>
                      <td className="p-3 text-gray-500 text-xs">One-time (Refundable)</td>
                      <td className="p-3 font-semibold text-right">{course.fee.cautionDepositOneTime}</td>
                    </tr>
                    <tr className="bg-maroon/5 font-bold text-maroon">
                      <td className="p-3">Total Estimated Annual Fee</td>
                      <td className="p-3 text-xs font-normal text-maroon/80">Inclusive of Hostel</td>
                      <td className="p-3 text-right text-base">{course.fee.totalAnnualFee}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900">
                <strong>Scholarship Note:</strong> Merit scholarships of up to 50% tuition waiver are available for rankers in TS EAMCET (&lt; 5000 rank) and JEE Main (&gt; 95 percentile).
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 px-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onApplyNow(course.title);
            }}
            className="px-6 py-2.5 bg-maroon text-white rounded-xl hover:bg-maroon-dark text-sm font-semibold shadow-md transition-all flex items-center gap-2"
          >
            Apply for {course.title.split("(")[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
