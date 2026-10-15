

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

export default function LiveAvailability({ eventId, initialCount }) {
  const [available, setAvailable] = useState(initialCount);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setAvailable(initialCount);

    if (!eventId) return;

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/events/${eventId}/availability`
    );

    socket.onopen = () => setConnected(true);

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);

        if (
          Number(data.event_id) === Number(eventId) &&
          data.available_tickets !== undefined
        ) {
          setAvailable(Number(data.available_tickets));
        }
      } catch (error) {
        console.error("Invalid availability update", error);
      }
    };

    socket.onerror = () => setConnected(false);
    socket.onclose = () => setConnected(false);

    return () => socket.close();
  }, [eventId, initialCount]);

  return (
    <div className="availability">
      <Radio size={16} />
      <span>
        {available > 0
          ? `${available} tickets available`
          : "Sold out"}
      </span>
      <span className={`connection-dot ${connected ? "online" : ""}`} />
    </div>
  );
}
