

import { Link, NavLink, useNavigate } from "react-router-dom";
import { CalendarDays, Heart, UserRound, LogOut } from "lucide-react";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/events");
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/events">
        <CalendarDays size={25} />
        <span>SmartEvent</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/events">Discover</NavLink>
        <NavLink to="/wishlist">
          <Heart size={16} /> Wishlist
        </NavLink>
        <NavLink to="/profile">
          <UserRound size={16} /> Profile
        </NavLink>
        <NavLink to="/my-bookings">My Bookings</NavLink>

        {token ? (
          <button className="nav-button" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <Link className="login-link" to="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
