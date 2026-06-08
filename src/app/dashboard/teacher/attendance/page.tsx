"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, AttendanceRecord } from "@/services/db";

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selector States
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSem, setSelectedSem] = useState("6th");
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await dbService.getDepartments();
        setDepartments(depts);
        if (depts.length > 0) {
          setSelectedDept(depts[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDepts();
  }, []);

  // Attendance Dict State: studentId -> "Present" | "Absent"
  const [attendanceDict, setAttendanceDict] = useState<Record<string, "Present" | "Absent">>({});

  // Load students and existing attendance when selectors change
  useEffect(() => {
    async function fetchStudentsAndAttendance() {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // 1. Fetch students
        const allStudents = await dbService.getStudents();
        const filtered = allStudents.filter(
          (s) => s.department === selectedDept && s.semester === selectedSem
        );
        setStudents(filtered);

        // 2. Fetch attendance for selected date
        const allAttendance = await dbService.getAttendance();
        const dateRecords = allAttendance.filter((a) => a.date === selectedDate);
        
        // 3. Map to dict
        const initialDict: Record<string, "Present" | "Absent"> = {};
        
        // Default to "Present" for all filtered students
        filtered.forEach((stu) => {
          initialDict[stu.studentId] = "Present";
        });
        
        // Overwrite with existing records if found
        dateRecords.forEach((rec) => {
          if (initialDict[rec.studentId] !== undefined) {
            initialDict[rec.studentId] = rec.status;
          }
        });

        setAttendanceDict(initialDict);
      } catch (err) {
        console.error("Error loading class records:", err);
        setError("Failed to load student attendance registers.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudentsAndAttendance();
  }, [selectedDate, selectedDept, selectedSem]);

  const handleStatusChange = (studentId: string, status: "Present" | "Absent") => {
    setAttendanceDict((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSelectAll = (status: "Present" | "Absent") => {
    const updated = { ...attendanceDict };
    students.forEach((s) => {
      updated[s.studentId] = status;
    });
    setAttendanceDict(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const recordsToSave = students.map((stu) => ({
        studentId: stu.studentId,
        date: selectedDate,
        status: attendanceDict[stu.studentId] || "Present"
      }));

      if (recordsToSave.length === 0) {
        setError("No students in selected class to record attendance.");
        setSaving(false);
        return;
      }

      await dbService.saveBulkAttendance(recordsToSave);
      setSuccess(`Attendance successfully saved for ${recordsToSave.length} students.`);
    } catch (err: any) {
      setError(err.message || "Failed to submit attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRole="teacher">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Title */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Daily Attendance Register
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Select class specifications to mark daily student presence.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            background: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.95rem"
          }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{
            background: "var(--color-success-bg)",
            color: "var(--color-success)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.95rem"
          }}>
            ✅ {success}
          </div>
        )}

        {/* Filter Selection Panel */}
        <div className="glass-panel" style={{
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="att-date">Register Date</label>
            <input
              id="att-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="class-dept">Department</label>
            <select
              id="class-dept"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="class-sem">Semester Division</label>
            <select
              id="class-sem"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="form-select"
            >
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

        {/* Attendance Marking List */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading student registers...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {students.length > 0 && (
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleSelectAll("Present")}
                  className="btn btn-secondary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  ✔️ Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll("Absent")}
                  className="btn btn-secondary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  ❌ Mark All Absent
                </button>
              </div>
            )}

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th style={{ textAlign: "center", width: "220px" }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                        No enrolled students found matching selected department and semester.
                      </td>
                    </tr>
                  ) : (
                    students.map((stu) => (
                      <tr key={stu.studentId}>
                        <td style={{ fontWeight: 600, color: "var(--primary)" }}>{stu.studentId}</td>
                        <td style={{ fontWeight: 500 }}>{stu.name}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{stu.email}</td>
                        <td>
                          <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem"
                          }}>
                            {/* Present Radio */}
                            <label style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              cursor: "pointer",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "var(--radius-sm)",
                              background: attendanceDict[stu.studentId] === "Present" ? "var(--color-success-bg)" : "transparent",
                              border: attendanceDict[stu.studentId] === "Present" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                              color: attendanceDict[stu.studentId] === "Present" ? "var(--color-success)" : "var(--text-secondary)",
                              transition: "var(--transition-smooth)"
                            }}>
                              <input
                                type="radio"
                                name={`att-${stu.studentId}`}
                                checked={attendanceDict[stu.studentId] === "Present"}
                                onChange={() => handleStatusChange(stu.studentId, "Present")}
                                style={{ accentColor: "var(--color-success)", cursor: "pointer" }}
                              />
                              <span>Present</span>
                            </label>

                            {/* Absent Radio */}
                            <label style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              cursor: "pointer",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "var(--radius-sm)",
                              background: attendanceDict[stu.studentId] === "Absent" ? "var(--color-danger-bg)" : "transparent",
                              border: attendanceDict[stu.studentId] === "Absent" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid transparent",
                              color: attendanceDict[stu.studentId] === "Absent" ? "var(--color-danger)" : "var(--text-secondary)",
                              transition: "var(--transition-smooth)"
                            }}>
                              <input
                                type="radio"
                                name={`att-${stu.studentId}`}
                                checked={attendanceDict[stu.studentId] === "Absent"}
                                onChange={() => handleStatusChange(stu.studentId, "Absent")}
                                style={{ accentColor: "var(--color-danger)", cursor: "pointer" }}
                              />
                              <span>Absent</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {students.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ padding: "0.85rem 2.5rem" }}
                >
                  {saving ? "Saving Registers..." : "Save Daily Attendance"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
