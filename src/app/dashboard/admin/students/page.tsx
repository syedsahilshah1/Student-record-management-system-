"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService, Student } from "@/services/db";
import StudentRecordModal from "@/components/StudentRecordModal";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter, setSemFilter] = useState("All");

  // Form States (for Create)
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [semester, setSemester] = useState("1st");
  const [isAdding, setIsAdding] = useState(false);

  // Form States (for Edit)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // State for viewing/printing a student's full record
  const [selectedRecordStudent, setSelectedRecordStudent] = useState<Student | null>(null);


  useEffect(() => {
    loadStudents();
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

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await dbService.getStudents();
      setStudents(data);
    } catch (err: any) {
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations
    if (!studentId || !name || !email || !phone) {
      setError("All fields are required.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(studentId)) {
      setError("Student ID can only contain alphanumeric characters, hyphens, and underscores.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\+?[0-9\s-]{7,15}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      const newStu: Student = {
        studentId: studentId.toUpperCase().trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department,
        semester,
      };

      await dbService.addStudent(newStu);
      setSuccess(`Student ${name} (${studentId.toUpperCase()}) added successfully.`);
      
      // Reset Form
      setStudentId("");
      setName("");
      setEmail("");
      setPhone("");
      setDepartment(departments[0] || "");
      setSemester("1st");
      setIsAdding(false);
      
      // Reload Table
      loadStudents();
    } catch (err: any) {
      setError(err.message || "Failed to add student.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setError(null);
    setSuccess(null);

    if (!editingStudent.name || !editingStudent.email || !editingStudent.phone) {
      setError("Fields cannot be empty.");
      return;
    }

    try {
      await dbService.updateStudent(editingStudent.studentId, {
        name: editingStudent.name.trim(),
        email: editingStudent.email.trim().toLowerCase(),
        phone: editingStudent.phone.trim(),
        department: editingStudent.department,
        semester: editingStudent.semester,
      });
      setSuccess(`Student ${editingStudent.name} updated successfully.`);
      setEditingStudent(null);
      loadStudents();
    } catch (err: any) {
      setError(err.message || "Failed to update student.");
    }
  };

  const handleDelete = async (stuId: string, stuName: string) => {
    if (!confirm(`Are you sure you want to delete ${stuName} (${stuId})? This will also purge their grades and attendance records.`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await dbService.deleteStudent(stuId);
      setSuccess("Student deleted successfully.");
      loadStudents();
    } catch (err: any) {
      setError(err.message || "Failed to delete student.");
    }
  };

  // Filter Logic
  const filteredStudents = students.filter((stu) => {
    const matchesQuery =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || stu.department === deptFilter;
    const matchesSem = semFilter === "All" || stu.semester === semFilter;
    return matchesQuery && matchesDept && matchesSem;
  });

  return (
    <DashboardLayout allowedRole="admin">
      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Student Management
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Enroll new students, edit metadata profiles, and manage system access.
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
            {isAdding ? "Cancel Enrollment" : "➕ Enroll Student"}
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

        {/* Add Student Panel */}
        {isAdding && (
          <div className="glass-panel animate-fade" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              New Student Enrollment Form
            </h3>
            <form onSubmit={handleAddSubmit} style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              alignItems: "end"
            }}>
              <div className="input-group">
                <label className="input-label" htmlFor="new-stuid">Student ID (Unique)</label>
                <input
                  id="new-stuid"
                  type="text"
                  placeholder="STU004"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-name">Full Name</label>
                <input
                  id="new-name"
                  type="text"
                  placeholder="Alice Smith"
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
                  placeholder="alice@srms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="new-phone">Phone Number</label>
                <input
                  id="new-phone"
                  type="text"
                  placeholder="555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                <label className="input-label" htmlFor="new-sem">Semester</label>
                <select
                  id="new-sem"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
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

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">
                  Register Enrollment
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
            <label className="input-label" htmlFor="search-q">Search Students</label>
            <input
              id="search-q"
              type="text"
              placeholder="Search by Name, Email, or ID..."
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

          <div className="input-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
            <label className="input-label" htmlFor="filter-sem">Semester</label>
            <select
              id="filter-sem"
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

        {/* Students List Table */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading students...
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => (
                    <tr key={stu.studentId}>
                      <td 
                        style={{ fontWeight: 600, color: "var(--primary)", cursor: "pointer" }}
                        onClick={() => setSelectedRecordStudent(stu)}
                        title="Click to view/download record"
                      >
                        {stu.studentId}
                      </td>
                      <td style={{ fontWeight: 500 }}>{stu.name}</td>
                      <td>{stu.email}</td>
                      <td>{stu.phone}</td>
                      <td>{stu.department}</td>
                      <td>{stu.semester}</td>
                      <td style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          onClick={() => setSelectedRecordStudent(stu)}
                          className="btn btn-primary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", background: "var(--color-info)", borderColor: "var(--color-info)" }}
                        >
                          📄 Record
                        </button>
                        <button
                          onClick={() => setEditingStudent(stu)}
                          className="btn btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(stu.studentId, stu.name)}
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

        {/* Edit Student Modal Overlay */}
        {editingStudent && (
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
                Update Student Record
              </h3>
              
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Student ID (Cannot change)</label>
                  <input
                    type="text"
                    value={editingStudent.studentId}
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
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="edit-phone">Phone Number</label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="input-label" htmlFor="edit-dept">Department</label>
                    <select
                      id="edit-dept"
                      value={editingStudent.department}
                      onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                      className="form-select"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="input-label" htmlFor="edit-sem">Semester</label>
                    <select
                      id="edit-sem"
                      value={editingStudent.semester}
                      onChange={(e) => setEditingStudent({ ...editingStudent, semester: e.target.value })}
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
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
      {selectedRecordStudent && (
        <StudentRecordModal
          student={selectedRecordStudent}
          onClose={() => setSelectedRecordStudent(null)}
        />
      )}
    </DashboardLayout>
  );
}
