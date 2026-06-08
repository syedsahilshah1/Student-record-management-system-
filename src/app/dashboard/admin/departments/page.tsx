"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { dbService } from "@/services/db";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States (for Create)
  const [newDeptName, setNewDeptName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await dbService.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError("Failed to fetch departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const name = newDeptName.trim();
    if (!name) {
      setError("Department name is required.");
      return;
    }

    try {
      await dbService.addDepartment(name);
      setSuccess(`Department "${name}" added successfully.`);
      setNewDeptName("");
      setIsAdding(false);
      loadDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to add department.");
    }
  };

  const handleDelete = async (deptName: string) => {
    if (!confirm(`Are you sure you want to delete the department "${deptName}"? Existing teachers, students, or courses assigned to this department might need to be reassigned manually.`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await dbService.deleteDepartment(deptName);
      setSuccess(`Department "${deptName}" deleted successfully.`);
      loadDepartments();
    } catch (err: any) {
      setError(err.message || "Failed to delete department.");
    }
  };

  return (
    <DashboardLayout allowedRole="admin">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Department Management
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Define academic divisions and departments for instructors, students, and courses.
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
            {isAdding ? "Cancel Creation" : "➕ Add Department"}
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

        {/* Add Department Panel */}
        {isAdding && (
          <div className="glass-panel animate-fade" style={{ padding: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
              New Department Form
            </h3>
            <form onSubmit={handleAddSubmit} style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.25rem",
              alignItems: "end"
            }}>
              <div className="input-group" style={{ flex: 1, minWidth: "250px", marginBottom: 0 }}>
                <label className="input-label" htmlFor="new-deptname">Department Name (Unique)</label>
                <input
                  id="new-deptname"
                  type="text"
                  placeholder="e.g. Mechanical Eng"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <button type="submit" className="btn btn-primary">
                  Create Department
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Departments List Table */}
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading departments...
          </div>
        ) : (
          <div className="table-container" style={{ maxWidth: "600px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th style={{ textAlign: "center", width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{dept}</td>
                      <td style={{ display: "flex", justifyContent: "center" }}>
                        <button
                          onClick={() => handleDelete(dept)}
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
      </div>
    </DashboardLayout>
  );
}
