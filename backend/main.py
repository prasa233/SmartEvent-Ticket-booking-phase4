
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.realtime import availability_manager
from app.database import Base, engine
from app import models

from app.routers import (
    auth,
    events,
    bookings,
    tickets,
    notifications,
    admin,
    profile,
    wishlist,
    phase4,
    payments_extra,
    reviews_extra,
)

app = FastAPI(
    title="SmartEvent API",
    description="Event Discovery and Ticket Booking System",
    version="3.0.0",
)

# Create missing database tables.
# This does not migrate columns in existing tables.
Base.metadata.create_all(bind=engine)

# CORS configuration for the React frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register existing routers.
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(tickets.router, prefix="/tickets")
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(profile.router)
app.include_router(wishlist.router)
app.include_router(phase4.router)

# Register Phase 3 modules.
app.include_router(payments_extra.router)
app.include_router(reviews_extra.router)


@app.get("/")
def root():
    return {
        "message": "SmartEvent API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
