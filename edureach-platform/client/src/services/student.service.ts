import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CourseAttendance {
  code: string;
  title: string;
  total: number;
  attended: number;
  percentage: number;
  faculty: string;
}

export interface DayWiseAttendance {
  date: string;
  day: string;
  slot: string;
  subject: string;
  status: "Present" | "Absent" | "On Duty";
  room: string;
}

export interface SemesterSGPA {
  semester: string;
  sgpa: number;
  credits: number;
}

export interface ExamScheduleItem {
  code: string;
  title: string;
  date: string;
  time: string;
  room: string;
}

export interface HallTicket {
  ticketNo: string;
  studentName: string;
  rollNo: string;
  examCenter: string;
  seatNo: string;
  status: string;
  issueDate: string;
  schedule: ExamScheduleItem[];
}

export interface ExamFees {
  semester: string;
  regularFee: number;
  labFee: number;
  backlogFee: number;
  totalAmount: number;
  status: "Paid" | "Pending";
  transactionId?: string;
  paymentDate?: string;
  receiptUrl?: string;
}

export interface PlacementModule {
  id: string;
  title: string;
  trainer: string;
  status: "Completed" | "In Progress" | "Upcoming";
  attendance: number;
  totalHours: number;
  attendedHours: number;
}

export interface PlacementLog {
  date: string;
  topic: string;
  duration: string;
  trainer: string;
  status: string;
}

export interface JobDrive {
  id: string;
  company: string;
  logo: string;
  role: string;
  package: string;
  location: string;
  eligibility: string;
  requiredSkills?: string[];
  matchScore?: number;
  deadline: string;
  applied: boolean;
  status: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  category: string;
  urgency: "High" | "Medium" | "Low";
  detail: string;
}

export interface StudentPortalData {
  profile: {
    rollNo: string;
    department: string;
    semester: string;
    academicYear: string;
    section: string;
    mentor: string;
    skills?: string[];
  };
  cgpa: {
    overallCGPA: number;
    totalCreditsEarned: number;
    totalCreditsRequired: number;
    classification: string;
    semesterSGPA: SemesterSGPA[];
  };
  attendance: {
    overallPercentage: number;
    totalClassesConducted: number;
    totalClassesAttended: number;
    courseWise: CourseAttendance[];
    dayWise: DayWiseAttendance[];
  };
  exams: {
    hallTicket: HallTicket;
    fees: ExamFees;
  };
  placements: {
    training: {
      overallAttendance: number;
      totalModules: number;
      completedModules: number;
      modules: PlacementModule[];
      logs: PlacementLog[];
    };
    jobs: JobDrive[];
  };
  deadlines?: DeadlineItem[];
}

export interface AIResumeFeedback {
  atsScore: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  recommendedKeywords: string[];
  improvedSummary: string;
}

export const getStudentPortalData = async (): Promise<StudentPortalData> => {
  try {
    const res = await axios.get(`${API_URL}/student/portal-data`, {
      headers: getAuthHeader(),
    });
    return res.data.data;
  } catch (error) {
    console.warn("Failed to fetch live student data, loading default fallback dataset:", error);
    // Default fallback dataset for offline/mock scenario
    return {
      profile: {
        rollNo: "22CSE0104",
        department: "Computer Science & Engineering",
        semester: "Semester 6",
        academicYear: "2025-2026",
        section: "CSE-A",
        mentor: "Dr. Rajesh Sharma",
      },
      cgpa: {
        overallCGPA: 8.92,
        totalCreditsEarned: 112,
        totalCreditsRequired: 160,
        classification: "First Class with Distinction",
        semesterSGPA: [
          { semester: "Semester 1", sgpa: 8.75, credits: 20 },
          { semester: "Semester 2", sgpa: 8.90, credits: 20 },
          { semester: "Semester 3", sgpa: 9.10, credits: 20 },
          { semester: "Semester 4", sgpa: 9.12, credits: 20 },
          { semester: "Semester 5", sgpa: 8.85, credits: 18 },
          { semester: "Semester 6", sgpa: 8.95, credits: 14 },
        ],
      },
      attendance: {
        overallPercentage: 88.5,
        totalClassesConducted: 240,
        totalClassesAttended: 212,
        courseWise: [
          { code: "CS601", title: "Artificial Intelligence & ML", total: 48, attended: 44, percentage: 91.6, faculty: "Dr. R. Sharma" },
          { code: "CS602", title: "Cloud Computing & DevOps", total: 45, attended: 41, percentage: 91.1, faculty: "Prof. S. Rao" },
          { code: "CS603", title: "Database Systems & MongoDB", total: 50, attended: 44, percentage: 88.0, faculty: "Dr. V. Kapoor" },
          { code: "CS604", title: "Design & Analysis of Algorithms", total: 52, attended: 45, percentage: 86.5, faculty: "Prof. M. Patel" },
          { code: "CS605", title: "Web Technologies & React", total: 45, attended: 38, percentage: 84.4, faculty: "Dr. A. Verma" },
        ],
        dayWise: [
          { date: "2026-03-13", day: "Friday", slot: "09:30 AM - 10:30 AM", subject: "Artificial Intelligence", status: "Present", room: "Lab 3" },
          { date: "2026-03-13", day: "Friday", slot: "10:45 AM - 11:45 AM", subject: "Cloud Computing", status: "Present", room: "LH 201" },
          { date: "2026-03-13", day: "Friday", slot: "01:30 PM - 03:30 PM", subject: "Web Technologies Lab", status: "Present", room: "Lab 1" },
          { date: "2026-03-12", day: "Thursday", slot: "09:30 AM - 10:30 AM", subject: "Database Systems", status: "Present", room: "LH 201" },
          { date: "2026-03-12", day: "Thursday", slot: "10:45 AM - 11:45 AM", subject: "Algorithms", status: "Absent", room: "LH 201" },
          { date: "2026-03-12", day: "Thursday", slot: "01:30 PM - 02:30 PM", subject: "AI & ML", status: "Present", room: "LH 201" },
          { date: "2026-03-11", day: "Wednesday", slot: "09:30 AM - 11:30 AM", subject: "Algorithms Lab", status: "Present", room: "Lab 4" },
          { date: "2026-03-11", day: "Wednesday", slot: "01:30 PM - 02:30 PM", subject: "Cloud Computing", status: "Present", room: "LH 201" },
          { date: "2026-03-10", day: "Tuesday", slot: "09:30 AM - 10:30 AM", subject: "Database Systems", status: "On Duty", room: "Auditorium" },
          { date: "2026-03-10", day: "Tuesday", slot: "10:45 AM - 11:45 AM", subject: "Web Technologies", status: "Present", room: "LH 201" },
        ],
      },
      exams: {
        hallTicket: {
          ticketNo: "HT-2026-CSE-0104",
          studentName: "Alex Rivera",
          rollNo: "22CSE0104",
          examCenter: "EduReach Block A - Main Exam Center",
          seatNo: "A-42",
          status: "Issued",
          issueDate: "10 March 2026",
          schedule: [
            { code: "CS601", title: "Artificial Intelligence & ML", date: "24 Mar 2026", time: "10:00 AM - 01:00 PM", room: "Hall 102" },
            { code: "CS602", title: "Cloud Computing & DevOps", date: "27 Mar 2026", time: "10:00 AM - 01:00 PM", room: "Hall 104" },
            { code: "CS603", title: "Database Systems & MongoDB", date: "30 Mar 2026", time: "10:00 AM - 01:00 PM", room: "Hall 102" },
            { code: "CS604", title: "Design & Analysis of Algorithms", date: "02 Apr 2026", time: "10:00 AM - 01:00 PM", room: "Hall 105" },
            { code: "CS605", title: "Web Technologies & React", date: "06 Apr 2026", time: "10:00 AM - 01:00 PM", room: "Hall 101" },
          ],
        },
        fees: {
          semester: "Semester 6 End Examinations",
          regularFee: 1500,
          labFee: 500,
          backlogFee: 0,
          totalAmount: 2000,
          status: "Paid",
          transactionId: "TXN-9847103982",
          paymentDate: "05 March 2026",
          receiptUrl: "#",
        },
      },
      placements: {
        training: {
          overallAttendance: 92.5,
          totalModules: 4,
          completedModules: 3,
          modules: [
            { id: "M1", title: "Advanced Data Structures & Algorithms Bootcamp", trainer: "Er. Karthik V.", status: "Completed", attendance: 95.0, totalHours: 40, attendedHours: 38 },
            { id: "M2", title: "System Design & Cloud Microservices", trainer: "Dr. S. Kulkarni", status: "Completed", attendance: 90.0, totalHours: 30, attendedHours: 27 },
            { id: "M3", title: "Quantitative Aptitude & Logical Reasoning", trainer: "Prof. Neha Gupta", status: "Completed", attendance: 93.3, totalHours: 30, attendedHours: 28 },
            { id: "M4", title: "Corporate Grooming & Mock HR Interviews", trainer: "Ms. Priya Sharma", status: "In Progress", attendance: 91.7, totalHours: 24, attendedHours: 22 },
          ],
          logs: [
            { date: "2026-03-12", topic: "Mock Behavioral & Technical HR Interview Round 2", duration: "2 hrs", trainer: "Ms. Priya Sharma", status: "Attended" },
            { date: "2026-03-10", topic: "Dynamic Programming & Graph Algorithms Practice", duration: "3 hrs", trainer: "Er. Karthik V.", status: "Attended" },
            { date: "2026-03-08", topic: "System Design: Load Balancers & Distributed Caching", duration: "2.5 hrs", trainer: "Dr. S. Kulkarni", status: "Attended" },
            { date: "2026-03-05", topic: "Quantitative Speed Math & Probability Puzzles", duration: "2 hrs", trainer: "Prof. Neha Gupta", status: "Attended" },
          ],
        },
        jobs: [
          {
            id: "JOB-101",
            company: "Microsoft Technologies",
            logo: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=100&auto=format&fit=crop&q=80",
            role: "Software Development Engineer - I (SDE 1)",
            package: "₹ 18.5 LPA",
            location: "Hyderabad / Bengaluru",
            eligibility: "CGPA >= 8.0, No active backlogs",
            deadline: "2026-03-28",
            applied: true,
            status: "Shortlisted for Online Assessment",
          },
          {
            id: "JOB-102",
            company: "Amazon Web Services (AWS)",
            logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&auto=format&fit=crop&q=80",
            role: "Cloud Support Associate & DevOps Engineer",
            package: "₹ 16.0 LPA",
            location: "Hyderabad",
            eligibility: "CGPA >= 7.5, CSE / ECE / IT",
            deadline: "2026-04-02",
            applied: false,
            status: "Open for Applications",
          },
          {
            id: "JOB-103",
            company: "TCS Digital",
            logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
            role: "System Engineer - Digital & AI Track",
            package: "₹ 9.0 LPA",
            location: "Pan India",
            eligibility: "CGPA >= 7.0, All Branches",
            deadline: "2026-04-10",
            applied: true,
            status: "Application Under Review",
          },
          {
            id: "JOB-104",
            company: "Infosys Springboard & Power Programmer",
            logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80",
            role: "Power Specialist Developer",
            package: "₹ 9.5 LPA",
            location: "Bengaluru / Pune",
            eligibility: "CGPA >= 7.5",
            deadline: "2026-04-15",
            applied: false,
            status: "Open for Applications",
          },
        ],
      },
    };
  }
};

export interface AIBriefingData {
  greeting: string;
  focusToday: string;
  actionAlerts: string[];
  academicAdvice: string;
  careerInsight: string;
}

export interface BunkSafetyResult {
  code: string;
  title: string;
  attended: number;
  total: number;
  percentage: number;
  status: string;
  safeBunks: number;
  requiredClasses: number;
  advice: string;
}

export const updateProfilePhoto = async (photoUrl: string): Promise<any> => {
  const res = await axios.put(
    `${API_URL}/auth/update-profile`,
    { profilePhoto: photoUrl },
    { headers: getAuthHeader() },
  );
  return res.data;
};

export const reviewResumeWithAI = async (resumeText: string, targetRole?: string): Promise<AIResumeFeedback> => {
  const res = await axios.post(
    `${API_URL}/student/ai-resume-review`,
    { resumeText, targetRole },
    { headers: getAuthHeader() },
  );
  return res.data.data;
};

export const getAIBriefing = async (): Promise<AIBriefingData> => {
  try {
    const res = await axios.get(`${API_URL}/student/ai-briefing`, {
      headers: getAuthHeader(),
    });
    return res.data.data;
  } catch (err) {
    console.warn("Fallback briefing data:", err);
    return {
      greeting: "Welcome back, Alex! Here is your AI Student Intelligence Briefing for today.",
      focusToday: "Complete your Web Technologies MERN project submission due Mar 18 and prepare for the Microsoft SDE coding round on Mar 28.",
      actionAlerts: [
        "Attendance Watch: CS605 Web Tech is at 84.4%. You can safely miss at most 4 classes while maintaining >75%.",
        "Upcoming Exam: Artificial Intelligence & ML Theory Exam on March 24 in Hall 102.",
      ],
      academicAdvice: "Your current CGPA is 8.92. Securing a 9.10 SGPA in Semester 6 will place you in the Top 3% of the CSE department.",
      careerInsight: "High Placement Match: You hold a 94% skill match for Microsoft SDE (18.5 LPA). Focus on System Design & Dynamic Programming.",
    };
  }
};

export const calculateBunkSafety = async (courseWise?: CourseAttendance[]): Promise<BunkSafetyResult[]> => {
  try {
    const res = await axios.post(
      `${API_URL}/student/attendance-bunk-calc`,
      { courseWise },
      { headers: getAuthHeader() },
    );
    return res.data.data;
  } catch (err) {
    console.warn("Fallback bunk safety calculation:", err);
    const courses = courseWise || [
      { code: "CS601", title: "Artificial Intelligence & ML", total: 48, attended: 44, percentage: 91.6, faculty: "Dr. R. Sharma" },
      { code: "CS602", title: "Cloud Computing & DevOps", total: 45, attended: 41, percentage: 91.1, faculty: "Prof. S. Rao" },
      { code: "CS603", title: "Database Systems & MongoDB", total: 50, attended: 44, percentage: 88.0, faculty: "Dr. V. Kapoor" },
      { code: "CS604", title: "Design & Analysis of Algorithms", total: 52, attended: 45, percentage: 86.5, faculty: "Prof. M. Patel" },
      { code: "CS605", title: "Web Technologies & React", total: 45, attended: 38, percentage: 84.4, faculty: "Dr. A. Verma" },
    ];
    return courses.map((c) => {
      const A = c.attended;
      const T = c.total;
      const pct = (A / T) * 100;
      const safeBunks = Math.floor((A - 0.75 * T) / 0.75);
      return {
        code: c.code,
        title: c.title,
        attended: A,
        total: T,
        percentage: parseFloat(pct.toFixed(1)),
        status: pct >= 75 ? "Eligible" : "Shortage",
        safeBunks: Math.max(0, safeBunks),
        requiredClasses: pct < 75 ? Math.ceil((0.75 * T - A) / 0.25) : 0,
        advice:
          pct >= 75
            ? `You can safely miss up to ${Math.max(0, safeBunks)} class(es) while staying above 75%.`
            : `Shortage! Attend next ${Math.ceil((0.75 * T - A) / 0.25)} classes.`,
      };
    });
  }
};

export interface AcademicRiskData {
  riskLevel: string;
  riskScore: number;
  detentionProbability: string;
  backlogRisk: string;
  attendanceStatus: string;
  lowestCourseAttendance: string;
  cgpaTrajectory: string;
  aiInterventionPlan: string[];
}

export const getAcademicRiskPrediction = async (): Promise<AcademicRiskData> => {
  try {
    const res = await axios.get(`${API_URL}/student/academic-risk`, {
      headers: getAuthHeader(),
    });
    return res.data.data;
  } catch (err) {
    console.warn("Fallback academic risk data:", err);
    return {
      riskLevel: "Low Risk",
      riskScore: 12,
      detentionProbability: "0% (Fully Eligible)",
      backlogRisk: "Low (< 3%)",
      attendanceStatus: "Safe (88.5% overall)",
      lowestCourseAttendance: "CS605 Web Tech (84.4%)",
      cgpaTrajectory: "Upward (8.75 ➔ 8.92)",
      aiInterventionPlan: [
        "Attend the next 4 consecutive Web Tech (CS605) classes to push course attendance above 88%.",
        "Maintain current study routine for AI & ML (CS601) to secure A+ grade in end semester exam.",
        "Schedule 1-on-1 mock technical interview with mentor Dr. Rajesh Sharma before March 25.",
      ],
    };
  }
};
