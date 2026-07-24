"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
      } else {
        setAllowed(true);
      }
      setChecking(false);
    }

    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setAllowed(false);
        router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
      } else {
        setAllowed(true);
        setChecking(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (checking || !allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <section className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-950 p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-400" />
          <p className="mt-5 font-semibold text-amber-400">Checking secure access...</p>
          <p className="mt-2 text-sm text-neutral-500">SYP ON CAFÉ Admin System</p>
        </section>
      </main>
    );
  }

  return children;
}