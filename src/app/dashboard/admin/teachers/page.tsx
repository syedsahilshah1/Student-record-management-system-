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

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Form States (for Create)
  const [teacherId, setTeacherId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [designation, setDesignation] = useState("Assistant Professor");
  const [specialization, setSpecialization] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form States (for Edit)
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    loadTeachers();
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

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await dbService.getTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError("Failed to fetch teachers.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations
    if (!teacherId || !name || !email || !specialization) {
      setError("All fields are required.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(teacherId)) {
      setError("Teacher ID can only contain alphanumeric characters, hyphens, and underscores.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const formattedId = teacherId.toUpperCase().trim();
      await dbService.addTeacher({
        uid: formattedId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department,
        designation,
        specialization: specialization.trim()
      });
      setSuccess(`Teacher ${name} (${formattedId}) added successfully. Default password is their email address.`);
      
      // Reset Form
      setTeacherId("");
      setName("");
      setEmail("");
      setDepartment(departments[0] || "");
      setDesignation("Assistant Professor");
      setSpecialization("");
      setIsAdding(false);
      
      // Reload Table
      loadTeachers();
    } catch (err: any) {
      setError(err.message || "Failed to add teacher.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setError(null);
    setSuccess(null);

    if (!editingTeacher.name || !editingTeacher.email || !editingTeacher.specialization) {
      setError("Fields cannot be empty.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(editingTeacher.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await dbService.updateTeacher(editingTeacher.uid, {
        name: editingTeacher.name.trim(),
        email: editingTeacher.email.trim().toLowerCase(),
        department: editingTeacher.department,
        designation: editingTeacher.designation,
        specialization: editingTeacher.specialization.trim()
      });
      setSuccess(`Teacher ${editingTeacher.name} updated successfully.`);
      setEditingTeacher(null);
      loadTeachers();
    } catch (err: any) {
      setError(err.message || "Failed to update teacher.");
    }
  };

  const handleDelete = async (tId: string, tName: string) => {
    if (!confirm(`Are you sure you want to delete ${tName} (${tId})?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await dbService.deleteTeacher(tId);
      setSuccess("Teacher deleted successfully.");
      loadTeachers();
    } catch (err: any) {
      setError(err.message || "Failed to delete teacher.");
    }
  };

  // Filter Logic
  const filteredTeachers = teachers.filter((teacher) => {
    const queryLower = searchQuery.toLowerCase();
    const matchesQuery = 
      teacher.name.toLowerCase().includes(queryLower) ||
      teacher.uid.toLowerCase().includes(queryLower) ||
      teacher.email.toLowerCase().includes(queryLower) ||
      (teacher.specialization && teacher.specialization.toLowerCase().includes(queryLower));
    
    const matchesDept = deptFilter === "All" || teacher.department === deptFilter;
    return matchesQuery && matchesDept;
  });

  return (
    <DashboardLayout allowedRole="admin">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Teacher Management
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Add instructors, define their subjects, and configure system permissions.
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
            {isAdding ? "Cancel Addition" : "➕ Add Teacher"}
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

        {/* Add Teacher Panel */}
        {isAdding && (
          <div className="glass-panel animate-fade" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              New Teacher Form
            </h3>
            <form onSubmit={handleAddSubmit} style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              alignItems: "end"
            }}>
              <div className="input-group">
                <label className="input-label" htmlFor="new-teacherid">Teacher ID (Unique)</label>
                <input
                  id="new-teacherid"
                  type="text"
                  placeholder="TCH001"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-name">Full Name</label>
                <input
                  id="new-name"
                  type="text"
                  placeholder="Dr. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-email">Email Address</label>
                <input
                  id="new-email"
                  type="email"
                  placeholder="johndoe@srms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <div className="input-group">
                <label className="input-label" htmlFor="new-desig">Designation</label>
                <select
                  id="new-desig"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="form-select"
                >
                  <option value="Lecturer">Lecturer</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-spec">Specialization / Subject</label>
                <input
                  id="new-spec"
                  type="text"
                  placeholder="Data Structures / Calculus"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  Create Teacher Profile
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
            <label className="input-label" htmlFor="search-q">Search Instructors</label>
            <input
              id="search-q"
              type="text"
              placeholder="Search by Name, Email, ID, or Specialization..."
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

        {/* Table */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading teachers...
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Specialization</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No teacher records found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.uid}>
                      <td style={{ fontWeight: 600, color: "var(--primary)" }}>{t.uid}</td>
                      <td style={{ fontWeight: 500 }}>{t.name}</td>
                      <td>{t.email}</td>
                      <td>
                        <span style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "var(--primary)",
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>
                          {t.designation || "Faculty"}
                        </span>
                      </td>
                      <td>{t.department || "N/A"}</td>
                      <td style={{ fontWeight: 500, color: "var(--secondary)" }}>{t.specialization || "N/A"}</td>
                      <td style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          onClick={() => setEditingTeacher(t)}
                          className="btn btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.uid, t.name)}
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

        {/* Edit Teacher Modal */}
        {editingTeacher && (
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
                Update Teacher Profile
              </h3>
              
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Teacher ID (Cannot change)</label>
                  <input
                    type="text"
                    value={editingTeacher.uid}
                    disabled
                    className="form-input"
                    style={{ background: "rgba(255,255,255,0.01)", color: "var(--text-muted)" }}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-name">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-dept">Department</label>
                  <select
                    id="edit-dept"
                    value={editingTeacher.department || (departments[0] || "")}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })}
                    className="form-select"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-desig">Designation</label>
                  <select
                    id="edit-desig"
                    value={editingTeacher.designation || "Assistant Professor"}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, designation: e.target.value })}
                    className="form-select"
                  >
                    <option value="Lecturer">Lecturer</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-spec">Specialization / Subject</label>
                  <input
                    id="edit-spec"
                    type="text"
                    value={editingTeacher.specialization || ""}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, specialization: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingTeacher(null)}
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
