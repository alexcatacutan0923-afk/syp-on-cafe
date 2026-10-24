"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global { interface Window { L?: any; } }

type PinRecord = {
  customer_name: string;
  order_ref: string | null;
  address_text: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "awaiting_pin" | "pin_saved";
};

const DEFAULT_CENTER: [number, number] = [14.8001, 120.5375];

function PinkMap({ latitude, longitude, onChange }: {
  latitude: number; longitude: number; onChange: (lat: number, lng: number) => void;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    async function setup() {
      if (!document.getElementById("syp-pin-leaflet-css")) {
        const css = document.createElement("link");
        css.id = "syp-pin-leaflet-css";
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);
      }
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById("syp-pin-leaflet-js") as HTMLScriptElement | null;
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Map library failed to load")), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.id = "syp-pin-leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Map library failed to load"));
          document.body.appendChild(script);
        });
      }
      if (cancelled || !host.current || !window.L || map.current) return;
      const L = window.L;
      const initial: [number, number] = [latitude, longitude];
      const m = L.map(host.current, { zoomControl: true, scrollWheelZoom: true }).setView(initial, 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(m);
      const icon = L.divIcon({
        className: "syp-pink-pin",
        html: '<div style="width:30px;height:30px;background:#ec4899;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 10px #0008;position:relative"><span style="position:absolute;width:8px;height:8px;background:white;border-radius:50%;top:8px;left:8px"></span></div>',
        iconSize: [30, 30], iconAnchor: [15, 30]
      });
      const pin = L.marker(initial, { icon, draggable: true, autoPan: true }).addTo(m);
      pin.on("dragend", () => { const p = pin.getLatLng(); onChangeRef.current(Number(p.lat.toFixed(7)), Number(p.lng.toFixed(7))); });
      m.on("click", (event: any) => { pin.setLatLng(event.latlng); onChangeRef.current(Number(event.latlng.lat.toFixed(7)), Number(event.latlng.lng.toFixed(7))); });
      map.current = m; marker.current = pin;
      window.setTimeout(() => m.invalidateSize(), 100);
    }
    setup().catch(error => console.error("Delivery map could not load", error));
    return () => { cancelled = true; if (map.current) { map.current.remove(); map.current = null; marker.current = null; } };
  }, []);

  useEffect(() => {
    if (!map.current || !marker.current) return;
    const pos: [number, number] = [latitude, longitude];
    marker.current.setLatLng(pos);
    map.current.setView(pos, Math.max(map.current.getZoom(), 16));
  }, [latitude, longitude]);

  return <div ref={host} className="h-full min-h-[320px] w-full" aria-label="Map for selecting delivery location" />;
}

export default function DeliveryPinPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [record, setRecord] = useState<PinRecord | null>(null);
  const [latitude, setLatitude] = useState(DEFAULT_CENTER[0]);
  const [longitude, setLongitude] = useState(DEFAULT_CENTER[1]);
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    void (async () => {
      const { data, error: rpcError } = await supabase.rpc("get_delivery_pin", { p_token: token });
      if (!active) return;
      if (rpcError || !data || !data.length) {
        setError(rpcError?.message || "This delivery link is invalid or no longer available.");
        setLoading(false); return;
      }
      const pin = data[0] as PinRecord;
      setRecord(pin);
      if (pin.latitude !== null && pin.longitude !== null) {
        setLatitude(pin.latitude); setLongitude(pin.longitude);
      }
      setAddress(pin.address_text || "");
      setLandmark(pin.landmark || "");
      setLoading(false);
    })();
    return () => { active = false; };
  }, [token]);

  function useCurrentLocation() {
    setError(""); setNotice("");
    if (!navigator.geolocation) { setError("Location access is unavailable in this browser. Please move the pin manually."); return; }
    navigator.geolocation.getCurrentPosition(
      position => { setLatitude(Number(position.coords.latitude.toFixed(7)); setLongitude(Number(position.coords.longitude.toFixed(7)); setNotice("Current location selected. Check the pink pin before saving."); },
      issue => setError(issue.code === issue.PERMISSION_DENIED ? "Allow location access, or move the pin manually." : "Could not get your location. Move the pin manually instead."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const { data, error: rpcError } = await supabase.rpc("save_delivery_pin", {
      p_token: token, p_latitude: latitude, p_longitude: longitude,
      p_address_text: address.trim() || null, p_landmark: landmark.trim() || null
    });
    setSaving(false);
    if (rpcError) { setError(rpcError.message); return; }
    const saved = (Array.isArray(data) ? data[0] : data) as PinRecord | undefined;
    if (!saved) { setError("We couldn't confirm the save. Please try again."); return; }
    setRecord(saved); setNotice("Delivery pin saved successfully. Thank you, KasYP! 🤎");
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#fffaf5] p-6 text-stone-700">Loading your delivery map…</main>;
  if (!record) return <main className="grid min-h-screen place-items-center bg-[#fffaf5] p-6"><section className="max-w-md rounded-3xl border border-pink-100 bg-white p-7 text-center"><div className="text-4xl">📍</div><h1 className="mt-3 text-2xl font-black text-stone-900">Delivery link unavailable</h1><p className="mt-3 text-sm text-stone-600">{error}</p><p className="mt-2 text-sm text-stone-500">Please contact SYP ON CAFÉ and ask for a new link.</p></section></main>;

  return <main className="min-h-screen bg-[#fffaf5] px-3 py-4 text-stone-900 sm:px-5 sm:py-7">
    <div className="mx-auto max-w-2xl">
      <header className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-black tracking-[.24em] text-pink-600">STREET • ICED • BREWED</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Drop Your Delivery Pin 📍</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Hi {record.customer_name}, drag the pink pin or tap the exact spot on the map. You can adjust it before saving.</p>
        {record.order_ref && <p className="mt-2 text-xs font-bold text-stone-500">Order: {record.order_ref}</p>}
      </header>
      <section className="mt-3 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
        <div className="h-[360px] sm:h-[420px]"><PinkMap latitude={latitude} longitude={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); setNotice(""); }} /></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pink-50 p-4">
          <div><p className="text-sm font-bold">Selected location</p><p className="font-mono text-xs text-stone-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p></div>
          <button type="button" onClick={useCurrentLocation} className="rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-bold text-pink-700">📡 Use My Current Location</button>
        </div>
      </section>
      <form onSubmit={save} className="mt-3 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6">
        <label className="block text-sm font-bold">Complete address (optional)</label>
        <textarea maxLength={500} rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="House / unit, street, subdivision, barangay" className="mt-2 w-full rounded-xl border border-stone-200 p-3 text-sm outline-none focus:border-pink-400" />
        <label className="mt-4 block text-sm font-bold">Landmark / delivery instructions</label>
        <textarea maxLength={500} rows={2} value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. blue gate beside the sari-sari store" className="mt-2 w-full rounded-xl border border-stone-200 p-3 text-sm outline-none focus:border-pink-400" />
        <button disabled={saving} className="mt-4 w-full rounded-xl bg-pink-600 p-3.5 font-black text-white transition hover:bg-pink-500 disabled:opacity-60">{saving ? "Saving delivery pin…" : record.status === "pin_saved" ? "Update delivery location" : "Confirm delivery location"}</button>
        {notice && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}
        {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <p className="mt-3 text-center text-xs text-stone-400">Your delivery location is shared with SYP ON CAFÉ for this delivery.</p>
      </form>
    </div>
  </main>;
}
