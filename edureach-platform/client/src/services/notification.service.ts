import API from "./api";

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "admission";
  isRead: boolean;
  relatedApplicationId?: any;
  actionUrl?: string;
  createdAt: string;
}

export const getNotifications = async (page = 1, limit = 20) => {
  const res = await API.get("/notifications", { params: { page, limit } });
  return res.data.data; // { notifications, unreadCount, pagination }
};

export const getUnreadCount = async () => {
  const res = await API.get("/notifications/unread-count");
  return res.data.data.count as number;
};

export const markAsRead = async (notificationId: string) => {
  const res = await API.patch(`/notifications/${notificationId}/read`);
  return res.data.data;
};

export const markAllAsRead = async () => {
  const res = await API.patch("/notifications/read-all");
  return res.data.data;
};

