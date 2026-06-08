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
      justifyContent: "flex-start",
      alignItems: "center",
      padding: "2rem 1.5rem",
      background: "var(--bg-app)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Navigation Header */}
      <header className="glass-panel" style={{
        width: "100%",
        maxWidth: "1100px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        marginBottom: "4rem",
        zIndex: 5
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.03em" }} className="gradient-text">
            SRMS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{
            fontSize: "0.75rem",
            background: "rgba(16, 185, 129, 0.1)",
            color: "var(--color-success)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.35rem"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-success)" }}></span>
            Cloud Services Active
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="animate-fade" style={{
        width: "100%",
        maxWidth: "1100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "4rem",
        zIndex: 5
      }}>
        
        {/* Hero Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <span style={{
            fontSize: "0.8rem",
            background: "rgba(99, 102, 241, 0.08)",
            color: "var(--primary)",
            border: "1px solid rgba(99, 102, 241, 0.15)",
            padding: "0.4rem 1.25rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em"
          }}>
            Academic Console
          </span>
          <h1 className="gradient-text" style={{
            fontSize: "3.75rem",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "800px"
          }}>
            A Unified Management Console for Academic Excellence
          </h1>
          <p style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: "640px",
            lineHeight: 1.6
          }}>
            Streamline student profiles, record marks rosters, and track daily attendance registers within a secure, real-time cloud workspace.
          </p>
          <div style={{ marginTop: "1rem" }}>
            {user ? (
              <Link href={`/dashboard/${user.role}`} className="btn btn-primary" style={{ padding: "1rem 2.75rem" }}>
                Enter System Console &rarr;
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: "1rem 2.75rem" }}>
                Launch System Console
              </Link>
            )}
          </div>
        </div>

        {/* Feature Grid Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          width: "100%",
          marginTop: "1.5rem"
        }}>
          {/* Card 1 */}
          <div className="premium-card">
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.5rem",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "var(--primary)",
              marginBottom: "0.5rem"
            }}>
              🛡️
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Secure Role Workspaces
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Isolated portal interfaces for Administrators, Teachers, and Students. Role verification secures every backend route.
            </p>
          </div>

          {/* Card 2 */}
          <div className="premium-card">
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(217, 70, 239, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.5rem",
              border: "1px solid rgba(217, 70, 239, 0.2)",
              color: "var(--secondary)",
              marginBottom: "0.5rem"
            }}>
              📊
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Gradebook Analytics
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Automated subject marks aggregation. Dynamically computes GPA indices, credit weights, and letter grades.
            </p>
          </div>

          {/* Card 3 */}
          <div className="premium-card">
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.5rem",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "var(--color-success)",
              marginBottom: "0.5rem"
            }}>
              📝
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Roster & Transcript Tools
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Compile daily attendance logs and export print-friendly student transcripts with custom print layout styles.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: "8rem",
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        zIndex: 5,
        textAlign: "center"
      }}>
        &copy; {new Date().getFullYear()} SRMS. All Rights Reserved.
      </footer>
    </div>
  );
}
