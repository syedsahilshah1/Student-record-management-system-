"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, AttendanceRecord, MarkRecord, Course } from "@/services/db";
import Link from "next/link";

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [stuList, courseList, attList, marksList, teacherList] = await Promise.all([
          dbService.getStudents(),
          dbService.getCourses(),
          dbService.getAttendance(),
          dbService.getMarks(),
          dbService.getTeachers()
        ]);
        setStudents(stuList);
        setCourses(courseList);
        setAttendance(attList);
        setMarks(marksList);
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to load statistics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Calculate statistics
  const totalStudents = students.length;
  const totalCourses = courses.length;

  const avgAttendance = (() => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter((a) => a.status === "Present").length;
    return Math.round((presentCount / attendance.length) * 100);
  })();

  const avgMarks = (() => {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, m) => acc + m.marks, 0);
    return Math.round((sum / marks.length) * 10) / 10;
  })();

  return (
    <DashboardLayout allowedRole="admin">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Title Section */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Admin Dashboard
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Welcome back! Here is a summary of school operations and student performance.
          </p>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Computing stats...
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem"
            }}>
              {/* Stat 1: Total Students */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🎓</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Total Students</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{totalStudents}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>Active Enrollments</span>
              </div>

              {/* Stat 2: Total Teachers */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🧑‍🏫</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Total Teachers</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{teachers.length}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>Faculty Members</span>
              </div>

              {/* Stat 3: Active Courses */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📚</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Active Courses</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{totalCourses}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>Offered Subjects</span>
              </div>

              {/* Stat 4: Avg Attendance */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📅</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Avg Attendance</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{avgAttendance}%</span>
                <span style={{ fontSize: "0.75rem", color: avgAttendance >= 75 ? "var(--color-success)" : "var(--color-danger)" }}>
                  {avgAttendance >= 75 ? "Excellent Turnout" : "Below Threshold"}
                </span>
              </div>

              {/* Stat 5: Avg Class Grade */}
              <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📝</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>System Grade Avg</span>
                <span style={{ fontSize: "2.25rem", fontWeight: 700 }}>{avgMarks}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>Out of 100 points</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              {/* Quick Actions Panel */}
              <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Quick System Actions</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <Link href="/dashboard/admin/students" className="btn btn-primary" style={{ justifyContent: "center" }}>
                    🎓 Manage Students
                  </Link>
                  <Link href="/dashboard/admin/teachers" className="btn btn-secondary" style={{ justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
                    🧑‍🏫 Manage Teachers
                  </Link>
                  <Link href="/dashboard/admin/courses" className="btn btn-secondary" style={{ justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
                    📚 Manage Courses
                  </Link>
                  <Link href="/dashboard/admin/departments" className="btn btn-secondary" style={{ justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
                    🏢 Manage Departments
                  </Link>
                  <Link href="/dashboard/admin/reports" className="btn btn-secondary" style={{ justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
                    📈 Generate Reports Center
                  </Link>
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Recent Enrollments</h3>
                {students.length === 0 ? (
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>No students registered yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {students.slice(-3).reverse().map((stu) => (
                      <div key={stu.studentId} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem 1rem",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-glass)"
                      }}>
                        <div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{stu.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{stu.department} &bull; {stu.semester} Semester</div>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>{stu.studentId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
