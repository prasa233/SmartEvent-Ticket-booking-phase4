
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Clock3, XCircle, Ticket } from "lucide-react";

export default function PaymentConfirmation() {
  const { state } = useLocation();

  const status = String(state?.status || "PENDING").toUpperCase();
  const success = status === "SUCCESS" || status === "SUCCEEDED";
  const failed = status === "FAILED" || status === "CANCELED";

  const Icon = success ? CheckCircle2 : failed ? XCircle : Clock3;

  return (
    <section className="confirmation-wrap">
      <div className="confirmation-card panel">
        <div className={`confirmation-icon ${success ? "success" : failed ? "failed" : "pending"}`}>
          <Icon size={48} />
        </div>

        <span className="eyebrow">PAYMENT UPDATE</span>
        <h1>
          {success ? "Payment successful!" :
           failed ? "Payment failed" :
           "Payment is pending"}
        </h1>

        <p>
          {success
            ? "Your payment was confirmed. Thank you for booking with SmartEvent."
            : failed
            ? "The payment was not completed. Check your payment status before trying again."
            : "Your payment has not yet been confirmed. Please wait for verification."}
        </p>

        {state && (
          <div className="confirmation-details">
            <div><span>Booking ID</span><strong>{state.bookingId ?? "—"}</strong></div>
            <div><span>Transaction ID</span><strong>{state.transactionId ?? "Awaiting confirmation"}</strong></div>
            <div><span>Amount</span><strong>₹{Number(state.amount ?? 0).toFixed(2)}</strong></div>
            <div><span>Status</span><strong>{status}</strong></div>
          </div>
        )}

        <Link className="button-primary confirmation-button" to="/events">
          <Ticket size={17} /> Explore more events
        </Link>
      </div>
    </section>
  );
}
