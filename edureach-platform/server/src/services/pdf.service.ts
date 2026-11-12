import PDFDocument from "pdfkit";
import type { Response } from "express";

export interface HallTicketData {
  ticketNo: string;
  studentName: string;
  rollNo: string;
  department: string;
  semester: string;
  examCenter: string;
  seatNo: string;
  schedule: Array<{
    code: string;
    title: string;
    date: string;
    time: string;
    room: string;
  }>;
}

export interface GradeCardData {
  studentName: string;
  rollNo: string;
  department: string;
  course: string;
  semester: string;
  academicYear: string;
  subjects: Array<{
    code: string;
    name: string;
    internalMarks: number;
    externalMarks: number;
    totalMarks: number;
    grade: string;
    credits: number;
  }>;
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  sgpa: number;
  cgpa: number;
  status: string;
}

export const streamHallTicketPDF = (data: HallTicketData, res: Response): void => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="HallTicket_${data.rollNo || "Exam"}.pdf"`
  );

  doc.pipe(res);

  // University Header Box
  doc.rect(40, 40, 515, 80).fillAndStroke("#7B1113", "#7B1113");
  doc.fillColor("#FFFFFF").fontSize(16).text("EDUREACH COLLEGE OF ENGINEERING & TECHNOLOGY", 50, 52, { align: "center" });
  doc.fontSize(9).text("Approved by AICTE, New Delhi • Affiliated to JNTU Hyderabad • Hyderabad, Telangana", 50, 74, { align: "center" });
  doc.fontSize(11).fillColor("#FBBF24").text("OFFICIAL EXAMINATION HALL TICKET — SPRING 2026", 50, 92, { align: "center" });

  // Candidate Details Table
  doc.fillColor("#1E293B").fontSize(10);
  let y = 140;

  doc.rect(40, y, 515, 75).fillAndStroke("#F8FAFC", "#CBD5E1");
  doc.fillColor("#0F172A").fontSize(9);

  doc.text(`Hall Ticket No: `, 55, y + 12).font("Helvetica-Bold").text(data.ticketNo || "HT-2026-CSE-0104", 130, y + 12);
  doc.font("Helvetica").text(`Student Name: `, 55, y + 30).font("Helvetica-Bold").text(data.studentName || "Alex Rivera", 130, y + 30);
  doc.font("Helvetica").text(`Roll Number: `, 55, y + 48).font("Helvetica-Bold").text(data.rollNo || "22CSE0104", 130, y + 48);

  doc.font("Helvetica").text(`Department: `, 320, y + 12).font("Helvetica-Bold").text(data.department || "Computer Science", 390, y + 12);
  doc.font("Helvetica").text(`Exam Center: `, 320, y + 30).font("Helvetica-Bold").text(data.examCenter || "Main Block Hall A", 390, y + 30);
  doc.font("Helvetica").text(`Seat No: `, 320, y + 48).font("Helvetica-Bold").text(data.seatNo || "A-42", 390, y + 48);

  // Exam Schedule Title
  y = 235;
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#7B1113").text("REGISTERED EXAMINATION SCHEDULE", 40, y);

  // Schedule Table Header
  y += 20;
  doc.rect(40, y, 515, 22).fillAndStroke("#7B1113", "#7B1113");
  doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
  doc.text("CODE", 50, y + 6);
  doc.text("SUBJECT TITLE", 110, y + 6);
  doc.text("DATE", 310, y + 6);
  doc.text("TIME", 390, y + 6);
  doc.text("HALL", 485, y + 6);

  // Rows
  const scheduleItems = data.schedule?.length
    ? data.schedule
    : [
        { code: "CS601", title: "Artificial Intelligence & ML", date: "24-03-2026", time: "10:00 AM - 01:00 PM", room: "Hall 102" },
        { code: "CS602", title: "Cloud Computing & DevOps", date: "27-03-2026", time: "10:00 AM - 01:00 PM", room: "Hall 104" },
        { code: "CS603", title: "Database Systems & MongoDB", date: "30-03-2026", time: "10:00 AM - 01:00 PM", room: "Hall 102" },
        { code: "CS604", title: "Design & Analysis of Algorithms", date: "02-04-2026", time: "10:00 AM - 01:00 PM", room: "Hall 105" },
        { code: "CS605", title: "Web Technologies & React", date: "06-04-2026", time: "10:00 AM - 01:00 PM", room: "Hall 101" },
      ];

  y += 22;
  doc.font("Helvetica").fontSize(8.5).fillColor("#334155");

  scheduleItems.forEach((row, i) => {
    const rowBg = i % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    doc.rect(40, y, 515, 20).fillAndStroke(rowBg, "#E2E8F0");
    doc.fillColor("#0F172A");
    doc.text(row.code, 50, y + 5);
    doc.text(row.title.slice(0, 35), 110, y + 5);
    doc.text(row.date, 310, y + 5);
    doc.text(row.time, 390, y + 5);
    doc.text(row.room, 485, y + 5);
    y += 20;
  });

  // Instructions
  y += 25;
  doc.rect(40, y, 515, 90).fillAndStroke("#FEF3C7", "#FDE68A");
  doc.fillColor("#92400E").font("Helvetica-Bold").fontSize(9).text("IMPORTANT INSTRUCTIONS TO CANDIDATES:", 50, y + 10);
  doc.font("Helvetica").fontSize(7.5).fillColor("#78350F");
  doc.text("1. Candidates must arrive at the examination center at least 30 minutes prior to the scheduled start time.", 50, y + 25);
  doc.text("2. Electronic gadgets, smart watches, mobile phones, and programmable calculators are strictly prohibited.", 50, y + 38);
  doc.text("3. This Hall Ticket must be produced along with the College Photo Identity Card in every session.", 50, y + 51);
  doc.text("4. Minimum mandatory attendance of 75% was verified prior to hall ticket issuance.", 50, y + 64);

  // Signatures
  y += 120;
  doc.font("Helvetica").fontSize(8.5).fillColor("#475569");
  doc.text("_______________________", 60, y);
  doc.text("Candidate's Signature", 70, y + 12);

  doc.text("_______________________", 225, y);
  doc.text("Chief Superintendent", 240, y + 12);

  doc.text("_______________________", 400, y);
  doc.text("Controller of Examinations", 395, y + 12);

  doc.end();
};

export const streamGradeCardPDF = (data: GradeCardData, res: Response): void => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="GradeCard_${data.rollNo || "Result"}.pdf"`
  );

  doc.pipe(res);

  // University Header
  doc.rect(40, 40, 515, 80).fillAndStroke("#1E293B", "#1E293B");
  doc.fillColor("#FFFFFF").fontSize(15).font("Helvetica-Bold").text("EDUREACH COLLEGE OF ENGINEERING & TECHNOLOGY", 50, 52, { align: "center" });
  doc.fontSize(8.5).font("Helvetica").text("Autonomous Institution • Accredited with 'A+' Grade by NAAC • Hyderabad, Telangana", 50, 72, { align: "center" });
  doc.fontSize(10.5).fillColor("#FBBF24").font("Helvetica-Bold").text("OFFICIAL CONSOLIDATED SEMESTER GRADE STATEMENT", 50, 92, { align: "center" });

  let y = 135;
  doc.rect(40, y, 515, 65).fillAndStroke("#F8FAFC", "#CBD5E1");
  doc.fillColor("#0F172A").fontSize(9);

  doc.font("Helvetica").text("Student Name: ", 55, y + 10).font("Helvetica-Bold").text(data.studentName, 135, y + 10);
  doc.font("Helvetica").text("Roll Number: ", 55, y + 26).font("Helvetica-Bold").text(data.rollNo, 135, y + 26);
  doc.font("Helvetica").text("Department: ", 55, y + 42).font("Helvetica-Bold").text(data.department, 135, y + 42);

  doc.font("Helvetica").text("Semester: ", 340, y + 10).font("Helvetica-Bold").text(data.semester, 420, y + 10);
  doc.font("Helvetica").text("Academic Year: ", 340, y + 26).font("Helvetica-Bold").text(data.academicYear || "2025-2026", 420, y + 26);
  doc.font("Helvetica").text("Result Status: ", 340, y + 42).font("Helvetica-Bold").fillColor("#059669").text(data.status || "PASS", 420, y + 42);

  // Grades Table Header
  y = 220;
  doc.rect(40, y, 515, 22).fillAndStroke("#7B1113", "#7B1113");
  doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold");
  doc.text("CODE", 50, y + 6);
  doc.text("COURSE TITLE", 110, y + 6);
  doc.text("CREDITS", 290, y + 6);
  doc.text("INT (40)", 350, y + 6);
  doc.text("EXT (60)", 405, y + 6);
  doc.text("TOT (100)", 460, y + 6);
  doc.text("GRADE", 512, y + 6);

  y += 22;
  doc.font("Helvetica").fontSize(8.5);

  data.subjects.forEach((s, idx) => {
    const bg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    doc.rect(40, y, 515, 20).fillAndStroke(bg, "#E2E8F0");
    doc.fillColor("#0F172A");
    doc.text(s.code, 50, y + 5);
    doc.text(s.name.slice(0, 34), 110, y + 5);
    doc.text(String(s.credits), 305, y + 5);
    doc.text(String(s.internalMarks), 365, y + 5);
    doc.text(String(s.externalMarks), 420, y + 5);
    doc.text(String(s.totalMarks), 475, y + 5);
    doc.font("Helvetica-Bold").text(s.grade, 518, y + 5).font("Helvetica");
    y += 20;
  });

  // Summary Metrics Box
  y += 15;
  doc.rect(40, y, 515, 60).fillAndStroke("#F1F5F9", "#CBD5E1");
  doc.fillColor("#0F172A").fontSize(9);

  doc.font("Helvetica").text("Total Marks Obtained: ", 55, y + 15).font("Helvetica-Bold").text(`${data.totalMarks} / ${data.maxTotalMarks}`, 170, y + 15);
  doc.font("Helvetica").text("Aggregate Percentage: ", 55, y + 33).font("Helvetica-Bold").text(`${data.percentage}%`, 170, y + 33);

  doc.font("Helvetica").text("Semester SGPA: ", 340, y + 15).font("Helvetica-Bold").fillColor("#7B1113").text(String(data.sgpa), 430, y + 15);
  doc.fillColor("#0F172A").font("Helvetica").text("Cumulative CGPA: ", 340, y + 33).font("Helvetica-Bold").fillColor("#7B1113").text(String(data.cgpa), 430, y + 33);

  // Digital Verification seal
  y += 90;
  doc.rect(40, y, 515, 40).fillAndStroke("#EFF6FF", "#BFDBFE");
  doc.fillColor("#1E40AF").font("Helvetica-Bold").fontSize(8.5).text("OFFICIALLY VERIFIED & SECURELY GENERATED BY EDUREACH EXAMINATION DIVISION", 50, y + 10, { align: "center" });
  doc.font("Helvetica").fontSize(7.5).text("This is an authenticated computer-generated grade report. For verification, visit http://localhost:5050/api/results/all", 50, y + 24, { align: "center" });

  doc.end();
};
