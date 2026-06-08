"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, AttendanceRecord } from "@/services/db";

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [stuData, attData] = await Promise.all([
          dbService.getStudents(),
          dbService.getAttendance()
        ]);
        setStudents(stuData);
        setAttendance(attData);
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute student stats
  const studentsWithStats = students.map((stu) => {
    const records = attendance.filter((a) => a.studentId === stu.studentId);
    const total = records.length;
    const present = records.filter((a) => a.status === "Present").length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      ...stu,
      totalRecords: total,
      presentCount: present,
      absentCount: absent,
      attendanceRate: rate
    };
  });

  const filteredStats = studentsWithStats.filter((stu) => {
    const matchesQuery =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || stu.department === deptFilter;
    const matchesSem = semFilter === "All" || stu.semester === semFilter;
    return matchesQuery && matchesDept && matchesSem;
  });

  return (
    <DashboardLayout allowedRole="admin">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Title */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Attendance Records
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Monitor student attendance statistics, filters, and logs.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-panel" style={{
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <div className="input-group" style={{ flex: 2, minWidth: "200px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="att-search">Search Students</label>
            <input
              id="att-search"
              type="text"
              placeholder="Search by Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="att-dept">Department</label>
            <select
              id="att-dept"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Eng">Electrical Eng</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="att-sem">Semester</label>
            <select
              id="att-sem"
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Semesters</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
              <option value="5th">5th</option>
              <option value="6th">6th</option>
              <option value="7th">7th</option>
              <option value="8th">8th</option>
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Aggregating logs...
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th style={{ textAlign: "center" }}>Present</th>
                  <th style={{ textAlign: "center" }}>Absent</th>
                  <th style={{ textAlign: "center" }}>Total Classes</th>
                  <th style={{ textAlign: "right" }}>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stu) => (
                    <tr key={stu.studentId}>
                      <td style={{ fontWeight: 600, color: "var(--primary)" }}>{stu.studentId}</td>
                      <td style={{ fontWeight: 500 }}>{stu.name}</td>
                      <td>{stu.department}</td>
                      <td>{stu.semester}</td>
                      <td style={{ textAlign: "center", color: "var(--color-success)", fontWeight: 600 }}>
                        {stu.presentCount}
                      </td>
                      <td style={{ textAlign: "center", color: stu.absentCount > 0 ? "var(--color-danger)" : "var(--text-muted)", fontWeight: 600 }}>
                        {stu.absentCount}
                      </td>
                      <td style={{ textAlign: "center" }}>{stu.totalRecords}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        <span style={{
                          color: stu.attendanceRate >= 75 ? "var(--color-success)" : "var(--color-danger)",
                          background: stu.attendanceRate >= 75 ? "var(--color-success-bg)" : "var(--color-danger-bg)",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "var(--radius-md)",
                          border: stu.attendanceRate >= 75 ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                        }}>
                          {stu.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
