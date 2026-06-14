"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (!accepted) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", { name: name.trim(), email: email.trim(), password });
      router.push("/login?reason=registered");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  const passwordField = (
    label: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    setVisible: (value: boolean) => void,
    autoComplete: string,
  ) => (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-300">{label}</span>
      <span className="relative block">
        <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
        <input value={value} onChange={(event) => setValue(event.target.value)} type={visible ? "text" : "password"} required minLength={6} autoComplete={autoComplete} placeholder={label} className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
        <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-slate-500 transition hover:text-blue-300">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );

  return (
    <>
      <header className="mb-5">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-white">Create your account</h1>
        <p className="mt-1.5 text-sm text-slate-400">Join SkyTrack AI today</p>
      </header>

      {error && <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-3 text-xs leading-5 text-rose-200">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-300">Full name</span>
            <span className="relative block">
              <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
              <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" placeholder="Enter your full name" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-300">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" placeholder="Enter your email" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
            </span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {passwordField("Password", password, setPassword, showPassword, setShowPassword, "new-password")}
          {passwordField("Confirm password", confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, "new-password")}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-400">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue-600" />
          <span>I agree to the <span className="font-semibold text-blue-300">Terms of Service</span> and <span className="font-semibold text-blue-300">Privacy Policy</span>.</span>
        </label>

        <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.32)] transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
          {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-blue-300 transition hover:text-white">Login</Link>
      </p>
    </>
  );
}
