"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type Customer = {
  id: number;
  customer_code: string | null;
  name: string;
  mobile: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  trust_score: number;
  customer_status: string;
  is_blacklisted: boolean;
};

type Order = {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name: string;
  mobile: string;
  order_type: "pickup" | "delivery";
  payment_method: "cash" | "gcash";
  payment_status: string;
  address: string | null;
  landmark: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  rider_name: string | null;
  rider_mobile: string | null;
  rider_vehicle: string | null;
  rider_eta: string | null;
  accepted_by_rider_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  items: OrderItem[];
  customer: Customer | null;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  delivering: "Delivering",
  completed: "Completed",
  cancelled: "Cancelled",
};

const filterStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "delivering",
  "completed",
  "cancelled",
];

function formatMoney(value: number | null | undefined) {
  return `₱${Number(value ?? 0).toLocaleString("en-PH")}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function renderStars(score: number | null | undefined) {
  const safeScore = Math.max(1, Math.min(5, Number(score ?? 3)));
  return "★".repeat(safeScore) + "☆".repeat(5 - safeScore);
}

function getOrderAge(createdAt: string, now: number) {
  const createdTime = new Date(createdAt).getTime();
  const difference = Math.max(0, now - createdTime);
  const totalSeconds = Math.floor(difference / 1000);
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

function getOrderAgeStyle(createdAt: string, now: number) {
  const ageMinutes =
    (now - new Date(createdAt).getTime()) / 60000;

  if (ageMinutes >= 20) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (ageMinutes >= 10) {
    return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  }

  if (ageMinutes >= 5) {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<OrderStatus | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [newOrderAlert, setNewOrderAlert] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [paymentUpdatingOrderId, setPaymentUpdatingOrderId] = useState<number | null>(null);
  const [riderDrafts, setRiderDrafts] = useState<
    Record<
      number,
      {
        name: string;
        mobile: string;
        vehicle: string;
        eta: string;
      }
    >
  >({});

  const soundEnabledRef = useRef(soundEnabled);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const loadOrders = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      const { data: orderRows, error: ordersError } =
        await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const { data: itemRows, error: itemsError } =
        await supabase
          .from("order_items")
          .select("*")
          .order("id", { ascending: true });

      if (itemsError) throw itemsError;

      const rawItems = (itemRows ?? []) as Omit<
        OrderItem,
        "addons"
      >[];
      const itemIds = rawItems.map((item) => item.id);

      let addonRows: OrderItemAddon[] = [];

      if (itemIds.length > 0) {
        const { data: addonData, error: addonsError } =
          await supabase
            .from("order_item_addons")
            .select(
              "id, order_item_id, addon_id, addon_name, addon_price",
            )
            .in("order_item_id", itemIds)
            .order("id", { ascending: true });

        if (addonsError) throw addonsError;

        addonRows = (addonData ?? []).map((addon) => ({
          ...addon,
          addon_price: Number(addon.addon_price ?? 0),
        })) as OrderItemAddon[];
      }

      const { data: customerRows, error: customersError } =
        await supabase.from("customers").select("*");

      if (customersError) throw customersError;

      const items: OrderItem[] = rawItems.map((item) => ({
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
      const customers = (customerRows ?? []) as Customer[];

      const combinedOrders: Order[] = (orderRows ?? []).map(
        (order) => ({
          ...order,
          subtotal: Number(order.subtotal ?? 0),
          delivery_fee: Number(order.delivery_fee ?? 0),
          total: Number(order.total ?? 0),
          items: items
            .filter((item) => item.order_id === order.id)
            .map((item) => ({ ...item })),
          customer:
            customers.find(
              (customer) => customer.id === order.customer_id,
            ) ?? null,
        }),
      );

      setOrders(combinedOrders);
    } catch (error) {
      console.error("Failed to load admin orders:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load orders.",
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  function playNewOrderSound() {
    if (!soundEnabledRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        880,
        audioContext.currentTime,
      );
      oscillator.frequency.setValueAtTime(
        1100,
        audioContext.currentTime + 0.18,
      );

      gain.gain.setValueAtTime(
        0.15,
        audioContext.currentTime,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.45,
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.45);

      oscillator.addEventListener("ended", () => {
        void audioContext.close();
      });
    } catch (error) {
      console.error("Unable to play order sound:", error);
    }
  }

  useEffect(() => {
    void loadOrders();

    const refreshInterval = window.setInterval(() => {
      void loadOrders(true);
    }, 30000);

    const ordersChannel = supabase
      .channel("syp-live-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as {
            order_number?: string;
          };

          setNewOrderAlert(
            newOrder.order_number
              ? `New order: ${newOrder.order_number}`
              : "A new order has arrived.",
          );

          playNewOrderSound();
          setActiveFilter("pending");
          void loadOrders(true);

          window.setTimeout(() => {
            setNewOrderAlert("");
          }, 10000);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
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
      window.clearInterval(refreshInterval);
      void supabase.removeChannel(ordersChannel);
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
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "all" ||
        order.status === activeFilter;

      const matchesSearch =
        query.length === 0 ||
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.mobile.toLowerCase().includes(query) ||
        order.customer?.customer_code
          ?.toLowerCase()
          .includes(query) ||
        order.items.some((item) =>
          item.product_name.toLowerCase().includes(query),
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const acceptedCount = orders.filter(
    (order) => order.status === "accepted",
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "preparing",
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "ready",
  ).length;

  const deliveringCount = orders.filter(
    (order) => order.status === "delivering",
  ).length;

  const todayKey = new Date().toDateString();

  const ordersToday = orders.filter(
    (order) =>
      new Date(order.created_at).toDateString() === todayKey,
  );

  const completedToday = ordersToday.filter(
    (order) => order.status === "completed",
  );

  const salesToday = completedToday.reduce(
    (total, order) => total + Number(order.total),
    0,
  );

  const gcashPendingCount = orders.filter(
    (order) =>
      order.payment_method === "gcash" &&
      String(order.payment_status || "pending").toLowerCase() !== "paid",
  ).length;

  function getRiderDraft(order: Order) {
    return (
      riderDrafts[order.id] ?? {
        name: order.rider_name ?? "",
        mobile: order.rider_mobile ?? "",
        vehicle: order.rider_vehicle ?? "",
        eta: order.rider_eta ?? "",
      }
    );
  }

  function updateRiderDraft(
    orderId: number,
    field: "name" | "mobile" | "vehicle" | "eta",
    value: string,
  ) {
    setRiderDrafts((current) => ({
      ...current,
      [orderId]: {
        name: current[orderId]?.name ?? "",
        mobile: current[orderId]?.mobile ?? "",
        vehicle: current[orderId]?.vehicle ?? "",
        eta: current[orderId]?.eta ?? "",
        [field]: value,
      },
    }));
  }

  async function assignRider(order: Order) {
    const draft = getRiderDraft(order);
    const cleanName = draft.name.trim();
    const cleanMobile = draft.mobile.replace(/\s+/g, "").trim();

    if (!cleanName) {
      setErrorMessage("Enter the rider name before assigning.");
      return;
    }

    if (cleanMobile && !/^09\d{9}$/.test(cleanMobile)) {
      setErrorMessage(
        "Enter a valid Philippine rider mobile number, for example 09171234567.",
      );
      return;
    }

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          rider_name: cleanName,
          rider_mobile: cleanMobile || null,
          rider_vehicle: draft.vehicle.trim() || null,
          rider_eta: draft.eta.trim() || null,
          accepted_by_rider_at: now,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                rider_name: cleanName,
                rider_mobile: cleanMobile || null,
                rider_vehicle: draft.vehicle.trim() || null,
                rider_eta: draft.eta.trim() || null,
                accepted_by_rider_at: now,
              }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to assign rider:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to assign the rider.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function markOutForDelivery(order: Order) {
    if (!order.rider_name) {
      setErrorMessage("Assign a rider before marking the order out for delivery.");
      return;
    }

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivering",
          out_for_delivery_at: now,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "delivering",
                out_for_delivery_at: now,
              }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to start delivery:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to mark the order out for delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function markDelivered(order: Order) {
    const confirmed = window.confirm(
      `Mark order ${order.order_number} as delivered?`,
    );

    if (!confirmed) return;

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          status: "completed",
          delivered_at: now,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "completed",
                delivered_at: now,
              }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to complete delivery:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete the delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }


  async function updatePaymentStatus(order: Order, paymentStatus: "paid" | "pending") {
    setPaymentUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? { ...currentOrder, payment_status: paymentStatus }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to update payment status:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the payment status.",
      );
    } finally {
      setPaymentUpdatingOrderId(null);
    }
  }

  async function updateOrderStatus(
    orderId: number,
    status: OrderStatus,
  ) {
    setUpdatingOrderId(orderId);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the order.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function getNextAction(order: Order) {
    switch (order.status) {
      case "pending":
        return {
          label: "Accept Order",
          nextStatus: "accepted" as OrderStatus,
        };
      case "accepted":
        return {
          label: "Start Preparing",
          nextStatus: "preparing" as OrderStatus,
        };
      case "preparing":
        return {
          label: "Mark Ready",
          nextStatus: "ready" as OrderStatus,
        };
      case "ready":
        return order.order_type === "delivery"
          ? null
          : {
              label: "Complete Pickup",
              nextStatus: "completed" as OrderStatus,
            };
      case "delivering":
        return order.order_type === "delivery"
          ? null
          : {
              label: "Complete Order",
              nextStatus: "completed" as OrderStatus,
            };
      default:
        return null;
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-bold">SYP ON CAFÉ ADMIN</p>
            <p className="text-xs text-neutral-500">
              Live Order Management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSoundEnabled((current) => !current)
              }
              className={
                soundEnabled
                  ? "rounded-full border border-amber-400 bg-amber-400/10 px-4 py-2 text-sm text-amber-400"
                  : "rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-400"
              }
            >
              {soundEnabled
                ? "🔔 Sound On"
                : "🔕 Enable Sound"}
            </button>

            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              ● Live
            </span>

            <button
              type="button"
              onClick={() => void loadOrders(true)}
              disabled={refreshing}
              className="rounded-full border border-white/15 px-5 py-2 text-sm transition hover:border-amber-400 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-red-500/30 px-5 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              Logout
            </button>

            <Link
              href="/admin/community"
              className="rounded-full border border-amber-400/40 px-5 py-2 text-sm font-semibold text-amber-300"
            >
              Reviews & Moments
            </Link>

            <Link
              href="/menu"
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black"
            >
              Customer Menu
            </Link>
          </div>
        </div>
      </header>

      {newOrderAlert && (
        <div className="border-b border-amber-400/20 bg-amber-400/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-bold text-amber-400">
                🔔 New Order Received
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                {newOrderAlert}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewOrderAlert("");
                setActiveFilter("pending");
              }}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black"
            >
              View Order
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-9">
          <DashboardCard
            label="Orders Today"
            value={ordersToday.length}
          />
          <DashboardCard
            label="Pending"
            value={pendingCount}
          />
          <DashboardCard
            label="Accepted"
            value={acceptedCount}
          />
          <DashboardCard
            label="Preparing"
            value={preparingCount}
          />
          <DashboardCard label="Ready" value={readyCount} />
          <DashboardCard
            label="Delivering"
            value={deliveringCount}
          />
          <DashboardCard
            label="Completed"
            value={completedToday.length}
          />
          <DashboardCard
            label="GCash Pending"
            value={gcashPendingCount}
          />
          <DashboardCard
            label="Sales Today"
            value={formatMoney(salesToday)}
          />
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Live Orders
                </h1>
                <p className="mt-2 text-neutral-500">
                  Realtime order management for SYP ON CAFÉ.
                </p>
              </div>

              <label className="w-full max-w-md">
                <span className="text-sm text-neutral-400">
                  Search orders
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Order no., name, phone or product..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-950 px-5 py-3 outline-none transition focus:border-amber-400"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label={`All (${orders.length})`}
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              />

              {filterStatuses.map((status) => (
                <FilterButton
                  key={status}
                  label={`${statusLabels[status]} (${
                    orders.filter(
                      (order) => order.status === status,
                    ).length
                  })`}
                  active={activeFilter === status}
                  onClick={() => setActiveFilter(status)}
                />
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-950 p-12 text-center text-neutral-400">
              Loading live orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center text-neutral-500">
              No orders found in this section.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {filteredOrders.map((order) => {
                const nextAction = getNextAction(order);
                const customer = order.customer;
                const isUpdating =
                  updatingOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-neutral-950 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={order.status}
                          />

                          {![
                            "completed",
                            "cancelled",
                          ].includes(order.status) && (
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getOrderAgeStyle(
                                order.created_at,
                                currentTime,
                              )}`}
                            >
                              ⏱{" "}
                              {getOrderAge(
                                order.created_at,
                                currentTime,
                              )}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-xl font-bold text-amber-400">
                          {order.order_number}
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatMoney(order.total)}
                        </p>
                        <p className="mt-1 text-sm capitalize text-neutral-500">
                          {order.order_type} •{" "}
                          {order.payment_method}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 p-4">
                        <p className="text-sm text-neutral-500">
                          Customer
                        </p>
                        <p className="mt-1 font-semibold">
                          {order.customer_name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {order.mobile}
                        </p>
                        <p className="mt-3 text-amber-400">
                          {renderStars(customer?.trust_score)}
                        </p>
                        <p className="mt-1 text-xs capitalize text-neutral-500">
                          {customer?.customer_status ?? "new"} •{" "}
                          {customer?.total_orders ?? 0} total
                          orders
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-300">
                            Completed:{" "}
                            {customer?.completed_orders ?? 0}
                          </div>
                          <div className="rounded-xl bg-red-500/10 px-3 py-2 text-red-300">
                            Cancelled:{" "}
                            {customer?.cancelled_orders ?? 0}
                          </div>
                        </div>

                        {customer?.is_blacklisted && (
                          <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
                            Blacklisted customer
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 p-4">
                        <p className="text-sm text-neutral-500">
                          Order method
                        </p>
                        <p className="mt-1 font-semibold capitalize">
                          {order.order_type}
                        </p>

                        {order.order_type === "delivery" && (
                          <>
                            <p className="mt-3 text-sm leading-6 text-neutral-300">
                              {order.address || "No address"}
                            </p>
                            {order.landmark && (
                              <p className="mt-2 text-sm text-neutral-500">
                                Landmark: {order.landmark}
                              </p>
                            )}
                          </>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                            String(order.payment_status || "pending").toLowerCase() === "paid"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          }`}>
                            {order.payment_method} • {order.payment_status || "pending"}
                          </span>

                          {order.payment_method === "gcash" && (
                            <button
                              type="button"
                              disabled={paymentUpdatingOrderId === order.id}
                              onClick={() =>
                                void updatePaymentStatus(
                                  order,
                                  String(order.payment_status || "pending").toLowerCase() === "paid"
                                    ? "pending"
                                    : "paid",
                                )
                              }
                              className="rounded-full border border-sky-400/40 px-3 py-1 text-xs font-bold text-sky-300 disabled:opacity-50"
                            >
                              {paymentUpdatingOrderId === order.id
                                ? "Saving..."
                                : String(order.payment_status || "pending").toLowerCase() === "paid"
                                  ? "Mark Unpaid"
                                  : "Verify GCash"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 p-4">
                      <p className="font-semibold">
                        Order Items
                      </p>

                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-4"
                          >
                            <div>
                              <p>
                                {item.quantity}×{" "}
                                {item.temperature === "hot"
                                  ? "Hot "
                                  : item.temperature === "iced"
                                    ? "Iced "
                                    : ""}
                                {item.product_name}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {item.size || "Regular"} • Base{" "}
                                {formatMoney(item.base_price)}
                              </p>

                              {item.addons.length > 0 && (
                                <div className="mt-2 space-y-1 border-l border-amber-400/40 pl-3 text-sm text-amber-300">
                                  {item.addons.map((addon) => (
                                    <p key={addon.id}>
                                      + {addon.addon_name} (
                                      {formatMoney(addon.addon_price)})
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <p className="font-semibold">
                              {formatMoney(item.line_total)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                        <div className="flex justify-between text-neutral-400">
                          <span>Subtotal</span>
                          <span>
                            {formatMoney(order.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Delivery fee</span>
                          <span>
                            {formatMoney(order.delivery_fee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold">
                          <span>Total</span>
                          <span className="text-amber-400">
                            {formatMoney(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <p className="text-sm font-semibold text-amber-400">
                          Customer notes
                        </p>
                        <p className="mt-2 text-sm leading-6 text-neutral-300">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {order.order_type === "delivery" &&
                      ["ready", "delivering", "completed"].includes(
                        order.status,
                      ) && (
                        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-amber-400">
                                🚚 Shop Rider Assignment
                              </p>
                              <p className="mt-1 text-sm text-neutral-500">
                                Cashier-managed delivery details shown to the customer.
                              </p>
                            </div>

                            {order.rider_name && (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                Rider Assigned
                              </span>
                            )}
                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Rider name
                              </span>
                              <input
                                type="text"
                                value={getRiderDraft(order).name}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="Example: Alex"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Rider mobile
                              </span>
                              <input
                                type="tel"
                                value={getRiderDraft(order).mobile}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "mobile",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="09XXXXXXXXX"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Vehicle / description
                              </span>
                              <input
                                type="text"
                                value={getRiderDraft(order).vehicle}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "vehicle",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="Example: Black Mio"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Estimated arrival
                              </span>
                              <input
                                type="text"
                                value={getRiderDraft(order).eta}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "eta",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="Example: 15–20 minutes"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>
                          </div>

                          {order.status !== "completed" && (
                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => void assignRider(order)}
                                className="flex-1 rounded-full border border-amber-400 px-5 py-3 font-semibold text-amber-400 transition hover:bg-amber-400/10 disabled:opacity-50"
                              >
                                {isUpdating
                                  ? "Saving..."
                                  : order.rider_name
                                    ? "Update Rider Details"
                                    : "Assign Rider"}
                              </button>

                              {order.status === "ready" && (
                                <button
                                  type="button"
                                  disabled={isUpdating || !order.rider_name}
                                  onClick={() =>
                                    void markOutForDelivery(order)
                                  }
                                  className="flex-1 rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Out for Delivery
                                </button>
                              )}

                              {order.status === "delivering" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void markDelivered(order)}
                                  className="flex-1 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          )}

                          {order.rider_name && (
                            <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-300">
                              <p>
                                Assigned rider:{" "}
                                <span className="font-bold text-white">
                                  {order.rider_name}
                                </span>
                              </p>
                              {order.rider_mobile && (
                                <p>Mobile: {order.rider_mobile}</p>
                              )}
                              {order.rider_vehicle && (
                                <p>Vehicle: {order.rider_vehicle}</p>
                              )}
                              {order.rider_eta && (
                                <p>ETA: {order.rider_eta}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      {nextAction && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void updateOrderStatus(
                              order.id,
                              nextAction.nextStatus,
                            )
                          }
                          className="flex-1 rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                        >
                          {isUpdating
                            ? "Updating..."
                            : nextAction.label}
                        </button>
                      )}

                      {![
                        "completed",
                        "cancelled",
                      ].includes(order.status) && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                `Cancel order ${order.order_number}?`,
                              );

                            if (confirmed) {
                              void updateOrderStatus(
                                order.id,
                                "cancelled",
                              );
                            }
                          }}
                          className="rounded-full border border-red-500/30 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      </main>
    </ProtectedRoute>
  );
}

function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-amber-400">
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
          ? "rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black"
          : "rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-400 transition hover:border-amber-400 hover:text-amber-400"
      }
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<OrderStatus, string> = {
    pending:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    accepted:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",
    preparing:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    ready:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    delivering:
      "border-purple-500/30 bg-purple-500/10 text-purple-300",
    completed:
      "border-green-500/30 bg-green-500/10 text-green-300",
    cancelled:
      "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}