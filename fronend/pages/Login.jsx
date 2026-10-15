
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);

      toast.success("Login successful");

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "ORGANIZER") {
        navigate("/organizer");
      } else {
        navigate("/events");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p>Log in to SmartEvent.</p>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          New to SmartEvent? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}