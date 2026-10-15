
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import api from "../api/axios";
import EventCard from "./EventCard";

export default function TrendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get("/events/trending")
      .then((response) => {
        const data = response.data;
        const items = Array.isArray(data) ? data : data.items || data.events || [];
        if (active) setEvents(items);
      })
      .catch((error) => {
        console.error("Trending events could not be loaded", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">POPULAR RIGHT NOW</p>
          <h2><Flame size={24} className="inline-icon" /> Trending Events</h2>
          <p>See what people are booking and exploring.</p>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading trending events...</p>
      ) : events.length ? (
        <div className="event-grid">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No trending events to show yet.</p>
      )}
    </section>
  );
}
