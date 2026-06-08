"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, isDemoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <p style={{
            fontSize: "0.8rem",
            color: "var(--color-warning)",
            textAlign: "center",
            marginTop: "1.25rem",
            lineHeight: "1.4",
            background: "var(--color-warning-bg)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            padding: "0.6rem 0.8rem",
            borderRadius: "var(--radius-md)"
          }}>
            ⚠️ <strong>Offline Demo Mode</strong>: Database environment variables are not configured. Use <strong>admin@srms.com</strong> / <strong>admin123</strong> to test the console.
          </p>
        )}
      </div>
    </div>
  );
}
