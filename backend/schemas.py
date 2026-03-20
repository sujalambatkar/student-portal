from pydantic import BaseModel, EmailStr
from typing import List

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    student_id: str
    password: str
    course_ids: List[str]

class RegisterResponse(BaseModel):
    message: str
    student_id: str
    email: str
    enrolled_courses: List[str]
    moodle_user_id: int | None = None