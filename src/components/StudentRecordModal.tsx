"use client";

import React, { useEffect, useState } from "react";
import { dbService, Student, MarkRecord, AttendanceRecord, Course } from "@/services/db";

interface StudentRecordModalProps {
  student: Student;
  onClose: () => void;
}

export default function StudentRecordModal({ student, onClose }: StudentRecordModalProps) {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      setError(null);
      try {
        const [marksData, attendanceData, coursesData] = await Promise.all([
          dbService.getMarks(student.studentId),
          dbService.getAttendance(student.studentId),
          dbService.getCourses(),
        ]);
        setMarks(marksData);
        setAttendance(attendanceData);
        setCourses(coursesData);
      } catch (err: any) {
        console.error("Failed to load student record details:", err);
        setError("Failed to fetch detailed records for this student.");
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [student.studentId]);

  // Grade Converter Helpers
  const getLetterGrade = (score: number) => {
    if (score >= 90) return { text: "A", color: "var(--color-success)" };
    if (score >= 80) return { text: "B", color: "var(--color-info)" };
    if (score >= 70) return { text: "C", color: "var(--color-warning)" };
    if (score >= 60) return { text: "D", color: "var(--text-secondary)" };
    return { text: "F", color: "var(--color-danger)" };
  };

  const getGpaPoints = (score: number) => {
    if (score >= 90) return 4.0;
    if (score >= 80) return 3.5;
    if (score >= 70) return 3.0;
    if (score >= 60) return 2.5;
    if (score >= 50) return 2.0;
    return 0.0;
  };

  // Compile combined course + mark data
  const marksWithCourseDetails = marks.map((m) => {
    const courseDetails = courses.find(
      (c) => c.courseName.toLowerCase() === m.subject.toLowerCase()
    );
    const letter = getLetterGrade(m.marks);
    const gpa = getGpaPoints(m.marks);

    return {
      ...m,
      creditHours: courseDetails?.creditHours ?? 3,
      courseId: courseDetails?.courseId ?? "N/A",
      letter,
      gpa,
    };
  });

  // Calculate Cumulative Metrics
  const cumulativeAvg = marks.length > 0
    ? Math.round((marks.reduce((acc, m) => acc + m.marks, 0) / marks.length) * 10) / 10
    : 0;

  const cumulativeGpa = marksWithCourseDetails.length > 0
    ? Math.round((marksWithCourseDetails.reduce((acc, m) => acc + m.gpa, 0) / marksWithCourseDetails.length) * 100) / 100
    : 0;

  const totalClasses = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "Present").length;
  const absentDays = totalClasses - presentDays;
  const attendanceRate = totalClasses > 0
    ? Math.round((presentDays / totalClasses) * 100)
    : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      className="modal-backdrop-print-hide"
    >
      <div
        className="glass-panel student-record-print-modal"
        style={{
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2.5rem",
          boxShadow: "var(--shadow-lg), 0 0 40px rgba(99, 102, 241, 0.15)",
          border: "1px solid var(--border-glass)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Header (Screen Action buttons) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "1.25rem",
          }}
          className="no-print"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>📋</span>
            <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--text-secondary)" }}>
              Student Academic Transcript
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
            >
              🖨️ Save PDF / Print
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-secondary)" }}>
            <div className="animate-pulse" style={{ fontSize: "1.2rem", fontWeight: 500 }}>
              Compiling academic transcript...
            </div>
          </div>
        ) : error ? (
          <div style={{
            padding: "2rem",
            background: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-md)",
            textAlign: "center",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            ⚠️ {error}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Transcript Print Only Title */}
            <div
              className="print-only"
              style={{
                display: "none",
                flexDirection: "column",
                gap: "0.5rem",
                borderBottom: "2px solid #000",
                paddingBottom: "1rem",
                marginBottom: "1rem"
              }}
            >
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Student Record Management System</h1>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Official Student Academic Transcript</h2>
              <p style={{ fontSize: "0.85rem", color: "#555" }}>
                Generated on: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Profile Summary */}
            <div className="student-profile-form-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              background: "rgba(255,255,255,0.02)",
              padding: "1.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-glass)"
            }}>
              <div>
                <div className="form-label-print" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Student Name
                </div>
                <div className="form-value-print" style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {student.name}
                </div>
              </div>

              <div>
                <div className="form-label-print" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Student ID
                </div>
                <div className="form-value-print" style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {student.studentId}
                </div>
              </div>

              <div>
                <div className="form-label-print" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Department
                </div>
                <div className="form-value-print" style={{ fontSize: "1.1rem", fontWeight: 500, marginTop: "0.25rem" }}>
                  {student.department}
                </div>
              </div>

              <div>
                <div className="form-label-print" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Academic Semester
                </div>
                <div className="form-value-print" style={{ fontSize: "1.1rem", fontWeight: 500, marginTop: "0.25rem" }}>
                  {student.semester} Semester
                </div>
              </div>

              <div>
                <div className="form-label-print" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Email Address
                </div>
                <div className="form-value-print" style={{ fontSize: "0.95rem", marginTop: "0.25rem", wordBreak: "break-all" }}>
                  {student.email}
                </div>
              </div>

              <div>
                <div className="form-label-print" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Contact Phone
                </div>
                <div className="form-value-print" style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
                  {student.phone}
                </div>
              </div>
            </div>

            {/* Performance Overview (Grade card) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem"
            }}>
              <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
                  Cumulative GPA
                </span>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--secondary)" }}>
                  {cumulativeGpa.toFixed(2)} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 4.0</span>
                </span>
              </div>

              <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
                  Grade Average
                </span>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                  {cumulativeAvg.toFixed(1)}%
                </span>
              </div>

              <div className="glass-panel" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
                  Attendance Rate
                </span>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-success)" }}>
                  {attendanceRate}%
                </span>
              </div>
            </div>

            {/* Grades Table */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                Academic Course Performance
              </h3>
              <div className="table-container" style={{ border: "none" }}>
                <table className="data-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Course ID</th>
                      <th>Subject Title</th>
                      <th style={{ textAlign: "center" }}>Credit Hours</th>
                      <th style={{ textAlign: "center" }}>Letter Grade</th>
                      <th style={{ textAlign: "center" }}>Subject GPA</th>
                      <th style={{ textAlign: "right" }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksWithCourseDetails.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                          No course marks recorded for this student.
                        </td>
                      </tr>
                    ) : (
                      marksWithCourseDetails.map((rec) => (
                        <tr key={rec.id}>
                          <td style={{ fontWeight: 600, color: "var(--primary)" }}>{rec.courseId}</td>
                          <td style={{ fontWeight: 500 }}>{rec.subject}</td>
                          <td style={{ textAlign: "center" }}>{rec.creditHours} Credits</td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              className="student-record-print-badge"
                              style={{
                                color: rec.letter.color,
                                fontWeight: 700,
                                background: "rgba(255,255,255,0.02)",
                                padding: "0.3rem 0.6rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-glass)"
                              }}
                            >
                              {rec.letter.text}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 600 }}>{rec.gpa.toFixed(1)}</td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>{rec.marks}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attendance Summary Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                Attendance Registry Summary
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
                padding: "1rem",
                background: "rgba(255,255,255,0.01)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-glass)",
                textAlign: "center"
              }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>Total Lectures</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>{totalClasses}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: 500 }}>Lectures Attended</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem", color: "var(--color-success)" }}>{presentDays}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-danger)", fontWeight: 500 }}>Lectures Missed</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem", color: "var(--color-danger)" }}>{absentDays}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>Attendance Ratio</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.25rem" }}>{attendanceRate}%</div>
                </div>
              </div>
            </div>

            {/* Print Signature Footer */}
            <div
              className="print-only"
              style={{
                display: "none",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: "4rem",
                borderTop: "1px solid #ccc",
                paddingTop: "2rem"
              }}
            >
              <div>
                <div style={{ height: "40px" }} />
                <div style={{ borderBottom: "1px solid #000", width: "200px" }} />
                <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 600 }}>Registrar Signature</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.85rem", color: "#555" }}>
                  Official Transcript Seal
                </div>
                <div style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: "0.5rem" }}>
                  SRMS Console Verification Service
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
