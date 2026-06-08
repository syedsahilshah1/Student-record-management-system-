"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student, Course } from "@/services/db";
import Link from "next/link";

export default function TeacherDashboard() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [students, courses] = await Promise.all([
          dbService.getStudents(),
          dbService.getCourses()
        ]);
        setStudentsCount(students.length);
        setCoursesCount(courses.length);
      } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout allowedRole="teacher">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Title greeting */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Teacher Workspace
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Review, record, and update student performance and attendance logs.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading dashboard context...
          </div>
        ) : (
          <>
            {/* Shortcuts Panel */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem"
            }}>
              {/* Card 1: Attendance */}
              <div className="glass-panel" style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                justifyContent: "space-between"
              }}>
                <div>
                  <span style={{ fontSize: "2rem" }}>📅</span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0.75rem 0 0.5rem 0" }}>Daily Attendance Register</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Select date, semester class divisions, and toggle student presence. Supports updating existing logs.
                  </p>
                </div>
                <Link href="/dashboard/teacher/attendance" className="btn btn-primary" style={{ alignSelf: "flex-start", width: "100%", justifyContent: "center" }}>
                  Record Attendance &rarr;
                </Link>
              </div>

              {/* Card 2: Marks */}
              <div className="glass-panel" style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                justifyContent: "space-between"
              }}>
                <div>
                  <span style={{ fontSize: "2rem" }}>📝</span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0.75rem 0 0.5rem 0" }}>Academic Grade Book</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Input marks, exam sheets, and coursework averages. Validates marks out of 100 points maximum.
                  </p>
                </div>
                <Link href="/dashboard/teacher/marks" className="btn btn-primary" style={{ alignSelf: "flex-start", width: "100%", justifyContent: "center" }}>
                  Enter Academic Grades &rarr;
                </Link>
              </div>
            </div>

            {/* Information Callout */}
            <div className="glass-panel" style={{
              padding: "2rem",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
              border: "1px solid var(--border-glass)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Administrative Notice & guidelines</h3>
              <ul style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                paddingLeft: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                lineHeight: 1.5
              }}>
                <li>Ensure students are enrolled in their respective departments before marking grades.</li>
                <li>Daily attendance logs should be registered by 5:00 PM for the automated reporting metrics to compile accurately.</li>
                <li>Numerical marks must be within the 0 to 100 range. Double-check exam register sheets before saving.</li>
                <li>For any student profile changes, contact the <strong>System Administrator</strong>.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
