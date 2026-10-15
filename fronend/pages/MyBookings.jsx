
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings/my-bookings")
      .then(({ data }) => {
        setBookings(Array.isArray(data) ? data : data.items || []);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.detail || "Could not load bookings"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container">
      <h1>My Bookings</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="panel">No bookings found.</div>
      ) : (
        <div className="panel table-scroll">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Event</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.event_title || booking.event?.title || booking.event_id}</td>
                  <td>{booking.quantity ?? booking.ticket_count ?? "-"}</td>
                  <td>₹{booking.total_amount ?? booking.amount ?? 0}</td>
                  <td>{booking.status || "UNKNOWN"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}