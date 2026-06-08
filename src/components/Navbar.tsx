"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout, isDemoMode } = useAuth();

  if (!user) return null;

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "badge-admin";
      case "teacher":
        return "badge-teacher";
      default:
        return "badge-student";
    }
  };

  return (
    <header className="glass-panel" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem 2rem",
      borderRadius: "0 0 var(--radius-md) var(--radius-md)",
      marginBottom: "2rem",
      borderTop: "none",
      zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 700 }}>SRMS</h1>
        {isDemoMode && (
          <span style={{
            fontSize: "0.75rem",
            background: "rgba(245, 158, 11, 0.15)",
            color: "var(--color-warning)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "0.25rem 0.6rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 500
          }}>
            Demo Mode
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {/* Profile Avatar */}
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="Profile Avatar"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--primary)",
              boxShadow: "0 0 10px rgba(99, 102, 241, 0.2)"
            }}
          />
        ) : (
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "#fff",
            border: "1px solid var(--border-glass)",
            boxShadow: "0 0 10px rgba(99, 102, 241, 0.1)"
          }}>
            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{user.name}</span>
            <span className={`badge ${getRoleBadgeClass(user.role)}`}>{user.role}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{user.email}</div>
        </div>

        <button 
          onClick={logout} 
          className="btn btn-secondary" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};
