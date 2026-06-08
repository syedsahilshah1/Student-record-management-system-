"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, MarkRecord } from "@/services/db";

export default function AdminMarksPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await dbService.getDepartments();
        setDepartments(depts);
      } catch (err) {
        console.error(err);
      }
    }
    loadDepts();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [stuData, marksData] = await Promise.all([
          dbService.getStudents(),
          dbService.getMarks()
        ]);
        setStudents(stuData);
        setMarks(marksData);
      } catch (error) {
        console.error("Failed to load marks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const studentsWithMarks = students.map((stu) => {
    const records = marks.filter((m) => m.studentId === stu.studentId);
    const avgScore = records.length > 0
      ? Math.round((records.reduce((acc, m) => acc + m.marks, 0) / records.length) * 10) / 10
      : null;

    return {
      ...stu,
      records,
      avgScore
    };
  });

  const filteredStats = studentsWithMarks.filter((stu) => {
    const matchesQuery =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || stu.department === deptFilter;
    const matchesSem = semFilter === "All" || stu.semester === semFilter;
    return matchesQuery && matchesDept && matchesSem;
  });

  const getPerformanceBadge = (avg: number | null) => {
    if (avg === null) return { text: "No Data", style: { color: "var(--text-muted)", background: "rgba(255,255,255,0.05)" } };
    if (avg >= 85) return { text: "Excellent", style: { color: "var(--color-success)", background: "var(--color-success-bg)" } };
    if (avg >= 70) return { text: "Average", style: { color: "var(--color-warning)", background: "var(--color-warning-bg)" } };
    return { text: "Critical", style: { color: "var(--color-danger)", background: "var(--color-danger-bg)" } };
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Title */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Marks Overview
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Review academic performance, grade lists, and student grade point averages.
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
            <label className="input-label" htmlFor="marks-search">Search Students</label>
            <input
              id="marks-search"
              type="text"
              placeholder="Search by Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="marks-dept">Department</label>
            <select
              id="marks-dept"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-select"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="marks-sem">Semester</label>
            <select
              id="marks-sem"
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

        {/* Marks Table */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Averaging grades...
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
                  <th>Subject Grades</th>
                  <th style={{ textAlign: "center" }}>Average</th>
                  <th style={{ textAlign: "right" }}>Performance</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stu) => {
                    const badge = getPerformanceBadge(stu.avgScore);
                    return (
                      <tr key={stu.studentId}>
                        <td style={{ fontWeight: 600, color: "var(--primary)" }}>{stu.studentId}</td>
                        <td style={{ fontWeight: 500 }}>{stu.name}</td>
                        <td>{stu.department}</td>
                        <td>{stu.semester}</td>
                        <td>
                          {stu.records.length === 0 ? (
                            <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No marks recorded</span>
                          ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                              {stu.records.map((rec) => (
                                <span key={rec.id} style={{
                                  fontSize: "0.75rem",
                                  background: "rgba(255, 255, 255, 0.05)",
                                  padding: "0.2rem 0.5rem",
                                  borderRadius: "var(--radius-sm)",
                                  border: "1px solid var(--border-glass)"
                                }}>
                                  {rec.subject}: <strong>{rec.marks}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                          {stu.avgScore !== null ? `${stu.avgScore}%` : "-"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span style={{
                            padding: "0.25rem 0.6rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.02em",
                            ...badge.style
                          }}>
                            {badge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
