
import { useState } from "react";
import { Bot, Send, X, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

const suggestions = [
  "Show trending events",
  "Suggest music events this weekend",
  "Show my bookings",
  "How do I book tickets?",
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your SmartEvent assistant. How can I help you?",
    },
  ]);

  async function sendMessage(text = input) {
    const message = text.trim();
    if (!message || sending) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: message },
    ]);
    setInput("");
    setSending(true);

    try {
      const response = await api.post("/chatbot", {
        message,
        history: messages,
      });

      const reply =
        response.data.reply ||
        response.data.response ||
        response.data.message ||
        "I could not find an answer to that question.";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        "The assistant is temporarily unavailable. Please try again.";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: detail },
      ]);

      if (error.response?.status === 401) {
        toast.info("Log in to ask questions about your bookings.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <section className="chat-panel" aria-label="SmartEvent assistant">
          <header className="chat-header">
            <div className="chat-avatar"><Bot size={22} /></div>
            <div>
              <strong>SmartEvent Assistant</strong>
              <small>Event discovery and support</small>
            </div>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </header>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                className={`chat-message ${message.role}`}
                key={`${index}-${message.role}`}
              >
                {message.content}
              </div>
            ))}

            {sending && (
              <div className="chat-message assistant">Thinking...</div>
            )}
          </div>

          <div className="chat-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                disabled={sending}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            className="chat-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about events..."
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </>
  );
}
