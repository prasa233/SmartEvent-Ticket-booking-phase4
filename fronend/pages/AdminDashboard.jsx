
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    setLoading(true);

    api.get("/admin/analytics", {
      params: { days: Number(days) },
    })
      .then(({ data }) => setData(data))
      .catch((error) => {
        toast.error(
          error.response?.data?.detail ||
          "Could not load admin analytics"
        );
      })
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return <main className="container">Loading admin dashboard...</main>;
  }

  if (!data) {
    return (
      <main className="container">
        <h1>Admin Dashboard</h1>
        <p>Analytics are unavailable. Check the backend endpoint.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="page-heading">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform activity and performance.</p>
        </div>

        <select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <section className="stats-grid">
        <Stat title="Registered Users" value={data.total_users ?? 0} />
        <Stat title="Total Events" value={data.total_events ?? 0} />
        <Stat title="Tickets Sold" value={data.total_tickets_sold ?? 0} />
        <Stat title="Bookings" value={data.total_bookings ?? 0} />
        <Stat title="Platform Revenue" value={`₹${data.total_revenue ?? 0}`} />
      </section>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <h2>Daily Ticket Sales</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.daily_sales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="tickets_sold" name="Tickets Sold" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <h2>Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthly_bookings || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="panel">
        <h2>Popular Events</h2>
        <DataTable
          rows={data.popular_events || []}
          columns={[
            ["title", "Event"],
            ["tickets_sold", "Tickets Sold"],
            ["booking_count", "Bookings"],
          ]}
        />
      </section>

      <section className="panel">
        <h2>Top Revenue Events</h2>
        <DataTable
          rows={data.top_revenue_events || []}
          columns={[
            ["title", "Event"],
            ["revenue", "Revenue (₹)"],
          ]}
        />
      </section>
    </main>
  );
}

function Stat({ title, value }) {
  return (
    <article className="panel stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </article>
  );
}

function DataTable({ rows, columns }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns.map(([key, label]) => <th key={key}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.event_id ?? row.id ?? index}>
              {columns.map(([key]) => (
                <td key={key}>
                  {key === "revenue"
                    ? `₹${row[key] ?? 0}`
                    : row[key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}