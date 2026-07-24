"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "../components/ProtectedRoute";

type Temperature = "iced" | "hot" | "regular";

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";

type OrderItemAddon = {
  id: number;
  order_item_id: number;
  addon_id: number | null;
  addon_name: string;
  addon_price: number;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_name: string;
  size: string | null;
  price: number;
  quantity: number;
  line_total: number;
  temperature: Temperature;
  base_price: number;
  addons: OrderItemAddon[];
};

type KitchenOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  order_type: "pickup" | "delivery";
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
};

const visibleStatuses: OrderStatus[] = [
  "accepted",
  "preparing",
  "ready",
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  delivering: "Delivering",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getElapsedTime(createdAt: string, now: number) {
  const elapsed = Math.max(
    0,
    now - new Date(createdAt).getTime(),
  );

  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getElapsedStyle(createdAt: string, now: number) {
  const minutes =
    (now - new Date(createdAt).getTime()) / 60000;

  if (minutes >= 20) {
    return "border-red-500 bg-red-500/15 text-red-300";
  }

  if (minutes >= 10) {
    return "border-orange-500 bg-orange-500/15 text-orange-300";
  }

  if (minutes >= 5) {
    return "border-yellow-500 bg-yellow-500/15 text-yellow-300";
  }

  return "border-emerald-500 bg-emerald-500/15 text-emerald-300";
}

function getStatusStyle(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    pending:
      "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    accepted:
      "border-blue-500/40 bg-blue-500/10 text-blue-300",
    preparing:
      "border-orange-500/40 bg-orange-500/10 text-orange-300",
    ready:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    delivering:
      "border-purple-500/40 bg-purple-500/10 text-purple-300",
    completed:
      "border-green-500/40 bg-green-500/10 text-green-300",
    cancelled:
      "border-red-500/40 bg-red-500/10 text-red-300",
  };

  return styles[status];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [activeStatus, setActiveStatus] =
    useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

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
            "id, order_number, customer_name, order_type, notes, status, created_at",
          )
          .in("status", visibleStatuses)
          .order("created_at", { ascending: true });

      if (orderError) throw orderError;

      const orderIds = (orderRows ?? []).map(
        (order) => order.id,
      );

      let itemRows: OrderItem[] = [];

      if (orderIds.length > 0) {
        const { data, error: itemError } = await supabase
          .from("order_items")
          .select(
            "id, order_id, product_name, size, price, quantity, line_total, temperature, base_price",
          )
          .in("order_id", orderIds)
          .order("id", { ascending: true });

        if (itemError) throw itemError;

        const rawItems = (data ?? []) as Omit<OrderItem, "addons">[];
        const itemIds = rawItems.map((item) => item.id);
        let addonRows: OrderItemAddon[] = [];

        if (itemIds.length > 0) {
          const { data: addonData, error: addonError } =
            await supabase
              .from("order_item_addons")
              .select(
                "id, order_item_id, addon_id, addon_name, addon_price",
              )
              .in("order_item_id", itemIds)
              .order("id", { ascending: true });

          if (addonError) throw addonError;

          addonRows = (addonData ?? []).map((addon) => ({
            ...addon,
            addon_price: Number(addon.addon_price ?? 0),
          })) as OrderItemAddon[];
        }

        itemRows = rawItems.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
          quantity: Number(item.quantity ?? 0),
          line_total: Number(item.line_total ?? 0),
          base_price: Number(item.base_price ?? item.price ?? 0),
          temperature:
            (item.temperature as Temperature) ?? "regular",
          addons: addonRows.filter(
            (addon) => addon.order_item_id === item.id,
          ),
        }));
      }

      const combinedOrders: KitchenOrder[] = (
        orderRows ?? []
      ).map((order) => ({
        ...order,
        items: itemRows.filter(
          (item) => item.order_id === order.id,
        ),
      }));

      setOrders(combinedOrders);
    } catch (error) {
      console.error("Kitchen display load error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load kitchen orders.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    const pollingInterval = window.setInterval(() => {
      void loadOrders(true);
    }, 15000);

    const channel = supabase
      .channel("syp-kitchen-orders")
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_item_addons",
        },
        () => {
          void loadOrders(true);
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(pollingInterval);
      void supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeStatus === "all") return orders;

    return orders.filter(
      (order) => order.status === activeStatus,
    );
  }, [orders, activeStatus]);

  const acceptedCount = orders.filter(
    (order) => order.status === "accepted",
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "preparing",
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "ready",
  ).length;

  async function updateOrderStatus(
    orderId: number,
    nextStatus: OrderStatus,
  ) {
    setUpdatingOrderId(orderId);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus })
        .eq("id", orderId);

      if (error) throw error;

      if (
        nextStatus === "completed" ||
        nextStatus === "delivering"
      ) {
        setOrders((currentOrders) =>
          currentOrders.filter(
            (order) => order.id !== orderId,
          ),
        );
      } else {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: nextStatus }
              : order,
          ),
        );
      }
    } catch (error) {
      console.error("Kitchen status update error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the order.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function getNextAction(order: KitchenOrder) {
    switch (order.status) {
      case "accepted":
        return {
          label: "Start Preparing",
          status: "preparing" as OrderStatus,
        };
      case "preparing":
        return {
          label: "Mark Ready",
          status: "ready" as OrderStatus,
        };
      case "ready":
        return order.order_type === "delivery"
          ? {
              label: "Send to Rider",
              status: "delivering" as OrderStatus,
            }
          : {
              label: "Complete Pickup",
              status: "completed" as OrderStatus,
            };
      default:
        return null;
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xl font-black tracking-wide">
              SYP ON CAFÉ — KITCHEN
            </p>
            <p className="text-sm text-neutral-500">
              Live Kitchen Display System
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              ● Live
            </span>

            <button
              type="button"
              onClick={() => void loadOrders(true)}
              disabled={isRefreshing}
              className="rounded-full border border-white/15 px-5 py-2 text-sm transition hover:border-amber-400 disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-red-500/30 px-5 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
            >
              Logout
            </button>

            <Link
              href="/admin"
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-black"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px] px-5 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Active Orders"
            value={orders.length}
          />
          <SummaryCard
            label="Accepted"
            value={acceptedCount}
          />
          <SummaryCard
            label="Preparing"
            value={preparingCount}
          />
          <SummaryCard label="Ready" value={readyCount} />
        </section>

        <section className="mt-6 flex flex-wrap gap-2">
          <FilterButton
            label={`All (${orders.length})`}
            active={activeStatus === "all"}
            onClick={() => setActiveStatus("all")}
          />

          {(["accepted", "preparing", "ready"] as OrderStatus[]).map(
            (status) => (
              <FilterButton
                key={status}
                label={`${statusLabels[status]} (${
                  orders.filter(
                    (order) => order.status === status,
                  ).length
                })`}
                active={activeStatus === status}
                onClick={() => setActiveStatus(status)}
              />
            ),
          )}
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-950 p-12 text-center text-xl text-neutral-400">
            Loading kitchen orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center">
            <p className="text-3xl">☕</p>
            <p className="mt-3 text-xl font-bold">
              No active kitchen orders
            </p>
            <p className="mt-2 text-neutral-500">
              New accepted orders will appear here automatically.
            </p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredOrders.map((order) => {
              const nextAction = getNextAction(order);
              const isUpdating =
                updatingOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className="flex min-h-[420px] flex-col rounded-3xl border border-white/10 bg-neutral-950 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusStyle(
                          order.status,
                        )}`}
                      >
                        {statusLabels[order.status]}
                      </div>

                      <h2 className="mt-3 text-3xl font-black text-amber-400">
                        {order.order_number}
                      </h2>

                      <p className="mt-2 text-sm text-neutral-500">
                        {order.customer_name} •{" "}
                        <span className="capitalize">
                          {order.order_type}
                        </span>
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border px-4 py-3 text-center ${getElapsedStyle(
                        order.created_at,
                        currentTime,
                      )}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Elapsed
                      </p>
                      <p className="mt-1 text-xl font-black">
                        {getElapsedTime(
                          order.created_at,
                          currentTime,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex-1">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
                      Items
                    </p>

                    <div className="mt-4 space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                        >
                          <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-amber-400 text-xl font-black text-black">
                            {item.quantity}
                          </span>

                          <div className="min-w-0">
                            <p className="text-xl font-bold">
                              {item.temperature === "hot"
                                ? "♨ Hot "
                                : item.temperature === "iced"
                                  ? "❄ Iced "
                                  : ""}
                              {item.product_name}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                              {item.size || "Regular"}
                            </p>

                            {item.addons.length > 0 && (
                              <div className="mt-3 space-y-1 border-l-2 border-amber-400/40 pl-3">
                                {item.addons.map((addon) => (
                                  <p
                                    key={addon.id}
                                    className="font-semibold text-amber-300"
                                  >
                                    + {addon.addon_name}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Notes
                        </p>
                        <p className="mt-2 text-base leading-6 text-neutral-200">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {nextAction && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        void updateOrderStatus(
                          order.id,
                          nextAction.status,
                        )
                      }
                      className="mt-6 w-full rounded-2xl bg-amber-400 px-5 py-4 text-lg font-black text-black transition hover:bg-amber-300 disabled:opacity-50"
                    >
                      {isUpdating
                        ? "Updating..."
                        : nextAction.label}
                    </button>
                  )}
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

function FilterButton({
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