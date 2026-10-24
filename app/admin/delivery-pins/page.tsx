"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type DeliveryPin = {
  id: string;
  token: string;
  customer_name: string;
  phone: string;
  order_ref: string | null;
  address_text: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "awaiting_pin" | "pin_saved";
  created_at: string;
  updated_at: string | null;
};

function AdminContent() {
  const [rows, setRows] = useState<DeliveryPin[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [landmark, setLandmark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const load = useCallback(async () => {
    setError("");
    const { data, error: rpcError } = await supabase.rpc("admin_list_delivery_pins");
    if (rpcError) {
      setError(rpcError.message.includes("admin_list_delivery_pins")
        ? "Database setup is not complete yet. Run supabase/BUILD_26_DELIVERY_PIN_SQL.sql in Supabase SQL Editor."
        : rpcError.message);
      return;
    }
    setRows((data ?? []) as DeliveryPin[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setNotice("");
    const { data, error: rpcError } = await supabase.rpc("admin_create_delivery_pin", {
      p_customer_name: name.trim(),
      p_phone: phone.trim(),
      p_order_ref: orderRef.trim() || null,
      p_landmark: landmark.trim() || null,
    });
    setLoading(false);
    if (rpcError) { setError(rpcError.message); return; }
    const created = (Array.isArray(data) ? data[0] : data) as DeliveryPin | undefined;
    if (!created?.token) { setError("Link was not returned. Refresh and try again."); return; }
    const url = `${origin}/delivery-pin/${created.token}`;
    setRows(current => [created, ...current]);
    setName(""); setPhone(""); setOrderRef(""); setLandmark("");
    try {
      await navigator.clipboard.writeText(url);
      setNotice(`Unique link created and copied for ${created.customer_name}.`);
    } catch {
      setNotice(`Link created: ${url}`);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[.25em] text-pink-400">STREET • ICED • BREWED</p>
            <h1 className="mt-2 text-3xl font-black">Delivery Pin Manager</h1>
            <p className="mt-2 text-sm text-neutral-400">Create one customer link per delivery and track saved map pins.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5">← Admin</Link>
            <button onClick={() => void load()} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5">Refresh</button>
          </div>
        </header>

        <section className="mt-7 rounded-2xl border border-pink-400/20 bg-neutral-950 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Create unique customer link</h2>
          <form onSubmit={createLink} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Customer name" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-pink-400" />
            <input required maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Mobile number" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-pink-400" />
            <input maxLength={100} value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="Order number / reference (optional)" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-pink-400" />
            <input maxLength={300} value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Known landmark (optional)" className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-pink-400" />
            <button disabled={loading} className="rounded-xl bg-pink-500 px-4 py-3 font-black text-black transition hover:bg-pink-400 disabled:opacity-50 sm:col-span-2">{loading ? "Creating link…" : "＋ Create unique link & copy"}</button>
          </form>
          <p className="mt-3 text-xs text-neutral-500">The copied link is unique to this delivery. Send it only to the intended customer.</p>
        </section>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        {notice && <p className="mt-4 break-words rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{notice}</p>}

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Delivery records <span className="text-sm font-medium text-neutral-500">({rows.length})</span></h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-neutral-400"><tr>{["Customer", "Order", "Status", "Coordinates", "Address / landmark", "Created", "Link"].map(x => <th key={x} className="px-4 py-3">{x}</th>)}</tr></thead>
              <tbody>{rows.map(row => (
                <tr key={row.id} className="border-t border-white/5 align-top">
                  <td className="px-4 py-4"><div className="font-bold">{row.customer_name}</div><div className="mt-1 text-xs text-neutral-500">{row.phone}</div></td>
                  <td className="px-4 py-4">{row.order_ref || "—"}</td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.status === "pin_saved" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{row.status === "pin_saved" ? "Pin saved" : "Awaiting pin"}</span></td>
                  <td className="px-4 py-4">{row.latitude !== null && row.longitude !== null ? <><div className="font-mono text-xs">{row.latitude.toFixed(6)}, {row.longitude.toFixed(6)}</div><a target="_blank" rel="noreferrer" className="mt-2 inline-block text-pink-300 underline" href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}>Open Google Maps ↗</a></> : <span className="text-neutral-500">Not submitted</span>}</td>
                  <td className="max-w-64 whitespace-normal px-4 py-4">{row.address_text || "—"}{row.landmark && <div className="mt-1 text-xs text-neutral-400">{row.landmark}</div>}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-neutral-400">{new Date(row.created_at).toLocaleString("en-PH")}</td>
                  <td className="px-4 py-4"><button onClick={async () => { const url = `${origin}/delivery-pin/${row.token}`; try { await navigator.clipboard.writeText(url); setNotice("Customer link copied."); } catch { setNotice(url); } }} className="whitespace-nowrap rounded-lg border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/5">Copy link</button></td>
                </tr>
              ))}</tbody>
            </table>
            {rows.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">No delivery links yet. Create your first link above.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DeliveryPinsAdminPage() {
  return <ProtectedRoute><AdminContent /></ProtectedRoute>;
}
