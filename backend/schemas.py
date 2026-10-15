from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from pydantic import BaseModel



class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class TicketOut(BaseModel):
    id: int
    booking_id: int
    ticket_code: str
    qr_code_url: Optional[str] = None

    class Config:
        from_attributes = True


# =========================
# AUTH
# =========================

# =========================
# AUTH
# =========================

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# =========================
# EVENTS
# =========================

class EventCreate(BaseModel):

    title: str = Field(
        min_length=3,
        max_length=200
    )

    description: str | None = None

    location: str = Field(
        min_length=2,
        max_length=300
    )

    event_date: datetime

    price: float = Field(
        ge=0
    )

    total_tickets: int = Field(
        gt=0
    )
class EventCreate(BaseModel):
    title: str
    description: str
    category: str = Field(
        ...,
        description="Music, Tech, Sports, or Business"
    )
    location: str
    event_date: datetime
    price: float
    total_tickets: int
    banner_image: Optional[str] = None

class EventUpdate(BaseModel):

    title: str | None = None

    description: str | None = None

    location: str | None = None

    event_date: datetime | None = None

    price: float | None = Field(
        default=None,
        ge=0
    )

    total_tickets: int | None = Field(
        default=None,
        gt=0
    )


class EventResponse(BaseModel):

    id: int

    title: str

    description: str | None

    location: str

    event_date: datetime

    price: float

    total_tickets: int

    organizer_id: int

    event_status: str

    class Config:
        from_attributes = True


# =========================
# BOOKING
# =========================

class BookingResponse(BaseModel):

    id: int

    user_id: int

    event_id: int

    quantity: int

    total_amount: float

    status: str

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    event_id: int
    ticket_quantity: int = Field(gt=0, le=10)


class BookingOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    ticket_quantity: int
    total_price: float
    booking_status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
# =========================
# PHASE 4 CHATBOT
# =========================

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=1000,
        description="Message sent by the user",
    )