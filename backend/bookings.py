
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, update
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    Booking,
    Event,
    Ticket,
    Notification,
    User,
)
from app.schemas import BookingCreate, BookingOut
from app.websocket_manager import manager


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


async def broadcast_availability(
    db: Session,
    event_id: int,
):
    """Broadcast the committed ticket count to connected clients."""

    available = (
        db.query(Event.available_tickets)
        .filter(Event.id == event_id)
        .scalar()
    )

    if available is None:
        return

    try:
        await manager.broadcast(
            event_id,
            {
                "type": "availability",
                "event_id": event_id,
                "available_tickets": available,
            },
        )
    except Exception as exc:
        # A failed WebSocket must not undo a committed booking.
        print("Availability broadcast failed:", exc)


@router.post("/", response_model=BookingOut)
async def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        # 1. Validate quantity.
        quantity = data.ticket_quantity

        if quantity < 1 or quantity > 10:
            raise HTTPException(
                status_code=400,
                detail="Ticket quantity must be between 1 and 10",
            )

        # 2. Find the event.
        event = (
            db.query(Event)
            .filter(Event.id == data.event_id)
            .first()
        )

        if event is None:
            raise HTTPException(
                status_code=404,
                detail="Event not found",
            )

        if str(event.event_status).upper() == "CANCELLED":
            raise HTTPException(
                status_code=400,
                detail="Event is cancelled",
            )

        # Save these before the atomic update.
        event_id = event.id
        event_title = event.title
        total = round(float(event.price) * quantity, 2)

        # 3. Atomically reserve the tickets.
        # The database condition prevents concurrent requests
        # from reserving more tickets than are available.
        reservation = db.execute(
            update(Event)
            .where(
                Event.id == event_id,
                Event.available_tickets >= quantity,
                func.upper(Event.event_status) != "CANCELLED",
            )
            .values(
                available_tickets=(
                    Event.available_tickets - quantity
                )
            )
            .execution_options(synchronize_session=False)
        )

        if reservation.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Not enough tickets available",
            )

        # 4. Create the pending booking.
        booking = Booking(
            user_id=user.id,
            event_id=event_id,
            quantity=quantity,
            ticket_quantity=quantity,
            total_amount=total,
            total_price=total,
            final_amount=total,
            discount_amount=0.0,
            status="PENDING",
            booking_status="PENDING",
        )

        db.add(booking)
        db.flush()

        # 5. Create the ticket record.
        ticket = Ticket(
            booking_id=booking.id,
            ticket_code=(
                f"TKT-{uuid.uuid4().hex[:12].upper()}"
            ),
            qr_code_url=f"/tickets/{booking.id}/qr",
        )
        db.add(ticket)

        # 6. Notify the user.
        notification = Notification(
            user_id=user.id,
            title="Booking created",
            message=(
                f"Your booking for {event_title} "
                "is awaiting payment."
            ),
            type="BOOKING",
        )
        db.add(notification)

        # 7. Commit the reservation and records together.
        db.commit()
        db.refresh(booking)

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    # 8. Broadcast only after the database commit succeeds.
    await broadcast_availability(db, event_id)

    return booking


@router.get("/history", response_model=list[BookingOut])
def booking_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        # 1. Find a booking owned by the current user.
        booking = (
            db.query(Booking)
            .filter(
                Booking.id == booking_id,
                Booking.user_id == user.id,
            )
            .first()
        )

        if booking is None:
            raise HTTPException(
                status_code=404,
                detail="Booking not found",
            )

        if (
            str(booking.status).upper() == "CANCELLED"
            or str(booking.booking_status).upper() == "CANCELLED"
        ):
            raise HTTPException(
                status_code=400,
                detail="Booking already cancelled",
            )

        if str(booking.status).upper() != "PENDING":
            raise HTTPException(
                status_code=400,
                detail="Only pending bookings can be cancelled",
            )

        event_id = booking.event_id
        quantity = booking.quantity

        # 2. Atomically change the booking status.
        # Only one concurrent cancellation can succeed.
        cancelled = db.execute(
            update(Booking)
            .where(
                Booking.id == booking_id,
                Booking.user_id == user.id,
                func.upper(Booking.status) == "PENDING",
            )
            .values(
                status="CANCELLED",
                booking_status="CANCELLED",
            )
            .execution_options(synchronize_session=False)
        )

        if cancelled.rowcount != 1:
            raise HTTPException(
                status_code=409,
                detail="Booking is no longer pending",
            )

        # 3. Release the reserved tickets in the same transaction.
        released = db.execute(
            update(Event)
            .where(Event.id == event_id)
            .values(
                available_tickets=(
                    Event.available_tickets + quantity
                )
            )
            .execution_options(synchronize_session=False)
        )

        if released.rowcount != 1:
            raise HTTPException(
                status_code=404,
                detail="Event not found",
            )

        # 4. Commit both changes together.
        db.commit()

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise

    # 5. Broadcast the updated count after the commit.
    await broadcast_availability(db, event_id)

    return {
        "message": "Booking cancelled",
        "booking_id": booking_id,
    }
