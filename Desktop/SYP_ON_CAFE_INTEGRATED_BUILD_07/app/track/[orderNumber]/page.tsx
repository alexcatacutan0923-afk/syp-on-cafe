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

const trackingSteps: Array<{
  status: OrderStatus;
  title: string;
  pickupDescription: string;
  deliveryDescription: string;
  icon: string;
}> = [
  {
    status: "pending",
    title: "Order Received",
    pickupDescription: "We received your order and are reviewing it.",
    deliveryDescription: "We received your delivery order and are reviewing it.",
    icon: "📦",
  },
  {
    status: "accepted",
    title: "Order Accepted",
    pickupDescription: "Your order has been accepted by SYP ON CAFÉ.",
    deliveryDescription: "Your delivery order has been accepted by SYP ON CAFÉ.",
    icon: "✅",
  },
  {
    status: "preparing",
    title: "Preparing",
    pickupDescription: "Your drinks and food are being prepared.",
    deliveryDescription: "Your drinks and food are being prepared.",
    icon: "☕",
  },
  {
    status: "ready",
    title: "Ready",
    pickupDescription: "Your order is ready for pickup.",
    deliveryDescription: "Your order is packed and ready for the rider.",
    icon: "🛍️",
  },
  {
    status: "delivering",
    title: "Out for Delivery",
    pickupDescription: "Your order is ready.",
    deliveryDescription: "Your rider is on the way.",
    icon: "🛵",
  },
  {
    status: "completed",
    title: "Completed",
    pickupDescription: "Your order has been picked up. Thank you!",
    deliveryDescription: "Your order has been delivered. Thank you!",
    icon: "🏁",
  },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  delivering: "Out for Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatCurrency(value: number | null | undefined) {
  return `₱${Number(value ?? 0).toFixed(0)}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default function TrackOrderPage() {
  const params = useParams<{ orderNumber: string }>();
  const rawOrderNumber = params?.orderNumber;
  const orderNumber = Array.isArray(rawOrderNumber)
    ? rawOrderNumber[0]
    : rawOrderNumber;

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadOrder = useCallback(
    async (silent = false) => {
      if (!orderNumber) return;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage("");

      try {
        const { data: orderRow, error: orderError } = await supabase
          .from("orders")
          .select(
            "id, order_number, customer_name, order_type, address, notes, status, subtotal, delivery_fee, total, payment_method, created_at, rider_name, rider_mobile, rider_vehicle, rider_eta, accepted_by_rider_at, out_for_delivery_at, delivered_at",
          )
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
          .select(
            "id, order_id, product_name, size, price, quantity, line_total",
          )
          .eq("order_id", orderRow.id)
          .order("id", { ascending: true });

        if (itemError) throw itemError;

        setOrder({
          ...orderRow,
          items: (itemRows ?? []) as OrderItem[],
        } as TrackedOrder);
      } catch (error) {
        console.error("Track order load error:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your order.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderNumber],
  );

  useEffect(() => {
    void loadOrder();

    const pollingInterval = window.setInterval(() => {
      void loadOrder(true);
    }, 15000);

    const channel = supabase
      .channel(`track-order-${orderNumber}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `order_number=eq.${decodeURIComponent(
            orderNumber || "",
          )}`,
        },
        () => {
          void loadOrder(true);
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(pollingInterval);
      void supabase.removeChannel(channel);
    };
  }, [loadOrder, orderNumber]);

  const visibleTrackingSteps = useMemo(() => {
  if (!order) return trackingSteps;

  return order.order_type === "pickup"
    ? trackingSteps.filter(
        (step) => step.status !== "delivering",
      )
    : trackingSteps;
}, [order]);

const currentStepIndex = useMemo(() => {
  if (!order) return -1;

  return visibleTrackingSteps.findIndex(
    (step) => step.status === order.status,
  );
}, [order, visibleTrackingSteps]);

if (isLoading) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
      <div className="text-center">
        <p className="text-4xl">☕</p>
        <p className="mt-4 text-xl font-bold">
          Loading your SYP order...
        </p>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/">
            <p className="font-black">SYP ON CAFÉ</p>
            <p className="text-xs text-neutral-500">
              Street • Iced • Brewed
            </p>
          </Link>

          <button
            type="button"
            onClick={() => void loadOrder(true)}
            disabled={isRefreshing}
            className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-amber-400 disabled:opacity-50"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10">
        {errorMessage && !order ? (
          <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-4xl">⚠️</p>
            <h1 className="mt-4 text-2xl font-black">
              Order Not Found
            </h1>
            <p className="mt-3 text-red-200">{errorMessage}</p>
            <Link
              href="/menu"
              className="mt-6 inline-flex rounded-full bg-amber-400 px-6 py-3 font-bold text-black"
            >
              Back to Menu
            </Link>
          </section>
        ) : order ? (
          <>
            <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
                    Live Order Tracking
                  </p>
                  <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    {order.order_number}
                  </h1>
                  <p className="mt-2 text-neutral-500">
                    Ordered {formatDateTime(order.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-400">
                    Current Status
                  </p>
                  <p className="mt-1 text-xl font-black">
                    {statusLabels[order.status]}
                  </p>
                </div>
              </div>

              {order.status === "cancelled" ? (
                <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                  <p className="text-2xl font-black text-red-300">
                    Order Cancelled
                  </p>
                  <p className="mt-2 text-red-200">
                    Please contact SYP ON CAFÉ if you need assistance.
                  </p>
                </div>
              ) : (
                <div className="mt-10">
                 {(
  order?.order_type === "pickup"
    ? trackingSteps.filter(
        (step) => step.status !== "delivering",
      )
    : trackingSteps
).map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className="relative flex gap-4 pb-8 last:pb-0"
                      >
                        {index < visibleTrackingSteps.length - 1 && (
                          <div
                            className={`absolute left-6 top-12 h-[calc(100%-2rem)] w-0.5 ${
                              isCompleted
                                ? "bg-amber-400"
                                : "bg-white/10"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl ${
                            isCompleted || isCurrent
                              ? "border-amber-400 bg-amber-400 text-black"
                              : "border-white/10 bg-neutral-900 text-neutral-600"
                          }`}
                        >
                          {isCompleted ? "✓" : step.icon}
                        </div>

                        <div
                          className={`pt-1 ${
                            isPending ? "opacity-40" : ""
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-black">
                              {step.title}
                            </h2>

                            {isCurrent && (
                              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-black">
                                CURRENT
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm leading-6 text-neutral-400">
                            {order.order_type === "delivery"
                              ? step.deliveryDescription
                              : step.pickupDescription}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {order.order_type === "delivery" && order.rider_name && (
              <section className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-400">
                      🛵 Your Delivery Rider
                    </p>
                    <h2 className="mt-3 text-2xl font-black">
                      {order.rider_name}
                    </h2>
                    <p className="mt-2 text-neutral-400">
                      {order.status === "ready"
                        ? "Your rider has been assigned and is preparing to leave."
                        : order.status === "delivering"
                          ? "Your rider is currently on the way."
                          : order.status === "completed"
                            ? "Your order was delivered successfully."
                            : "Rider details have been assigned to your order."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Delivery Status
                    </p>
                    <p className="mt-1 font-black text-amber-400">
                      {statusLabels[order.status]}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <RiderDetail
                    label="Rider"
                    value={order.rider_name}
                  />
                  <RiderDetail
                    label="Mobile"
                    value={order.rider_mobile || "Not provided"}
                  />
                  <RiderDetail
                    label="Vehicle"
                    value={order.rider_vehicle || "Not provided"}
                  />
                  <RiderDetail
                    label="Estimated Arrival"
                    value={order.rider_eta || "To be confirmed"}
                  />
                </div>

                {order.rider_mobile && (
                  <a
                    href={`tel:${order.rider_mobile}`}
                    className="mt-6 inline-flex rounded-full bg-amber-400 px-5 py-3 font-bold text-black"
                  >
                    Call Rider
                  </a>
                )}
              </section>
            )}

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                <h2 className="text-xl font-black">Order Items</h2>

                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 p-4"
                    >
                      <div className="flex gap-3">
                        <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-black">
                          {item.quantity}
                        </span>

                        <div>
                          <p className="font-bold">
                            {item.product_name}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {item.size || "Regular"}
                          </p>
                        </div>
                      </div>

                      <p className="font-bold text-amber-400">
                        {formatCurrency(item.line_total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                  <h2 className="text-xl font-black">Order Details</h2>

                  <dl className="mt-5 space-y-4 text-sm">
                    <DetailRow
                      label="Customer"
                      value={order.customer_name}
                    />
                    <DetailRow
                      label="Order Type"
                      value={
                        order.order_type === "delivery"
                          ? "Delivery"
                          : "Pickup"
                      }
                    />
                    <DetailRow
                      label="Payment"
                      value={order.payment_method || "Not specified"}
                    />
                    {order.order_type === "delivery" &&
                      order.address && (
                        <DetailRow
                          label="Address"
                          value={order.address}
                        />
                      )}
                  </dl>
                </section>

                <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                  <h2 className="text-xl font-black">Payment Summary</h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <PriceRow
                      label="Subtotal"
                      value={formatCurrency(order.subtotal)}
                    />
                    <PriceRow
                      label="Delivery Fee"
                      value={formatCurrency(order.delivery_fee)}
                    />
                    <div className="border-t border-white/10 pt-4">
                      <PriceRow
                        label="Total"
                        value={formatCurrency(order.total)}
                        strong
                      />
                    </div>
                  </div>
                </section>

                {order.notes && (
                  <section className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
                    <p className="text-sm font-black uppercase tracking-wide text-amber-400">
                      Order Notes
                    </p>
                    <p className="mt-3 leading-6 text-neutral-200">
                      {order.notes}
                    </p>
                  </section>
                )}
              </div>
            </section>

            <p className="mt-8 text-center text-sm text-neutral-600">
              This page updates automatically whenever your order status changes.
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}

function RiderDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 font-bold text-white">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="mt-1 font-semibold text-white">{value}</dd>
    </div>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-black" : "text-neutral-500"}>
        {label}
      </span>
      <span
        className={
          strong
            ? "text-xl font-black text-amber-400"
            : "font-semibold"
        }
      >
        {value}
      </span>
    </div>
  );
}