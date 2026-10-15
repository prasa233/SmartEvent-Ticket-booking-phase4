# SmartEvent — Phase 4 README

## Overview
Phase 4 enhances SmartEvent with real-time ticket availability, personalized recommendations, wishlists, live announcements, profile management, advanced search, and an AI chatbot.

## Technology Stack
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** SQLite
- **Frontend:** React, React Router, Axios, CSS
- **Security:** JWT authentication, role-based access control
- **Real-time:** WebSockets or polling
- **AI:** Configurable chatbot service with fallback responses

## Modules

### Module 18: Real-Time Ticket Availability
- Display live ticket counts.
- Prevent overbooking using atomic database transactions.
- Broadcast availability changes.
- Disable booking for sold-out events.

### Module 19: Event Recommendations
- Track viewed events and booking categories.
- Recommend events using category, location, and popularity.
- Display Recommended for You and Trending Events sections.

### Module 20: Wishlist
- Create a wishlist table with `id`, `user_id`, `event_id`, and `created_at`.
- Add, remove, and retrieve saved events.
- Provide bookmark controls and a Wishlist page.
- Enforce user ownership and prevent duplicate entries.

### Module 21: Live Event Updates
- Create an event updates table with `id`, `event_id`, `message`, and `created_at`.
- Allow authorized organizers and admins to publish announcements.
- Display updates on event detail pages.

### Module 22: User Profile
- View and update profile information.
- Display booking summaries.
- Optionally support profile-picture uploads.
- Protect personal information with authentication and ownership validation.

### Module 23: Advanced Search
- Filter events by category, location, price, and date.
- Sort by popularity, price, or date.
- Validate filter inputs and support clearing filters.

### Module 24: AI Chatbot
- Create a `POST /chat` endpoint.
- Support event discovery, FAQs, booking assistance, and navigation.
- Add a floating React chatbot with message history and quick suggestions.
- Protect private booking information and store AI credentials in environment variables.

## Database Requirements
Preserve existing Users, Events, Bookings, Tickets, Payments, Coupons, Reviews, and Notifications tables.

Add:
- `wishlist`
- `event_updates`

**Important:** `Base.metadata.create_all()` does not add missing columns to existing tables. Back up the database and apply appropriate migrations without deleting existing data.

## Security
- JWT authentication for protected endpoints.
- Admin and organizer permission checks.
- Pydantic input validation.
- Ownership checks for profiles, wishlists, and events.
- Atomic booking transactions.
- Secure environment variables and error handling.

## Implementation Order
1. Verify database models and schema.
2. Implement real-time availability and overbooking prevention.
3. Implement wishlist functionality.
4. Implement live event updates.
5. Implement profile management.
6. Implement search and filters.
7. Implement recommendations.
8. Implement the chatbot.
9. Test integration and existing Phase 1–3 features.
10. Run backend tests and `npm run build`.

## Testing Checklist
- [ ] Concurrent bookings cannot oversell tickets.
- [ ] Availability updates correctly.
- [ ] Recommendations and trending events load.
- [ ] Wishlist add/remove/list works securely.
- [ ] Event updates enforce permissions.
- [ ] Profile and booking summary are user-specific.
- [ ] Search filters and sorting work.
- [ ] Chatbot handles requests and service failures.
- [ ] Payments, coupons, reviews, tickets, and notifications still work.
- [ ] FastAPI `/docs` and the React frontend work correctly.

