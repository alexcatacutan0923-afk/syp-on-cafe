"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";

type OrderItem = {
  id: number;
  order_id: number;
  product_name: string;
  size: string | null;
  price: number;
  quantity: number;
  line_total: number;
};

type TrackedOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  order_type: "pickup" | "delivery";
  address: string | null;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string | null;
  payment_status?: string | null;
  created_at: string;
  rider_name: string | null;
  rider_mobile: string | null;
  rider_vehicle: string | null;
  rider_eta: string | null;
  accepted_by_rider_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  items: OrderItem[];
};

type TrackingStep = {
  status: OrderStatus;
  title: string;
  pickupDescription: string;
  deliveryDescription: string;
  icon: string;
};

const trackingSteps: TrackingStep[] = [
  { status: "pending", title: "Order Received", pickupDescription: "We received your order and are reviewing it.", deliveryDescription: "We received your delivery order and are reviewing it.", icon: "◈" },
  { status: "accepted", title: "Order Accepted", pickupDescription: "Your order has been accepted by SYP ON CAFÉ.", deliveryDescription: "Your delivery order has been accepted by SYP ON CAFÉ.", icon: "✓" },
  { status: "preparing", title: "Preparing Coffee", pickupDescription: "Your drinks and food are being prepared with care.", deliveryDescription: "Your drinks and food are being prepared with care.", icon: "☕" },
  { status: "ready", title: "Ready", pickupDescription: "Your order is ready for pickup at the café.", deliveryDescription: "Your order is packed and waiting for the rider.", icon: "✓" },
  { status: "delivering", title: "Out for Delivery", pickupDescription: "Your order is ready.", deliveryDescription: "Your rider is on the way to your address.", icon: "➜" },
  { status: "completed", title: "Completed", pickupDescription: "Your order has been picked up. Thank you, KaSYP!", deliveryDescription: "Your order has been delivered. Thank you, KaSYP!", icon: "✓" },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Order Received",
  accepted: "Order Accepted",
  preparing: "Brewing Your Coffee",
  ready: "Ready",
  delivering: "Out for Delivery",
  completed: "Order Completed",
  cancelled: "Order Cancelled",
};

function formatCurrency(value: number | null | undefined) {
  return `₱${Number(value ?? 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function extractRiderTip(notes: string | null | undefined) {
  const match = String(notes || "").match(/\[RIDER TIP: ₱([0-9]+)\]/i);
  return match ? Number(match[1]) : 0;
}

function cleanCustomerNotes(notes: string | null | undefined) {
  return String(notes || "")
    .split("\n")
    .filter((line) => !/^\[(RIDER TIP|GCASH PAYMENT):/i.test(line.trim()))
    .join("\n")
    .trim();
}

function getProgress(status: OrderStatus, orderType: "pickup" | "delivery") {
  const pickup: Record<OrderStatus, number> = { pending: 12, accepted: 28, preparing: 62, ready: 88, delivering: 88, completed: 100, cancelled: 0 };
  const delivery: Record<OrderStatus, number> = { pending: 10, accepted: 22, preparing: 48, ready: 68, delivering: 86, completed: 100, cancelled: 0 };
  return orderType === "pickup" ? pickup[status] : delivery[status];
}

function getEtaText(order: TrackedOrder) {
  if (order.status === "pending" || order.status === "accepted") return "10–15 mins";
  if (order.status === "preparing") return "6–10 mins";
  if (order.status === "ready") {
    return order.order_type === "pickup" ? "Ready now" : order.rider_name ? order.rider_eta || "Rider preparing" : "Waiting for rider";
  }
  if (order.status === "delivering") return order.rider_eta || "On the way";
  if (order.status === "completed") return "Completed";
  return "Unavailable";
}

export default function TrackOrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const rawOrderNumber = params?.orderNumber;
  const orderNumber = Array.isArray(rawOrderNumber) ? rawOrderNumber[0] : rawOrderNumber;

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrder = useCallback(async (silent = false) => {
    if (!orderNumber) return;
    silent ? setIsRefreshing(true) : setIsLoading(true);
    setErrorMessage("");

    try {
      const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, order_type, address, notes, status, subtotal, delivery_fee, total, payment_method, payment_status, created_at, rider_name, rider_mobile, rider_vehicle, rider_eta, accepted_by_rider_at, out_for_delivery_at, delivered_at")
        .eq("order_number", decodeURIComponent(orderNumber))
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderRow) {
        setOrder(null);
        setErrorMessage("Order not found. Please check your tracking link.");
        return;
      }

      const { data: itemRows, error: itemError } = await supabase
        .from("order_items")
        .select("id, order_id, product_name, size, price, quantity, line_total")
        .eq("order_id", orderRow.id)
        .order("id", { ascending: true });

      if (itemError) throw itemError;
      setOrder({ ...orderRow, items: (itemRows ?? []) as OrderItem[] } as TrackedOrder);
    } catch (error) {
      console.error("Track order load error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load your order.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    void loadOrder();
    const pollingInterval = window.setInterval(() => void loadOrder(true), 15000);
    const channel = supabase
      .channel(`track-order-${orderNumber}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `order_number=eq.${decodeURIComponent(orderNumber || "")}`,
      }, () => void loadOrder(true))
      .subscribe();

    return () => {
      window.clearInterval(pollingInterval);
      void supabase.removeChannel(channel);
    };
  }, [loadOrder, orderNumber]);

  const visibleSteps = useMemo(() => {
    if (!order) return trackingSteps;
    return order.order_type === "pickup" ? trackingSteps.filter((step) => step.status !== "delivering") : trackingSteps;
  }, [order]);

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    return visibleSteps.findIndex((step) => step.status === order.status);
  }, [order, visibleSteps]);

  const riderTip = useMemo(() => extractRiderTip(order?.notes), [order?.notes]);
  const customerNotes = useMemo(() => cleanCustomerNotes(order?.notes), [order?.notes]);
  const customerTotal = Number(order?.total ?? 0) + riderTip;

  async function shareOrder() {
    if (!order) return;
    const shareData = { title: `SYP ON CAFÉ • ${order.order_number}`, text: `Track my SYP ON CAFÉ order ${order.order_number}.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard?.writeText(window.location.href);
        alert("Tracking link copied.");
      }
    } catch {}
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-4xl shadow-[0_0_55px_rgba(251,191,36,0.18)]">☕</div>
          <p className="mt-5 text-xl font-black">Loading your SYP order...</p>
          <p className="mt-2 text-sm text-neutral-500">Connecting to live tracking</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-16rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-amber-300/5 blur-[130px]" />
      </div>

      <header className="relative z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/">
            <p className="bg-gradient-to-r from-[#f9de8f] via-[#c99b35] to-[#f6d675] bg-clip-text text-lg font-black tracking-[0.16em] text-transparent">SYP ON CAFÉ</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-neutral-600">Street • Iced • Brewed</p>
          </Link>
          <button type="button" onClick={() => void loadOrder(true)} disabled={isRefreshing} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-neutral-300 transition hover:border-amber-400/40 hover:text-amber-300 disabled:opacity-50">
            {isRefreshing ? "Refreshing..." : "Refresh status"}
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-10">
        {errorMessage && !order ? (
          <section className="mx-auto max-w-xl rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
            <p className="text-5xl">⚠</p>
            <h1 className="mt-4 text-2xl font-black">Order Not Found</h1>
            <p className="mt-3 text-red-200">{errorMessage}</p>
            <Link href="/menu" className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-3 font-black text-black">Back to Menu</Link>
          </section>
        ) : order ? (
          <>
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(20,20,20,0.96),rgba(5,5,5,0.98))] p-5 shadow-[0_0_70px_rgba(251,191,36,0.12)] sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(201,155,53,0.12),transparent_36%)]" />
              <div className="relative">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-400">Live Order Tracking</p>
                    <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">#{order.order_number}</h1>
                    <p className="mt-2 text-sm text-neutral-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300">{order.order_type === "delivery" ? "Delivery Order" : "Pickup Order"}</span>
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300">{statusLabels[order.status]}</span>
                  </div>
                </div>

                {order.status === "cancelled" ? (
                  <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl text-red-300">×</div>
                    <h2 className="mt-4 text-2xl font-black text-red-300">Order Cancelled</h2>
                    <p className="mt-2 text-red-200/80">Please contact SYP ON CAFÉ if you need assistance.</p>
                  </div>
                ) : (
                  <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-3xl border border-white/10 bg-black/35 p-5 sm:p-6">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-400">{statusLabels[order.status]}</p>
                      <h2 className="mt-3 text-3xl font-black">{order.status === "preparing" ? "Brewing your coffee..." : order.status === "completed" ? "Thank you, KaSYP!" : "Your order is moving forward."}</h2>

                      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-amber-400/25 bg-[radial-gradient(circle,rgba(251,191,36,0.15),rgba(0,0,0,0.6))] text-5xl shadow-[0_0_40px_rgba(251,191,36,0.13)]">☕</div>
                          <div className="min-w-0">
                            <p className="truncate text-xl font-black">{order.items[0]?.product_name || "Your SYP order"}</p>
                            {order.items.slice(1, 3).map((item) => <p key={item.id} className="mt-1 truncate text-sm text-neutral-500">{item.product_name}</p>)}
                            {order.items.length > 3 && <p className="mt-1 text-sm text-amber-300">+{order.items.length - 3} more item(s)</p>}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-neutral-500">Order progress</span>
                          <span className="font-black text-amber-300">{getProgress(order.status, order.order_type)}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,#8d6415,#f4cb67,#b78423)] shadow-[0_0_18px_rgba(251,191,36,0.35)] transition-all duration-1000" style={{ width: `${getProgress(order.status, order.order_type)}%` }} />
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <InfoCard label="Estimated Time" value={getEtaText(order)} accent />
                        <InfoCard label="Payment" value={`${order.payment_method || "Not specified"} • ${order.payment_status || "pending"}`} />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/35 p-5 sm:p-6">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-400">Order Journey</p>
                      <div className="mt-6">
                        {visibleSteps.map((step, index) => {
                          const isCompleted = index < currentStepIndex;
                          const isCurrent = index === currentStepIndex;
                          const isPending = index > currentStepIndex;
                          return (
                            <div key={step.status} className="relative flex gap-4 pb-7 last:pb-0">
                              {index < visibleSteps.length - 1 && <div className={`absolute left-[1.35rem] top-10 h-[calc(100%-1.1rem)] w-px ${isCompleted ? "bg-gradient-to-b from-amber-300 to-amber-500" : "bg-white/10"}`} />}
                              <div className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-lg ${isCompleted ? "border-amber-400 bg-amber-400 text-black" : isCurrent ? "border-amber-300 bg-amber-400/15 text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.25)]" : "border-white/10 bg-neutral-950 text-neutral-700"}`}>{isCompleted ? "✓" : step.icon}</div>
                              <div className={`min-w-0 pt-1 ${isPending ? "opacity-35" : ""}`}>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-black">{step.title}</h3>
                                  {isCurrent && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">Live</span>}
                                </div>
                                <p className="mt-1 text-sm leading-6 text-neutral-500">{order.order_type === "delivery" ? step.deliveryDescription : step.pickupDescription}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {order.order_type === "delivery" && order.rider_name && (
              <section className="mt-6 rounded-[2rem] border border-sky-400/20 bg-[linear-gradient(145deg,rgba(9,20,35,0.95),rgba(5,8,15,0.98))] p-5 shadow-[0_0_60px_rgba(56,189,248,0.08)] sm:p-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">Your Delivery Rider</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/10 text-3xl">🛵</div>
                      <div>
                        <h2 className="text-2xl font-black">{order.rider_name}</h2>
                        <p className="mt-1 text-sm text-neutral-400">{order.status === "delivering" ? "Currently on the way" : order.status === "completed" ? "Delivery completed" : "Assigned and preparing to leave"}</p>
                      </div>
                    </div>
                  </div>
                  <InfoCard label="ETA" value={order.rider_eta || "To be confirmed"} accent />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <InfoCard label="Mobile" value={order.rider_mobile || "Not provided"} />
                  <InfoCard label="Vehicle" value={order.rider_vehicle || "Not provided"} />
                  <InfoCard label="Status" value={order.status === "delivering" ? "On the way" : order.status === "completed" ? "Delivered" : "Assigned"} />
                </div>
                {order.rider_mobile && <a href={`tel:${order.rider_mobile}`} className="mt-5 inline-flex rounded-full bg-sky-400 px-5 py-3 font-black text-black">Call Rider</a>}
              </section>
            )}

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-white/10 bg-neutral-950/90 p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">Order Details</p>
                    <h2 className="mt-2 text-2xl font-black">Your Items</h2>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-neutral-400">{order.items.reduce((total, item) => total + item.quantity, 0)} item(s)</span>
                </div>
                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/30 p-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-2xl">☕</div>
                        <div className="min-w-0">
                          <p className="truncate font-black">{item.quantity}× {item.product_name}</p>
                          <p className="mt-1 text-sm text-neutral-500">{item.size || "Regular"}</p>
                        </div>
                      </div>
                      <p className="shrink-0 font-black text-amber-300">{formatCurrency(item.line_total)}</p>
                    </div>
                  ))}
                </div>
                {customerNotes && <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/[0.06] p-5"><p className="text-xs font-black uppercase tracking-wider text-amber-300">Order Notes</p><p className="mt-3 leading-7 text-neutral-300">{customerNotes}</p></div>}
              </div>

              <div className="space-y-6">
                <section className="rounded-[2rem] border border-white/10 bg-neutral-950/90 p-5 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">Payment Summary</p>
                  <div className="mt-5 space-y-4 text-sm">
                    <PriceRow label="Subtotal" value={formatCurrency(order.subtotal)} />
                    <PriceRow label="Delivery Fee" value={formatCurrency(order.delivery_fee)} />
                    {riderTip > 0 && <PriceRow label="Rider Tip" value={formatCurrency(riderTip)} />}
                    <div className="border-t border-white/10 pt-4"><PriceRow label="Total" value={formatCurrency(customerTotal)} strong /></div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <InfoCard label="Customer" value={order.customer_name} />
                    <InfoCard label="Order Type" value={order.order_type === "delivery" ? "Delivery" : "Pickup"} />
                  </div>
                  {order.order_type === "delivery" && order.address && <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4"><p className="text-xs font-black uppercase tracking-wider text-neutral-500">Delivery Address</p><p className="mt-2 text-sm leading-6 text-neutral-300">{order.address}</p></div>}
                </section>

                <section className="rounded-[2rem] border border-amber-400/20 bg-[linear-gradient(145deg,rgba(45,31,8,0.55),rgba(12,10,7,0.95))] p-5 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Join KaSYP Membership</p>
                  <h2 className="mt-2 text-2xl font-black">Earn stamps. Get free drinks.</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-400">Register your account and start collecting rewards with every qualifying order.</p>
                  <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-black/35 p-5 sm:flex-row">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/member-register?source=tracking&order=${order.order_number}` : "")}`} alt="KaSYP registration QR code" className="h-28 w-28 rounded-xl bg-white p-2" />
                    <div>
                      <p className="font-black text-amber-300">Scan to register</p>
                      <p className="mt-2 text-sm leading-6 text-neutral-400">Buy 9 qualifying drinks and enjoy your 10th drink free.</p>
                      <Link href={`/member-register?source=tracking&order=${encodeURIComponent(order.order_number)}`} className="mt-4 inline-flex rounded-full border border-amber-400/40 px-4 py-2 text-sm font-black text-amber-300">Register Now</Link>
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <section className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <button type="button" onClick={() => window.print()} className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 font-black">Print / Save Receipt</button>
              <button type="button" onClick={() => void shareOrder()} className="rounded-full bg-amber-400 px-5 py-3 font-black text-black">Share Order</button>
              {order.status === "completed" && <Link href={`/reviews?order=${encodeURIComponent(order.order_number)}`} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 font-black text-emerald-300">Leave a Review</Link>}
            </section>

            <footer className="mt-8 border-t border-white/10 py-8 text-center text-xs leading-6 text-neutral-600">
              <p>This page updates automatically whenever your order status changes.</p>
              <p className="mt-2 text-neutral-700">SYP ON CAFÉ • Apollo, Orani, Bataan</p>
            </footer>
          </>
        ) : null}
      </div>
    </main>
  );
}

function InfoCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-amber-400/20 bg-amber-400/[0.06]" : "border-white/10 bg-black/30"}`}>
      <p className={`text-xs font-black uppercase tracking-wider ${accent ? "text-amber-300" : "text-neutral-500"}`}>{label}</p>
      <p className={`mt-2 font-black ${accent ? "text-xl text-amber-200" : "text-white"}`}>{value}</p>
    </div>
  );
}

function PriceRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-black text-white" : "text-neutral-500"}>{label}</span>
      <span className={strong ? "text-2xl font-black text-amber-300" : "font-bold text-neutral-200"}>{value}</span>
    </div>
  );
}