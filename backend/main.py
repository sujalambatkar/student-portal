from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, engine
import models, schemas
from moodle import create_moodle_user, enroll_student_in_courses
from mailer import send_welcome_email

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://student-portal-theta-mauve.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COURSES = {
    "cs101": {"name": "Introduction to Computer Science", "moodle_id": 2},
    "math201": {"name": "Calculus II", "moodle_id": 3},
    "eng110": {"name": "Academic Writing", "moodle_id": 4},
    "phy150": {"name": "Physics for Engineers", "moodle_id": 5},
    "data301": {"name": "Data Structures & Algorithms", "moodle_id": 6},
}

@app.get("/")
def root():
    return {"message": "Student Portal API is running!"}

@app.get("/courses")
def get_courses():
    return {"courses": [{"id": k, "name": v["name"]} for k, v in COURSES.items()]}

@app.post("/register", response_model=schemas.RegisterResponse)
def register_student(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.Student).filter(models.Student.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if student ID already exists
    existing_id = db.query(models.Student).filter(models.Student.student_id == data.student_id).first()
    if existing_id:
        raise HTTPException(status_code=400, detail="Student ID already registered")

    # Create Moodle user
    # Create Moodle user (wrapped in try/except so it doesn't crash without real Moodle)
    moodle_user_id = None
    try:
        moodle_user_id = create_moodle_user(
            full_name=data.full_name,
            email=data.email,
            student_id=data.student_id,
            password=data.password,
        )
        if moodle_user_id:
            moodle_course_ids = [COURSES[c]["moodle_id"] for c in data.course_ids if c in COURSES]
            enroll_student_in_courses(moodle_user_id, moodle_course_ids)
    except Exception:
        pass  # Moodle not connected yet, skip for now
    # Save student to our database
    student = models.Student(
        full_name=data.full_name,
        email=data.email,
        student_id=data.student_id,
        password=data.password,
        moodle_user_id=moodle_user_id,
        courses=",".join(data.course_ids),
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    enrolled_names = [COURSES[c]["name"] for c in data.course_ids if c in COURSES]


    # Send welcome email
    try:
        send_welcome_email(
            to_email=data.email,
            full_name=data.full_name,
            student_id=data.student_id,
            enrolled_courses=enrolled_names,
        )
    except Exception as e:
        print(f"Email error: {e}")

    return schemas.RegisterResponse(
        message="Registration successful!",
        student_id=data.student_id,
        email=data.email,
        enrolled_courses=enrolled_names,
        moodle_user_id=moodle_user_id,
    )
