"use client";

import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { dbService } from "@/services/db";

export default function ProfilePage() {
  const { user, changePassword, updateProfilePicture } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [extraDetails, setExtraDetails] = useState<any>(null);
  
  // Photo states
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  useEffect(() => {
    async function loadExtraDetails() {
      if (!user) return;
      setProfileLoading(true);
      try {
        if (user.role === "student") {
          const detail = await dbService.getStudentByEmail(user.email);
          setExtraDetails(detail);
        } else if (user.role === "teacher") {
          const teachers = await dbService.getTeachers();
          const detail = teachers.find((t) => t.email.toLowerCase() === user.email.toLowerCase());
          setExtraDetails(detail);
        }
      } catch (err) {
        console.error("Failed to load extra profile details:", err);
      } finally {
        setProfileLoading(false);
      }
    }
    loadExtraDetails();
  }, [user]);

  if (!user) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!newPassword || !confirmPassword) {
      setPwdError("Please fill in both fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }

    setUpdatingPwd(true);
    try {
      await changePassword(newPassword);
      setPwdSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdError(err.message || "Failed to change password.");
    } finally {
      setUpdatingPwd(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (JPG, PNG).");
      return;
    }

    // Maximum 5MB file before resizing
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image file is too large. Please select a file under 5MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image dynamically
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio and force fit into a 200x200 canvas
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress the resized image into JPEG quality 75%
          // This outputs a base64 string around 10-15KB, well under database payload bounds.
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          
          updateProfilePicture(compressedBase64)
            .then(() => {
              setUploadSuccess("Profile picture updated successfully!");
              setUploading(false);
            })
            .catch((err) => {
              console.error("Failed to upload avatar:", err);
              setUploadError("Failed to save profile picture to database.");
              setUploading(false);
            });
        } else {
          setUploadError("Failed to compress profile image.");
          setUploading(false);
        }
      };
      img.onerror = () => {
        setUploadError("Failed to read image content.");
        setUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError("Failed to load file.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout allowedRole={user.role}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Title Block */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            My Profile
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your personal credentials, view academic details, and upload account avatars.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          alignItems: "start"
        }}>
          
          {/* Card 1: Avatar Upload & Card Summary */}
          <div className="glass-panel animate-fade" style={{ padding: "2.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={handleAvatarClick} title="Click to upload new image">
              
              {/* Avatar circle */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile Avatar"
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--primary)",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
                    transition: "var(--transition-smooth)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--secondary)"}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                />
              ) : (
                <div
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: 800,
                    fontSize: "2.25rem",
                    color: "#fff",
                    border: "2px solid var(--border-glass)",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.15)",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {initials}
                </div>
              )}

              {/* Upload Hover Indicator overlay */}
              <div style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-glass)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "var(--shadow-md)",
                fontSize: "1.1rem"
              }}>
                📷
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: "none" }}
            />

            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{user.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", textTransform: "capitalize" }}>
                System {user.role}
              </p>
            </div>

            {/* Notifications */}
            {uploadError && (
              <div style={{
                fontSize: "0.8rem",
                color: "var(--color-danger)",
                background: "var(--color-danger-bg)",
                padding: "0.4rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                width: "100%"
              }}>
                ⚠️ {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div style={{
                fontSize: "0.8rem",
                color: "var(--color-success)",
                background: "var(--color-success-bg)",
                padding: "0.4rem 0.8rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                width: "100%"
              }}>
                ✅ {uploadSuccess}
              </div>
            )}

            {uploading && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }} className="animate-pulse">
                Saving avatar to profile...
              </div>
            )}

            <button onClick={handleAvatarClick} className="btn btn-secondary" style={{ width: "100%", padding: "0.6rem" }}>
              Upload New Photo
            </button>
          </div>

          {/* Card 2: Details & Security */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Profile Information Panel */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                Account Information
              </h3>

              {profileLoading ? (
                <div style={{ padding: "1rem 0", color: "var(--text-secondary)" }}>
                  Loading profile records...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  
                  {/* Standard details */}
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Full Name</span>
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Email Address</span>
                    <span style={{ fontWeight: 600 }}>{user.email}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Account Role</span>
                    <span className="badge badge-admin" style={{ textTransform: "capitalize", fontWeight: 700 }}>{user.role}</span>
                  </div>

                  {/* Role-Specific details */}
                  {user.role === "student" && extraDetails && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Student ID</span>
                        <span style={{ fontWeight: 600, color: "var(--primary)" }}>{extraDetails.studentId}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Department</span>
                        <span style={{ fontWeight: 600 }}>{extraDetails.department}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Academic Semester</span>
                        <span style={{ fontWeight: 600 }}>{extraDetails.semester} Semester</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Phone Number</span>
                        <span style={{ fontWeight: 600 }}>{extraDetails.phone}</span>
                      </div>
                    </>
                  )}

                  {user.role === "teacher" && extraDetails && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Department</span>
                        <span style={{ fontWeight: 600 }}>{extraDetails.department}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Academic Designation</span>
                        <span style={{ fontWeight: 600 }}>{extraDetails.designation}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Subject Specialization</span>
                        <span style={{ fontWeight: 600, color: "var(--secondary)" }}>{extraDetails.specialization}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Change Password Form */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                Security Settings
              </h3>
              
              <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {pwdError && (
                  <div style={{
                    background: "var(--color-danger-bg)",
                    color: "var(--color-danger)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    padding: "0.6rem 1rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem"
                  }}>
                    ⚠️ {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div style={{
                    background: "var(--color-success-bg)",
                    color: "var(--color-success)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    padding: "0.6rem 1rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem"
                  }}>
                    ✅ {pwdSuccess}
                  </div>
                )}

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="new-pwd">New Password</label>
                  <input
                    id="new-pwd"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" htmlFor="confirm-pwd">Confirm New Password</label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem", alignSelf: "flex-start", marginTop: "0.5rem" }} disabled={updatingPwd}>
                  {updatingPwd ? "Updating..." : "Update Security Password"}
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
