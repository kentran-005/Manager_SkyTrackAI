"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason") || sessionStorage.getItem("skytrack_auth_message");
    if (reason === "session-expired") {
      setMessage("Your session expired. Please sign in again.");
      sessionStorage.removeItem("skytrack_auth_message");
    } else if (reason === "registered") {
      setMessage("Account created successfully. You can sign in now.");
    }
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (process.env.NEXT_PUBLIC_NO_BACKEND === "true") {
      const isAdmin = email === "admin@gmail.com" && password === "123456";
      const isUser = email === "user@gmail.com" && password === "123456";
      if (!isAdmin && !isUser) {
        setError("Use admin@gmail.com or user@gmail.com with password 123456.");
        setLoading(false);
        return;
      }
      const role = isAdmin ? "ADMIN" : "USER";
      login(`mock-token-${role.toLowerCase()}`, { email, role, name: isAdmin ? "Admin Dev" : "User Dev" }, remember);
      router.push(isAdmin ? "/admin" : "/user");
      return;
    }

    try {
      const { data } = await api.post("/api/auth/login", { email: email.trim(), password });
      login(data.token, { email: data.email, role: data.role, name: data.name }, remember);
      router.push(data.role === "ADMIN" ? "/admin" : "/user");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-400">Sign in to your flight intelligence workspace</p>
      </header>

      {error && <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-3 text-xs leading-5 text-rose-200">{error}</div>}
      {message && <div className="mb-4 rounded-xl border border-blue-400/20 bg-blue-400/10 px-3.5 py-3 text-xs leading-5 text-blue-200">{message}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-slate-300">Email</span>
          <span className="relative block">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" placeholder="Enter your email" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold text-slate-300">Password</span>
          <span className="relative block">
            <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-slate-500 transition hover:text-blue-300">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-white/20 accent-blue-600" />
            Remember me
          </label>
          <button type="button" onClick={() => setMessage("Please contact a SkyTrack administrator to reset your password.")} className="text-xs font-semibold text-blue-300 transition hover:text-white">Forgot password?</button>
        </div>

        <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.32)] transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
          {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-blue-300 transition hover:text-white">Register</Link>
      </p>
    </>
  );
}
