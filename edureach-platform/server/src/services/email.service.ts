import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Development fallback mock transporter (logs to console)
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
    console.log("ℹ️ [EmailService] SMTP credentials not set. Using dev stream transport (logged to console).");
  }

  return transporter;
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailer = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"EduReach Admissions" <admissions@edureach.edu>`;

    const info = await mailer.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    });

    console.log(`📧 [EmailService] Email sent to ${options.to}: ${options.subject} (MessageId: ${info.messageId || "mock"})`);
    return true;
  } catch (error) {
    console.error("❌ [EmailService] Failed to send email:", error);
    return false;
  }
};

/**
 * Send 6-digit OTP verification email
 */
export const sendOtpEmail = async (email: string, otp: string, purpose: string = "Email Verification"): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #800000 0%, #4a0000 100%); color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
        .otp-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #92400e; margin: 24px 0; }
        .footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>EduReach Platform</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Secure Account Authentication</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a one-time verification code for <strong>${purpose}</strong> on your EduReach account.</p>
          <div class="otp-box">${otp}</div>
          <p style="font-size: 14px; color: #6b7280;">This code is valid for <strong>5 minutes</strong>. For security, never share this OTP with anyone.</p>
          <p style="margin-top: 24px;">Warm regards,<br /><strong>EduReach Admissions Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EduReach College. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `EduReach: Your One-Time Passcode (${otp}) for ${purpose}`,
    html,
    text: `Your EduReach verification OTP is: ${otp}. It will expire in 5 minutes.`,
  });
};

/**
 * Send admission application submission confirmation email
 */
export const sendApplicationConfirmationEmail = async (
  email: string,
  studentName: string,
  applicationId: string,
  course: string,
  session: string = "2024–25"
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #800000 0%, #4a0000 100%); color: #ffffff; padding: 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 28px; color: #374151; line-height: 1.6; }
        .badge { display: inline-block; background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #fdf8f6; border-radius: 8px; overflow: hidden; }
        .info-table td { padding: 12px 16px; border-bottom: 1px solid #fee2e2; font-size: 14px; }
        .info-table td:first-child { font-weight: 600; color: #800000; width: 40%; }
        .footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>EduReach Admissions</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Admission Session ${session}</p>
        </div>
        <div class="content">
          <div class="badge">Application Submitted Successfully</div>
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Congratulations! Your admission application has been received and registered with the EduReach Admissions Directorate.</p>
          
          <table class="info-table">
            <tr>
              <td>Application ID</td>
              <td><strong style="color: #800000; font-size: 16px;">${applicationId}</strong></td>
            </tr>
            <tr>
              <td>Course Applied</td>
              <td>${course}</td>
            </tr>
            <tr>
              <td>Admission Session</td>
              <td>${session}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td><span style="color: #2563eb; font-weight: 600;">Submitted (Under Verification)</span></td>
            </tr>
            <tr>
              <td>Submission Date</td>
              <td>${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #4b5563;">
            You can track the progress of your application and upload any requested supplementary documents anytime by logging into your EduReach Student Portal.
          </p>

          <p style="margin-top: 24px;">Sincerely,<br /><strong>Director of Admissions</strong><br />EduReach College of Engineering & Technology</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EduReach College. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Application Confirmation: ${applicationId} - EduReach Admission Session ${session}`,
    html,
    text: `Dear ${studentName}, your application ${applicationId} for ${course} has been submitted successfully. Track your status on your dashboard.`,
  });
};

/**
 * Send status update email to student
 */
export const sendApplicationStatusUpdateEmail = async (
  email: string,
  studentName: string,
  applicationId: string,
  status: string,
  remarks?: string
): Promise<boolean> => {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    "Under Review": { bg: "#eff6ff", text: "#1e40af", border: "#3b82f6" },
    "Documents Required": { bg: "#fffbeb", text: "#b45309", border: "#f59e0b" },
    "Shortlisted": { bg: "#faf5ff", text: "#6b21a8", border: "#a855f7" },
    "Approved": { bg: "#ecfdf5", text: "#065f46", border: "#10b981" },
    "Rejected": { bg: "#fef2f2", text: "#991b1b", border: "#ef4444" },
  };

  const currentTheme = statusColors[status] || { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #800000 0%, #4a0000 100%); color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 32px 28px; color: #374151; line-height: 1.6; }
        .status-badge { display: inline-block; background: ${currentTheme.bg}; border: 1px solid ${currentTheme.border}; color: ${currentTheme.text}; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 15px; margin: 12px 0 20px 0; }
        .remarks-box { background: #f9fafb; border-left: 4px solid #800000; padding: 14px 16px; margin: 20px 0; font-size: 14px; color: #4b5563; }
        .footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>EduReach Admissions Status Update</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Application ID: ${applicationId}</p>
        </div>
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>There is an official update regarding your admission application:</p>
          
          <div style="text-align: center;">
            <div class="status-badge">${status}</div>
          </div>

          ${
            remarks
              ? `<div class="remarks-box">
                  <strong>Admissions Committee Remarks:</strong><br />
                  ${remarks}
                </div>`
              : ""
          }

          <p style="font-size: 14px; color: #4b5563;">
            Please log in to your EduReach Student Dashboard to review full details${
              status === "Documents Required" ? " and submit the requested documents" : ""
            }.
          </p>

          <p style="margin-top: 24px;">Warm regards,<br /><strong>EduReach Admissions Directorate</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EduReach College. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Status Update: Application ${applicationId} is now ${status}`,
    html,
    text: `Dear ${studentName}, your EduReach admission application ${applicationId} status has been updated to: ${status}. Remarks: ${remarks || "None"}.`,
  });
};
