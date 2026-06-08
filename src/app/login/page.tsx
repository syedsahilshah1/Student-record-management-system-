"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isDemoMode, seedAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  const handlePreseedClick = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSuccess(null);
  };

  const handleSeedFirebase = async () => {
    setError(null);
    setSuccess("Registering admin account and seeding roster data in Firebase...");
    setIsSeeding(true);
    try {
      await seedAdmin();
      setSuccess("Database initialized! You can now sign in using: admin@srms.com / admin123");
    } catch (err: any) {
      setSuccess(null);
      setError(err.message || "Failed to initialize Firebase database.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      background: "radial-gradient(circle at bottom, rgba(99, 102, 241, 0.1) 0%, rgba(9, 9, 11, 0) 60%)"
    }}>
      <div className="glass-panel animate-fade" style={{
        width: "100%",
        maxWidth: "460px",
        padding: "2.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
      }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Sign In
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Student Record Management System Console
          </p>
        </div>

        {error && (
          <div style={{
            background: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "var(--color-success-bg)",
            color: "var(--color-success)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@srms.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group" style={{ marginBottom: "1.5rem" }}>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Access Console &rarr;"}
          </button>
        </form>

        {isDemoMode && (
          <div style={{
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "1.5rem",
            marginTop: "0.5rem"
          }}>
            <h4 style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              Quick-Select Demo Accounts
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                onClick={() => handlePreseedClick("admin@srms.com", "admin123")}
                style={{
                  background: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.6rem 1rem",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  transition: "var(--transition-smooth)"
                }}
                className="demo-btn"
              >
                <span>🔑 <strong>Admin</strong> (Management)</span>
                <span style={{ color: "var(--text-muted)" }}>Select</span>
              </button>
              <button
                onClick={() => handlePreseedClick("teacher@srms.com", "teacher123")}
                style={{
                  background: "rgba(6, 182, 212, 0.05)",
                  border: "1px solid rgba(6, 182, 212, 0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.6rem 1rem",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  transition: "var(--transition-smooth)"
                }}
                className="demo-btn"
              >
                <span>📝 <strong>Teacher</strong> (Grades & Att.)</span>
                <span style={{ color: "var(--text-muted)" }}>Select</span>
              </button>
              <button
                onClick={() => handlePreseedClick("student@srms.com", "student123")}
                style={{
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.6rem 1rem",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  transition: "var(--transition-smooth)"
                }}
                className="demo-btn"
              >
                <span>🎓 <strong>Student</strong> (Profile & Marks)</span>
                <span style={{ color: "var(--text-muted)" }}>Select</span>
              </button>
            </div>
          </div>
        )}

        {!isDemoMode && (
          <div style={{
            borderTop: "1px solid var(--border-glass)",
            paddingTop: "1.5rem",
            marginTop: "0.5rem",
            textAlign: "center"
          }}>
            <h4 style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "0.75rem"
            }}>
              First Time Setup?
            </h4>
            <button
              type="button"
              onClick={handleSeedFirebase}
              className="btn btn-secondary"
              style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem" }}
              disabled={isSeeding}
            >
              {isSeeding ? "Seeding Live Database..." : "🚀 Seed Default Roster & Admin"}
            </button>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", lineHeight: 1.4 }}>
              Click to register <strong>admin@srms.com</strong> (pass: <strong>admin123</strong>) in Firebase and load default students/courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
