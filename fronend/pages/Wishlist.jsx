
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import EventCard from "../components/EventCard";

export default function Wishlist() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/wishlist/s");
      const data = response.data;
      const items = Array.isArray(data) ? data : data.items || data.events || [];

      // Supports APIs returning either event objects or wishlist rows.
      const normalized = items.map((item) => item.event || item);
      setEvents(normalized);
    } catch (error) {
      toast.error(
        error.response?.status === 401
          ? "Please log in to view your wishlist"
          : error.response?.data?.detail || "Could not load wishlist"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  function handleWishlistChange(eventId, isSaved) {
    if (!isSaved) {
      setEvents((current) => current.filter((event) => event.id !== eventId));
    }
  }

  return (
    <main className="page-container">
      <div className="page-title">
        <p className="eyebrow">YOUR COLLECTION</p>
        <h1><Heart className="inline-icon" /> My Wishlist</h1>
        <p>Save events now and come back when you're ready to book.</p>
      </div>

      {loading ? (
        <p>Loading your saved events...</p>
      ) : events.length ? (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              saved
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state large-empty">
          <Heart size={36} />
          <h2>Your wishlist is empty</h2>
          <p>Browse events and tap the heart icon to save your favorites.</p>
          <Link className="primary-button" to="/events">Explore events</Link>
        </div>
      )}
    </main>
  );
}
