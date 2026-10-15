from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Wishlist

router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)


@router.get("/")
def get_wishlist(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .all()
    )

    return items