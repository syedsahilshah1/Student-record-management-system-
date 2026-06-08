"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { dbService, Student, AttendanceRecord, MarkRecord } from "@/services/db";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!newPassword || !confirmPassword) {
      setPwdError("Please fill in both fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }

    setUpdatingPwd(true);
    try {
      await changePassword(newPassword);
      setPwdSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdError(err.message || "Failed to change password.");
    } finally {
      setUpdatingPwd(false);
    }
  };

  useEffect(() => {
    async function loadStudentData() {
      if (!user) return;
      setLoading(true);
      try {
        // Find student details by email
        const studentProfile = await dbService.getStudentByEmail(user.email);
        if (studentProfile) {
          setProfile(studentProfile);
          
          // Fetch their attendance and marks
          const [attData, marksData] = await Promise.all([
            dbService.getAttendance(studentProfile.studentId),
            dbService.getMarks(studentProfile.studentId)
          ]);
          setAttendance(attData);
          setMarks(marksData);
        }
      } catch (error) {
        console.error("Failed to load student dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [user]);

  // Calculations
  const totalClasses = attendance.length;
  const attendanceRate = (() => {
    if (totalClasses === 0) return 100;
    const present = attendance.filter((a) => a.status === "Present").length;
    return Math.round((present / totalClasses) * 100);
  })();

  const avgGrade = (() => {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, m) => acc + m.marks, 0);
    return Math.round((sum / marks.length) * 10) / 10;
  })();

  const getGpa = (grade: number) => {
    if (grade >= 90) return 4.0;
    if (grade >= 80) return 3.5;
    if (grade >= 70) return 3.0;
    if (grade >= 60) return 2.5;
    if (grade >= 50) return 2.0;
    return 0.0;
  };

  const cumulativeGpa = (() => {
    if (marks.length === 0) return 0;
    const totalGpa = marks.reduce((acc, m) => acc + getGpa(m.marks), 0);
    return Math.round((totalGpa / marks.length) * 100) / 100;
  })();

  return (
    <DashboardLayout allowedRole="student">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Title */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Student Hub Profile
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            View your enrollment status, attendance history, and grade book results.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading profile...
          </div>
        ) : !profile ? (
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>
            ⚠️ Profile registration not found. Please contact the administrator.
          </div>
        ) : (
          <>
            {/* Profile Info Header */}
            <div className="glass-panel" style={{
              padding: "2rem",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "2rem"
            }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Name</span>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.25rem" }}>{profile.name}</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>{profile.studentId}</span>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Department</span>
                <p style={{ fontSize: "1.1rem", fontWeight: 500, marginTop: "0.25rem" }}>{profile.department}</p>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{profile.semester} Semester</span>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Email Address</span>
                <p style={{ fontSize: "1rem", fontWeight: 500, marginTop: "0.25rem" }}>{profile.email}</p>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Phone: {profile.phone}</span>
              </div>
            </div>

            {/* Performance Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem"
            }}>
              {/* Attendance Card */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📅</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cumulative Attendance</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700, color: attendanceRate >= 75 ? "var(--color-success)" : "var(--color-danger)" }}>
                  {attendanceRate}%
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{totalClasses} Classes Logged</span>
              </div>

              {/* Average Mark Card */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📝</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Subject Average</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{avgGrade}%</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{marks.length} Subjects Evaluated</span>
              </div>

              {/* Cumulative GPA Card */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🏆</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Cumulative GPA</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700, color: "var(--secondary)" }}>{cumulativeGpa} / 4.0</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Based on grade thresholds</span>
              </div>
            </div>

            {/* Password Management */}
            <div className="glass-panel" style={{ padding: "2rem", marginTop: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                Security Settings
              </h3>
              <form onSubmit={handlePasswordChange} style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.5rem",
                alignItems: "end"
              }}>
                <div style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
                  {pwdError && (
                    <div style={{
                      background: "var(--color-danger-bg)",
                      color: "var(--color-danger)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      padding: "0.6rem 1rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      marginBottom: "1rem"
                    }}>
                      ⚠️ {pwdError}
                    </div>
                  )}
                  {pwdSuccess && (
                    <div style={{
                      background: "var(--color-success-bg)",
                      color: "var(--color-success)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      padding: "0.6rem 1rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      marginBottom: "1rem"
                    }}>
                      ✅ {pwdSuccess}
                    </div>
                  )}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="new-pwd">New Password</label>
                  <input
                    id="new-pwd"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="confirm-pwd">Confirm Password</label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }} disabled={updatingPwd}>
                    {updatingPwd ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
