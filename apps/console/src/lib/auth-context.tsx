"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminFetch, getAdminToken, setAdminToken } from "./api";

export interface AdminUser {
  username: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const data = await adminFetch<{ ok: boolean; user: AdminUser }>("/admin/me");
      if (data.ok && data.user) {
        setUser(data.user);
        return true;
      }
      setUser(null);
      setAdminToken(null);
      return false;
    } catch {
      setUser(null);
      setAdminToken(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const data = await adminFetch<{
      ok: boolean;
      token: string;
      user: AdminUser;
    }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data.ok && data.token) {
      setAdminToken(data.token);
      setUser(data.user);
    }
  };

  const logout = async () => {
    try {
      await adminFetch("/admin/logout", { method: "POST" });
    } catch {
      // Ignore network failure on logout
    } finally {
      setAdminToken(null);
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AuthProvider");
  }
  return context;
}
