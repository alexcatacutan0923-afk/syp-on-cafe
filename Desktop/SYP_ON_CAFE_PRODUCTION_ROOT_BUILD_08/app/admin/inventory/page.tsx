"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type StockItem = {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_level: number;
  cost_per_unit: number;
  supplier: string | null;
  active: boolean;
  updated_at: string;
};

type Movement = {
  id: number;
  inventory_item_id: number;
  movement_type: string;
  quantity: number;
  balance_after: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  inventory_items: { name: string; unit: string } | { name: string; unit: string }[] | null;
};

const emptyForm = { name: "", unit: "g", current_stock: "", low_stock_level: "", cost_per_unit: "", supplier: "" };

function money(value: number) {
  return `₱${Number(value || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [adjustments, setAdjustments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const [stockResult, movementResult] = await Promise.all([
      supabase.from("inventory_items").select("*").eq("active", true).order("name"),
      supabase.from("inventory_movements").select("id,inventory_item_id,movement_type,quantity,balance_after,reference,notes,created_at,inventory_items(name,unit)").order("created_at", { ascending: false }).limit(30),
    ]);

    if (stockResult.error) setMessage(stockResult.error.message);
    else setItems((stockResult.data ?? []) as StockItem[]);

    if (!movementResult.error) setMovements((movementResult.data ?? []) as unknown as Movement[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const lowStock = useMemo(() => items.filter((item) => item.current_stock <= item.low_stock_level), [items]);
  const stockValue = useMemo(() => items.reduce((sum, item) => sum + item.current_stock * item.cost_per_unit, 0), [items]);

  async function addItem(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      name: form.name.trim(), unit: form.unit.trim(),
      current_stock: Number(form.current_stock || 0),
      low_stock_level: Number(form.low_stock_level || 0),
      cost_per_unit: Number(form.cost_per_unit || 0),
      supplier: form.supplier.trim() || null,
    };
    const { error } = await supabase.from("inventory_items").insert(payload);
    setSaving(false);
    if (error) return setMessage(error.message);
    setForm(emptyForm);
    setMessage("Inventory item added.");
    await loadData();
  }

  async function adjustStock(item: StockItem, type: "restock" | "waste") {
    const raw = Number(adjustments[item.id] || 0);
    if (!raw || raw < 0) return setMessage("Enter a valid quantity first.");
    setSaving(true);
    const signed = type === "restock" ? raw : -raw;
    const { error } = await supabase.rpc("adjust_inventory_stock", {
      p_inventory_item_id: item.id,
      p_quantity: signed,
      p_movement_type: type,
      p_reference: null,
      p_notes: type === "restock" ? "Manual restock" : "Manual waste/damage",
    });
    setSaving(false);
    if (error) return setMessage(error.message);
    setAdjustments((current) => ({ ...current, [item.id]: "" }));
    setMessage(type === "restock" ? `${item.name} restocked.` : `${item.name} waste recorded.`);
    await loadData();
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#080808] text-white">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div><h1 className="font-bold">📦 Inventory Management</h1><p className="text-xs text-neutral-500">Stock, restock, waste and low-stock monitoring</p></div>
            <div className="flex gap-2"><Link href="/admin/analytics" className="rounded-full border border-white/15 px-4 py-2 text-sm">Analytics</Link><Link href="/admin" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black">Back to Admin</Link></div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
          {message && <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">{message}</div>}
          <section className="grid gap-4 sm:grid-cols-3">
            <Metric label="Active ingredients" value={String(items.length)} />
            <Metric label="Low stock" value={String(lowStock.length)} danger={lowStock.length > 0} />
            <Metric label="Estimated stock value" value={money(stockValue)} />
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-bold">Add ingredient or supply</h2>
            <form onSubmit={addItem} className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <input required placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-3" />
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-3"><option>g</option><option>ml</option><option>pcs</option><option>kg</option><option>L</option></select>
              <input type="number" step="0.01" placeholder="Starting stock" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-3" />
              <input type="number" step="0.01" placeholder="Low-stock level" value={form.low_stock_level} onChange={(e) => setForm({ ...form, low_stock_level: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-3" />
              <input type="number" step="0.0001" placeholder="Cost per unit" value={form.cost_per_unit} onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-3" />
              <button disabled={saving} className="rounded-xl bg-amber-400 px-4 py-3 font-bold text-black disabled:opacity-50">Add Item</button>
              <input placeholder="Supplier (optional)" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="rounded-xl border border-white/10 bg-black px-3 py-3 md:col-span-3 lg:col-span-6" />
            </form>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-bold">Current Stock</h2><p className="text-sm text-neutral-500">Recipe deduction occurs when an order is marked completed.</p></div><button onClick={() => void loadData()} className="rounded-full border border-white/15 px-4 py-2 text-sm">Refresh</button></div>
            {loading ? <p className="text-neutral-500">Loading inventory…</p> : (
              <div className="grid gap-4 lg:grid-cols-2">
                {items.map((item) => {
                  const isLow = item.current_stock <= item.low_stock_level;
                  return <article key={item.id} className={`rounded-3xl border p-5 ${isLow ? "border-red-500/35 bg-red-500/10" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className="flex justify-between gap-4"><div><h3 className="font-bold">{item.name}</h3><p className="text-sm text-neutral-500">{item.supplier || "No supplier"}</p></div><span className={`rounded-full px-3 py-1 text-xs ${isLow ? "bg-red-500/20 text-red-300" : "bg-emerald-500/15 text-emerald-300"}`}>{isLow ? "LOW STOCK" : "IN STOCK"}</span></div>
                    <div className="mt-5 grid grid-cols-3 gap-3 text-sm"><div><p className="text-neutral-500">Available</p><p className="text-xl font-bold">{item.current_stock} {item.unit}</p></div><div><p className="text-neutral-500">Alert at</p><p>{item.low_stock_level} {item.unit}</p></div><div><p className="text-neutral-500">Value</p><p>{money(item.current_stock * item.cost_per_unit)}</p></div></div>
                    <div className="mt-5 flex gap-2"><input type="number" step="0.01" min="0" placeholder={`Quantity (${item.unit})`} value={adjustments[item.id] || ""} onChange={(e) => setAdjustments((current) => ({ ...current, [item.id]: e.target.value }))} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-3 py-2"/><button disabled={saving} onClick={() => void adjustStock(item, "restock")} className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black">+ Restock</button><button disabled={saving} onClick={() => void adjustStock(item, "waste")} className="rounded-xl border border-red-500/30 px-4 py-2 text-red-300">− Waste</button></div>
                  </article>;
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"><h2 className="text-xl font-bold">Recent Stock Movements</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-neutral-500"><tr><th className="pb-3">Date</th><th>Item</th><th>Type</th><th>Change</th><th>Balance</th><th>Reference</th></tr></thead><tbody>{movements.map((movement) => { const relation = Array.isArray(movement.inventory_items) ? movement.inventory_items[0] : movement.inventory_items; return <tr key={movement.id} className="border-t border-white/10"><td className="py-3">{new Date(movement.created_at).toLocaleString("en-PH")}</td><td>{relation?.name || "Item"}</td><td className="capitalize">{movement.movement_type}</td><td className={movement.quantity >= 0 ? "text-emerald-300" : "text-red-300"}>{movement.quantity > 0 ? "+" : ""}{movement.quantity} {relation?.unit}</td><td>{movement.balance_after} {relation?.unit}</td><td>{movement.reference || "—"}</td></tr>; })}</tbody></table></div></section>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className={`rounded-3xl border p-5 ${danger ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/[0.03]"}`}><p className="text-sm text-neutral-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>;
}
