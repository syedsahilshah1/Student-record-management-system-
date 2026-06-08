"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Course } from "@/services/db";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Form States (for Create)
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState(3);
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form States (for Edit)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadCourses();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await dbService.getDepartments();
      setDepartments(depts);
      if (depts.length > 0) {
        setDepartment(depts[0]);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCourses();
      setCourses(data);
    } catch (err: any) {
      setError("Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations
    if (!courseId || !courseName || !creditHours || !department) {
      setError("All fields are required.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(courseId)) {
      setError("Course ID can only contain alphanumeric characters, hyphens, and underscores.");
      return;
    }

    if (creditHours < 1 || creditHours > 6) {
      setError("Credit hours must be between 1 and 6.");
      return;
    }

    try {
      const newCourse: Course = {
        courseId: courseId.toUpperCase().trim(),
        courseName: courseName.trim(),
        creditHours: Number(creditHours),
        department,
      };

      await dbService.addCourse(newCourse);
      setSuccess(`Course ${courseName} (${courseId.toUpperCase()}) added successfully.`);
      
      // Reset Form
      setCourseId("");
      setCourseName("");
      setCreditHours(3);
      setDepartment(departments[0] || "");
      setIsAdding(false);
      
      // Reload Table
      loadCourses();
    } catch (err: any) {
      setError(err.message || "Failed to add course.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setError(null);
    setSuccess(null);

    if (!editingCourse.courseName || !editingCourse.creditHours) {
      setError("Fields cannot be empty.");
      return;
    }

    if (editingCourse.creditHours < 1 || editingCourse.creditHours > 6) {
      setError("Credit hours must be between 1 and 6.");
      return;
    }

    try {
      await dbService.updateCourse(editingCourse.courseId, {
        courseName: editingCourse.courseName.trim(),
        creditHours: Number(editingCourse.creditHours),
        department: editingCourse.department,
      });
      setSuccess(`Course ${editingCourse.courseName} updated successfully.`);
      setEditingCourse(null);
      loadCourses();
    } catch (err: any) {
      setError(err.message || "Failed to update course.");
    }
  };

  const handleDelete = async (cId: string, cName: string) => {
    if (!confirm(`Are you sure you want to delete ${cName} (${cId})?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await dbService.deleteCourse(cId);
      setSuccess("Course deleted successfully.");
      loadCourses();
    } catch (err: any) {
      setError(err.message || "Failed to delete course.");
    }
  };

  // Filter Logic
  const filteredCourses = courses.filter((course) => {
    const matchesQuery =
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || course.department === deptFilter;
    return matchesQuery && matchesDept;
  });

  return (
    <DashboardLayout allowedRole="admin">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Course Management
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Define academic subjects, credit allocations, and department categories.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setError(null);
              setSuccess(null);
            }} 
            className="btn btn-primary"
          >
            {isAdding ? "Cancel Creation" : "➕ Add New Course"}
          </button>
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

        {/* Add Course Panel */}
        {isAdding && (
          <div className="glass-panel animate-fade" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              New Course Form
            </h3>
            <form onSubmit={handleAddSubmit} style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              alignItems: "end"
            }}>
              <div className="input-group">
                <label className="input-label" htmlFor="new-courseid">Course ID (Unique)</label>
                <input
                  id="new-courseid"
                  type="text"
                  placeholder="CS101"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-name">Course Name</label>
                <input
                  id="new-name"
                  type="text"
                  placeholder="Introduction to Programming"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-credits">Credit Hours</label>
                <input
                  id="new-credits"
                  type="number"
                  placeholder="3"
                  min="1"
                  max="6"
                  value={creditHours}
                  onChange={(e) => setCreditHours(Number(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-dept">Department</label>
                <select
                  id="new-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-select"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Section */}
        <div className="glass-panel" style={{
          padding: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <div className="input-group" style={{ flex: 2, minWidth: "200px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="search-q">Search Courses</label>
            <input
              id="search-q"
              type="text"
              placeholder="Search by Course Name or ID..."
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

        {/* Courses List Table */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading courses...
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Credit Hours</th>
                  <th>Department</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No course records found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.courseId}>
                      <td style={{ fontWeight: 600, color: "var(--primary)" }}>{c.courseId}</td>
                      <td style={{ fontWeight: 500 }}>{c.courseName}</td>
                      <td>{c.creditHours} credits</td>
                      <td>{c.department}</td>
                      <td style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          onClick={() => setEditingCourse(c)}
                          className="btn btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.courseId, c.courseName)}
                          className="btn btn-danger"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Course Modal Overlay */}
        {editingCourse && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100
          }}>
            <div className="glass-panel animate-fade" style={{
              width: "100%",
              maxWidth: "500px",
              padding: "2rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
            }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                Update Course Details
              </h3>
              
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Course ID (Cannot change)</label>
                  <input
                    type="text"
                    value={editingCourse.courseId}
                    disabled
                    className="form-input"
                    style={{ background: "rgba(255,255,255,0.01)", color: "var(--text-muted)" }}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-name">Course Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editingCourse.courseName}
                    onChange={(e) => setEditingCourse({ ...editingCourse, courseName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-credits">Credit Hours</label>
                  <input
                    id="edit-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={editingCourse.creditHours}
                    onChange={(e) => setEditingCourse({ ...editingCourse, creditHours: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-dept">Department</label>
                  <select
                    id="edit-dept"
                    value={editingCourse.department}
                    onChange={(e) => setEditingCourse({ ...editingCourse, department: e.target.value })}
                    className="form-select"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
