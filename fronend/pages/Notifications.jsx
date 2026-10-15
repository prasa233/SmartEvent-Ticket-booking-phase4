
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      const response = await api.get("/notifications/");
      const data = response.data;
      setNotifications(
        Array.isArray(data) ? data : data.items || data.notifications || []
      );
    } catch {
      toast.error("Unable to load notifications. Please sign in.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markRead(item) {
    if (item.is_read) return;

    try {
      // Change this URL if your backend uses a different route.
      await api.patch(`/notifications/${item.id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, is_read: true }
            : notification
        )
      );
      toast.success("Notification marked as read.");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Unable to update notification."
      );
    }
  }

  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">STAY IN THE LOOP</span>
          <h2>Your notifications</h2>
          <p>Booking updates, payment alerts, and event news.</p>
        </div>
        <span className="notification-count">
          <Bell size={17} /> {unread} unread
        </span>
      </div>

      <div className="panel notification-panel">
        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={35} />
            <h3>You're all caught up</h3>
            <p>Your notifications will appear here.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <article
              className={`notification-item ${item.is_read ? "" : "unread"}`}
              key={item.id}
            >
              <div className="notification-icon"><Bell size={20} /></div>
              <div className="notification-copy">
                <div className="notification-title-row">
                  <strong>{item.title}</strong>
                  {!item.is_read && <span className="unread-dot" />}
                </div>
                <p>{item.message}</p>
                <small>
                  {item.notification_type || "SYSTEM"} ·{" "}
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : ""}
                </small>
              </div>

              {!item.is_read && (
                <button
                  className="icon-button"
                  onClick={() => markRead(item)}
                  title="Mark as read"
                  aria-label="Mark as read"
                >
                  <CheckCheck size={19} />
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
