import {
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Events from "./pages/Events";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Chatbot from "./components/Chatbot";

import "./App.css";

const navItems = [
  { label: "Events", path: "/events" },
  { label: "Wishlist", path: "/wishlist" },
  { label: "Profile", path: "/profile" },
];

function NotFound() {
  return (
    <section className="page-container">
      <h2>Page not found</h2>
      <p>The page you requested does not exist.</p>
      <NavLink to="/events">Browse events</NavLink>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/events" className="brand">
          SmartEvent
        </NavLink>

        <nav className="main-navigation" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="app-footer">
        SmartEvent — Discover events and book your tickets.
      </footer>

      <Chatbot />
    </div>
  );
}