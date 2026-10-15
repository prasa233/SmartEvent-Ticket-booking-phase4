
from pydantic import BaseModel, EmailStr, ConfigDict


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None

    model_config = ConfigDict(extra="forbid")
