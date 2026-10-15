

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_organizer
from ..models import User, Event
from ..schemas import EventCreate, EventUpdate, EventResponse
from app.dependencies import get_current_user
router = APIRouter(prefix="/events", tags=["Events"])


# CREATE EVENT
@router.post("/")
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate the category before inserting into the database
    if not event_data.category:
        raise HTTPException(
            status_code=400,
            detail="Category is required"
        )

    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,  # IMPORTANT: fixes category=None
        location=event_data.location,
        event_date=event_data.event_date,
        price=event_data.price,
        banner_image=getattr(event_data, "banner_image", None),
        total_tickets=event_data.total_tickets,
        available_tickets=event_data.total_tickets,
        event_status="UPCOMING",
        organizer_id=current_user.id,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


# GET ALL EVENTS — FOR THE FRONTEND
@router.get("", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db)):
    return (
        db.query(Event)
        .filter(Event.event_status != "CANCELLED")
        .order_by(Event.event_date.asc())
        .all()
    )


# GET ORGANIZER'S EVENTS
@router.get("/my-events", response_model=list[EventResponse])
def get_my_events(
    db: Session = Depends(get_db),
    organizer: User = Depends(require_organizer),
):
    return (
        db.query(Event)
        .filter(Event.organizer_id == organizer.id)
        .all()
    )


# CANCEL EVENT
@router.patch("/{event_id}/cancel")
def cancel_event(
    event_id: int,
    db: Session = Depends(get_db),
    organizer: User = Depends(require_organizer),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    if event.organizer_id != organizer.id:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own events",
        )

    event.event_status = "CANCELLED"
    db.commit()
    db.refresh(event)

    return {
        "message": "Event cancelled successfully",
        "event_id": event.id,
        "status": event.event_status,
    }
