
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import EventCard from "./EventCard";

export default function RecommendedEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await api.get("/recommendations");
        const data = response.data;
        const items = Array.isArray(data) ? data : data.items || data.events || [];
        if (active) setEvents(items);
      } catch (error) {
        console.error("Recommendations could not be loaded", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  if (loading) return <p className="muted">Loading recommendations...</p>;

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PICKED FOR YOU</p>
          <h2>Recommended for You</h2>
          <p>Discover events based on your interests.</p>
        </div>
        <Link to="/events">Explore all</Link>
      </div>

      {events.length ? (
        <div className="event-grid">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          Recommendations will appear as you explore events.
        </p>
      )}
    </section>
  );
}
