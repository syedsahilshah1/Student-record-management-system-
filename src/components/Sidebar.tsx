"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarLink {
  label: string;
  href: string;
  icon: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role;

  const linksByRole: Record<string, SidebarLink[]> = {
    admin: [
      { label: "Dashboard", href: "/dashboard/admin", icon: "📊" },
      { label: "Manage Students", href: "/dashboard/admin/students", icon: "🎓" },
      { label: "Manage Teachers", href: "/dashboard/admin/teachers", icon: "🧑‍🏫" },
      { label: "Manage Courses", href: "/dashboard/admin/courses", icon: "📚" },
      { label: "Manage Departments", href: "/dashboard/admin/departments", icon: "🏢" },
      { label: "Attendance Records", href: "/dashboard/admin/attendance", icon: "📅" },
      { label: "Marks Overview", href: "/dashboard/admin/marks", icon: "📝" },
      { label: "Report Center", href: "/dashboard/admin/reports", icon: "📈" },
    ],
    teacher: [
      { label: "Dashboard", href: "/dashboard/teacher", icon: "📊" },
      { label: "Mark Attendance", href: "/dashboard/teacher/attendance", icon: "📅" },
      { label: "Record Marks", href: "/dashboard/teacher/marks", icon: "📝" },
    ],
    student: [
      { label: "Profile Hub", href: "/dashboard/student", icon: "🎓" },
      { label: "Faculty Directory", href: "/dashboard/student/faculty", icon: "🧑‍🏫" },
      { label: "My Attendance", href: "/dashboard/student/attendance", icon: "📅" },
      { label: "My Marks", href: "/dashboard/student/marks", icon: "📝" },
    ],
  };

  const currentLinks = linksByRole[role] || [];

  return (
    <aside className="glass-panel" style={{
      width: "var(--sidebar-width)",
      minHeight: "calc(100vh - 8rem)",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem"
    }}>
      <div style={{
        padding: "0.5rem 1rem",
        marginBottom: "1.5rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--text-muted)"
      }}>
        Navigation Menu
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {currentLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.95rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                transition: "var(--transition-smooth)",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <a
        href="https://sahilportfol.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "1rem",
          borderRadius: "var(--radius-md)",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border-glass)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center",
          textDecoration: "none",
          display: "block",
          transition: "var(--transition-smooth)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = "var(--primary)";
          e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--border-glass)";
        }}
      >
        SRMS Console v2.0 &bull; SahilDev
      </a>
    </aside>
  );
};
