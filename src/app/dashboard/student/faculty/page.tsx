"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService } from "@/services/db";

interface TeacherProfile {
  uid: string;
  name: string;
  email: string;
  role: "teacher";
  department: string;
  designation: string;
  specialization: string;
}

export default function StudentFacultyPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    async function loadFaculty() {
      try {
        const [teachersData, deptsData] = await Promise.all([
          dbService.getTeachers(),
          dbService.getDepartments()
        ]);
        setTeachers(teachersData);
        setDepartments(deptsData);
      } catch (err: any) {
        setError("Failed to load faculty directory.");
      } finally {
        setLoading(false);
      }
    }
    loadFaculty();
  }, []);

  // Filter Logic
  const filteredTeachers = teachers.filter((t) => {
    const queryLower = searchQuery.toLowerCase();
    const matchesQuery = 
      t.name.toLowerCase().includes(queryLower) ||
      (t.specialization && t.specialization.toLowerCase().includes(queryLower));
    const matchesDept = deptFilter === "All" || t.department === deptFilter;
    return matchesQuery && matchesDept;
  });

  return (
    <DashboardLayout allowedRole="student">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header Section */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Faculty Directory
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Explore academic instructors, contact information, and specializations.
          </p>
        </div>

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

        {/* Filter Controls */}
        <div className="glass-panel" style={{
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <div className="input-group" style={{ flex: 2, minWidth: "200px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="search-q">Search Instructors</label>
            <input
              id="search-q"
              type="text"
              placeholder="Search by Name or Specialization/Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="filter-dept">Department</label>
            <select
              id="filter-dept"
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
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading faculty directory...
          </div>
        ) : (
          <>
            {filteredTeachers.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-secondary)",
                background: "rgba(255,255,255,0.01)",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border-glass)"
              }}>
                No instructors matching your search criteria were found.
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem"
              }}>
                {filteredTeachers.map((t) => (
                  <div 
                    key={t.uid} 
                    className="glass-panel animate-fade" 
                    style={{ 
                      padding: "1.75rem", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "1rem",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    {/* Background blob for card depth */}
                    <div style={{
                      position: "absolute",
                      top: "-20%",
                      right: "-20%",
                      width: "100px",
                      height: "100px",
                      background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                      borderRadius: "50%",
                      pointerEvents: "none"
                    }} />

                    <div>
                      {/* Designation Badge */}
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(99, 102, 241, 0.12)",
                        color: "var(--primary)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.75rem"
                      }}>
                        {t.designation || "Faculty"}
                      </span>

                      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                        {t.name}
                      </h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                        {t.department || "General Department"}
                      </p>
                    </div>

                    <div style={{ 
                      background: "rgba(255,255,255,0.02)", 
                      border: "1px solid var(--border-glass)",
                      borderRadius: "var(--radius-md)", 
                      padding: "0.75rem 1rem",
                      fontSize: "0.9rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem"
                    }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Specialization & Focus
                      </span>
                      <span style={{ color: "var(--secondary)", fontWeight: 600 }}>
                        {t.specialization || "General Education"}
                      </span>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <hr style={{ border: "0", borderTop: "1px solid var(--border-glass)", margin: "0.5rem 0" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                        <span>✉️</span>
                        <a 
                          href={`mailto:${t.email}`} 
                          style={{ 
                            color: "var(--text-secondary)", 
                            textDecoration: "none",
                            transition: "var(--transition-smooth)"
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary)")}
                          onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                        >
                          {t.email}
                        </a>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span>🆔</span>
                        <span>Faculty ID: {t.uid}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
