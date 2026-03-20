from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    student_id = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    moodle_user_id = Column(Integer, nullable=True)
    courses = Column(String, nullable=False)  # stored as comma-separated IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())