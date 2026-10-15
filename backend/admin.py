

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import User, Event, EventUpdate

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# Request schema for event announcements
class EventUpdateCreate(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


# Allow only admins and organizers to publish announcements
def require_privileged(user: User):
    role = str(user.role).upper()

    if role not in ("ADMIN", "ORGANIZER"):
        raise HTTPException(
            status_code=403,
            detail="Only admins and organizers can publish announcements",
        )


# Promote a user to organizer (admin only)
@router.put("/users/{user_id}/make-organizer")
def make_organizer(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.role = "ORGANIZER"
    db.commit()
    db.refresh(user)

    return {
        "message": "User promoted to organizer successfully",
        "user_id": user.id,
        "name": user.name,
        "role": user.role,
    }


# Publish an event announcement
@router.post("/events/{event_id}/updates")
def create_event_update(
    event_id: int,
    data: EventUpdateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_privileged(user)

    event = db.query(Event).filter(Event.id == event_id).first()

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    # Organizers can publish announcements only for their own events.
    if str(user.role).upper() == "ORGANIZER":
        owner_id = getattr(event, "organizer_id", None)

        if owner_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own events",
            )

    announcement = EventUpdate(
        event_id=event_id,
        message=data.message.strip(),
    )

    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return {
        "message": "Event announcement published",
        "id": announcement.id,
        "event_id": announcement.event_id,
        "announcement": announcement.message,
        "created_at": announcement.created_at,
    }


# Get announcements for an event
@router.get("/events/{event_id}/updates")
def get_event_updates(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    updates = (
        db.query(EventUpdate)
        .filter(EventUpdate.event_id == event_id)
        .order_by(EventUpdate.created_at.desc())
        .all()
    )

    return {
        "event_id": event_id,
        "total": len(updates),
        "items": [
            {
                "id": item.id,
                "message": item.message,
                "created_at": item.created_at,
            }
            for item in updates
        ],
    }
