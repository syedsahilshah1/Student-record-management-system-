"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { dbService, Student, AttendanceRecord } from "@/services/db";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const studentProfile = await dbService.getStudentByEmail(user.email);
        if (studentProfile) {
          setProfile(studentProfile);
          const attData = await dbService.getAttendance(studentProfile.studentId);
          // Sort by date descending
          setAttendance(attData.sort((a, b) => b.date.localeCompare(a.date)));
        }
      } catch (error) {
        console.error("Failed to load student attendance logs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter((a) => a.status === "Present").length;
  const absentClasses = totalClasses - presentClasses;
  const rate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  const filteredAttendance = attendance.filter((a) => {
    return statusFilter === "All" || a.status === statusFilter;
  });

  return (
    <DashboardLayout allowedRole="student">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Title */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            My Attendance Registry
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Review your historical classroom participation records and daily statuses.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading attendance records...
          </div>
        ) : !profile ? (
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>
            ⚠️ Profile registration not found. Please contact the administrator.
          </div>
        ) : (
          <>
            {/* Quick Metrics */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1.5rem"
            }}>
              <div className="glass-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>Total Lectures</span>
                <h4 style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>{totalClasses}</h4>
              </div>

              <div className="glass-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>Present Days</span>
                <h4 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-success)", marginTop: "0.25rem" }}>
                  {presentClasses}
                </h4>
              </div>

              <div className="glass-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>Absent Days</span>
                <h4 style={{ fontSize: "1.75rem", fontWeight: 700, color: absentClasses > 0 ? "var(--color-danger)" : "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {absentClasses}
                </h4>
              </div>

              <div className="glass-panel" style={{ padding: "1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>Attendance Rate</span>
                <h4 style={{ fontSize: "1.75rem", fontWeight: 700, color: rate >= 75 ? "var(--color-success)" : "var(--color-danger)", marginTop: "0.25rem" }}>
                  {rate}%
                </h4>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="glass-panel" style={{
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Filter Roster</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["All", "Present", "Absent"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="btn"
                    style={{
                      padding: "0.4rem 1rem",
                      fontSize: "0.8rem",
                      background: statusFilter === status ? "var(--primary)" : "rgba(255,255,255,0.05)",
                      color: "white",
                      border: statusFilter === status ? "none" : "1px solid var(--border-glass)"
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date Logged</th>
                    <th>Course Department</th>
                    <th>Semester Term</th>
                    <th style={{ textAlign: "right" }}>Daily Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                        No records logged.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600 }}>{rec.date}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{profile.department}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{profile.semester} Semester</td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`badge ${rec.status === "Present" ? "badge-student" : "badge-admin"}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
