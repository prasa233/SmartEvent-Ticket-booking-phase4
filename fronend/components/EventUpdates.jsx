
import { useEffect, useState } from "react";
import api from "../services/api";

export default function EventUpdates({ eventId }) {
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUpdates() {
      try {
        const response = await api.get(
          `/events/${eventId}/updates`
        );

        if (active) {
          setUpdates(response.data.items || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError("Unable to load event updates.");
        }
      }
    }

    loadUpdates();

    // Refresh announcements every 15 seconds.
    const intervalId = setInterval(loadUpdates, 15000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [eventId]);

  return (
    <section className="event-updates">
      <h2>Live Updates</h2>

      {error && <p role="alert">{error}</p>}

      {!error && updates.length === 0 && (
        <p>No announcements yet.</p>
      )}

      {updates.map((update) => (
        <article key={update.id} className="event-update-card">
          <p>{update.message}</p>
          <small>
            {new Date(update.created_at).toLocaleString()}
          </small>
        </article>
      ))}
    </section>
  );
}
