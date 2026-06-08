"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      background: "radial-gradient(circle at top, rgba(99, 102, 241, 0.15) 0%, rgba(9, 9, 11, 0) 60%)"
    }}>
      <div className="glass-panel animate-fade" style={{
        maxWidth: "850px",
        padding: "4rem 3rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.5rem"
      }}>
        <div>
          <span style={{
            fontSize: "0.85rem",
            background: "rgba(99, 102, 241, 0.1)",
            color: "var(--primary)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            padding: "0.35rem 1.25rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            Institution Portal
          </span>
          <h1 className="gradient-text" style={{
            fontSize: "3.5rem",
            fontWeight: 800,
            lineHeight: 1.1,
            marginTop: "1.25rem",
            marginBottom: "1.25rem"
          }}>
            Student Record<br />Management System
          </h1>
          <p style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: "600px",
            lineHeight: 1.6
          }}>
            A unified administration, grading, and attendance console for educational institutions.
          </p>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          width: "100%",
          margin: "1rem 0"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            textAlign: "left"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🛡️</span>
            <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>Role-Based Access</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Secure workspaces customized for System Administrators, Instructors, and Students.
            </p>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            textAlign: "left"
          }}>
            <span style={{ fontSize: "1.5rem" }}>📊</span>
            <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>Academic Statistics</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Instantly aggregate student performance records, average scores, and attendance rates.
            </p>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            textAlign: "left"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🖨️</span>
            <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>Transcript Generation</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Generate official printable student roster ledgers and performance summaries.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          {user ? (
            <Link href={`/dashboard/${user.role}`} className="btn btn-primary" style={{ padding: "1rem 2.5rem" }}>
              Enter System Console &rarr;
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ padding: "1rem 2.5rem" }}>
              Enter System Console
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
