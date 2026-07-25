"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { findMember, saveCloudMember, setMemberSession } from "@/lib/member-store";
import { registerCloudMember } from "@/lib/member-cloud";
import "../member/member.css";

export default function MemberRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", mobile: "", birthday: "", pin: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof form, value: string) { setForm(v => ({ ...v, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mobile = form.mobile.replace(/\D/g, "");
    if (!form.name.trim() || mobile.length < 10 || !form.birthday || form.pin.length < 4) {
      setError("Complete all fields. Use a valid mobile number and at least a 4-digit PIN.");
      return;
    }
    if (findMember(mobile)) {
      setError("This mobile number is already registered. Sign in instead.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const cloud = await registerCloudMember({ ...form, mobile });
      const member = saveCloudMember(cloud);
      localStorage.setItem("sypMemberIdentity", member.mobile);
      setMemberSession(member.id);
      router.push("/member");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create membership. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="member-auth-page">
      <div className="member-auth-glow" />
      <section className="member-auth-card register-card">
        <Link href="/" className="member-auth-logo">S</Link>
        <small className="gold-label">JOIN THE SYP FAMILY</small>
        <h1>Create your membership</h1>
        <p>Earn stamps, unlock rewards, and keep every café visit in one place.</p>
        <form onSubmit={submit}>
          <label>Full name<input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your complete name" /></label>
          <label>Mobile number<input value={form.mobile} onChange={e => update("mobile", e.target.value)} inputMode="tel" placeholder="09XX XXX XXXX" /></label>
          <label>Birthday<input value={form.birthday} onChange={e => update("birthday", e.target.value)} type="date" max={new Date().toISOString().slice(0, 10)} /></label>
          <label>Create member PIN<input value={form.pin} onChange={e => update("pin", e.target.value.replace(/\D/g, "").slice(0, 6))} type="password" inputMode="numeric" placeholder="4–6 digits" /></label>
          {error && <div className="member-auth-error">{error}</div>}
          <button className="member-primary" disabled={submitting}>{submitting ? "Creating membership..." : "Create My Membership"}</button>
        </form>
        <div className="member-auth-footer">Already registered? <Link href="/member-login">Sign in</Link></div>
      </section>
    </main>
  );
}
