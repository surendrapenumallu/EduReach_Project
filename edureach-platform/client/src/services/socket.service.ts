import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const serverUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") || "http://localhost:5050";

    socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("⚡ [Client] Connected to EduReach Socket.IO server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("⚡ [Client] Disconnected from Socket.IO server");
    });

    // Global listener for announcements
    socket.on("announcement:received", (data: any) => {
      toast(
        `📢 College Announcement: ${data.title}\n${data.content || ""}`,
        {
          duration: 6000,
          icon: "📢",
          style: {
            borderRadius: "10px",
            background: "#1e1e2d",
            color: "#fff",
            border: "1px solid #7B1113",
          },
        }
      );
    });
  }

  return socket;
};

export const joinRoleRoom = (role: string) => {
  const s = getSocket();
  s.emit("join:role", role);
};

export const joinUserRoom = (roleOrUserId?: string, maybeUserId?: string) => {
  const s = getSocket();
  if (maybeUserId) {
    if (roleOrUserId) s.emit("join:role", roleOrUserId);
    s.emit("join:user", maybeUserId);
  } else if (roleOrUserId) {
    s.emit("join:user", roleOrUserId);
  }
};
