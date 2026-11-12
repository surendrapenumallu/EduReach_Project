import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "node:http";

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (_origin, callback) => callback(null, true),
      methods: ["GET", "POST", "PATCH", "PUT"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

    // Join room based on role (student, faculty, admin)
    socket.on("join:role", (role: string) => {
      socket.join(`role:${role}`);
      console.log(`[Socket.IO] ${socket.id} joined role:${role}`);
    });

    // Join personal user room
    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.IO] ${socket.id} joined user:${userId}`);
    });

    // Faculty broadcasts announcement to all students
    socket.on("announcement:publish", (payload) => {
      console.log("[Socket.IO] Broadcasting announcement:", payload.title);
      io?.emit("announcement:received", {
        ...payload,
        timestamp: new Date().toISOString(),
      });
    });

    // Low attendance alert
    socket.on("attendance:alert", (payload) => {
      io?.to(`user:${payload.userId}`).emit("attendance:warning", payload);
    });

    socket.on("disconnect", () => {
      console.log(`⚡ [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return io;
};

// Helper notification emitters
export const emitNewApplication = (appData: any) => {
  if (io) {
    io.to("role:admin").emit("application:new", {
      message: `New Admission Application from ${appData.applicationDetails?.fullName || appData.studentName} for ${appData.course}`,
      application: appData,
      timestamp: new Date().toISOString(),
    });
  }
};

export const emitAdminAdmissionAlert = (appData: any) => {
  if (io) {
    io.to("role:admin").emit("admission:new", {
      applicationId: appData.applicationId,
      studentName: appData.applicationDetails?.fullName || appData.studentName,
      course: appData.course,
      session: appData.admissionSession,
      submittedAt: appData.submittedAt || new Date().toISOString(),
      message: `New Application ${appData.applicationId} submitted by ${appData.applicationDetails?.fullName || appData.studentName}`,
    });
  }
};

export const emitStudentNotification = (userId: string, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit("notification:new", notification);
  }
};

export const emitApplicationStatusUpdate = (appData: any) => {
  if (io) {
    io.emit("application:status_updated", {
      id: appData._id,
      applicationId: appData.applicationId,
      status: appData.status,
      studentName: appData.applicationDetails?.fullName || appData.studentName,
      message: `Application for ${appData.applicationDetails?.fullName || appData.studentName} updated to ${appData.status}`,
      timestamp: new Date().toISOString(),
    });

    if (appData.userId) {
      io.to(`user:${appData.userId}`).emit("admission:status_changed", {
        applicationId: appData.applicationId,
        status: appData.status,
        remarks: appData.adminRemarks,
        updatedAt: new Date().toISOString(),
      });
    }
  }
};
