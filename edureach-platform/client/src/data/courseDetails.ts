export interface SemesterSubject {
  code: string;
  name: string;
  credits: number;
}

export interface FeeBreakdown {
  tuitionFeePerYear: string;
  developmentFeePerYear: string;
  hostelAndMessFeePerYear: string;
  cautionDepositOneTime: string;
  totalAnnualFee: string;
}

export interface CourseDetail {
  id: string;
  title: string;
  degree: string;
  duration: string;
  category: "B.Tech" | "M.Tech" | "MBA";
  highlights: string[];
  eligibility: string[];
  fee: FeeBreakdown;
  averagePackage: string;
  highestPackage: string;
  placementRate: string;
  topRecruiters: string[];
  curriculum: {
    semesters: {
      semNumber: number;
      subjects: SemesterSubject[];
    }[];
  };
}

export const COURSE_DETAILS: Record<string, CourseDetail> = {
  "btech-cse": {
    id: "btech-cse",
    title: "Computer Science & Engineering (CSE)",
    degree: "B.Tech in Computer Science & Engineering",
    duration: "4 Years (8 Semesters)",
    category: "B.Tech",
    highlights: [
      "AI & High-Performance Computing Labs sponsored by NVIDIA & Intel",
      "Hands-on full-stack development, cloud architecture, and cybersecurity",
      "96% placement record with global tech giants",
      "Hackathons, open-source sprints, and industry mentorship programs",
    ],
    eligibility: [
      "Passed 10+2 with Physics, Mathematics, and Chemistry",
      "Minimum 60% aggregate marks in 12th Board Examinations",
      "Valid score in TS EAMCET / JEE Main Entrance Exam",
    ],
    fee: {
      tuitionFeePerYear: "₹1,20,000",
      developmentFeePerYear: "₹15,000",
      hostelAndMessFeePerYear: "₹85,000",
      cautionDepositOneTime: "₹5,000 (Refundable)",
      totalAnnualFee: "₹2,20,000",
    },
    averagePackage: "₹10.2 LPA",
    highestPackage: "₹42.0 LPA",
    placementRate: "96%",
    topRecruiters: ["Google", "Microsoft", "Amazon", "Flipkart", "Razorpay", "TCS Digital"],
    curriculum: {
      semesters: [
        {
          semNumber: 1,
          subjects: [
            { code: "CS101", name: "Programming in C & Data Structures", credits: 4 },
            { code: "MA101", name: "Linear Algebra & Calculus", credits: 4 },
            { code: "PH101", name: "Engineering Physics", credits: 3 },
            { code: "EE101", name: "Basic Electrical Engineering", credits: 3 },
          ],
        },
        {
          semNumber: 2,
          subjects: [
            { code: "CS102", name: "Object-Oriented Programming in C++ & Java", credits: 4 },
            { code: "MA102", name: "Differential Equations & Numerical Methods", credits: 4 },
            { code: "EC101", name: "Digital Logic & Computer Organization", credits: 4 },
            { code: "HS101", name: "Professional Communication & Ethics", credits: 2 },
          ],
        },
        {
          semNumber: 3,
          subjects: [
            { code: "CS201", name: "Advanced Data Structures & Algorithms", credits: 4 },
            { code: "CS202", name: "Database Management Systems (DBMS)", credits: 4 },
            { code: "CS203", name: "Discrete Mathematical Structures", credits: 3 },
            { code: "CS204", name: "Computer Architecture", credits: 3 },
          ],
        },
        {
          semNumber: 4,
          subjects: [
            { code: "CS205", name: "Operating Systems & Systems Programming", credits: 4 },
            { code: "CS206", name: "Computer Networks & Communications", credits: 4 },
            { code: "CS207", name: "Theory of Computation & Automata", credits: 3 },
            { code: "CS208", name: "Software Engineering & Agile Methodologies", credits: 3 },
          ],
        },
      ],
    },
  },
  "btech-aids": {
    id: "btech-aids",
    title: "Artificial Intelligence & Data Science (AI & DS)",
    degree: "B.Tech in Artificial Intelligence & Data Science",
    duration: "4 Years (8 Semesters)",
    category: "B.Tech",
    highlights: [
      "Specialized GPU Deep Learning Workstations & LLM Sandbox",
      "Curriculum aligned with Deep Learning, Generative AI, and Big Data Analytics",
      "Highest placement average among engineering branches (₹11.5 LPA)",
      "Industry capstone projects supervised by industry AI researchers",
    ],
    eligibility: [
      "Passed 10+2 with Physics, Mathematics, and Chemistry",
      "Minimum 65% aggregate in 12th Board",
      "Rank in TS EAMCET / JEE Main",
    ],
    fee: {
      tuitionFeePerYear: "₹1,35,000",
      developmentFeePerYear: "₹15,000",
      hostelAndMessFeePerYear: "₹85,000",
      cautionDepositOneTime: "₹5,000 (Refundable)",
      totalAnnualFee: "₹2,35,000",
    },
    averagePackage: "₹11.5 LPA",
    highestPackage: "₹38.0 LPA",
    placementRate: "94%",
    topRecruiters: ["Microsoft", "Google", "Amazon AI", "Zerodha", "PhonePe", "Deloitte"],
    curriculum: {
      semesters: [
        {
          semNumber: 1,
          subjects: [
            { code: "AI101", name: "Python for Data Science & AI", credits: 4 },
            { code: "MA101", name: "Calculus & Linear Algebra for Machine Learning", credits: 4 },
            { code: "PH101", name: "Applied Physics", credits: 3 },
            { code: "EE101", name: "Basic Electronics", credits: 3 },
          ],
        },
        {
          semNumber: 2,
          subjects: [
            { code: "AI102", name: "Data Structures & Algorithm Design", credits: 4 },
            { code: "MA102", name: "Probability & Inferential Statistics", credits: 4 },
            { code: "AI103", name: "Database Engineering & SQL/NoSQL", credits: 4 },
            { code: "HS101", name: "Technical Writing & Seminar", credits: 2 },
          ],
        },
        {
          semNumber: 3,
          subjects: [
            { code: "AI201", name: "Machine Learning Foundations", credits: 4 },
            { code: "AI202", name: "Data Mining & Data Warehousing", credits: 4 },
            { code: "AI203", name: "Statistical Modeling & R Programming", credits: 3 },
            { code: "CS204", name: "Operating Systems", credits: 3 },
          ],
        },
        {
          semNumber: 4,
          subjects: [
            { code: "AI204", name: "Deep Learning & Neural Networks (TensorFlow/PyTorch)", credits: 4 },
            { code: "AI205", name: "Natural Language Processing (NLP) & LLMs", credits: 4 },
            { code: "AI206", name: "Big Data Systems (Hadoop & Spark)", credits: 3 },
            { code: "AI207", name: "Computer Vision & Pattern Recognition", credits: 3 },
          ],
        },
      ],
    },
  },
  "btech-ece": {
    id: "btech-ece",
    title: "Electronics & Communication Engineering (ECE)",
    degree: "B.Tech in Electronics & Communication Engineering",
    duration: "4 Years (8 Semesters)",
    category: "B.Tech",
    highlights: [
      "State-of-the-art VLSI Design Lab & Embedded Systems Center",
      "IoT research cell & Robotics Innovation Hub",
      "Strong placement record in semiconductor giants and core engineering",
    ],
    eligibility: [
      "Passed 10+2 with Physics, Mathematics, and Chemistry",
      "Minimum 60% aggregate in 12th Board",
      "Score in TS EAMCET / JEE Main",
    ],
    fee: {
      tuitionFeePerYear: "₹1,10,000",
      developmentFeePerYear: "₹15,000",
      hostelAndMessFeePerYear: "₹85,000",
      cautionDepositOneTime: "₹5,000 (Refundable)",
      totalAnnualFee: "₹2,10,000",
    },
    averagePackage: "₹7.2 LPA",
    highestPackage: "₹26.0 LPA",
    placementRate: "90%",
    topRecruiters: ["Intel", "Qualcomm", "Bosch", "Siemens", "TCS", "Wipro"],
    curriculum: {
      semesters: [
        {
          semNumber: 1,
          subjects: [
            { code: "EC101", name: "Basic Electronics & Circuits", credits: 4 },
            { code: "MA101", name: "Calculus & Complex Variables", credits: 4 },
            { code: "CH101", name: "Engineering Chemistry", credits: 3 },
            { code: "CS101", name: "C Programming", credits: 3 },
          ],
        },
        {
          semNumber: 2,
          subjects: [
            { code: "EC102", name: "Analog Circuits & Operational Amplifiers", credits: 4 },
            { code: "EC103", name: "Digital System Design & Verilog", credits: 4 },
            { code: "MA102", name: "Signals & Systems", credits: 4 },
            { code: "ME101", name: "Engineering Graphics & CAD", credits: 2 },
          ],
        },
      ],
    },
  },
  "mba": {
    id: "mba",
    title: "Master of Business Administration (MBA)",
    degree: "Master of Business Administration",
    duration: "2 Years (4 Semesters)",
    category: "MBA",
    highlights: [
      "Dual Specializations: Finance, Marketing, HR, IT & Business Analytics",
      "Harvard Business School Case Study Methodology & Live Stock Trading Simulator",
      "100% internship placement with stipend",
      "CEO Speaker Series & Leadership Workshops",
    ],
    eligibility: [
      "Bachelor's Degree in any discipline with minimum 50% aggregate",
      "Valid score in TS ICET / CAT / MAT / XAT Entrance Test",
    ],
    fee: {
      tuitionFeePerYear: "₹1,40,000",
      developmentFeePerYear: "₹20,000",
      hostelAndMessFeePerYear: "₹90,000",
      cautionDepositOneTime: "₹5,000 (Refundable)",
      totalAnnualFee: "₹2,55,000",
    },
    averagePackage: "₹8.0 LPA",
    highestPackage: "₹22.0 LPA",
    placementRate: "93%",
    topRecruiters: ["Deloitte", "EY", "KPMG", "PwC", "HDFC Bank", "ICICI Bank", "Amazon"],
    curriculum: {
      semesters: [
        {
          semNumber: 1,
          subjects: [
            { code: "MB101", name: "Management Process & Organizational Behavior", credits: 4 },
            { code: "MB102", name: "Managerial Economics", credits: 4 },
            { code: "MB103", name: "Financial Accounting & Reporting", credits: 4 },
            { code: "MB104", name: "Marketing Management", credits: 4 },
          ],
        },
        {
          semNumber: 2,
          subjects: [
            { code: "MB201", name: "Financial Management & Capital Markets", credits: 4 },
            { code: "MB202", name: "Human Resource Management", credits: 4 },
            { code: "MB203", name: "Operations Management & Supply Chain", credits: 4 },
            { code: "MB204", name: "Business Analytics & Research Methodology", credits: 4 },
          ],
        },
      ],
    },
  },
};
