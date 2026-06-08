"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, AttendanceRecord, MarkRecord } from "@/services/db";
import StudentRecordModal from "@/components/StudentRecordModal";

export default function AdminReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordStudent, setSelectedRecordStudent] = useState<Student | null>(null);


  useEffect(() => {
    async function loadData() {
      try {
        const [stuData, attData, marksData] = await Promise.all([
          dbService.getStudents(),
          dbService.getAttendance(),
          dbService.getMarks()
        ]);
        setStudents(stuData);
        setAttendance(attData);
        setMarks(marksData);
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStudents = students.length;

  const systemAvgGrade = (() => {
    if (marks.length === 0) return 0;
    return Math.round((marks.reduce((acc, m) => acc + m.marks, 0) / marks.length) * 10) / 10;
  })();

  const systemAvgAttendance = (() => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "Present").length;
    return Math.round((present / attendance.length) * 100);
  })();

  // Find top performer
  const studentAverages = students.map((stu) => {
    const studentMarks = marks.filter((m) => m.studentId === stu.studentId);
    const avg = studentMarks.length > 0
      ? studentMarks.reduce((acc, m) => acc + m.marks, 0) / studentMarks.length
      : 0;
    return { stu, avg };
  });

  const topPerformer = studentAverages.length > 0
    ? [...studentAverages].sort((a, b) => b.avg - a.avg)[0]
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Title & Action */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Report Center
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Generate, preview, and print school-wide academic transcripts and registers.
            </p>
          </div>
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ Print Report
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Compiling report data...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} className="print-report-container">
            
            {/* Print Only Header */}
            <div className="print-only" style={{
              display: "none",
              flexDirection: "column",
              gap: "0.5rem",
              borderBottom: "2px solid #333",
              paddingBottom: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              <h1 style={{ fontSize: "2.25rem", color: "#000", fontWeight: 800 }}>Student Record Management System</h1>
              <p style={{ color: "#555", fontSize: "0.95rem" }}>Official Administrative Summary & Student Ledger &bull; Date: {new Date().toLocaleDateString()}</p>
            </div>

            {/* Statistics Summary Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem"
            }}>
              <div className="glass-panel print-card" style={{ padding: "1.5rem", border: "1px solid var(--border-glass)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }} className="print-label">Total Enrollment</div>
                <div style={{ fontSize: "2rem", fontWeight: 700 }} className="print-val">{totalStudents} Students</div>
              </div>

              <div className="glass-panel print-card" style={{ padding: "1.5rem", border: "1px solid var(--border-glass)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }} className="print-label">System Performance Avg</div>
                <div style={{ fontSize: "2rem", fontWeight: 700 }} className="print-val">{systemAvgGrade}%</div>
              </div>

              <div className="glass-panel print-card" style={{ padding: "1.5rem", border: "1px solid var(--border-glass)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }} className="print-label">System Attendance Rate</div>
                <div style={{ fontSize: "2rem", fontWeight: 700 }} className="print-val">{systemAvgAttendance}%</div>
              </div>

              <div className="glass-panel print-card" style={{ padding: "1.5rem", border: "1px solid var(--border-glass)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }} className="print-label">Valedictorian (Top GPA)</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700 }} className="print-val">
                  {topPerformer && topPerformer.avg > 0 ? (
                    <>
                      {topPerformer.stu.name} <span style={{ color: "var(--primary)" }}>({Math.round(topPerformer.avg * 10) / 10}%)</span>
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
            </div>

            {/* Students Ledger table */}
            <div className="glass-panel print-card" style={{ padding: "2rem", border: "1px solid var(--border-glass)" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }} className="print-sub">
                Student Enrollment & Academic Roster
              </h3>

              <div className="table-container" style={{ border: "none" }}>
                <table className="data-table print-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th style={{ textAlign: "center" }}>Attendance %</th>
                      <th style={{ textAlign: "right" }}>Grade Avg</th>
                      <th style={{ textAlign: "center" }} className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((stu) => {
                      const stuAtt = attendance.filter((a) => a.studentId === stu.studentId);
                      const attRate = stuAtt.length > 0
                        ? Math.round((stuAtt.filter((a) => a.status === "Present").length / stuAtt.length) * 100)
                        : 100;
                      
                      const stuMarks = marks.filter((m) => m.studentId === stu.studentId);
                      const gradeAvg = stuMarks.length > 0
                        ? Math.round((stuMarks.reduce((acc, m) => acc + m.marks, 0) / stuMarks.length) * 10) / 10
                        : null;

                      return (
                        <tr key={stu.studentId}>
                          <td 
                            style={{ fontWeight: 600, color: "var(--primary)", cursor: "pointer" }} 
                            className="print-id"
                            onClick={() => setSelectedRecordStudent(stu)}
                            title="Click to view/download record"
                          >
                            {stu.studentId}
                          </td>
                          <td style={{ fontWeight: 500 }}>{stu.name}</td>
                          <td>{stu.department}</td>
                          <td>{stu.semester}</td>
                          <td style={{ textAlign: "center" }}>{attRate}%</td>
                          <td style={{ textAlign: "right", fontWeight: 700 }}>
                            {gradeAvg !== null ? `${gradeAvg}%` : "No Grades"}
                          </td>
                          <td style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }} className="no-print">
                            <button
                              onClick={() => setSelectedRecordStudent(stu)}
                              className="btn btn-primary"
                              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", background: "var(--color-info)", borderColor: "var(--color-info)" }}
                            >
                              🖨️ Print
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedRecordStudent && (
        <StudentRecordModal
          student={selectedRecordStudent}
          onClose={() => setSelectedRecordStudent(null)}
        />
      )}
    </DashboardLayout>
  );
}
