
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../services/api";

export default function OrganizerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/organizer/analytics")
      .then(({ data }) => setAnalytics(data))
      .catch((error) => {
        toast.error(
          error.response?.data?.detail ||
          "Could not load organizer analytics"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="container">Loading dashboard...</main>;
  }

  if (!analytics) {
    return (
      <main className="container">
        <h1>Organizer Dashboard</h1>
        <p>Analytics could not be loaded. Check the backend endpoint.</p>
      </main>
    );
  }

  const events = analytics.events || [];

  return (
    <main className="container">
      <div className="page-heading">
        <div>
          <h1>Organizer Dashboard</h1>
          <p>Track your events and ticket performance.</p>
        </div>
        <Link className="button-link" to="/organizer/create">
          + Create Event
        </Link>
      </div>

      <section className="stats-grid">
        <StatCard title="My Events" value={analytics.total_events ?? 0} />
        <StatCard title="Tickets Sold" value={analytics.total_tickets_sold ?? 0} />
        <StatCard title="Bookings" value={analytics.total_bookings ?? 0} />
        <StatCard title="Revenue" value={`₹${analytics.total_revenue ?? 0}`} />
      </section>

      <section className="panel chart-panel">
        <h2>Event Ticket Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={events}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tickets_sold" name="Tickets Sold" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <h2>Event Performance</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Sold</th>
                <th>Remaining</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.event_id ?? event.id}>
                  <td>{event.title}</td>
                  <td>{event.tickets_sold ?? 0}</td>
                  <td>{event.remaining_tickets ?? 0}</td>
                  <td>₹{event.revenue ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <article className="panel stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </article>
  );
}