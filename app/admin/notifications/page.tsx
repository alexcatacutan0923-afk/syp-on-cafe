"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminPushNotifications from "@/components/AdminPushNotifications";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/admin");
      else setChecking(false);
    });
  }, [router]);

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#080808] text-white">Checking admin session…</main>;

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/90"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4"><div><b>SYP ON CAFÉ ADMIN</b><p className="text-xs text-neutral-500">Notification Settings</p></div><Link href="/admin" className="rounded-full border border-white/15 px-5 py-2 text-sm font-black">← Admin</Link></div></header>
      <div className="mx-auto max-w-5xl px-5 py-8"><AdminPushNotifications /></div>
    </main>
  );
}
