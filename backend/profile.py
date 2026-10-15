
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Booking
from app.schemas_profile import ProfileUpdate
from app.dependencies import get_current_user


router = APIRouter(prefix="/users", tags=["Profile"])


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    total_bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user.id)
        .count()
    )

    confirmed_bookings = (
        db.query(Booking)
        .filter(
            Booking.user_id == user.id,
            Booking.status.in_(["CONFIRMED", "PAID"]),
        )
        .count()
    )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "booking_summary": {
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
        },
    }


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.name is not None:
        name = data.name.strip()

        if not name:
            raise HTTPException(
                status_code=422,
                detail="Name cannot be empty",
            )

        user.name = name

    if data.email is not None:
        email = str(data.email).strip().lower()

        duplicate = (
            db.query(User)
            .filter(User.email == email, User.id != user.id)
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=409,
                detail="Email already exists",
            )

        user.email = email

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
