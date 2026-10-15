
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const initialForm = {
  title: "",
  description: "",
  location: "",
  event_date: "",
  price: 0,
  total_tickets: 1,
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        total_tickets: Number(form.total_tickets),
        event_date: new Date(form.event_date).toISOString(),
      };

      await api.post("/events", payload);

      toast.success("Event created successfully");
      navigate("/organizer/events");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Could not create event"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container narrow">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h1>Create Event</h1>

        <label>Event Title</label>
        <input
          name="title"
          value={form.title}
          onChange={updateField}
          minLength={3}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          rows={4}
        />

        <label>Location</label>
        <input
          name="location"
          value={form.location}
          onChange={updateField}
          required
        />

        <label>Date and Time</label>
        <input
          type="datetime-local"
          name="event_date"
          value={form.event_date}
          onChange={updateField}
          required
        />

        <label>Ticket Price (₹)</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={updateField}
          min="0"
          step="0.01"
          required
        />

        <label>Total Tickets</label>
        <input
          type="number"
          name="total_tickets"
          value={form.total_tickets}
          onChange={updateField}
          min="1"
          required
        />

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </main>
  );
}