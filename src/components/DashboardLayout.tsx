"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRole: "admin" | "teacher" | "student";
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== allowedRole) {
        // Redirect to correct dashboard path if trying to cross paths
        router.push(`/dashboard/${user.role}`);
      }
    }
  }, [user, loading, allowedRole, router]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "var(--bg-app)",
        color: "var(--text-primary)",
        gap: "1.5rem"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <span style={{ fontSize: "1rem", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
          Authenticating Session...
        </span>
      </div>
    );
  }

  if (!user || user.role !== allowedRole) {
    return null; // Don't render content during redirect
  }

  return (
    <div style={{ minHeight: "100vh", padding: "0 2rem 2rem 2rem", display: "flex", flexDirection: "column" }}>
      <Navbar />
      
      <div style={{ display: "flex", gap: "2rem", flex: 1 }}>
        <Sidebar />
        
        <main className="animate-fade" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
