import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Check,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type NotificationItem,
} from "../services/notification.service";
import { useAuth } from "../context/AuthContext";
import { getSocket, joinUserRoom } from "../services/socket.service";

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial unread count and notifications on user login
  const fetchCounts = async () => {
    if (!user) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent ignore on initial count
    }
  };

  const fetchFullNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications(1, 15);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCounts();

      // Connect Socket.IO
      const socket = getSocket();
      joinUserRoom(user.id);

      const handleNewNotification = (newNotif: NotificationItem) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [newNotif, ...prev]);
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-maroon`}
          >
            <div className="flex-1 w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-maroon">EduReach Notification</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{newNotif.title}</p>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">{newNotif.message}</p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-3 self-center text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>
        ));
      };

      socket.on("notification:new", handleNewNotification);

      return () => {
        socket.off("notification:new", handleNewNotification);
      };
    }
  }, [user?.id]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchFullNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notifId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case "admission":
        return <FileText className="w-4 h-4 text-maroon shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-maroon rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-maroon to-maroon-dark text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <h4 className="font-heading font-bold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-white/90 hover:text-white flex items-center gap-1 font-medium underline underline-offset-2"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <div className="w-6 h-6 border-2 border-maroon border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading alerts...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-gray-300" />
                <p className="font-medium text-gray-600">You're all caught up!</p>
                <p className="text-[11px]">No notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  className={`p-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-start gap-3 ${
                    !notif.isRead ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="mt-0.5">{getTypeIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Unread" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100/60 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {notif.actionUrl && (
                          <Link
                            to={notif.actionUrl}
                            onClick={() => setIsOpen(false)}
                            className="text-maroon font-semibold hover:underline flex items-center gap-0.5"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                            className="hover:text-gray-700 flex items-center gap-0.5"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" /> Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs text-maroon font-bold hover:underline inline-flex items-center gap-1"
            >
              Open Student Portal & Applications <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

