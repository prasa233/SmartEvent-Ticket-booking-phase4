

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Ticket, ShieldCheck, Tag } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();

  const [event] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedEvent") || "null");
    } catch {
      return null;
    }
  });

  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState(null);
  const [method, setMethod] = useState("SIMULATED");
  const [busy, setBusy] = useState(false);

  if (!event) {
    return (
      <div className="empty-state">
        <Ticket size={40} />
        <h2>No event selected</h2>
        <p>Choose an event before proceeding to checkout.</p>
        <button className="button-primary" onClick={() => navigate("/events")}>
          Explore events
        </button>
      </div>
    );
  }

  const unitPrice = Number(event.ticket_price ?? event.price ?? 0);
  const total = unitPrice * quantity;
  const finalAmount = Math.max(0, total - discount);

  async function applyCoupon() {
    if (!coupon.trim()) {
      toast.error("Enter a coupon code.");
      return;
    }

    try {
      // Expected API contract: POST /coupons/validate
      const response = await api.post("/coupons/validate", {
        coupon_code: coupon.trim(),
        booking_amount: total,
      });

      const data = response.data;
      const value = Number(data.discount_amount ?? 0);

      if (!data.valid || value < 0 || value > total) {
        throw new Error(data.message || "Invalid coupon.");
      }

      setDiscount(value);
      setCouponId(data.coupon_id ?? data.id ?? null);
      toast.success("Coupon applied successfully!");
    } catch (error) {
      setDiscount(0);
      setCouponId(null);
      toast.error(
        error.response?.data?.detail ||
        error.message ||
        "Coupon validation failed."
      );
    }
  }

  async function payNow() {
    if (busy) return;

    if (quantity < 1 || quantity > 10) {
      toast.error("Select between 1 and 10 tickets.");
      return;
    }

    setBusy(true);

    try {
      // Step 1: Create the booking.
      const bookingResponse = await api.post("/bookings/", {
        event_id: event.id,
        quantity,
        ...(couponId ? { coupon_id: couponId } : {}),
      });

      const booking = bookingResponse.data;
      const bookingId = booking.id ?? booking.booking_id;

      if (!bookingId) {
        throw new Error("The booking API did not return a booking ID.");
      }

      // Step 2: Initiate payment for the created booking.
      // Adapt this path and payload to your FastAPI payment router.
      const paymentResponse = await api.post("/payments/", {
        booking_id: bookingId,
        payment_method: method,
      });

      const payment = paymentResponse.data;

      // A Stripe integration should redirect to its returned checkout URL.
      if (payment.checkout_url) {
        window.location.assign(payment.checkout_url);
        return;
      }

      navigate("/payment-confirmation", {
        state: {
          bookingId,
          paymentId: payment.id,
          status: payment.payment_status || payment.status || "PENDING",
          transactionId: payment.transaction_id,
          amount: payment.amount ?? finalAmount,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        error.message ||
        "Unable to complete checkout."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="checkout-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">ALMOST THERE</span>
          <h2>Complete your booking</h2>
          <p>Review your order before proceeding.</p>
        </div>
        <span className="secure-label"><ShieldCheck size={17} /> Secure checkout</span>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main panel">
          <h3><Ticket size={20} /> Booking summary</h3>

          <div className="checkout-event">
            <div className="checkout-event-icon">✦</div>
            <div>
              <span className="category-badge">{event.category}</span>
              <h3>{event.title}</h3>
              <p>{event.location || "Location to be announced"}</p>
              <p>
                {event.event_date
                  ? new Date(event.event_date).toLocaleString()
                  : "Date to be announced"}
              </p>
            </div>
          </div>

          <label className="form-label" htmlFor="quantity">
            Number of tickets
          </label>
          <select
            id="quantity"
            className="form-control"
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setDiscount(0);
              setCouponId(null);
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} ticket{n > 1 ? "s" : ""}</option>
            ))}
          </select>

          <h3 className="subheading"><Tag size={19} /> Apply coupon</h3>
          <div className="coupon-row">
            <input
              className="form-control"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            />
            <button className="button-secondary" onClick={applyCoupon}>
              Apply
            </button>
          </div>

          <h3 className="subheading"><CreditCard size={19} /> Payment method</h3>
          <div className="payment-methods">
            <label className={method === "SIMULATED" ? "method selected" : "method"}>
              <input
                type="radio"
                value="SIMULATED"
                checked={method === "SIMULATED"}
                onChange={(e) => setMethod(e.target.value)}
              />
              <span>Test payment</span>
              <small>Development only</small>
            </label>
            <label className={method === "STRIPE" ? "method selected" : "method"}>
              <input
                type="radio"
                value="STRIPE"
                checked={method === "STRIPE"}
                onChange={(e) => setMethod(e.target.value)}
              />
              <span>Stripe Checkout</span>
              <small>Requires backend integration</small>
            </label>
          </div>

          <p className="notice">
            Test payments are for development only. Production payments must
            be verified by the backend or payment provider.
          </p>
        </div>

        <aside className="panel order-panel">
          <h3>Order total</h3>

          <div className="price-row">
            <span>Ticket price</span>
            <span>₹{unitPrice.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Quantity</span>
            <span>× {quantity}</span>
          </div>
          <div className="price-row">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="price-row discount-row">
            <span>Discount</span>
            <span>− ₹{discount.toFixed(2)}</span>
          </div>

          <div className="price-row grand-total">
            <strong>Total to pay</strong>
            <strong>₹{finalAmount.toFixed(2)}</strong>
          </div>

          <button
            className="button-primary pay-button"
            disabled={busy}
            onClick={payNow}
          >
            {busy ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
          </button>

          <p className="fine-print">
            Your booking and payment status will be shown after the backend
            confirms the transaction.
          </p>
        </aside>
      </div>
    </section>
  );
}
