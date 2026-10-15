
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import api from "../api/axios";

export default function LiveUpdates({ eventId }) {
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;

    let active = true;

    api.get(`/events/${eventId}/updates`)
      .then((response) => {
        if (active) {
          const data = response.data;
          setUpdates(Array.isArray(data) ? data : data.items || []);
        }
      })
      .catch(() => {
        if (active) setError("Live announcements are not available yet.");
      });

    return () => { active = false; };
  }, [eventId]);

  return (
    <section className="updates-panel">
      <h3><Megaphone size={20} /> Live Updates</h3>

      {error && <p className="muted">{error}</p>}

      {!error && updates.length === 0 && (
        <p className="muted">No announcements have been posted yet.</p>
      )}

      {updates.map((update) => (
        <article className="update-item" key={update.id}>
          <strong>{update.title || "Event announcement"}</strong>
          <p>{update.message}</p>
          {update.created_at && (
            <small>{new Date(update.created_at).toLocaleString()}</small>
          )}
        </article>
      ))}
    </section>
  );
}
