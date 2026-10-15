
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("Registration successful. Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>

        <label>Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={updateField}
          minLength={2}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={updateField}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={updateField}
          minLength={6}
          required
        />

        <button disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}