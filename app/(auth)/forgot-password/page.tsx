"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import api from "@/lib/axios";

type Step = "email" | "verify" | "complete";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function requestCode(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post<{ message?: string }>("/api/auth/password-reset/request", {
        email: email.trim(),
      });
      setMessage(response.data.message || "If the account exists, a reset code has been sent.");
      setStep("verify");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send the reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/password-reset/confirm", {
        email: email.trim(),
        code,
        newPassword,
      });
      setStep("complete");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="mb-6 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-blue-300/15 bg-blue-500/10 text-blue-300">
          {step === "complete" ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">
          {step === "email" ? "Reset your password" : step === "verify" ? "Check your email" : "Password updated"}
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-400">
          {step === "email"
            ? "We will send a secure 6-digit code to your account email."
            : step === "verify"
              ? `Enter the code sent to ${email.trim()}. It expires in 10 minutes.`
              : "You can now sign in with your new password."}
        </p>
      </header>

      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-3 text-xs leading-5 text-rose-200">{error}</div>}
      {message && <div className="mb-4 rounded-xl border border-blue-400/20 bg-blue-400/10 px-3.5 py-3 text-xs leading-5 text-blue-200">{message}</div>}

      {step === "email" && (
        <form onSubmit={requestCode} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-300">Account email</span>
            <span className="relative block">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" placeholder="Enter your email" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
            </span>
          </label>
          <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.32)] transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={resetPassword} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-300">Verification code</span>
            <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required placeholder="000000" className="h-14 w-full rounded-xl border border-blue-300/15 bg-[#071e38] px-4 text-center font-mono text-xl font-bold tracking-[0.35em] text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-300">New password</span>
            <span className="relative block">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300/70" />
              <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type={showPassword ? "text" : "password"} required autoComplete="new-password" placeholder="Enter a strong password" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-slate-500 transition hover:text-blue-300">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-300">Confirm new password</span>
            <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type={showPassword ? "text" : "password"} required autoComplete="new-password" placeholder="Repeat your new password" className="h-12 w-full rounded-xl border border-blue-300/15 bg-[#071e38] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10" />
          </label>

          <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.32)] transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {loading ? "Updating..." : "Set new password"}
          </button>

          <button type="button" disabled={loading} onClick={() => setStep("email")} className="w-full text-xs font-semibold text-blue-300 transition hover:text-white disabled:opacity-60">
            Send a new code
          </button>
        </form>
      )}

      {step === "complete" && (
        <Link href="/login?reason=password-reset" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.32)] transition hover:-translate-y-0.5 hover:bg-blue-500">
          Continue to login
        </Link>
      )}

      {step !== "complete" && (
        <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      )}
    </>
  );
}
