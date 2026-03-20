"use client";
import { useState } from "react";

const COURSES = [
  { id: "cs101", name: "Introduction to Computer Science" },
  { id: "math201", name: "Calculus II" },
  { id: "eng110", name: "Academic Writing" },
  { id: "phy150", name: "Physics for Engineers" },
  { id: "data301", name: "Data Structures & Algorithms" },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    student_id: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [serverError, setServerError] = useState("");

  const toggleCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.student_id.trim()) e.student_id = "Student ID is required";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (selectedCourses.length === 0) e.courses = "Select at least one course";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, course_ids: selectedCourses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      setSuccess(data);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f4ee" }}>
        <div style={{ background: "white", padding: "48px", borderRadius: "16px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>You're all set, {form.full_name.split(" ")[0]}!</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>Your account has been created and you've been enrolled in your courses on Moodle.</p>
          <div style={{ background: "#f7f4ee", borderRadius: "12px", padding: "20px", textAlign: "left", marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", color: "#999", marginBottom: "12px" }}>Enrolled Courses</p>
            {success.enrolled_courses.map((c: string) => (
              <p key={c} style={{ fontSize: "14px", color: "#333", marginBottom: "6px" }}>✅ {c}</p>
            ))}
          </div>
          <p style={{ fontSize: "13px", color: "#999" }}>Check your email for Moodle login credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ee", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px", maxWidth: "520px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "4px" }}>Student Registration</h1>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>Register to get instant Moodle access</p>

        {serverError && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "8px", padding: "12px", marginBottom: "20px", color: "#cc0000", fontSize: "14px" }}>
            {serverError}
          </div>
        )}

        {/* Full Name */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle(!!errors.full_name)} placeholder="Jane Doe"
            value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          {errors.full_name && <p style={errorStyle}>{errors.full_name}</p>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Email Address</label>
          <input style={inputStyle(!!errors.email)} placeholder="jane@university.edu" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>

        {/* Student ID */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Student ID</label>
          <input style={inputStyle(!!errors.student_id)} placeholder="STU-2024-XXXX"
            value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
          {errors.student_id && <p style={errorStyle}>{errors.student_id}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle(!!errors.password)} placeholder="Min 8 characters" type="password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Confirm Password</label>
          <input style={inputStyle(!!errors.confirmPassword)} placeholder="Repeat password" type="password"
            value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
        </div>

        {/* Courses */}
        <div style={{ marginBottom: "28px" }}>
          <label style={labelStyle}>Select Courses</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
            {COURSES.map((course) => (
              <button key={course.id} onClick={() => toggleCourse(course.id)}
                style={{
                  padding: "10px 12px", borderRadius: "8px", fontSize: "13px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                  border: selectedCourses.includes(course.id) ? "2px solid #c84b2f" : "2px solid #e0e0e0",
                  background: selectedCourses.includes(course.id) ? "#c84b2f" : "white",
                  color: selectedCourses.includes(course.id) ? "white" : "#333",
                }}>
                {course.name}
              </button>
            ))}
          </div>
          {errors.courses && <p style={errorStyle}>{errors.courses}</p>}
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: "14px", background: loading ? "#ccc" : "#c84b2f", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Registering..." : "Register & Enroll in Moodle →"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: "600",
  textTransform: "uppercase", letterSpacing: "0.05em", color: "#666", marginBottom: "6px"
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%", padding: "11px 14px", borderRadius: "8px", fontSize: "14px",
  border: hasError ? "1.5px solid #cc0000" : "1.5px solid #ddd",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  background: "white", color: "#333"
});

const errorStyle: React.CSSProperties = {
  fontSize: "12px", color: "#cc0000", marginTop: "4px"
};
