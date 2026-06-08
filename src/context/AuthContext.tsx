"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, UserProfile } from "@/services/auth";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updateProfilePicture: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen to changes in auth state (either Firebase or LocalStorage Mock)
    const unsubscribe = authService.onAuthStateChange((profile) => {
      setUser(profile);
      setLoading(false);
      
      // If user logs in and is on a public auth page (like /login), redirect to correct dashboard
      if (profile && (pathname === "/login" || pathname === "/")) {
        router.push(`/dashboard/${profile.role}`);
      }
      
      // If user logs out and is on a dashboard page, redirect to login
      if (!profile && pathname.startsWith("/dashboard")) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const profile = await authService.login(email, password);
      setUser(profile);
      router.push(`/dashboard/${profile.role}`);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    setLoading(true);
    try {
      await authService.changePassword(newPassword);
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (photoURL: string) => {
    setLoading(true);
    try {
      await authService.updateProfilePicture(photoURL);
      if (authService.isDemoMode) {
        setUser((prev) => (prev ? { ...prev, photoURL } : null));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isDemoMode: authService.isDemoMode,
      changePassword,
      updateProfilePicture
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
