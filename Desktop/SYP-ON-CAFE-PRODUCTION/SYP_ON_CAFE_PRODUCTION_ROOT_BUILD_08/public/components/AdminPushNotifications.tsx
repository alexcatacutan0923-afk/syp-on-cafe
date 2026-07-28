"use client";

import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { deleteToken, getMessaging, getToken, isSupported } from "firebase/messaging";
import { supabase } from "@/lib/supabase";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export default function AdminPushNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void isSupported().then(setSupported); }, []);

  async function enableNotifications() {
    setBusy(true); setMessage("");
    try {
      if (!(await isSupported())) throw new Error("Push notifications are not supported on this browser.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not allowed.");

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const token = await getToken(getMessaging(app), {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
      });
      if (!token) throw new Error("Firebase did not return a push token.");

      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Admin login is required.");

      const { error } = await supabase.from("admin_push_tokens").upsert({
        user_id: data.user.id,
        token,
        device_name: `${navigator.platform || "Device"} • ${new Date().toLocaleDateString("en-PH")}`,
        user_agent: navigator.userAgent.slice(0, 500),
        platform: navigator.platform || null,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: "token" });
      if (error) throw error;

      setEnabled(true);
      setMessage("Push notifications are active on this device.");
      new Notification("SYP ON CAFÉ Notifications", {
        body: "This device is ready for new-order alerts.",
        icon: "/brand/syp-logo-clean-v2.webp",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to enable notifications.");
    } finally { setBusy(false); }
  }

  async function sendTest() {
    setBusy(true); setMessage("");
    try {
      const { data, error } = await supabase.functions.invoke("send-admin-push", {
        body: { test: true, title: "SYP ON CAFÉ Test Alert", body: "Push notifications are working.", url: "/admin" },
      });
      if (error) throw error;
      setMessage(`Test sent to ${data?.sent ?? 0} device(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send test alert.");
    } finally { setBusy(false); }
  }

  async function disableNotifications() {
    setBusy(true); setMessage("");
    try {
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
      });
      if (token) {
        await supabase.from("admin_push_tokens").update({ is_active: false }).eq("token", token);
        await deleteToken(messaging);
      }
      setEnabled(false);
      setMessage("Push notifications disabled on this device.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to disable notifications.");
    } finally { setBusy(false); }
  }

  if (supported === null) return <p>Checking notification support…</p>;
  if (!supported) return <p>Push notifications are not supported by this browser.</p>;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-neutral-950 p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Multi-device order alerts</p>
      <h2 className="mt-2 text-2xl font-black">Phone and desktop push notifications</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-500">Enable this once on every logged-in admin phone, laptop, and POS device.</p>
      {message && <p className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">{message}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {!enabled ? (
          <button type="button" onClick={() => void enableNotifications()} disabled={busy} className="rounded-full bg-amber-400 px-6 py-3 font-black text-black disabled:opacity-50">{busy ? "Enabling..." : "Enable on This Device"}</button>
        ) : (
          <>
            <button type="button" onClick={() => void sendTest()} disabled={busy} className="rounded-full bg-emerald-400 px-6 py-3 font-black text-black disabled:opacity-50">Send Test Alert</button>
            <button type="button" onClick={() => void disableNotifications()} disabled={busy} className="rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 font-black text-red-300 disabled:opacity-50">Disable</button>
          </>
        )}
      </div>
    </section>
  );
}
