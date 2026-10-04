import API from "./api";

export interface SubjectMark {
  code: string;
  name: string;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  credits: number;
}

export interface StudentResult {
  _id?: string;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  department: string;
  course: string;
  semester: string;
  academicYear: string;
  subjects: SubjectMark[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  sgpa: number;
  cgpa: number;
  status: "Pass" | "Fail";
  publishedBy: string;
  created_at?: string;
}

const FALLBACK_RESULTS: StudentResult[] = [
  {
    _id: "res-demo-1",
    studentName: "Alex Rivera",
    studentEmail: "student@edureach.edu",
    rollNo: "22CSE0104",
    department: "Computer Science & Engineering",
    course: "B.Tech - Computer Science & Engineering (CSE)",
    semester: "Semester 4",
    academicYear: "2025-2026",
    subjects: [
      { code: "CS401", name: "Data Structures & Algorithms", internalMarks: 28, externalMarks: 62, totalMarks: 90, maxMarks: 100, grade: "A+", credits: 4 },
      { code: "CS402", name: "Database Management Systems", internalMarks: 27, externalMarks: 58, totalMarks: 85, maxMarks: 100, grade: "A", credits: 4 },
      { code: "CS403", name: "Operating Systems", internalMarks: 25, externalMarks: 53, totalMarks: 78, maxMarks: 100, grade: "B+", credits: 3 },
      { code: "CS404", name: "Computer Networks", internalMarks: 29, externalMarks: 63, totalMarks: 92, maxMarks: 100, grade: "O", credits: 4 },
      { code: "CS405", name: "Full Stack Web Development", internalMarks: 30, externalMarks: 65, totalMarks: 95, maxMarks: 100, grade: "O", credits: 3 },
    ],
    totalMarks: 440,
    maxTotalMarks: 500,
    percentage: 88.0,
    sgpa: 9.12,
    cgpa: 8.95,
    status: "Pass",
    publishedBy: "Prof. Rajesh Sharma (HOD CSE)",
    created_at: "2026-08-15T10:00:00.000Z",
  },
  {
    _id: "res-demo-2",
    studentName: "Priya Patel",
    studentEmail: "priya.patel@edureach.edu",
    rollNo: "22CSE0112",
    department: "Computer Science & Engineering",
    course: "B.Tech - Computer Science & Engineering (CSE)",
    semester: "Semester 4",
    academicYear: "2025-2026",
    subjects: [
      { code: "CS401", name: "Data Structures & Algorithms", internalMarks: 25, externalMarks: 55, totalMarks: 80, maxMarks: 100, grade: "A", credits: 4 },
      { code: "CS402", name: "Database Management Systems", internalMarks: 26, externalMarks: 59, totalMarks: 85, maxMarks: 100, grade: "A", credits: 4 },
      { code: "CS403", name: "Operating Systems", internalMarks: 24, externalMarks: 50, totalMarks: 74, maxMarks: 100, grade: "B+", credits: 3 },
      { code: "CS404", name: "Computer Networks", internalMarks: 27, externalMarks: 60, totalMarks: 87, maxMarks: 100, grade: "A+", credits: 4 },
      { code: "CS405", name: "Full Stack Web Development", internalMarks: 28, externalMarks: 62, totalMarks: 90, maxMarks: 100, grade: "A+", credits: 3 },
    ],
    totalMarks: 416,
    maxTotalMarks: 500,
    percentage: 83.2,
    sgpa: 8.65,
    cgpa: 8.70,
    status: "Pass",
    publishedBy: "Prof. Rajesh Sharma (HOD CSE)",
    created_at: "2026-08-16T14:30:00.000Z",
  },
];

export const getMyResults = async (): Promise<StudentResult[]> => {
  try {
    const res = await API.get("/results/my-results");
    if (res.data.data?.results && res.data.data.results.length > 0) {
      return res.data.data.results;
    }
  } catch (err) {
    console.warn("Backend results endpoint unreachable, using fallback results.", err);
  }
  return FALLBACK_RESULTS;
};

export const getAllResults = async (): Promise<StudentResult[]> => {
  try {
    const res = await API.get("/results/all");
    if (res.data.data?.results && res.data.data.results.length > 0) {
      return res.data.data.results;
    }
  } catch (err) {
    console.warn("Backend results endpoint unreachable, using fallback results.", err);
  }
  return FALLBACK_RESULTS;
};

export const createResult = async (data: Partial<StudentResult>): Promise<StudentResult> => {
  try {
    const res = await API.post("/results", data);
    return res.data.data.result;
  } catch (err) {
    console.warn("Backend result creation offline, creating local entry.", err);
    const mockResult: StudentResult = {
      _id: `res-local-${Date.now()}`,
      studentName: data.studentName || "Student Name",
      studentEmail: data.studentEmail || "student@edureach.edu",
      rollNo: data.rollNo || "22CSE0199",
      department: data.department || "Computer Science",
      course: data.course || "B.Tech - CSE",
      semester: data.semester || "Semester 4",
      academicYear: data.academicYear || "2025-2026",
      subjects: data.subjects || [],
      totalMarks: data.totalMarks || 400,
      maxTotalMarks: data.maxTotalMarks || 500,
      percentage: data.percentage || 80,
      sgpa: data.sgpa || 8.5,
      cgpa: data.cgpa || 8.5,
      status: data.status || "Pass",
      publishedBy: data.publishedBy || "Faculty Member",
      created_at: new Date().toISOString(),
    };
    return mockResult;
  }
};
