"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "./operations.css";

type QueueItem = {
  name: string;
  qty: number;
  size?: string;
  details?: string;
  image?: string;
  unitPrice?: number;
};

type QueueTicket = {
  id: string;
  queue_no: string;
  receipt_no: string;
  customer_name: string;
  status: "waiting" | "preparing" | "ready" | "served";
  items: QueueItem[];
  total: number;
  cashier?: string | null;
  paid_at: string;
  preparing_at?: string | null;
  ready_at?: string | null;
  served_at?: string | null;
};

type InventoryItem = {
  id: string | number;
  name?: string | null;
  item_name?: string | null;
  stock?: number | null;
  current_stock?: number | null;
  minimum_stock?: number | null;
  reorder_level?: number | null;
  unit?: string | null;
};

type MemberRow = {
  id?: string;
  member_code?: string;
  joined_at?: string | null;
  created_at?: string | null;
};

type ProductStat = {
  name: string;
  qty: number;
};

type HourStat = {
  hour: string;
  count: number;
  sales: number;
};

const money = (value: number) =>
  `₱${Math.max(0, Number(value || 0)).toLocaleString("en-PH")}`;

function queueLabel(value: string) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "A-000";
  if (/^[A-Z]-\d{3,}$/.test(raw)) return raw;

  const letter = raw.match(/[A-Z]/)?.[0] || "A";
  const digits = raw.replace(/\D/g, "");

  return digits
    ? `${letter}-${digits.slice(-3).padStart(3, "0")}`
    : raw;
}

function elapsedSeconds(from?: string | null) {
  if (!from) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(from).getTime()) / 1000),
  );
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
}

function localDayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function sameLocalDay(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function OperationsCenterPage() {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [membersToday, setMembersToday] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setMessage("");

    const start = localDayStart().toISOString();

    const [queueResult, inventoryResult, membersResult] =
      await Promise.allSettled([
        supabase
          .from("pos_preparation_queue")
          .select("*")
          .gte("paid_at", start)
          .order("paid_at", { ascending: false })
          .limit(300),

        supabase
          .from("inventory_items")
          .select("*")
          .limit(100),

        supabase
          .from("loyalty_members")
          .select("id,member_code,joined_at,created_at")
          .gte("joined_at", start)
          .limit(500),
      ]);

    if (queueResult.status === "fulfilled") {
      const { data, error } = queueResult.value;

      if (error) {
        setMessage(error.message);
      } else {
        setTickets((data ?? []) as QueueTicket[]);
      }
    }

    if (
      inventoryResult.status === "fulfilled" &&
      !inventoryResult.value.error
    ) {
      setInventory(
        (inventoryResult.value.data ?? []) as InventoryItem[],
      );
    } else {
      setInventory([]);
    }

    if (
      membersResult.status === "fulfilled" &&
      !membersResult.value.error
    ) {
      const rows = (membersResult.value.data ?? []) as MemberRow[];
      setMembersToday(
        rows.filter((row) =>
          sameLocalDay(row.joined_at || row.created_at),
        ).length,
      );
    } else {
      setMembersToday(0);
    }

    setLastSync(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    setNow(new Date());
    void load();

    const clock = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    const refresh = window.setInterval(() => {
      void load();
    }, 15000);

    const queueChannel = supabase
      .channel("operations-center-queue")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pos_preparation_queue",
        },
        () => void load(),
      )
      .subscribe();

    const memberChannel = supabase
      .channel("operations-center-members")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "loyalty_members",
        },
        () => void load(),
      )
      .subscribe();

    return () => {
      window.clearInterval(clock);
      window.clearInterval(refresh);
      void supabase.removeChannel(queueChannel);
      void supabase.removeChannel(memberChannel);
    };
  }, [load]);

  const todayTickets = useMemo(
    () => tickets.filter((ticket) => sameLocalDay(ticket.paid_at)),
    [tickets],
  );

  const activeTickets = useMemo(
    () =>
      todayTickets.filter(
        (ticket) => ticket.status !== "served",
      ),
    [todayTickets],
  );

  const salesToday = useMemo(
    () =>
      todayTickets.reduce(
        (sum, ticket) => sum + Number(ticket.total || 0),
        0,
      ),
    [todayTickets],
  );

  const preparingCount = activeTickets.filter(
    (ticket) => ticket.status === "preparing",
  ).length;

  const readyCount = activeTickets.filter(
    (ticket) => ticket.status === "ready",
  ).length;

  const waitingCount = activeTickets.filter(
    (ticket) => ticket.status === "waiting",
  ).length;

  const servedToday = todayTickets.filter(
    (ticket) => ticket.status === "served",
  );

  const averagePrepSeconds = useMemo(() => {
    const durations = servedToday
      .map((ticket) => {
        const start = ticket.preparing_at || ticket.paid_at;
        const end = ticket.ready_at || ticket.served_at;
        if (!start || !end) return 0;
        return Math.max(
          0,
          Math.floor(
            (new Date(end).getTime() -
              new Date(start).getTime()) /
              1000,
          ),
        );
      })
      .filter((value) => value > 0);

    if (!durations.length) return 0;

    return Math.floor(
      durations.reduce((sum, value) => sum + value, 0) /
        durations.length,
    );
  }, [servedToday]);

  const topProducts = useMemo<ProductStat[]>(() => {
    const map = new Map<string, number>();

    todayTickets.forEach((ticket) => {
      (ticket.items ?? []).forEach((item) => {
        const name = String(item.name || "Unknown item").trim();
        map.set(name, (map.get(name) || 0) + Number(item.qty || 0));
      });
    });

    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [todayTickets]);

  const hourlyStats = useMemo<HourStat[]>(() => {
    const map = new Map<number, { count: number; sales: number }>();

    todayTickets.forEach((ticket) => {
      const hour = new Date(ticket.paid_at).getHours();
      const current = map.get(hour) || { count: 0, sales: 0 };
      current.count += 1;
      current.sales += Number(ticket.total || 0);
      map.set(hour, current);
    });

    const startHour = 17;
    const endHour = 28;

    return Array.from({ length: endHour - startHour }, (_, index) => {
      const rawHour = startHour + index;
      const hour = rawHour % 24;
      const current = map.get(hour) || { count: 0, sales: 0 };

      return {
        hour: new Date(2026, 0, 1, hour).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
          },
        ),
        count: current.count,
        sales: current.sales,
      };
    });
  }, [todayTickets]);

  const maxHourlyCount = Math.max(
    1,
    ...hourlyStats.map((item) => item.count),
  );

  const slowOrders = useMemo(
    () =>
      activeTickets
        .map((ticket) => ({
          ...ticket,
          age: elapsedSeconds(
            ticket.preparing_at || ticket.paid_at,
          ),
        }))
        .filter((ticket) => ticket.age >= 8 * 60)
        .sort((a, b) => b.age - a.age)
        .slice(0, 5),
    [activeTickets, now],
  );

  const inventoryAlerts = useMemo(() => {
    return inventory
      .map((item) => {
        const stock = Number(
          item.current_stock ?? item.stock ?? 0,
        );
        const minimum = Number(
          item.minimum_stock ?? item.reorder_level ?? 0,
        );

        return {
          id: item.id,
          name:
            String(item.name || item.item_name || "Inventory item"),
          stock,
          minimum,
          unit: item.unit || "",
          low: minimum > 0 ? stock <= minimum : stock <= 5,
        };
      })
      .filter((item) => item.low)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);
  }, [inventory]);

  const staffStats = useMemo(() => {
    const map = new Map<
      string,
      { drinks: number; orders: number; totalSeconds: number }
    >();

    servedToday.forEach((ticket) => {
      const cashier = String(ticket.cashier || "Unassigned").trim();
      const current = map.get(cashier) || {
        drinks: 0,
        orders: 0,
        totalSeconds: 0,
      };

      current.orders += 1;
      current.drinks += (ticket.items ?? []).reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0,
      );

      const start = ticket.preparing_at || ticket.paid_at;
      const end = ticket.ready_at || ticket.served_at;

      if (start && end) {
        current.totalSeconds += Math.max(
          0,
          Math.floor(
            (new Date(end).getTime() -
              new Date(start).getTime()) /
              1000,
          ),
        );
      }

      map.set(cashier, current);
    });

    return Array.from(map.entries())
      .map(([name, stats]) => ({
        name,
        ...stats,
        average:
          stats.orders > 0
            ? Math.floor(stats.totalSeconds / stats.orders)
            : 0,
      }))
      .sort((a, b) => b.drinks - a.drinks)
      .slice(0, 4);
  }, [servedToday]);

  return (
    <main className="ops-page">
      <div className="ops-bg" aria-hidden="true">
        <video
          src="/videos/syp-cafe-background.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/syp-logo-glow-v2.webp"
        />
        <div />
      </div>

      <header className="ops-header">
        <div className="ops-brand">
          <img
            src="/brand/syp-logo-glow-v2.webp"
            alt="SYP ON CAFÉ"
          />
          <div>
            <span>LIVE BUSINESS CONTROL</span>
            <h1>SYP Café Operating Center</h1>
            <p>Queue, performance, members, and inventory in one view.</p>
          </div>
        </div>

        <div className="ops-header-actions">
          <div className="ops-live-pill">
            <i />
            REALTIME
          </div>

          <time>
            <b>
  {now
    ? now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--"}
</b>

<span>
  {now
    ? now.toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : ""}
</span>
          </time>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>

          <Link href="/admin">Back to Admin</Link>
        </div>
      </header>

      <section className="ops-content">
        <section className="ops-metrics">
          <article>
            <span>SALES TODAY</span>
            <strong>{money(salesToday)}</strong>
            <small>{todayTickets.length} paid orders</small>
          </article>

          <article>
            <span>ACTIVE ORDERS</span>
            <strong>{activeTickets.length}</strong>
            <small>{waitingCount} waiting</small>
          </article>

          <article>
            <span>PREPARING</span>
            <strong>{preparingCount}</strong>
            <small>Live production queue</small>
          </article>

          <article>
            <span>READY</span>
            <strong>{readyCount}</strong>
            <small>Waiting for pickup</small>
          </article>

          <article>
            <span>NEW MEMBERS</span>
            <strong>{membersToday}</strong>
            <small>Joined today</small>
          </article>

          <article>
            <span>AVG. PREP TIME</span>
            <strong>
              {averagePrepSeconds
                ? formatDuration(averagePrepSeconds)
                : "—"}
            </strong>
            <small>Served orders today</small>
          </article>
        </section>

        {message && <div className="ops-message">{message}</div>}

        <section className="ops-main-grid">
          <article className="ops-card ops-queue-card">
            <header>
              <div>
                <span>LIVE KITCHEN QUEUE</span>
                <h2>Current production</h2>
              </div>
              <b>{activeTickets.length} active</b>
            </header>

            <div className="ops-queue-list">
              {activeTickets.length ? (
                activeTickets
                  .slice()
                  .sort((a, b) => {
                    const rank = {
                      ready: 0,
                      preparing: 1,
                      waiting: 2,
                      served: 3,
                    };
                    return rank[a.status] - rank[b.status];
                  })
                  .slice(0, 10)
                  .map((ticket) => {
                    const age = elapsedSeconds(
                      ticket.preparing_at || ticket.paid_at,
                    );

                    return (
                      <section
                        key={ticket.id}
                        className={`ops-ticket status-${ticket.status} ${
                          age >= 8 * 60 ? "delayed" : ""
                        }`}
                      >
                        <strong>{queueLabel(ticket.queue_no)}</strong>

                        <div>
                          <b>
                            {ticket.customer_name ||
                              "WALK-IN CUSTOMER"}
                          </b>
                          <span>
                            {(ticket.items ?? [])
                              .slice(0, 2)
                              .map(
                                (item) =>
                                  `${item.qty}× ${item.name}`,
                              )
                              .join(" · ") || "No item details"}
                          </span>
                        </div>

                        <aside>
                          <i>{ticket.status.toUpperCase()}</i>
                          <small>{formatDuration(age)}</small>
                        </aside>
                      </section>
                    );
                  })
              ) : (
                <div className="ops-empty">
                  <strong>No active preparation orders</strong>
                  <span>Paid orders will appear here.</span>
                </div>
              )}
            </div>
          </article>

          <article className="ops-card ops-preview-card">
            <header>
              <div>
                <span>CUSTOMER DISPLAY PREVIEW</span>
                <h2>Extended monitor</h2>
              </div>
              <a
                href="/customer-display"
                target="_blank"
                rel="noreferrer"
              >
                Open full screen
              </a>
            </header>

            <div className="ops-preview-shell">
              <iframe
                src="/customer-display"
                title="Customer Display Preview"
              />
            </div>
          </article>
        </section>

        <section className="ops-secondary-grid">
          <article className="ops-card ops-top-products">
            <header>
              <div>
                <span>TOP DRINKS TODAY</span>
                <h2>Best sellers</h2>
              </div>
            </header>

            <div>
              {topProducts.length ? (
                topProducts.map((product, index) => (
                  <section key={product.name}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <div>
                      <b>{product.name}</b>
                      <span>{product.qty} sold</span>
                    </div>
                    <em
                      style={{
                        width: `${
                          (product.qty /
                            Math.max(1, topProducts[0].qty)) *
                          100
                        }%`,
                      }}
                    />
                  </section>
                ))
              ) : (
                <div className="ops-empty compact">
                  No product data yet.
                </div>
              )}
            </div>
          </article>

          <article className="ops-card ops-peak-card">
            <header>
              <div>
                <span>ORDER HEATMAP</span>
                <h2>Peak hours</h2>
              </div>
            </header>

            <div className="ops-hour-bars">
              {hourlyStats.map((item) => (
                <section key={item.hour}>
                  <span>{item.hour}</span>
                  <div>
                    <i
                      style={{
                        height: `${
                          12 +
                          (item.count / maxHourlyCount) * 88
                        }%`,
                      }}
                    />
                  </div>
                  <b>{item.count}</b>
                </section>
              ))}
            </div>
          </article>

          <article className="ops-card ops-alert-card">
            <header>
              <div>
                <span>SLOW ORDERS</span>
                <h2>Needs attention</h2>
              </div>
              <b>{slowOrders.length}</b>
            </header>

            <div className="ops-alert-list">
              {slowOrders.length ? (
                slowOrders.map((ticket) => (
                  <section key={ticket.id}>
                    <strong>{queueLabel(ticket.queue_no)}</strong>
                    <div>
                      <b>{ticket.customer_name}</b>
                      <span>{ticket.status}</span>
                    </div>
                    <em>{formatDuration(ticket.age)}</em>
                  </section>
                ))
              ) : (
                <div className="ops-empty compact">
                  No delayed orders.
                </div>
              )}
            </div>
          </article>

          <article className="ops-card ops-inventory-card">
            <header>
              <div>
                <span>INVENTORY ALERTS</span>
                <h2>Low stock</h2>
              </div>
              <b>{inventoryAlerts.length}</b>
            </header>

            <div className="ops-inventory-list">
              {inventoryAlerts.length ? (
                inventoryAlerts.map((item) => (
                  <section key={item.id}>
                    <div>
                      <b>{item.name}</b>
                      <span>
                        Minimum: {item.minimum} {item.unit}
                      </span>
                    </div>
                    <strong>
                      {item.stock} {item.unit}
                    </strong>
                  </section>
                ))
              ) : (
                <div className="ops-empty compact">
                  No low-stock alerts or inventory table unavailable.
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="ops-bottom-grid">
          <article className="ops-card ops-staff-card">
            <header>
              <div>
                <span>STAFF PERFORMANCE</span>
                <h2>Served orders today</h2>
              </div>
            </header>

            <div className="ops-staff-list">
              {staffStats.length ? (
                staffStats.map((staff) => (
                  <section key={staff.name}>
                    <strong>
                      {staff.name.charAt(0).toUpperCase()}
                    </strong>
                    <div>
                      <b>{staff.name}</b>
                      <span>
                        {staff.drinks} drinks · {staff.orders} orders
                      </span>
                    </div>
                    <em>
                      {staff.average
                        ? formatDuration(staff.average)
                        : "—"}
                    </em>
                  </section>
                ))
              ) : (
                <div className="ops-empty compact">
                  No completed staff data yet.
                </div>
              )}
            </div>
          </article>

          <article className="ops-card ops-status-card">
            <header>
              <div>
                <span>SYSTEM STATUS</span>
                <h2>Operations health</h2>
              </div>
            </header>

            <div className="ops-system-list">
              <section>
                <i className="online" />
                <div>
                  <b>Supabase queue</b>
                  <span>Realtime listener active</span>
                </div>
              </section>

              <section>
                <i className="online" />
                <div>
                  <b>Customer display</b>
                  <span>Preview connected</span>
                </div>
              </section>

              <section>
                <i className={message ? "warning" : "online"} />
                <div>
                  <b>Last sync</b>
                  <span>
                    {lastSync
                      ? lastSync.toLocaleTimeString("en-US")
                      : "Waiting for first sync"}
                  </span>
                </div>
              </section>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}