
import { useEffect, useState } from "react";
import { UserRound, CalendarCheck, Ticket, Save } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });

  useEffect(() => {
    async function loadProfile() {
      try {
        const [userResponse, bookingResponse] = await Promise.all([
          api.get("/users/profile"),
          api.get("/bookings/history"),
        ]);

        const user = userResponse.data;
        const history = Array.isArray(bookingResponse.data)
          ? bookingResponse.data
          : bookingResponse.data.items || [];

        setProfile(user)
        setForm({
          username: user.username || "",
          email: user.email || "",
        });
        setBookings(history);
      } catch (error) {
        toast.error(
          error.response?.status === 401
            ? "Please log in to view your profile"
            : "Could not load profile. Check your backend endpoints."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function changeField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);

    try {
      // Requires a backend endpoint that accepts these editable fields.
      const response = await api.put("/users/profile", form);
      setProfile(response.data);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Profile update endpoint is not available or the input is invalid"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="page-container"><p>Loading profile...</p></main>;
  }

  const pending = bookings.filter(
    (b) => String(b.status || b.booking_status).toUpperCase() === "PENDING"
  ).length;

  return (
    <main className="page-container profile-layout">
      <section className="profile-card">
        <div className="profile-avatar"><UserRound size={35} /></div>
        <h1>My Profile</h1>
        <p className="muted">Manage your SmartEvent account.</p>

        <form onSubmit={saveProfile} className="profile-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={changeField}
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={changeField}
            required
          />

          <button className="primary-button" type="submit" disabled={saving}>
            <Save size={17} />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      <section className="profile-summary">
        <h2>Activity Summary</h2>

        <div className="summary-grid">
          <div className="summary-card">
            <CalendarCheck size={22} />
            <span>Total bookings</span>
            <strong>{bookings.length}</strong>
          </div>
          <div className="summary-card">
            <Ticket size={22} />
            <span>Pending bookings</span>
            <strong>{pending}</strong>
          </div>
        </div>

        <h2>Recent Bookings</h2>
        {bookings.length ? (
          <div className="booking-list">
            {bookings.slice(0, 5).map((booking) => (
              <div className="booking-row" key={booking.id}>
                <div>
                  <strong>Booking #{booking.id}</strong>
                  <p className="muted">
                    {booking.quantity ?? booking.ticket_quantity ?? 0} ticket(s)
                  </p>
                </div>
                <span className="status-badge">
                  {booking.status || booking.booking_status || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Your bookings will appear here.</p>
        )}
      </section>
    </main>
  );
}
