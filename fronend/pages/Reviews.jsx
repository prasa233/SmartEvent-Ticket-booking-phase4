
import { useState } from "react";

export default function Reviews() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  function submitReview(event) {
    event.preventDefault();

    if (!review.trim()) {
      alert("Please enter your review.");
      return;
    }

    alert(`Review submitted locally with ${rating} star(s).`);
    setReview("");
    setRating(5);
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
      <h1>Event Reviews</h1>
      <p>Share your experience with a SmartEvent event.</p>

      <form onSubmit={submitReview}>
        <label htmlFor="rating">Rating</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <br />
        <br />

        <label htmlFor="review">Your review</label>
        <br />
        <textarea
          id="review"
          rows={5}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your experience..."
          required
          style={{ width: "100%", marginTop: 8, padding: 12 }}
        />

        <br />
        <br />

        <button type="submit">Submit Review</button>
      </form>
    </main>
  );
}
