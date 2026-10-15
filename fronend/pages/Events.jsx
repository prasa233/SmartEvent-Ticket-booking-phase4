

import { useCallback, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import EventCard from "../components/EventCard";
import RecommendedEvents from "../components/RecommendedEvents";
import TrendingEvents from "../components/TrendingEvents";

const categories = ["All Categories", "Music", "Tech", "Sports", "Business"];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("10000");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const loadEvents = useCallback(async () => {
    setLoading(true);

    const params = {
      sort_by: sortBy,
      limit: 50,
    };

    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (location.trim()) params.location = location.trim();
    if (minPrice !== "") params.min_price = Number(minPrice);
    if (maxPrice !== "") params.max_price = Number(maxPrice);
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    try {
      const response = await api.get("/events/search", { params });
      const data = response.data;
      setEvents(Array.isArray(data) ? data : data.items || data.events || []);
    } catch (error) {
      // Fallback to the existing event list if advanced search is not ready.
      try {
        const fallback = await api.get("/events/");
        const data = fallback.data;
        let items = Array.isArray(data) ? data : data.items || data.events || [];

        if (search) {
          items = items.filter((event) =>
            `${event.title} ${event.description || ""}`
              .toLowerCase()
              .includes(search.toLowerCase())
          );
        }

        if (category) {
          items = items.filter(
            (event) =>
              String(event.category || "").toLowerCase() ===
              category.toLowerCase()
          );
        }

        if (location) {
          items = items.filter((event) =>
            String(event.location || "").toLowerCase()
              .includes(location.toLowerCase())
          );
        }

        items = items.filter((event) => {
          const price = Number(event.price ?? event.ticket_price ?? 0);
          return (
            (minPrice === "" || price >= Number(minPrice)) &&
            (maxPrice === "" || price <= Number(maxPrice))
          );
        });

        if (startDate) {
          items = items.filter(
            (event) => event.event_date && event.event_date.slice(0, 10) >= startDate
          );
        }

        if (endDate) {
          items = items.filter(
            (event) => event.event_date && event.event_date.slice(0, 10) <= endDate
          );
        }

        items.sort((a, b) => {
          if (sortBy === "price") {
            return Number(a.price ?? a.ticket_price ?? 0) -
              Number(b.price ?? b.ticket_price ?? 0);
          }
          if (sortBy === "popularity") {
            return Number(b.booking_count ?? b.popularity ?? 0) -
              Number(a.booking_count ?? a.popularity ?? 0);
          }
          return new Date(a.event_date || 0) - new Date(b.event_date || 0);
        });

        setEvents(items);
      } catch {
        toast.error("Could not load events. Check whether FastAPI is running.");
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }, [search, category, location, minPrice, maxPrice, startDate, endDate, sortBy]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("0");
    setMaxPrice("10000");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">YOUR NEXT EXPERIENCE STARTS HERE</p>
          <h1>Discover events.<br /><span>Make memories.</span></h1>
          <p>
            Find music, technology, sports, and business events with SmartEvent.
          </p>

          <form
            className="hero-search"
            onSubmit={(event) => {
              event.preventDefault();
              loadEvents();
            }}
          >
            <Search size={21} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events by title..."
              aria-label="Search events"
            />
            <button type="submit" className="primary-button">Search</button>
          </form>
        </div>
      </section>

      <div className="page-container">
        <RecommendedEvents />
        <TrendingEvents />

        <section className="section" id="all-events">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT EVENT</p>
              <h2>Explore All Events</h2>
              <p>Filter events to find the right experience for you.</p>
            </div>
          </div>

          <form
            className="filter-panel"
            onSubmit={(event) => {
              event.preventDefault();
              loadEvents();
            }}
          >
            <div className="filter-heading">
              <SlidersHorizontal size={19} />
              <strong>Smart Filters</strong>
              <button type="button" className="text-button" onClick={resetFilters}>
                Reset filters
              </button>
            </div>

            <div className="filter-grid">
              <label>
                Category
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((item) => (
                    <option key={item} value={item === "All Categories" ? "" : item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hyderabad"
                />
              </label>

              <label>
                Minimum price (₹)
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </label>

              <label>
                Maximum price (₹)
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </label>

              <label>
                From date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>

              <label>
                To date
                <input
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>

              <label>
                Sort by
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date">Event date</option>
                  <option value="price">Price: low to high</option>
                  <option value="popularity">Popularity</option>
                </select>
              </label>

              <div className="filter-action">
                <button className="primary-button" type="submit">Apply filters</button>
              </div>
            </div>
          </form>

          {loading ? (
            <p className="loading-text">Finding events for you...</p>
          ) : events.length ? (
            <>
              <p className="result-count">{events.length} event(s) found</p>
              <div className="event-grid">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Search size={34} />
              <h3>No events found</h3>
              <p>Try a different search or reset your filters.</p>
              <button className="primary-button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
