"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { dbService, Student, MarkRecord, Course } from "@/services/db";

export default function StudentMarksPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const studentProfile = await dbService.getStudentByEmail(user.email);
        if (studentProfile) {
          setProfile(studentProfile);
          
          const [marksData, coursesData] = await Promise.all([
            dbService.getMarks(studentProfile.studentId),
            dbService.getCourses()
          ]);
          
          setMarks(marksData);
          setCourses(coursesData);
        }
      } catch (error) {
        console.error("Failed to load student marks details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

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
      gpa
    };
  });

  const cumulativeAvg = marks.length > 0
    ? Math.round((marks.reduce((acc, m) => acc + m.marks, 0) / marks.length) * 10) / 10
    : 0;

  const cumulativeGpa = marksWithCourseDetails.length > 0
    ? Math.round((marksWithCourseDetails.reduce((acc, m) => acc + m.gpa, 0) / marksWithCourseDetails.length) * 100) / 100
    : 0;

  return (
    <DashboardLayout allowedRole="student">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Title */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            My Scorecard
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            View your current subject grades, credits, letter equivalents, and GPAs.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading marks...
          </div>
        ) : !profile ? (
          <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--color-danger)" }}>
            ⚠️ Profile registration not found. Please contact the administrator.
          </div>
        ) : (
          <>
            {/* GPA Callout Banner */}
            <div className="glass-panel animate-fade" style={{
              padding: "2rem",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
                  Academic standing
                </span>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.25rem" }}>
                  {profile.name} &bull; {profile.semester} Semester
                </h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>
                  Cumulative GPA
                </span>
                <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--secondary)", marginTop: "0.25rem" }}>
                  {cumulativeGpa} <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>/ 4.0</span>
                </div>
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Subject Title</th>
                    <th style={{ textAlign: "center" }}>Credit Hours</th>
                    <th style={{ textAlign: "center" }}>Letter Grade</th>
                    <th style={{ textAlign: "center" }}>Subject GPA</th>
                    <th style={{ textAlign: "right" }}>Numerical Score</th>
                  </tr>
                </thead>
                <tbody>
                  {marksWithCourseDetails.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                        No academic marks recorded in the system.
                      </td>
                    </tr>
                  ) : (
                    marksWithCourseDetails.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600, color: "var(--primary)" }}>{rec.courseId}</td>
                        <td style={{ fontWeight: 500 }}>{rec.subject}</td>
                        <td style={{ textAlign: "center" }}>{rec.creditHours} Credits</td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{
                            color: rec.letter.color,
                            fontWeight: 700,
                            background: "rgba(255,255,255,0.02)",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-glass)"
                          }}>
                            {rec.letter.text}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{rec.gpa.toFixed(1)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{rec.marks}%</td>
                      </tr>
                    ))
                  )}
                  {marksWithCourseDetails.length > 0 && (
                    <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                      <td colSpan={4} style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                        Roster Summary Average
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "var(--secondary)" }}>
                        {cumulativeGpa.toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "var(--primary)" }}>
                        {cumulativeAvg.toFixed(1)}%
                      </td>
                    </tr>
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
