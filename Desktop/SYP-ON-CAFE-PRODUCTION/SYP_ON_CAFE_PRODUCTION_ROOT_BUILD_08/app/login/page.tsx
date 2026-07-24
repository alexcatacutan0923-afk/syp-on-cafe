"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requestedNext = searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/admin";

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(nextPath);
        return;
      }
      const savedEmail = localStorage.getItem("sypAdminEmail");
      if (savedEmail) setEmail(savedEmail);
      setChecking(false);
    }
    void checkSession();
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Enter your admin email and password.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) throw error;
      if (rememberMe) localStorage.setItem("sypAdminEmail", cleanEmail);
      else localStorage.removeItem("sypAdminEmail");
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">Checking session...</main>;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
      </div>
      <section className="relative w-full max-w-md rounded-[2rem] border border-amber-400/20 bg-neutral-950/95 p-7 shadow-2xl sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-black text-2xl font-black text-amber-400">SYP</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-amber-400">Secure Staff Access</p>
          <h1 className="mt-3 text-3xl font-black">SYP ON CAFÉ</h1>
          <p className="mt-2 text-sm text-neutral-500">Admin and Kitchen Management</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-neutral-300">Email address</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@syponcafe.shop" className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 outline-none focus:border-amber-400" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-300">Password</span>
            <div className="relative mt-2">
              <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3.5 pr-20 outline-none focus:border-amber-400" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-amber-400">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </label>
          <label className="flex items-center gap-3 text-sm text-neutral-400">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 accent-amber-400" />
            Remember my email on this device
          </label>
          {errorMessage && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{errorMessage}</div>}
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-amber-400 px-6 py-4 font-bold text-black hover:bg-amber-300 disabled:opacity-50">{submitting ? "Signing In..." : "Secure Login"}</button>
        </form>
        <p className="mt-7 border-t border-white/10 pt-6 text-center text-xs leading-5 text-neutral-600">Authorized SYP ON CAFÉ staff only.</p>
      </section>
    </main>
  );
}