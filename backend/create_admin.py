from app.database import SessionLocal, Base, engine
from app.models import User
from app.auth import hash_password


Base.metadata.create_all(bind=engine)

db = SessionLocal()


admin = db.query(User).filter(
    User.email == "prasanth23@gmail.com"
).first()


if not admin:

    admin = User(
        name="SmartEvent Admin",
        email="admin@smartevent.com",
        password=hash_password("Admin@123"),
        role="ADMIN"
    )

    db.add(admin)
    db.commit()

    print("Admin created successfully")

else:

    print("Admin already exists")


db.close()