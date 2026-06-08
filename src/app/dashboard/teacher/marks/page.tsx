"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, Course, MarkRecord } from "@/services/db";

export default function TeacherMarksPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selectors
  const [selectedDept, setSelectedDept] = useState("Computer Science");
  const [selectedSem, setSelectedSem] = useState("6th");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Marks Dict State: studentId -> marks (number or empty string)
  const [marksDict, setMarksDict] = useState<Record<string, string>>({});

  // 1. Load available courses once
  useEffect(() => {
    async function loadCourses() {
      try {
        const allCourses = await dbService.getCourses();
        setCourses(allCourses);
      } catch (err) {
        console.error("Error loading courses:", err);
      }
    }
    loadCourses();
  }, []);

  // Filter courses by department
  const filteredCourses = courses.filter((c) => c.department === selectedDept);

  // Update selected subject when department changes
  useEffect(() => {
    if (filteredCourses.length > 0) {
      setSelectedSubject(filteredCourses[0].courseName);
    } else {
      setSelectedSubject("");
    }
  }, [selectedDept, courses]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Fetch students and existing marks when selectors change
  useEffect(() => {
    async function fetchStudentsAndMarks() {
      if (!selectedSubject) {
        setStudents([]);
        return;
      }
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // Fetch students
        const allStudents = await dbService.getStudents();
        const filteredStudents = allStudents.filter(
          (s) => s.department === selectedDept && s.semester === selectedSem
        );
        setStudents(filteredStudents);

        // Fetch marks for selected subject
        const allMarks = await dbService.getMarks();
        const subjectMarks = allMarks.filter((m) => m.subject === selectedSubject);

        // Map existing marks to dict
        const initialDict: Record<string, string> = {};
        
        // Default to empty string for all students
        filteredStudents.forEach((stu) => {
          initialDict[stu.studentId] = "";
        });

        // Fill in existing values
        subjectMarks.forEach((rec) => {
          if (initialDict[rec.studentId] !== undefined) {
            initialDict[rec.studentId] = rec.marks.toString();
          }
        });

        setMarksDict(initialDict);
      } catch (err) {
        console.error("Error loading marks registry:", err);
        setError("Failed to load student gradebooks.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudentsAndMarks();
  }, [selectedDept, selectedSem, selectedSubject]);

  const handleMarkChange = (studentId: string, val: string) => {
    // Only allow numeric/decimal characters and empty strings
    if (val === "" || /^[0-9]+(\.[0-9]*)?$/.test(val)) {
      setMarksDict((prev) => ({
        ...prev,
        [studentId]: val
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const recordsToSave: { studentId: string; subject: string; marks: number }[] = [];
      
      // Perform validation and gather data
      for (const stu of students) {
        const markVal = marksDict[stu.studentId];
        if (markVal === "") {
          setError(`Please input marks for all students. ${stu.name} is missing a grade.`);
          setSaving(false);
          return;
        }

        const numericMark = parseFloat(markVal);
        if (isNaN(numericMark) || numericMark < 0 || numericMark > 100) {
          setError(`Invalid marks for ${stu.name}. Numerical marks must be between 0 and 100.`);
          setSaving(false);
          return;
        }

        recordsToSave.push({
          studentId: stu.studentId,
          subject: selectedSubject,
          marks: numericMark
        });
      }

      if (recordsToSave.length === 0) {
        setError("No students in selected class to record grades.");
        setSaving(false);
        return;
      }

      await dbService.saveBulkMarks(recordsToSave);
      setSuccess(`Academic grades successfully saved for ${recordsToSave.length} students in ${selectedSubject}.`);
    } catch (err: any) {
      setError(err.message || "Failed to save grades.");
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
            Academic Grade Book
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Input and update numerical coursework marks and exam scores.
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

        {/* Class / Subject Selection Panel */}
        <div className="glass-panel" style={{
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="class-dept">Department</label>
            <select
              id="class-dept"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-select"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Eng">Electrical Eng</option>
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

          <div className="input-group" style={{ flex: 1, minWidth: "180px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="class-sub">Subject Course</label>
            <select
              id="class-sub"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-select"
              disabled={filteredCourses.length === 0}
            >
              {filteredCourses.length === 0 ? (
                <option value="">No subjects offered</option>
              ) : (
                filteredCourses.map((c) => (
                  <option key={c.courseId} value={c.courseName}>
                    {c.courseName}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Grade Entry Form */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading student rosters...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th style={{ width: "200px", textAlign: "right" }}>Marks (Max 100)</th>
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
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem" }}>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="0.0"
                              value={marksDict[stu.studentId] ?? ""}
                              onChange={(e) => handleMarkChange(stu.studentId, e.target.value)}
                              className="form-input"
                              style={{ width: "90px", textAlign: "right", padding: "0.5rem" }}
                            />
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 100</span>
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
                  {saving ? "Saving Grades..." : "Save Academic Grades"}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
