"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "../components/ProtectedRoute";

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";

type RiderStatus =
  | "waiting"
  | "accepted"
  | "out_for_delivery"
  | "delivered";

type OrderItem = {
  id: number;
  order_id: number;
  product_name: string;
  size: string | null;
  price: number;
  quantity: number;
  line_total: number;
};

type RiderOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  mobile: string;
  address: string | null;
  landmark: string | null;
  notes: string | null;
  total: number;
  status: OrderStatus;
  rider_name: string | null;
  rider_status: RiderStatus | null;
  accepted_by_rider_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  created_at: string;
  items: OrderItem[];
};

type Tab = "available" | "active" | "history";

function formatMoney(value: number | null | undefined) {
  return `₱${Number(value ?? 0).toLocaleString("en-PH")}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `63${digits.slice(1)}`;
  }

  return digits;
}

function buildMapUrl(order: RiderOrder) {
  const destination = [order.address, order.landmark]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    destination || "SYP ON CAFÉ",
  )}`;
}

export default function RiderPage() {
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [activeTab, setActiveTab] =
    useState<Tab>("available");
  const [riderName, setRiderName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("sypRiderName");

    if (savedName) {
      setRiderName(savedName);
    }
  }, []);

  const loadOrders = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      const { data: orderRows, error: orderError } =
        await supabase
          .from("orders")
          .select(
            [
              "id",
              "order_number",
              "customer_name",
              "mobile",
              "address",
              "landmark",
              "notes",
              "total",
              "status",
              "rider_name",
              "rider_status",
              "accepted_by_rider_at",
              "out_for_delivery_at",
              "delivered_at",
              "created_at",
            ].join(","),
          )
          .eq("order_type", "delivery")
          .in("status", ["ready", "delivering", "completed"])
          .order("created_at", { ascending: false })
          .limit(100);

      if (orderError) throw orderError;

      const typedOrderRows = (orderRows ?? []) as unknown as Omit<RiderOrder, "items">[];

      const orderIds = typedOrderRows.map((order) => order.id);

      let itemRows: OrderItem[] = [];

      if (orderIds.length > 0) {
        const { data, error: itemError } = await supabase
          .from("order_items")
          .select(
            "id, order_id, product_name, size, price, quantity, line_total",
          )
          .in("order_id", orderIds)
          .order("id", { ascending: true });

        if (itemError) throw itemError;
        itemRows = (data ?? []) as OrderItem[];
      }

      const combinedOrders = typedOrderRows.map(
        (order) => ({
          ...order,
          total: Number(order.total ?? 0),
          rider_status:
            (order.rider_status as RiderStatus | null) ??
            "waiting",
          items: itemRows.filter(
            (item) => item.order_id === order.id,
          ),
        }),
      ) as RiderOrder[];

      setOrders(combinedOrders);
    } catch (error) {
      console.error("Rider orders load error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load delivery orders.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    const interval = window.setInterval(() => {
      void loadOrders(true);
    }, 15000);

    const channel = supabase
      .channel("syp-rider-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadOrders(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        () => {
          void loadOrders(true);
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const availableOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "ready" &&
          (!order.rider_status ||
            order.rider_status === "waiting"),
      ),
    [orders],
  );

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "delivering" ||
          order.rider_status === "accepted" ||
          order.rider_status === "out_for_delivery",
      ),
    [orders],
  );

  const historyOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "completed" ||
          order.rider_status === "delivered",
      ),
    [orders],
  );

  const visibleOrders =
    activeTab === "available"
      ? availableOrders
      : activeTab === "active"
        ? activeOrders
        : historyOrders;

  function saveRiderName(value: string) {
    setRiderName(value);
    localStorage.setItem("sypRiderName", value);
  }

  function requireRiderName() {
    const cleanName = riderName.trim();

    if (!cleanName) {
      setErrorMessage(
        "Enter the rider name before accepting a delivery.",
      );
      return null;
    }

    localStorage.setItem("sypRiderName", cleanName);
    return cleanName;
  }

  async function acceptDelivery(order: RiderOrder) {
    const cleanName = requireRiderName();
    if (!cleanName) return;

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          rider_name: cleanName,
          rider_status: "accepted",
          accepted_by_rider_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("status", "ready")
        .or("rider_status.is.null,rider_status.eq.waiting")
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "This delivery may already have been accepted by another rider.",
        );
      }

      setActiveTab("active");
      await loadOrders(true);
    } catch (error) {
      console.error("Accept delivery error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to accept this delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function markOutForDelivery(order: RiderOrder) {
    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivering",
          rider_status: "out_for_delivery",
          out_for_delivery_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;
      await loadOrders(true);
    } catch (error) {
      console.error("Out for delivery error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function markDelivered(order: RiderOrder) {
    const confirmed = window.confirm(
      `Mark ${order.order_number} as delivered?`,
    );

    if (!confirmed) return;

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "completed",
          rider_status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;

      setActiveTab("history");
      await loadOrders(true);
    } catch (error) {
      console.error("Delivered update error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete this delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#050505] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-lg font-black">
                SYP ON CAFÉ — RIDER
              </p>
              <p className="text-xs text-neutral-500">
                Live Delivery Operations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
                ● Live
              </span>

              <button
                type="button"
                onClick={() => void loadOrders(true)}
                disabled={isRefreshing}
                className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-amber-400 disabled:opacity-50"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                href="/admin"
                className="rounded-full border border-white/15 px-4 py-2 text-sm"
              >
                Admin
              </Link>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7">
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Available"
              value={availableOrders.length}
            />
            <SummaryCard
              label="Active"
              value={activeOrders.length}
            />
            <SummaryCard
              label="Delivered"
              value={historyOrders.length}
            />
          </section>

          <section className="mt-6 rounded-3xl border border-white/10 bg-neutral-950 p-5">
            <label className="block">
              <span className="text-sm font-semibold text-neutral-300">
                Rider name
              </span>
              <input
                type="text"
                value={riderName}
                onChange={(event) =>
                  saveRiderName(event.target.value)
                }
                placeholder="Example: Alex"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400"
              />
            </label>
          </section>

          <section className="mt-6 flex flex-wrap gap-2">
            <TabButton
              label={`Available (${availableOrders.length})`}
              active={activeTab === "available"}
              onClick={() => setActiveTab("available")}
            />
            <TabButton
              label={`Active (${activeOrders.length})`}
              active={activeTab === "active"}
              onClick={() => setActiveTab("active")}
            />
            <TabButton
              label={`History (${historyOrders.length})`}
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            />
          </section>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-950 p-12 text-center text-neutral-400">
              Loading rider dashboard...
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center">
              <p className="text-4xl">🛵</p>
              <h2 className="mt-4 text-xl font-bold">
                No deliveries in this section
              </h2>
              <p className="mt-2 text-neutral-500">
                New ready delivery orders will appear automatically.
              </p>
            </div>
          ) : (
            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              {visibleOrders.map((order) => {
                const isUpdating =
                  updatingOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-neutral-950 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <StatusBadge order={order} />
                        <h2 className="mt-3 text-2xl font-black text-amber-400">
                          {order.order_number}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <p className="text-2xl font-black">
                        {formatMoney(order.total)}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Customer
                        </p>
                        <p className="mt-2 font-bold">
                          {order.customer_name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {order.mobile}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`tel:${normalizePhone(
                              order.mobile,
                            )}`}
                            className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300"
                          >
                            Call
                          </a>

                          <a
                            href={`https://wa.me/${normalizePhone(
                              order.mobile,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/15 px-4 py-2 text-sm"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Delivery Address
                        </p>
                        <p className="mt-2 leading-6 text-neutral-200">
                          {order.address || "No address provided"}
                        </p>

                        {order.landmark && (
                          <p className="mt-2 text-sm text-neutral-500">
                            Landmark: {order.landmark}
                          </p>
                        )}

                        <a
                          href={buildMapUrl(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-black"
                        >
                          Open in Maps
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 p-4">
                      <p className="font-bold">Order Items</p>

                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-4"
                          >
                            <div>
                              <p>
                                {item.quantity}×{" "}
                                {item.product_name}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {item.size || "Regular"}
                              </p>
                            </div>

                            <p className="font-semibold">
                              {formatMoney(item.line_total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Customer Notes
                        </p>
                        <p className="mt-2 leading-6 text-neutral-200">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {order.rider_name && (
                      <div className="mt-5 rounded-2xl border border-white/10 p-4 text-sm">
                        <p>
                          Rider:{" "}
                          <span className="font-bold text-amber-400">
                            {order.rider_name}
                          </span>
                        </p>
                        <p className="mt-2 text-neutral-500">
                          Accepted:{" "}
                          {formatDate(
                            order.accepted_by_rider_at,
                          )}
                        </p>
                      </div>
                    )}

                    <div className="mt-6">
                      {activeTab === "available" && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void acceptDelivery(order)
                          }
                          className="w-full rounded-2xl bg-amber-400 px-5 py-4 text-lg font-black text-black transition hover:bg-amber-300 disabled:opacity-50"
                        >
                          {isUpdating
                            ? "Accepting..."
                            : "Accept Delivery"}
                        </button>
                      )}

                      {activeTab === "active" &&
                        order.rider_status === "accepted" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void markOutForDelivery(order)
                            }
                            className="w-full rounded-2xl bg-amber-400 px-5 py-4 text-lg font-black text-black transition hover:bg-amber-300 disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Start Delivery"}
                          </button>
                        )}

                      {activeTab === "active" &&
                        (order.rider_status ===
                          "out_for_delivery" ||
                          order.status === "delivering") && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void markDelivered(order)
                            }
                            className="w-full rounded-2xl bg-emerald-500 px-5 py-4 text-lg font-black text-black transition hover:bg-emerald-400 disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Completing..."
                              : "Mark Delivered"}
                          </button>
                        )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-amber-400">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-black"
          : "rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-400 transition hover:border-amber-400 hover:text-amber-400"
      }
    >
      {label}
    </button>
  );
}

function StatusBadge({
  order,
}: {
  order: RiderOrder;
}) {
  let label = "Waiting for Rider";
  let className =
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

  if (order.rider_status === "accepted") {
    label = "Accepted by Rider";
    className =
      "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (
    order.rider_status === "out_for_delivery" ||
    order.status === "delivering"
  ) {
    label = "Out for Delivery";
    className =
      "border-purple-500/30 bg-purple-500/10 text-purple-300";
  }

  if (
    order.rider_status === "delivered" ||
    order.status === "completed"
  ) {
    label = "Delivered";
    className =
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  );
}