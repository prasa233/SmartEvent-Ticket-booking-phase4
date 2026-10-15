import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, CalendarDays, Ticket } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import LiveAvailability from "./LiveAvailability";

export default function EventCard({
  event,
  saved = false,
  onWishlistChange,
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [saving, setSaving] = useState(false);

  const id = event.id;
  const price = event.price ?? event.ticket_price ?? 0;
  const available = Number(event.available_tickets ?? 0);

  const cancelled =
    String(event.event_status ?? event.status ?? "").toUpperCase() ===
    "CANCELLED";

  async function toggleWishlist() {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      toast.info("Please log in to save events");
      return;
    }

    setSaving(true);

    try {
      if (isSaved) {
        await api.delete(`/wishlist/${id}`);
        setIsSaved(false);
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/wishlist/${id}`);
        setIsSaved(true);
        toast.success("Event saved to wishlist");
      }

      onWishlistChange?.(id, !isSaved);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Could not update wishlist"
      );
    } finally {
      setSaving(false);
    }
  }

  async function trackView() {
    try {
      await api.post(`/events/${id}/view`);
    } catch {
      // View tracking errors should not prevent navigation.
    }
  }

  return (
    <article className="event-card">
      {event.banner_image ? (
        <img
          className="event-image"
          src={
            event.banner_image.startsWith("http")
              ? event.banner_image
              : `http://127.0.0.1:8000${event.banner_image}`
          }
          alt={event.title || "SmartEvent"}
          loading="lazy"
        />
      ) : (
        <div className="event-image image-placeholder">
          <CalendarDays size={42} />
          <span>SmartEvent</span>
        </div>
      )}

      <div className="event-card-body">
        <div className="event-card-top">
          <span className="category-badge">
            {event.category || "Event"}
          </span>

          <button
            type="button"
            className={`icon-button ${isSaved ? "saved" : ""}`}
            onClick={toggleWishlist}
            disabled={saving}
            aria-label={
              isSaved ? "Remove from wishlist" : "Save event"
            }
            title={isSaved ? "Remove from wishlist" : "Save event"}
          >
            <Heart
              size={19}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>

        <h3>{event.title || "Untitled event"}</h3>

        <p className="event-description">
          {event.description || "Discover this event on SmartEvent."}
        </p>

        <div className="event-meta">
          <span>
            <MapPin size={16} />
            {event.location || "Location to be announced"}
          </span>

          <span>
            <CalendarDays size={16} />
            {event.event_date
              ? new Date(event.event_date).toLocaleDateString()
              : "Date to be announced"}
          </span>
        </div>

        <LiveAvailability
          eventId={id}
          initialCount={available}
        />

        <div className="event-card-footer">
          <div className="event-price">
            <small>Ticket price</small>
            <strong>
              ₹{Number(price).toLocaleString("en-IN")}
            </strong>
          </div>

          <Link
            className={`primary-button ${
              available < 1 || cancelled ? "disabled-link" : ""
            }`}
            to={`/events/${id}`}
            onClick={trackView}
            aria-disabled={available < 1 || cancelled}
            onKeyDown={(e) => {
              if (
                (available < 1 || cancelled) &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault();
              }
            }}
          >
            <Ticket size={16} />
            {cancelled
              ? "Cancelled"
              : available < 1
                ? "Sold out"
                : "View event"}
          </Link>
        </div>
      </div>
    </article>
  );
}