import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_welcome_email(to_email: str, full_name: str, student_id: str, enrolled_courses: list):
    first_name = full_name.split()[0]
    courses_html = "".join([f"<li style='margin-bottom:8px'>✅ {course}</li>" for course in enrolled_courses])

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #c84b2f;">Welcome to the Student Portal, {first_name}! 🎉</h2>
        <p style="color: #444; font-size: 15px;">Your account has been created and you've been enrolled in the following Moodle courses:</p>
        <ul style="color: #333; font-size: 15px; padding-left: 20px;">
            {courses_html}
        </ul>
        <div style="background: #f7f4ee; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your Student ID</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: 700; color: #333;">{student_id}</p>
        </div>
        <p style="color: #888; font-size: 13px;">Use your Student ID and the password you set to log in to Moodle.</p>
        <p style="color: #888; font-size: 13px;">If you have any issues, contact your university admin.</p>
    </div>
    """

    params = {
        "from": os.getenv("FROM_EMAIL"),
        "to": [os.getenv("TEST_EMAIL", to_email)],
        "subject": f"Welcome {first_name} — You're enrolled in Moodle! 🎓",
        "html": html,
    }

    resend.Emails.send(params)