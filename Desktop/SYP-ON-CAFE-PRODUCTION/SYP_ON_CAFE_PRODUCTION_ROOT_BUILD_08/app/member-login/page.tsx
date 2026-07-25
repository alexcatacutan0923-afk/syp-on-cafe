"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { findMember, getMembers, saveCloudMember, setMemberSession } from "@/lib/member-store";
import { loginCloudMember } from "@/lib/member-cloud";
import "../member/member.css";

export default function MemberLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identity, setIdentity] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMembers();
    const fromQr = searchParams.get("identity")?.trim();
    const saved = localStorage.getItem("sypMemberIdentity");
    if (fromQr) setIdentity(fromQr);
    else if (saved) setIdentity(saved);
  }, [searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identity.trim() || pin.length < 4) {
      setError("Enter your mobile number or member ID and at least 4 digits.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const cloud = await loginCloudMember(identity, pin);
      const local = cloud ? saveCloudMember(cloud) : findMember(identity, pin);
      if (!local) {
        setError("Member account not found or PIN is incorrect.");
        setSubmitting(false);
        return;
      }
      localStorage.setItem("sypMemberIdentity", identity.trim());
      setMemberSession(local.id);
      router.push("/member");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="member-auth-page">
      <div className="member-auth-glow" />
      <section className="member-auth-card">
        <Link href="/" className="member-auth-logo">S</Link>
        <small className="gold-label">SYP DIGITAL MEMBERSHIP</small>
        <h1>Welcome back, KaSyp!</h1>
        <p>{searchParams.get("identity") ? "Your QR code opened this account. Enter your PIN to continue." : "Check your loyalty stamps, rewards, visits, and café moments."}</p>
        <form onSubmit={submit}>
          <label>Mobile number or Member ID<input value={identity} onChange={e => setIdentity(e.target.value)} placeholder="09XX XXX XXXX or SYP0001" /></label>
          <label>Member PIN<div className="pin-wrap"><input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} type={showPin ? "text" : "password"} inputMode="numeric" placeholder="••••" /><button type="button" onClick={() => setShowPin(v => !v)}>{showPin ? "Hide" : "Show"}</button></div></label>
          {error && <div className="member-auth-error">{error}</div>}
          <button className="member-primary" disabled={submitting}>{submitting ? "Opening dashboard..." : "Open My Dashboard"}</button>
        </form>
        <div className="member-auth-footer">New member? <Link href="/member-register">Create a free account</Link></div>
        <Link className="staff-login-link" href="/login">Staff login</Link>
      </section>
    </main>
  );
}
