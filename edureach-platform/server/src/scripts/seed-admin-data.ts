import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import Course from "../models/course.model";
import Assessment from "../models/assessment.model";
import Enrollment from "../models/enrollment.model";
import Resource from "../models/resource.model";
import Announcement from "../models/announcement.model";
import Setting from "../models/setting.model";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edureach_db";

async function seedAdminAndAcademicData() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully to edureach_db!");

    // 1. Ensure Admin Account Exists
    const adminEmail = "admin@edureach.edu";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      admin = await User.create({
        name: "Dr. Catherine Vance (Administrator)",
        email: adminEmail,
        password: hashedPassword,
        phone: "+91 98765 00001",
        role: "admin",
        status: "active",
        isEmailVerified: true,
        department: "University Academic Administration",
        designation: "Chief Academic Administrator",
      });
      console.log("Created Administrator Account: admin@edureach.edu / password123");
    } else {
      admin.role = "admin";
      admin.status = "active";
      admin.isEmailVerified = true;
      await admin.save();
      console.log("Admin account confirmed active: admin@edureach.edu");
    }

    // 2. Ensure Platform Settings Exist
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      await Setting.create({
        key: "edureach_platform_settings",
        institutionName: "EduReach Institute of Technology",
        academicYear: "2026-2027",
        maintenanceMode: false,
        allowStudentRegistration: true,
        allowFacultyRegistration: true,
        emailNotifications: true,
        maxCourseEnrollmentPerStudent: 8,
      });
      console.log("Created initial platform settings.");
    }

    // 3. Ensure Baseline Courses Exist
    const coursesCount = await Course.countDocuments();
    if (coursesCount === 0) {
      const courses = [
        {
          code: "CS101",
          title: "Introduction to Computer Science",
          description: "Fundamental concepts of computing, algorithmic thinking, and modern programming paradigms.",
          department: "Computer Science & Engineering",
          semester: "Semester 1",
          credits: 4,
          maxSeats: 60,
          enrolledCount: 42,
          status: "active",
          isPublished: true,
          instructorName: "Dr. Rajesh Sharma",
          instructorEmail: "sharma@edureach.edu",
        },
        {
          code: "CS201",
          title: "Data Structures & Algorithms",
          description: "Core algorithms, data organization, time/space complexity, and tree/graph operations.",
          department: "Computer Science & Engineering",
          semester: "Semester 3",
          credits: 4,
          maxSeats: 60,
          enrolledCount: 54,
          status: "active",
          isPublished: true,
          instructorName: "Dr. Rajesh Sharma",
          instructorEmail: "sharma@edureach.edu",
        },
        {
          code: "CS301",
          title: "Database Management Systems",
          description: "Relational modeling, SQL, ACID transactions, indexing, and NoSQL architecture with MongoDB.",
          department: "Information Technology",
          semester: "Semester 4",
          credits: 3,
          maxSeats: 50,
          enrolledCount: 38,
          status: "active",
          isPublished: true,
          instructorName: "Dr. Anita Desai",
          instructorEmail: "desai@edureach.edu",
        },
        {
          code: "CS401",
          title: "Artificial Intelligence & Deep Learning",
          description: "Supervised and unsupervised learning, neural network architectures, NLP, and modern generative AI.",
          department: "Artificial Intelligence & Data Science",
          semester: "Semester 6",
          credits: 4,
          maxSeats: 45,
          enrolledCount: 44,
          status: "active",
          isPublished: true,
          instructorName: "Dr. Rajesh Sharma",
          instructorEmail: "sharma@edureach.edu",
        },
        {
          code: "CS501",
          title: "Cloud Computing & DevOps Engineering",
          description: "Containerization with Docker, Kubernetes orchestration, CI/CD pipelines, and cloud native architectures.",
          department: "Computer Science & Engineering",
          semester: "Semester 7",
          credits: 3,
          maxSeats: 50,
          enrolledCount: 31,
          status: "active",
          isPublished: true,
          instructorName: "Dr. Vikram Patel",
          instructorEmail: "patel@edureach.edu",
        },
      ];
      await Course.insertMany(courses);
      console.log(`Seeded ${courses.length} foundational courses.`);
    }

    // 4. Ensure Announcements Exist
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.insertMany([
        {
          title: "Mid-Term Examination Schedule Released",
          content: "The official schedule for Spring 2026 Mid-Term examinations is now accessible under Course Assessments.",
          priority: "urgent",
          targetAudience: "all",
          senderName: "Dr. Catherine Vance (Admin)",
          senderRole: "admin",
          isActive: true,
        },
        {
          title: "Faculty Curriculum Review Meeting",
          content: "All department chairs are requested to submit revised syllabus proposals for next academic cycle by Friday.",
          priority: "normal",
          targetAudience: "faculty",
          senderName: "Dr. Catherine Vance (Admin)",
          senderRole: "admin",
          isActive: true,
        },
        {
          title: "Library Digital Resource Catalog Update",
          content: "Access to IEEE Xplore and Springer digital libraries has been renewed for all enrolled students.",
          priority: "info",
          targetAudience: "students",
          senderName: "Dr. Catherine Vance (Admin)",
          senderRole: "admin",
          isActive: true,
        },
      ]);
      console.log("Seeded platform announcements.");
    }

    // 5. Ensure Sample Resources Exist
    const resourceCount = await Resource.countDocuments();
    if (resourceCount === 0) {
      await Resource.insertMany([
        {
          courseCode: "CS201",
          courseTitle: "Data Structures & Algorithms",
          title: "Unit 1 Lecture Slides: Asymptotic Notation & Recursion",
          unit: "Unit 1",
          type: "ppt",
          fileUrl: "https://edureach-cloud.storage.com/resources/cs201_unit1.pdf",
          fileSize: "4.2 MB",
          uploadedBy: "Dr. Rajesh Sharma (Faculty)",
          isRestricted: false,
        },
        {
          courseCode: "CS201",
          courseTitle: "Data Structures & Algorithms",
          title: "Unit 2 Code Lab: Binary Search Trees & AVL Rotations",
          unit: "Unit 2",
          type: "note",
          fileUrl: "https://edureach-cloud.storage.com/resources/cs201_trees.zip",
          fileSize: "1.8 MB",
          uploadedBy: "Dr. Rajesh Sharma (Faculty)",
          isRestricted: false,
        },
        {
          courseCode: "CS301",
          courseTitle: "Database Management Systems",
          title: "Unit 3 Notes: MongoDB Aggregation Pipelines",
          unit: "Unit 3",
          type: "pdf",
          fileUrl: "https://edureach-cloud.storage.com/resources/cs301_aggregation.pdf",
          fileSize: "2.5 MB",
          uploadedBy: "Dr. Anita Desai (Faculty)",
          isRestricted: false,
        },
      ]);
      console.log("Seeded academic resources.");
    }

    // 6. Ensure Sample Assessments Exist
    const assessmentCount = await Assessment.countDocuments();
    if (assessmentCount === 0) {
      await Assessment.insertMany([
        {
          courseCode: "CS201",
          courseTitle: "Data Structures & Algorithms",
          title: "Quiz 1: Complexity Analysis & Stacks/Queues",
          type: "quiz",
          totalMarks: 25,
          passingMarks: 10,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "active",
          submissionsCount: 48,
          averageScore: 21.4,
          created_by: "sharma@edureach.edu",
        },
        {
          courseCode: "CS301",
          courseTitle: "Database Management Systems",
          title: "Assignment 2: Schema Design & Normalization",
          type: "assignment",
          totalMarks: 50,
          passingMarks: 20,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: "active",
          submissionsCount: 35,
          averageScore: 42.1,
          created_by: "desai@edureach.edu",
        },
        {
          courseCode: "CS401",
          courseTitle: "Artificial Intelligence & Deep Learning",
          title: "Mid-Term Project: CNN Image Classifier",
          type: "lab",
          totalMarks: 100,
          passingMarks: 40,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          status: "active",
          submissionsCount: 40,
          averageScore: 84.6,
          created_by: "sharma@edureach.edu",
        },
      ]);
      console.log("Seeded assessments.");
    }

    // 7. Ensure Sample Enrollments for Students
    const enrollmentCount = await Enrollment.countDocuments();
    if (enrollmentCount === 0) {
      const students = await User.find({ role: "student" }).limit(5);
      const courses = await Course.find().limit(3);
      if (students.length > 0 && courses.length > 0) {
        const enrollments = [];
        for (const st of students) {
          for (const cr of courses) {
            enrollments.push({
              studentId: st._id.toString(),
              studentName: st.name,
              studentEmail: st.email,
              courseId: cr._id.toString(),
              courseCode: cr.code,
              courseTitle: cr.title,
              semester: cr.semester,
              academicYear: "2026-2027",
              status: "active",
              progressPercentage: Math.floor(45 + Math.random() * 50),
              attendancePercentage: Math.floor(75 + Math.random() * 23),
              grade: ["A", "A+", "B+", "B"][Math.floor(Math.random() * 4)],
            });
          }
        }
        await Enrollment.insertMany(enrollments);
        console.log(`Seeded ${enrollments.length} sample enrollments.`);
      }
    }

    console.log("✅ Admin & Academic baseline database seeding complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedAdminAndAcademicData();
