import requests
import os
from dotenv import load_dotenv

load_dotenv()

MOODLE_URL = os.getenv("MOODLE_URL")
MOODLE_TOKEN = os.getenv("MOODLE_TOKEN")

def moodle_api(function: str, params: dict):
    url = f"{MOODLE_URL}/webservice/rest/server.php"
    params.update({
        "wstoken": MOODLE_TOKEN,
        "moodlewsrestformat": "json",
        "wsfunction": function,
    })
    response = requests.post(url, data=params)
    return response.json()

def create_moodle_user(full_name: str, email: str, student_id: str, password: str):
    first_name = full_name.split()[0]
    last_name = full_name.split()[-1] if len(full_name.split()) > 1 else "Student"

    result = moodle_api("core_user_create_users", {
        "users[0][username]": student_id.lower(),
        "users[0][password]": password,
        "users[0][firstname]": first_name,
        "users[0][lastname]": last_name,
        "users[0][email]": email,
    })

    if isinstance(result, list) and len(result) > 0:
        return result[0]["id"]
    return None

def enroll_student_in_courses(moodle_user_id: int, course_ids: list):
    params = {}
    for i, course_id in enumerate(course_ids):
        params[f"enrolments[{i}][roleid]"] = 5  # 5 = student role in Moodle
        params[f"enrolments[{i}][userid]"] = moodle_user_id
        params[f"enrolments[{i}][courseid]"] = course_id

    result = moodle_api("enrol_manual_enrol_users", params)
    return result