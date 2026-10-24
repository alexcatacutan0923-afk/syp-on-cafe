"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

declare global { interface Window { L?: any } }

type Temperature = "iced" | "hot" | "regular";
type Product = {
  id: number; name: string; category: string; description: string | null;
  image: string | null; price16: number; price22: number | null;
  available: boolean; temperature: Temperature | null;
  size_small_label: string | null; size_large_label: string | null;
};
type StoreSettings = { ordering_enabled: boolean; store_status: string; free_delivery: boolean; delivery_fee: number; announcement?: string };
type Draft = { size: "small" | "large"; temperature: "iced" | "hot"; ice: string; sugar: string; quantity: number };
type CartLine = { product: Product; size: "small" | "large"; temperature: "iced" | "hot"; ice: string; sugar: string; quantity: number; unitPrice: number };
type PaymentMethod = "cash" | "gcash";

const DEFAULT_CENTER: [number, number] = [14.8001, 120.5375];
const ICE_LEVELS = ["No Ice", "25%", "50%", "75%", "100%"];
const SUGAR_LEVELS = ["0%", "25%", "50%", "75%", "100%"];
const DEFAULT_SETTINGS: StoreSettings = { ordering_enabled: true, store_status: "open", free_delivery: false, delivery_fee: 30 };

function isHot(product: Product) { return product.temperature === "hot"; }
function sizeLabel(product: Product, size: "small" | "large") {
  const hot = isHot(product);
  if (size === "small") return product.size_small_label || (hot ? "8oz" : "16oz");
  return product.size_large_label || (hot ? "12oz" : "22oz");
}
function itemPrice(product: Product, size: "small" | "large") {
  return Number(size === "large" && product.price22 !== null ? product.price22 : product.price16);
}
function money(value: number) { return "₱" + Number(value).toFixed(0); }

function DeliveryMap({ latitude, longitude, onChange }: { latitude: number | null; longitude: number | null; onChange: (lat: number, lng: number) => void }) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const callback = useRef(onChange);
  useEffect(() => { callback.current = onChange; }, [onChange]);
  useEffect(() => {
    let cancelled = false;
    async function setup() {
      if (!document.getElementById("syp-quick-leaflet-css")) {
        const css = document.createElement("link"); css.id = "syp-quick-leaflet-css"; css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(css);
      }
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById("syp-quick-leaflet-js") as HTMLScriptElement | null;
          if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(new Error("Map library failed to load")), { once: true }); return; }
          const script = document.createElement("script"); script.id = "syp-quick-leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; script.async = true;
          script.onload = () => resolve(); script.onerror = () => reject(new Error("Map library failed to load")); document.body.appendChild(script);
        });
      }
      if (cancelled || !host.current || !window.L || map.current) return;
      const L = window.L; const initial: [number, number] = latitude !== null && longitude !== null ? [latitude, longitude] : DEFAULT_CENTER;
      const instance = L.map(host.current, { zoomControl: true, scrollWheelZoom: true }).setView(initial, latitude !== null ? 17 : 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 20, attribution: "&copy; OpenStreetMap contributors" }).addTo(instance);
      const pin = L.marker(initial, { draggable: true, autoPan: true }).addTo(instance);
      pin.on("dragend", () => { const p = pin.getLatLng(); callback.current(Number(p.lat.toFixed(7)), Number(p.lng.toFixed(7))); });
      instance.on("click", (event: any) => { pin.setLatLng(event.latlng); callback.current(Number(event.latlng.lat.toFixed(7)), Number(event.latlng.lng.toFixed(7))); });
      map.current = instance; marker.current = pin; window.setTimeout(() => instance.invalidateSize(), 100);
    }
    setup().catch((error) => console.error("Quick order map failed to load", error));
    return () => { cancelled = true; if (map.current) { map.current.remove(); map.current = null; marker.current = null; } };
  }, []);
  useEffect(() => { if (map.current && marker.current && latitude !== null && longitude !== null) { marker.current.setLatLng([latitude, longitude]); map.current.setView([latitude, longitude], Math.max(map.current.getZoom(), 16)); } }, [latitude, longitude]);
  return <div ref={host} className="h-[280px] w-full" aria-label="Pin your delivery location" />;
}

export default function QuickOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [savedTotal, setSavedTotal] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setLoadError("");
      const [menu, store] = await Promise.all([
        supabase.from("products").select("id,name,category,description,image,price16,price22,available,temperature,size_small_label,size_large_label").eq("available", true).order("id", { ascending: true }),
        supabase.from("store_settings").select("ordering_enabled,store_status,free_delivery,delivery_fee,announcement").eq("id", 1).single(),
      ]);
      if (!active) return;
      if (menu.error) { setLoadError(menu.error.message); setProducts([]); }
      else setProducts(((menu.data ?? []) as Product[]).filter((product) => product.category !== "Fries"));
      if (!store.error && store.data) setSettings({ ...DEFAULT_SETTINGS, ...(store.data as StoreSettings), delivery_fee: Number(store.data.delivery_fee ?? 30) });
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const orderingAvailable = settings.ordering_enabled && !["closed", "temporarily_closed"].includes(settings.store_status);
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, search]);
  const subtotal = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFee = settings.free_delivery ? 0 : Math.max(0, Number(settings.delivery_fee ?? 30));
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  function draftFor(product: Product): Draft {
    return drafts[product.id] ?? { size: "small", temperature: isHot(product) ? "hot" : "iced", ice: "50%", sugar: "100%", quantity: 1 };
  }
  function changeDraft(product: Product, patch: Partial<Draft>) {
    setDrafts(prev => ({ ...prev, [product.id]: { ...draftFor(product), ...patch } }));
  }
  function addItem(product: Product) {
    if (!orderingAvailable) return;
    const d = draftFor(product);
    const temp = isHot(product) ? "hot" : d.temperature;
    const line: CartLine = { product, size: d.size === "large" && product.price22 === null ? "small" : d.size, temperature: temp, ice: temp === "hot" ? "N/A" : d.ice, sugar: d.sugar, quantity: Math.max(1, d.quantity), unitPrice: itemPrice(product, d.size === "large" && product.price22 === null ? "small" : d.size) };
    setCart(prev => [...prev, line]);
  }
  function removeItem(index: number) { setCart(prev => prev.filter((_, i) => i !== index)); }
  function locateMe() {
    if (!navigator.geolocation) { setLocationMessage("Hindi supported ang location sa browser na ito."); return; }
    setLocationMessage("Kinukuha ang current location...");
    navigator.geolocation.getCurrentPosition(pos => {
      setLatitude(Number(pos.coords.latitude.toFixed(7))); setLongitude(Number(pos.coords.longitude.toFixed(7)));
      setLocationMessage("Nakuha ang location. Puwede mo pang ilipat ang pin sa mapa.");
    }, err => setLocationMessage(err.code === err.PERMISSION_DENIED ? "Payagan ang location access sa browser o i-pin manually sa mapa." : "Hindi nakuha ang location. I-pin manually sa mapa."), { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting) return; setSubmitError("");
    const cleanName = customerName.trim(); const cleanMobile = mobile.replace(/\s+/g, "").trim();
    if (!cleanName) { setSubmitError("Ilagay ang pangalan."); return; }
    if (!/^09\d{9}$/.test(cleanMobile)) { setSubmitError("Ilagay ang valid na Philippine mobile number (hal. 09171234567)."); return; }
    if (!cart.length) { setSubmitError("Magdagdag muna ng kahit isang item sa order."); return; }
    if (!address.trim()) { setSubmitError("Ilagay ang complete delivery address."); return; }
    if (latitude === null || longitude === null) { setSubmitError("I-pin ang delivery location sa mapa."); return; }
    if (!orderingAvailable) { setSubmitError("Sarado muna ang online ordering. Pakisubukan ulit mamaya."); return; }
    setSubmitting(true);
    try {
      const orderItems = cart.map(line => ({
        productId: line.product.id,
        name: line.product.name + " (" + (line.temperature === "hot" ? "Hot" : "Iced") + (line.temperature === "hot" ? "" : ", Ice " + line.ice) + ", Sugar " + line.sugar + ")",
        size: sizeLabel(line.product, line.size),
        price: Number(line.unitPrice),
        quantity: Number(line.quantity),
        temperature: line.temperature,
        basePrice: Number(line.unitPrice),
        addOns: [],
      }));
      const { data, error } = await supabase.rpc("create_customer_order", {
        p_customer_name: cleanName,
        p_mobile: cleanMobile,
        p_order_type: "delivery",
        p_payment_method: paymentMethod,
        p_address: address.trim(),
        p_landmark: landmark.trim(),
        p_notes: [notes.trim(), "[DELIVERY PIN: " + latitude + ", " + longitude + "]", "[MAP: https://www.google.com/maps?q=" + latitude + "," + longitude + "]"].filter(Boolean).join("\n"),
        p_subtotal: subtotal,
        p_delivery_fee: deliveryFee,
        p_total: total,
        p_items: orderItems,
      });
      if (error) throw error;
      const created = Array.isArray(data) ? data[0] : data;
      if (!created?.order_number) throw new Error("Na-save ang order pero walang order number na naibalik.");
      setSavedTotal(total); setOrderNumber(String(created.order_number));
      try {
        await supabase.functions.invoke("send-admin-push", { body: { orderNumber: created.order_number, customerName: cleanName, orderType: "delivery", total } });
      } catch (notifyError) { console.warn("Order saved; admin notification may not have been sent.", notifyError); }
      setCart([]);
    } catch (error) {
      const e = error as { message?: string; details?: string };
      setSubmitError(e?.message || e?.details || (error instanceof Error ? error.message : "Hindi na-submit ang order."));
    } finally { setSubmitting(false); }
  }

  if (orderNumber) return <main className="min-h-screen bg-[#100b08] px-4 py-12 text-white"><section className="mx-auto max-w-xl rounded-3xl border border-amber-400/20 bg-[#1c1510] p-8 text-center"><p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">SYP ON CAFÉ</p><div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-3xl text-emerald-300">✓</div><h1 className="mt-5 text-3xl font-black">Order received!</h1><p className="mt-3 text-neutral-300">Salamat, {customerName}! Nasa system na ang order mo for staff confirmation.</p><p className="mt-6 text-sm text-neutral-400">Order number</p><p className="mt-1 text-3xl font-black text-amber-300">{orderNumber}</p><p className="mt-4 text-xl font-bold">{money(savedTotal)}</p><p className="mt-3 text-sm text-neutral-400">Please wait for confirmation from SYP ON CAFÉ via your contact number.</p><Link href="/" className="mt-7 inline-flex rounded-full bg-amber-400 px-6 py-3 font-bold text-black">Back to SYP ON CAFÉ</Link></section></main>;

  return <main className="min-h-screen bg-[#100b08] text-white">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#100b08]/95 px-4 py-4 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><Link href="/" className="min-w-0"><span className="block text-lg font-black">SYP ON CAFÉ</span><span className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Street • Iced • Brewed</span></Link><Link href="/menu" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">Full Menu</Link></div></header>
    <section className="mx-auto max-w-5xl px-4 py-8"><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Fast & easy</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Quick Order</h1><p className="mt-3 max-w-2xl text-sm text-neutral-300">Piliin ang drinks, customize ang size, ice at sugar, pagkatapos ilagay ang delivery details. One form lang, KasYP. 🤎</p>
      <div className={"mt-5 rounded-2xl border p-4 " + (orderingAvailable ? "border-emerald-400/20 bg-emerald-400/5" : "border-red-400/30 bg-red-400/5")}><p className="font-bold">{orderingAvailable ? (settings.store_status === "busy" ? "🟡 Busy — maaaring mas matagal ang preparation" : "🟢 Accepting orders") : "🔴 Online ordering is currently closed"}</p>{settings.announcement && <p className="mt-1 text-sm text-neutral-300">{settings.announcement}</p>}{settings.free_delivery && <p className="mt-1 text-sm font-bold text-amber-200">FREE DELIVERY ACTIVE</p>}</div>
      {loading ? <div className="py-16 text-center text-neutral-400">Loading menu...</div> : loadError ? <div className="mt-6 rounded-2xl border border-red-400/30 p-4 text-red-200">{loadError}</div> : <form onSubmit={submitOrder} className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">1. Choose your drinks</h2><span className="text-xs text-neutral-400">{itemCount} item(s)</span></div><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drinks..." className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-amber-300" />
            <div className="mt-4 space-y-4">{filteredProducts.map(product => { const d = draftFor(product); const hot = isHot(product); return <article key={product.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex gap-3"><div className="min-w-0 flex-1"><p className="font-bold">{product.name}</p><p className="mt-1 text-xs text-neutral-400">{product.category}{product.description ? " • " + product.description : ""}</p><p className="mt-2 text-sm font-black text-amber-200">{money(itemPrice(product, d.size === "large" && product.price22 === null ? "small" : d.size))}{product.price22 !== null ? " • " + sizeLabel(product, d.size) : " • " + sizeLabel(product, "small")}</p></div>{product.image && <img src={product.image} alt="" className="h-16 w-16 rounded-xl object-cover" loading="lazy" />}</div>
              <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs text-neutral-300">Size<select value={d.size} onChange={e => changeDraft(product, { size: e.target.value as Draft["size"] })} className="mt-1 w-full rounded-xl border border-white/10 bg-[#18120e] px-3 py-2.5 text-sm">{[<option key="s" value="small">{sizeLabel(product, "small")} — {money(Number(product.price16))}</option>, ...(product.price22 !== null ? [<option key="l" value="large">{sizeLabel(product, "large")} — {money(Number(product.price22))}</option>] : [])]}</select></label><label className="text-xs text-neutral-300">Temperature<select disabled={hot} value={hot ? "hot" : d.temperature} onChange={e => changeDraft(product, { temperature: e.target.value as Draft["temperature"] })} className="mt-1 w-full rounded-xl border border-white/10 bg-[#18120e] px-3 py-2.5 text-sm"><option value="iced">Iced</option><option value="hot">Hot</option></select></label>
                <label className="text-xs text-neutral-300">Ice level<select disabled={hot} value={hot ? "N/A" : d.ice} onChange={e => changeDraft(product, { ice: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-[#18120e] px-3 py-2.5 text-sm">{hot ? <option value="N/A">Not applicable</option> : ICE_LEVELS.map(x => <option key={x} value={x}>{x}</option>)}</select></label>
                <label className="text-xs text-neutral-300">Sugar level<select value={d.sugar} onChange={e => changeDraft(product, { sugar: e.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-[#18120e] px-3 py-2.5 text-sm">{SUGAR_LEVELS.map(x => <option key={x} value={x}>{x}</option>)}</select></label></div>
              <div className="mt-3 flex items-center gap-3"><label className="text-xs text-neutral-300">Qty<input type="number" min={1} max={20} value={d.quantity} onChange={e => changeDraft(product, { quantity: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })} className="ml-2 w-16 rounded-lg border border-white/10 bg-[#18120e] px-2 py-2 text-sm" /></label><button type="button" onClick={() => addItem(product)} disabled={!orderingAvailable} className="ml-auto rounded-full bg-amber-400 px-4 py-2.5 text-sm font-black text-black disabled:opacity-40">+ Add {money(itemPrice(product, d.size === "large" && product.price22 === null ? "small" : d.size))}</button></div></article>})}</div>
          </section>
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"><h2 className="text-xl font-black">2. Your order</h2>{cart.length === 0 ? <p className="mt-3 text-sm text-neutral-400">Wala pang items. Pili ng drinks sa taas.</p> : <div className="mt-3 space-y-3">{cart.map((line, index) => <div key={index} className="flex items-start gap-3 rounded-xl border border-white/10 p-3"><div className="min-w-0 flex-1"><p className="font-bold">{line.product.name}</p><p className="mt-1 text-xs text-neutral-400">{sizeLabel(line.product, line.size)} • {line.temperature === "hot" ? "Hot" : "Iced"}{line.temperature !== "hot" ? " • Ice " + line.ice : ""} • Sugar {line.sugar} • Qty {line.quantity}</p><p className="mt-1 text-sm font-bold text-amber-200">{money(line.unitPrice * line.quantity)}</p></div><button type="button" onClick={() => removeItem(index)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs">Remove</button></div>)}</div>}</section>
        </div>
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"><h2 className="text-xl font-black">3. Delivery details</h2><div className="mt-4 space-y-3"><label className="block text-sm text-neutral-300">Full name<input required maxLength={120} value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="Your name" /></label><label className="block text-sm text-neutral-300">Mobile number<input required inputMode="numeric" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="09XXXXXXXXX" /></label><label className="block text-sm text-neutral-300">Complete delivery address<textarea required maxLength={500} rows={3} value={address} onChange={e => setAddress(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="House no., street, barangay, town..." /></label><label className="block text-sm text-neutral-300">Landmark (optional)<input maxLength={300} value={landmark} onChange={e => setLandmark(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="Near 7-Eleven, gate color, etc." /></label></div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20"><div className="flex items-center justify-between gap-3 px-4 py-3"><p className="text-sm font-bold">Exact map pin <span className="text-red-300">*</span></p><button type="button" onClick={locateMe} className="rounded-full border border-amber-300/40 px-3 py-2 text-xs font-bold text-amber-200">Use my location</button></div><DeliveryMap latitude={latitude} longitude={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); setLocationMessage("Na-set ang map pin. Puwede mo itong i-adjust."); }} />{latitude !== null && longitude !== null && <p className="px-4 py-2 text-xs text-emerald-200">Pin: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>}<p className="px-4 pb-3 text-xs text-neutral-400">I-tap ang mapa o i-drag ang marker papunta sa eksaktong delivery spot.</p>{locationMessage && <p className="px-4 pb-3 text-xs text-amber-200">{locationMessage}</p>}</div>
            <label className="mt-4 block text-sm text-neutral-300">Order notes (optional)<textarea rows={2} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="Extra instructions..." /></label>
            <label className="mt-4 block text-sm text-neutral-300">Payment method<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"><option value="cash">Cash on delivery</option><option value="gcash">GCash (subject to staff confirmation)</option></select></label>
          </section>
          <section className="sticky top-20 rounded-3xl border border-amber-300/20 bg-[#1c1510] p-5"><h2 className="text-xl font-black">Order summary</h2><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-4 text-neutral-300"><span>Items ({itemCount})</span><span>{money(subtotal)}</span></div><div className="flex justify-between gap-4 text-neutral-300"><span>Delivery fee</span><span>{deliveryFee === 0 ? "FREE" : money(deliveryFee)}</span></div><div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-lg font-black"><span>Total</span><span className="text-amber-200">{money(total)}</span></div></div>{submitError && <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{submitError}</p>}<button type="submit" disabled={submitting || !orderingAvailable || cart.length === 0} className="mt-5 w-full rounded-full bg-amber-400 px-5 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-40">{submitting ? "Submitting order..." : "Place delivery order"}</button><p className="mt-3 text-center text-xs text-neutral-400">Your order will be sent to SYP ON CAFÉ POS for confirmation.</p></section>
        </div>
      </form>}
    </section>
    <footer className="border-t border-white/10 px-4 py-6 text-center text-xs text-neutral-500">SYP ON CAFÉ • Street • Iced • Brewed • Apollo, Orani, Bataan</footer>
  </main>;
}
