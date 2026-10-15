
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="user")

    events = relationship("Event", back_populates="organizer")
    bookings = relationship("Booking", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class EventView(Base):
    __tablename__ = "event_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_wishlist_user_event"),
    )


class EventUpdate(Base):
    __tablename__ = "event_updates"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    message = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    event_date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    banner_image = Column(String(500), nullable=True)
    total_tickets = Column(Integer, nullable=False, default=0)
    available_tickets = Column(Integer, nullable=False, default=0)
    
    event_status = Column(
    String(30),
    nullable=False,
    default="UPCOMING"
)
    # Connect each event to its organizer
    organizer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    organizer = relationship("User", back_populates="events")
    bookings = relationship("Booking", back_populates="event")
    reviews = relationship("Review", back_populates="event")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)

    quantity = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="PENDING")

    booking_status = Column(String(30), nullable=True, default="PENDING")
    ticket_quantity = Column(Integer, nullable=True)
    total_price = Column(Float, nullable=True)
    final_amount = Column(Float, nullable=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=True)
    discount_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=utc_now, nullable=True)

    user = relationship("User", back_populates="bookings")
    event = relationship("Event", back_populates="bookings")
    ticket = relationship("Ticket", back_populates="booking", uselist=False)
    payments = relationship("Payment", back_populates="booking")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(
        Integer, ForeignKey("bookings.id"), nullable=False, unique=True
    )
    ticket_code = Column(String(100), unique=True, nullable=False)
    qr_code_url = Column(String(500), nullable=True)

    booking = relationship("Booking", back_populates="ticket")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="GENERAL")
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User", back_populates="notifications")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(
        Integer, ForeignKey("bookings.id"), nullable=False, index=True
    )
    payment_method = Column(String(30), nullable=False, default="SIMULATION")
    payment_status = Column(String(20), nullable=False, default="PENDING")
    transaction_id = Column(String(100), unique=True, nullable=True)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "payment_status IN ('PENDING', 'SUCCESS', 'FAILED')"
        ),
        CheckConstraint("amount >= 0"),
    )

    booking = relationship("Booking", back_populates="payments")


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    coupon_code = Column(String(50), unique=True, nullable=False, index=True)
    discount_type = Column(String(20), nullable=False)
    discount_value = Column(Float, nullable=False)
    minimum_booking_amount = Column(Float, nullable=False, default=0)
    expiry_date = Column(DateTime, nullable=False)
    usage_limit = Column(Integer, nullable=False, default=1)
    used_count = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    event_id = Column(
        Integer,
        ForeignKey("events.id"),
        nullable=False,
        index=True
    )
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5"),
    )

    user = relationship("User", back_populates="reviews")
    event = relationship("Event", back_populates="reviews")