"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Locale, ThemeMode, UserProfile } from "@smart-desk/types";
import { api, getToken, setToken } from "./api";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  locale: Locale;
  theme: ThemeMode;
  loginWithGoogleIdToken: (idToken: string) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: UserProfile }>("/auth/me");
      setUser(data.user);
      document.documentElement.classList.toggle("dark", data.user.theme === "dark");
      document.documentElement.classList.toggle("light", data.user.theme === "light");
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const loginWithGoogleIdToken = useCallback(async (idToken: string) => {
    const data = await api<{ token: string; user: UserProfile }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      auth: false,
    });
    setToken(data.token);
    setUser(data.user);
    document.documentElement.classList.toggle("dark", data.user.theme === "dark");
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const setLocale = useCallback(async (locale: Locale) => {
    const data = await api<{ user: UserProfile }>("/auth/preferences", {
      method: "PATCH",
      body: JSON.stringify({ locale }),
    });
    setUser(data.user);
  }, []);

  const setTheme = useCallback(async (theme: ThemeMode) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    if (!getToken()) {
      setUser((u) => (u ? { ...u, theme } : u));
      return;
    }
    const data = await api<{ user: UserProfile }>("/auth/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme }),
    });
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      locale: user?.locale || "en",
      theme: user?.theme || "dark",
      loginWithGoogleIdToken,
      logout,
      refreshUser,
      setLocale,
      setTheme,
    }),
    [user, loading, loginWithGoogleIdToken, logout, refreshUser, setLocale, setTheme]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
