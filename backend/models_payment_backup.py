
from datetime import datetime, timezone
from app.database import Base
from sqlalchemy import (
    Boolean, CheckConstraint, Column, DateTime,
    Float, ForeignKey, Integer, String, Text,
)


def module_utc_now():
    return datetime.now(timezone.utc)


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
    created_at = Column(DateTime, default=module_utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "payment_status IN ('PENDING', 'SUCCESS', 'FAILED')"
        ),
        CheckConstraint("amount >= 0"),
    )


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
    created_at = Column(DateTime, default=module_utc_now, nullable=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    event_id = Column(
        Integer, ForeignKey("events.id"), nullable=False, index=True
    )
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=module_utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5"),
    )