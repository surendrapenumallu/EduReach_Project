import type { Request, Response, NextFunction } from "express";

const MOCK_FACULTY_DATA = {
  stats: {
    totalStudents: 142,
    activeCourses: 3,
    todaysClassesCount: 3,
    pendingAssignmentsCount: 28,
    lowAttendanceCount: 4,
    unreadMessagesCount: 6,
  },
  courses: [
    {
      id: "CS401",
      code: "CS401",
      name: "Data Structures & Algorithms",
      department: "Computer Science & Engineering",
      semester: "Semester 4",
      studentsCount: 54,
      credits: 4,
      schedule: "Mon, Wed, Fri (10:00 AM - 11:30 AM)",
      room: "Lab Block 3 - Room 302",
      syllabusProgress: 78,
      prerequisites: "Programming in C++ / Java (CS201)",
      description: "Comprehensive study of linear and non-linear data structures, algorithm analysis, recursion, search/sort trees, and graph theory.",
      syllabusUnits: [
        { unit: "Unit 1", title: "Linear Data Structures & Arrays", topics: "Arrays, Linked Lists, Doubly Linked Lists, Stacks, Queues, Deques & Applications", hours: 10 },
        { unit: "Unit 2", title: "Trees & Search Trees", topics: "Binary Trees, BST Operations, Self-Balancing AVL Trees, B-Trees & Heaps", hours: 12 },
        { unit: "Unit 3", title: "Graph Theory & Shortest Path", topics: "Graph Representation, BFS, DFS, Dijkstra's Shortest Path, Prim's & Kruskal's MST", hours: 12 },
        { unit: "Unit 4", title: "Sorting, Searching & Hash Tables", topics: "MergeSort, QuickSort, RadixSort, Hash Functions & Collision Handling", hours: 8 },
        { unit: "Unit 5", title: "Dynamic Programming & Greedy Algorithms", topics: "Knapsack Problem, Longest Common Subsequence, Matrix Chain Multiplication", hours: 8 },
      ],
      materials: [
        { id: "mat-1", unit: "Unit 1", title: "Unit 1 Comprehensive Lecture Handout", type: "pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedDate: "2026-08-01", size: "2.4 MB" },
        { id: "mat-2", unit: "Unit 1", title: "Arrays & Linked List Lecture Deck", type: "ppt", fileUrl: "#", uploadedDate: "2026-08-03", size: "5.1 MB" },
        { id: "mat-3", unit: "Unit 2", title: "AVL Tree Balancing Code & Markdown Cheat Sheet", type: "note", fileUrl: "#", uploadedDate: "2026-08-07", size: "450 KB" },
        { id: "mat-4", unit: "Unit 2", title: "Video Tutorial: Double Rotations in AVL Trees", type: "video", fileUrl: "https://www.youtube.com/watch?v=FNeL18KsWPc", uploadedDate: "2026-08-10", size: "120 MB" },
        { id: "mat-5", unit: "Unit 3", title: "Interactive Dijkstra Graph Visualizer", type: "link", fileUrl: "https://visualgo.net/en/sssp", uploadedDate: "2026-08-12", size: "Web Resource" },
      ],
    },
    {
      id: "CS402",
      code: "CS402",
      name: "Database Management Systems",
      department: "Computer Science & Engineering",
      semester: "Semester 4",
      studentsCount: 48,
      credits: 4,
      schedule: "Tue, Thu (02:00 PM - 03:30 PM)",
      room: "Academic Block A - Hall 104",
      syllabusProgress: 65,
      prerequisites: "Discrete Mathematics (CS301)",
      description: "Relational database concepts, ER modeling, SQL query optimization, transactions, ACID properties, and concurrency control.",
      syllabusUnits: [
        { unit: "Unit 1", title: "Database Systems & ER Diagram", topics: "Database Architecture, Schemas, ER Diagrams & Extended ER", hours: 10 },
        { unit: "Unit 2", title: "Relational Model & SQL", topics: "Relational Algebra, SQL DDL/DML, Joins, Subqueries & Views", hours: 12 },
        { unit: "Unit 3", title: "Database Normalization", topics: "Functional Dependencies, 1NF, 2NF, 3NF, BCNF & Multivalued Dependencies", hours: 10 },
        { unit: "Unit 4", title: "Transaction & Concurrency Control", topics: "ACID Properties, Schedule Serializability, Lock-based Protocols & Deadlocks", hours: 10 },
        { unit: "Unit 5", title: "Indexing & Query Processing", topics: "B+ Tree Indexing, Hash Indexing & Query Execution Plans", hours: 8 },
      ],
      materials: [
        { id: "mat-201", unit: "Unit 1", title: "ER Diagram Design Rules PDF", type: "pdf", fileUrl: "#", uploadedDate: "2026-08-02", size: "1.8 MB" },
        { id: "mat-202", unit: "Unit 2", title: "Advanced SQL Joins & Subqueries Slide Deck", type: "ppt", fileUrl: "#", uploadedDate: "2026-08-05", size: "4.2 MB" },
        { id: "mat-203", unit: "Unit 3", title: "Normalization 3NF & BCNF Worked Examples", type: "note", fileUrl: "#", uploadedDate: "2026-08-09", size: "320 KB" },
        { id: "mat-204", unit: "Unit 4", title: "Video Demonstration: Transaction Concurrency & Locking", type: "video", fileUrl: "#", uploadedDate: "2026-08-14", size: "85 MB" },
      ],
    },
    {
      id: "CS403",
      code: "CS403",
      name: "Operating Systems",
      department: "Computer Science & Engineering",
      semester: "Semester 4",
      studentsCount: 40,
      credits: 3,
      schedule: "Mon, Thu (04:00 PM - 05:00 PM)",
      room: "Academic Block B - Room 201",
      syllabusProgress: 82,
      prerequisites: "Computer Organization & Architecture (CS302)",
      description: "Operating system concepts, process scheduling, synchronization, semaphores, memory paging, and file system implementation.",
      syllabusUnits: [
        { unit: "Unit 1", title: "OS Fundamentals & System Calls", topics: "Kernel Architecture, System Calls, Interrupts & Dual-Mode Execution", hours: 8 },
        { unit: "Unit 2", title: "Process Management & CPU Scheduling", topics: "Process State, FCFS, SJF, Round Robin, Priority Scheduling", hours: 10 },
        { unit: "Unit 3", title: "Process Synchronization & Deadlocks", topics: "Critical Section Problem, Semaphores, Monitors, Banker's Algorithm", hours: 10 },
        { unit: "Unit 4", title: "Memory Management & Paging", topics: "Logical vs Physical Address, Paging, Segmentation, Virtual Memory & Page Replacement", hours: 10 },
        { unit: "Unit 5", title: "Storage & File Systems", topics: "Disk Scheduling (FCFS, SSTF, SCAN), File Access Methods, Directory Structure", hours: 8 },
      ],
      materials: [
        { id: "mat-301", unit: "Unit 1", title: "Linux System Calls Reference Guide", type: "pdf", fileUrl: "#", uploadedDate: "2026-08-04", size: "3.1 MB" },
        { id: "mat-302", unit: "Unit 2", title: "Process Scheduling Algorithms PPT", type: "ppt", fileUrl: "#", uploadedDate: "2026-08-08", size: "3.8 MB" },
        { id: "mat-303", unit: "Unit 3", title: "Banker's Algorithm Safety Test Code", type: "note", fileUrl: "#", uploadedDate: "2026-08-11", size: "180 KB" },
      ],
    },
  ],
  todaysClasses: [
    { id: "cls-1", time: "10:00 AM - 11:30 AM", course: "Data Structures & Algorithms (CS401)", room: "Lab 302", type: "Practical Lab", status: "Upcoming", enrolled: 54 },
    { id: "cls-2", time: "02:00 PM - 03:30 PM", course: "Database Management Systems (CS402)", room: "Hall 104", type: "Lecture", status: "Upcoming", enrolled: 48 },
    { id: "cls-3", time: "04:00 PM - 05:00 PM", course: "Operating Systems (CS403)", room: "Room 201", type: "Tutorial", status: "Scheduled", enrolled: 40 },
  ],
  assignments: [
    { id: "asg-1", title: "Binary Search Trees & AVL Tree Implementation", course: "CS401 - Data Structures", dueDate: "2026-08-22", submittedCount: 42, totalCount: 54, status: "Pending Grading" },
    { id: "asg-2", title: "SQL Joins & Relational Algebra Problem Set", course: "CS402 - DBMS", dueDate: "2026-08-25", submittedCount: 30, totalCount: 48, status: "Open" },
    { id: "asg-3", title: "Process Synchronization & Deadlock Prevention", course: "CS403 - Operating Systems", dueDate: "2026-08-28", submittedCount: 15, totalCount: 40, status: "Open" },
  ],
  announcements: [
    { id: "ann-1", title: "Semester 4 Mid-Term Exam Timetable Released", content: "Mid-term evaluations begin from September 5th. All lab submissions must be finalized prior.", date: "2026-08-17", author: "HOD CSE Office", category: "Exam" },
    { id: "ann-2", title: "Guest Lecture: AI & Large Language Models in Software Engineering", content: "Dr. Vikram Sethi from Google AI will speak at Main Auditorium this Thursday at 3 PM.", date: "2026-08-16", author: "Prof. Rajesh Sharma", category: "Event" },
  ],
  messages: [
    { id: "msg-1", studentName: "Alex Rivera", rollNo: "22CSE0104", subject: "Clarification on AVL Tree Assignment #3", preview: "Respected Professor, could you please clarify if rotation balancing requires double rotation code?", time: "10 mins ago", unread: true },
    { id: "msg-2", studentName: "Priya Patel", rollNo: "22CSE0112", subject: "Office Hours Appointment Request", preview: "Sir, I would like to discuss my project report on Friday during office hours.", time: "2 hours ago", unread: true },
    { id: "msg-3", studentName: "Rohan Verma", rollNo: "22CSE0145", subject: "Attendance Shortage Explanation", preview: "Respected Sir, I missed classes last week due to university athletics championship representing college.", time: "Yesterday", unread: false },
  ],
  alerts: [
    { id: "alt-1", type: "low_attendance", studentName: "Karan Singh", rollNo: "22CSE0188", course: "CS401", attendancePercentage: 68.5, message: "Attendance below 75% threshold (68.5%). Requires warning notice." },
    { id: "alt-2", type: "low_attendance", studentName: "Sneha Reddy", rollNo: "22CSE0192", course: "CS402", attendancePercentage: 71.0, message: "Attendance below 75% threshold (71.0%). Medical certificate pending." },
    { id: "alt-3", type: "deadline", title: "Lab Assessment Marks Submission", dueDate: "Tomorrow at 5:00 PM", message: "Internal continuous evaluation marks deadline for Semester 4." },
  ],
  studentsRoster: [
    { id: "st-1", rollNo: "22CSE0104", name: "Alex Rivera", email: "student@edureach.edu", attendance: 92.5, cgpa: 8.95, status: "Good" },
    { id: "st-2", rollNo: "22CSE0112", name: "Priya Patel", email: "priya@edureach.edu", attendance: 88.0, cgpa: 8.70, status: "Good" },
    { id: "st-3", rollNo: "22CSE0145", name: "Rohan Verma", email: "rohan@edureach.edu", attendance: 81.2, cgpa: 7.90, status: "Good" },
    { id: "st-4", rollNo: "22CSE0188", name: "Karan Singh", email: "karan@edureach.edu", attendance: 68.5, cgpa: 6.80, status: "At Risk" },
    { id: "st-5", rollNo: "22CSE0192", name: "Sneha Reddy", email: "sneha@edureach.edu", attendance: 71.0, cgpa: 7.40, status: "At Risk" },
    { id: "st-6", rollNo: "22CSE0199", name: "Ananya Gupta", email: "ananya@edureach.edu", attendance: 95.0, cgpa: 9.30, status: "Excellent" },
  ],
};

// GET /api/faculty/dashboard-data
export const getFacultyDashboardData = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: MOCK_FACULTY_DATA,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/faculty/ai-assist
export const facultyAIAssist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskType, promptText, courseName } = req.body;

    let generatedContent = "";
    if (taskType === "assignment") {
      generatedContent = `### Generated Assignment Problem Set for ${courseName || "Computer Science"}

**Problem 1: Algorithm Complexity Analysis**
Analyze the time complexity of the following recursive function using the Master Theorem:
\`\`\`cpp
int findSubsets(int arr[], int n) {
    if (n <= 1) return 1;
    return 2 * findSubsets(arr, n - 1) + n;
}
\`\`\`

**Problem 2: Data Structure Implementation**
Implement an AVL tree in Python/C++ with self-balancing methods (\`rotateLeft\` and \`rotateRight\`). Include edge-case test suite for double rotation scenarios (LR & RL).

**Problem 3: Real-World Case Study**
Explain how B+ Trees are utilized in modern relational database index structures (e.g. InnoDB storage engine). Compare index lookup performance against Hash indexing for range queries.`;
    } else if (taskType === "syllabus") {
      generatedContent = `### Course Syllabus & Lesson Plan — ${courseName || "Data Structures & Algorithms"}

- **Week 1-2**: Linear Data Structures (Arrays, Linked Lists, Doubly Linked Lists) & Memory Management.
- **Week 3-4**: Stacks, Queues, Deques & Applications (Expression Evaluation, Backtracking).
- **Week 5-6**: Non-linear Data Structures: Binary Trees, BSTs, AVL Trees, Heap Sort.
- **Week 7-8**: Graph Algorithms: BFS, DFS, Dijkstra's Shortest Path, Minimum Spanning Trees (Kruskal/Prim).
- **Week 9-10**: Advanced Dynamic Programming, Greedy Strategy, & NP-Completeness Overview.`;
    } else {
      generatedContent = `### Faculty AI Recommendation for ${courseName || "Class"}

1. **Student Engagement Tip**: Incorporate live coding polls during the upcoming lecture on ${promptText || "Operating System Deadlocks"}.
2. **Attendance Notice**: 4 students currently fall below the 75% threshold. Automated warning notices can be issued via the Alert panel.
3. **Assessment Suggestion**: Conduct a 10-minute pop quiz next Wednesday to reinforce conceptual understanding.`;
    }

    res.status(200).json({
      success: true,
      data: { result: generatedContent },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/faculty/evaluate-assignment
export const evaluateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentName, assignmentTitle } = req.body;

    const evaluation = {
      studentName: studentName || "Alex Rivera (22CSE0104)",
      assignmentTitle: assignmentTitle || "Binary Search Trees & AVL Tree Implementation",
      summary: "The student successfully implemented the core BST operations (Insert, Delete, In-order Traversal) and single rotation logic (Left-Rotate and Right-Rotate) in C++. Code is clean and well-structured.",
      missingSections: [
        "Omitted Double Rotation edge-case handling (Left-Right and Right-Left balance factors).",
        "Missing asymptotic time complexity proof for tree height rebalancing in the written report.",
      ],
      suggestedMarks: {
        score: 91,
        maxScore: 100,
        breakdown: [
          { criteria: "Algorithmic Correctness", awarded: 45, max: 50 },
          { criteria: "Code Style & Formatting", awarded: 20, max: 20 },
          { criteria: "Documentation & Analysis", awarded: 14, max: 15 },
          { criteria: "Edge Case Testing", awarded: 12, max: 15 },
        ],
      },
      feedback: "Great work Alex! Your BST traversal and single rotation methods are optimal. To achieve full marks next time, make sure to handle double rotation balance factors (LR/RL) and include time complexity mathematical proofs.",
      plagiarismScore: {
        percentage: 3.8,
        status: "Passed - Low Similarity",
        matches: [
          { source: "GeeksforGeeks Standard Template Header", matchPercentage: 2.1 },
          { source: "Open-source STL Utility Code", matchPercentage: 1.7 },
        ],
      },
      commonMistakes: [
        "Unchecked NULL pointer dereference risk inside balance factor calculation method.",
        "Unreleased heap memory allocation when deleting leaf nodes (minor memory leak).",
      ],
    };

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/faculty/attendance
export const saveAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseCode, date, attendanceRecords } = req.body;
    res.status(200).json({
      success: true,
      message: `Attendance updated for ${courseCode || "CS401"} on ${date || new Date().toISOString().split("T")[0]}`,
      data: { count: attendanceRecords?.length || 6 },
    });
  } catch (error) {
    next(error);
  }
};
