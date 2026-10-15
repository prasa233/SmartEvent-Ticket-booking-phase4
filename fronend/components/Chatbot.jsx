
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Chatbot.css";

const suggestions = [
  "Trending events",
  "Suggest music events",
  "My bookings",
  "Help with tickets",
];

const initialMessage = {
  id: 1,
  sender: "bot",
  text: "Hi! Welcome to SmartEvent. I can help you discover events, check bookings, and answer ticket questions.",
};

export default function Chatbot() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, open]);

  async function sendMessage(text = message) {
    const question = text.trim();

    if (!question || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/chat", {
        message: question,
      });

      const data = response.data;

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.reply || "I could not find an answer. Please try again.",
        bookings: data.bookings || [],
        events: data.suggested_events || [],
      };

      setMessages((previous) => [...previous, botMessage]);
    } catch (error) {
      const status = error.response?.status;

      let errorText =
        "Sorry, I could not connect to SmartEvent. Please try again.";

      if (status === 401 || status === 403) {
        errorText =
          "Please log in again to use the SmartEvent assistant.";
      } else if (status === 429) {
        errorText =
          "Too many requests. Please wait a moment and try again.";
      } else if (!error.response) {
        errorText =
          "The backend is unavailable. Check that FastAPI is running.";
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 2,
          sender: "bot",
          text: errorText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(text) {
    if (text === "Trending events") {
      navigate("/events");
      sendMessage("Show me trending events");
      return;
    }

    if (text === "My bookings") {
      navigate("/my-bookings");
      sendMessage("Show my bookings");
      return;
    }

    if (text === "Help with tickets") {
      sendMessage("Help with ticket issues");
      return;
    }

    sendMessage(text);
  }

  function handleEventClick(eventId) {
    navigate(`/events/${eventId}`);
    setOpen(false);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chatbot-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open SmartEvent chatbot"
        >
          <span className="chatbot-launcher-icon">✦</span>
          <span>Ask SmartEvent</span>
        </button>
      )}

      {open && (
        <section
          className="chatbot-window"
          aria-label="SmartEvent assistant"
        >
          <header className="chatbot-header">
            <div>
              <strong>SmartEvent Assistant</strong>
              <div className="chatbot-status">
                Event discovery & support
              </div>
            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((item) => (
              <div key={item.id}>
                <div
                  className={`chatbot-message ${
                    item.sender === "user"
                      ? "chatbot-user"
                      : "chatbot-bot"
                  }`}
                >
                  {item.text}
                </div>

                {item.events?.map((event) => (
                  <button
                    type="button"
                    key={event.id}
                    className="chatbot-event"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <strong>{event.title}</strong>
                    <span>
                      {event.category} · {event.location}
                    </span>
                    <span>
                      {event.price != null
                        ? `₹${event.price}`
                        : ""}
                    </span>
                    <span>View event →</span>
                  </button>
                ))}

                {item.bookings?.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="chatbot-booking"
                  >
                    <strong>
                      {booking.event_title || "Event booking"}
                    </strong>
                    <span>
                      Booking #{booking.booking_id}
                    </span>
                    <span>Status: {booking.status}</span>
                    <span>Tickets: {booking.quantity}</span>
                  </div>
                ))}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message chatbot-bot">
                SmartEvent is thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-suggestions">
            {suggestions.map((item) => (
              <button
                type="button"
                key={item}
                disabled={loading}
                onClick={() => handleSuggestion(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <form
            className="chatbot-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about events or tickets..."
              aria-label="Chat message"
              maxLength={2000}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
            >
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
