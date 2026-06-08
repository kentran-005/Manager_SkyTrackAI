"use client";

import { Bell, AlertTriangle, Info, CheckCircle, Clock, Trash2, Check, Plane, XCircle } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: "warning" | "info" | "success" | "error";
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Flight VN220 Delayed",
    desc: "Your flight VN220 from SGN to HAN has been delayed by 15 minutes. New departure time: 10:45. Please check the updated schedule for gate information.",
    time: "5 min ago",
    type: "warning",
    read: false,
  },
  {
    id: 2,
    title: "Gate Change - VJ123",
    desc: "Gate for flight VJ123 has been changed from A5 to B12. Please proceed to the new gate immediately. Current boarding status: Boarding.",
    time: "20 min ago",
    type: "info",
    read: false,
  },
  {
    id: 3,
    title: "Flight QH301 On Time",
    desc: "Good news! Your flight QH301 from HAN to CXR is scheduled on time. Departure at 14:00 from Gate C7. Have a pleasant journey!",
    time: "1 hour ago",
    type: "success",
    read: false,
  },
  {
    id: 4,
    title: "Boarding Reminder",
    desc: "Flight VN220 boarding begins in 30 minutes. Please proceed to gate A3. Remember to have your boarding pass and ID ready.",
    time: "2 hours ago",
    type: "info",
    read: true,
  },
  {
    id: 5,
    title: "Flight Cancelled",
    desc: "We regret to inform you that flight VN512 from HAN to PQC has been cancelled due to severe weather conditions. Please contact our support for rebooking options.",
    time: "3 hours ago",
    type: "error",
    read: true,
  },
  {
    id: 6,
    title: "Price Drop Alert",
    desc: "The flight SGN to DAD you were tracking has dropped by 15%. Book now for the best price! Limited availability on VietJet Air.",
    time: "5 hours ago",
    type: "info",
    read: true,
  },
];

const typeIcons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="udash-page-notif">
      <div className="udash-page-header">
        <div>
          <h1 className="udash-page-title">Notifications</h1>
          <p className="udash-page-sub">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="udash-notif-filters">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                className={`udash-notif-filter ${filter === f ? "udash-notif-filter--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "unread" ? "Unread" : "Read"}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="udash-page-btn" onClick={markAllRead}>
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="udash-notif-list">
        {filteredNotifications.map((notif) => {
          const TypeIcon = typeIcons[notif.type];
          return (
            <div
              key={notif.id}
              className={`udash-notif-full-item ${notif.read ? "udash-notif-full-item--read" : ""}`}
            >
              <div className={`udash-notif-full-icon udash-notif-full-icon--${notif.type}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="udash-notif-full-content">
                <div className="udash-notif-full-top">
                  <h3 className="udash-notif-full-title">{notif.title}</h3>
                  <span className="udash-notif-full-time">
                    <Clock className="w-3 h-3" />
                    {notif.time}
                  </span>
                </div>
                <p className="udash-notif-full-desc">{notif.desc}</p>
              </div>
              <div className="udash-notif-full-actions">
                {!notif.read && (
                  <button
                    className="udash-notif-full-action"
                    onClick={() => markRead(notif.id)}
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="udash-notif-full-action udash-notif-full-action--delete"
                  onClick={() => deleteNotif(notif.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="udash-notif-empty">
          <Bell className="w-12 h-12 text-slate-300" />
          <h3>No notifications</h3>
          <p>
            {filter === "all"
              ? "You're all caught up!"
              : filter === "unread"
              ? "No unread notifications"
              : "No read notifications"}
          </p>
        </div>
      )}
    </div>
  );
}