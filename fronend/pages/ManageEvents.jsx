
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    try {
      const { data } = await api.get("/events/my-events");
      setEvents(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Could not load your events"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function cancelEvent(id) {
    if (!window.confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    try {
      await api.patch(`/events/${id}/cancel`);
      toast.success("Event cancelled");
      await loadEvents();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Could not cancel event"
      );
    }
  }

  return (
    <main className="container">
      <div className="page-heading">
        <h1>Manage My Events</h1>
        <Link className="button-link" to="/organizer/create">
          + Create Event
        </Link>
      </div>

      {loading ? (
        <p>Loading your events...</p>
      ) : events.length === 0 ? (
        <div className="panel">You have not created any events.</div>
      ) : (
        <div className="panel table-scroll">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>
                    {event.event_date
                      ? new Date(event.event_date).toLocaleString()
                      : "-"}
                  </td>
                  <td>{event.event_status}</td>
                  <td className="actions">
                    <Link to={`/organizer/events/${event.id}/edit`}>
                      Edit
                    </Link>

                    {event.event_status !== "CANCELLED" && (
                      <button
                        className="danger-button"
                        onClick={() => cancelEvent(event.id)}
                      >
                        Cancel
                      </button>
                    )}

                    <Link to={`/organizer/events/${event.id}/bookings`}>
                      Bookings
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}