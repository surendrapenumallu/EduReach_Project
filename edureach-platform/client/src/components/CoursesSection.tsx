import { useState } from "react";
import { coursesContent, images } from "../data/content";
import { BookOpen, Users, Info } from "lucide-react";
import CourseDetailModal from "./CourseDetailModal";

interface CoursesSectionProps {
  onApplyCourse?: (courseName: string) => void;
}

export default function CoursesSection({ onApplyCourse }: CoursesSectionProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const getCourseId = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("computer science")) return "btech-cse";
    if (n.includes("artificial intelligence") || n.includes("ai")) return "btech-aids";
    if (n.includes("electronics")) return "btech-ece";
    if (n.includes("mba")) return "mba";
    return "btech-cse";
  };

  return (
    <section id="courses" className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-maroon font-semibold text-sm uppercase tracking-wide mb-2">
            World-Class Education
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
            Programs Offered
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto mt-2">
            Explore industry-aligned engineering and management programs. Click any program to view semester syllabus and fee structure.
          </p>
        </div>

        {/* B.Tech grid */}
        <h3 className="font-heading text-xl font-semibold text-gray-800 mb-4">
          B.Tech Programs (4 Years)
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {coursesContent.btech.map((course) => (
            <div
              key={course.name}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-maroon/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-maroon mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{course.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {course.seats} seats
                        </span>
                        <span className="text-maroon font-medium">{course.avg}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedCourseId(getCourseId(course.name))}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  onClick={() => onApplyCourse?.(`B.Tech - ${course.name}`)}
                  className="w-full bg-maroon text-white hover:bg-maroon-dark py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply Online
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* M.Tech & MBA */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* M.Tech */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img src={images.tech2} alt="Tech" className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-heading text-xl font-semibold text-gray-800">M.Tech Programs</h3>
                  <p className="text-xs text-gray-500">2-Year Advanced Post-Graduate Engineering</p>
                </div>
              </div>
              <div className="space-y-2">
                {coursesContent.mtech.map((course) => (
                  <div key={course.name} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{course.name}</span>
                    <span className="text-gray-500 text-xs">{course.seats} seats</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onApplyCourse?.("M.Tech Program")}
              className="mt-4 w-full bg-maroon text-white hover:bg-maroon-dark py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Apply for M.Tech
            </button>
          </div>

          {/* MBA */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img src={images.tech3} alt="MBA" className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-heading text-xl font-semibold text-gray-800">MBA Program</h3>
                  <p className="text-xs text-gray-500">2-Year Full-Time Master of Business Administration</p>
                </div>
              </div>
              <p className="text-gray-800 font-medium text-sm">{coursesContent.mba.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-500 text-xs">{coursesContent.mba.seats} seats</span>
                <span className="text-maroon font-medium text-xs">{coursesContent.mba.avg}</span>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Specializations in Finance, Marketing, HR, and IT & Business Analytics
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedCourseId("mba")}
                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Info className="w-3.5 h-3.5" /> Details & Syllabus
              </button>
              <button
                onClick={() => onApplyCourse?.("MBA Program")}
                className="w-full bg-maroon text-white hover:bg-maroon-dark py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Apply for MBA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourseId && (
        <CourseDetailModal
          courseId={selectedCourseId}
          onClose={() => setSelectedCourseId(null)}
          onApplyNow={(cName) => {
            setSelectedCourseId(null);
            onApplyCourse?.(cName);
          }}
        />
      )}
    </section>
  );
}
