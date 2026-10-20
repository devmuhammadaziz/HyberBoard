"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAdminAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(username.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0B0F19] px-4 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-600/10 blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-2xl shadow-indigo-500/30">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            HyperBoard Console
          </h1>
          <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
            Enterprise administration & system telemetry
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[#111827]/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Operator Sign In</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Enter your administrative credentials
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <KeyRound className="h-4 w-4" />
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-[var(--border)] bg-[#0B0F19]/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[#0B0F19]/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)] hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0B0F19] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <span>Sign In to Console</span>
              )}
            </button>
          </form>

          {/* Security Features Accordion / Tips */}
          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Hardened Security Standard</span>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-[var(--text-muted)]">
              <li>• Constant-time cryptographic comparison</li>
              <li>• Automated IP brute-force rate limiter</li>
              <li>• Signed HttpOnly session tokens</li>
            </ul>

            <div className="mt-3 rounded-lg bg-white/5 p-2 text-[11px] text-[var(--text-secondary)]">
              Default password: <span className="font-mono text-indigo-300">demo1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
