"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type QueueItem = {
  name: string;
  size?: string;
  qty: number;
  unitPrice?: number;
  image?: string;
  details?: string;
};

type QueueTicket = {
  id: string;
  receipt_no: string;
  queue_no: string;
  customer_name: string;
  member_code?: string | null;
  payment_method: string;
  total: number;
  status: "waiting" | "preparing" | "ready" | "served";
  items: QueueItem[];
  notes?: string | null;
  cashier?: string | null;
  paid_at: string;
  preparing_at?: string | null;
  ready_at?: string | null;
  served_at?: string | null;
};

const money = (value: number) =>
  `₱${Math.max(0, Number(value || 0)).toLocaleString("en-PH")}`;

function elapsed(from?: string | null) {
  if (!from) return "00:00";
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(from).getTime()) / 1000),
  );
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ActiveOrdersPanel() {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [, setClockTick] = useState(0);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("pos_preparation_queue")
      .select("*")
      .neq("status", "served")
      .order("paid_at", { ascending: true })
      .limit(50);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTickets((data ?? []) as QueueTicket[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();

    const timer = window.setInterval(() => setClockTick((value) => value + 1), 1000);
    const refreshTimer = window.setInterval(() => void load(), 10000);

    const channel = supabase
      .channel("pos-preparation-panel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pos_preparation_queue" },
        () => void load(),
      )
      .subscribe();

    return () => {
      window.clearInterval(timer);
      window.clearInterval(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const counts = useMemo(
    () => ({
      waiting: tickets.filter((ticket) => ticket.status === "waiting").length,
      preparing: tickets.filter((ticket) => ticket.status === "preparing").length,
      ready: tickets.filter((ticket) => ticket.status === "ready").length,
    }),
    [tickets],
  );

  async function updateStatus(
    ticket: QueueTicket,
    nextStatus: QueueTicket["status"],
  ) {
    setUpdatingId(ticket.id);
    setMessage("");

    const now = new Date().toISOString();
    const timestampPatch =
      nextStatus === "preparing"
        ? { preparing_at: now }
        : nextStatus === "ready"
          ? { ready_at: now }
          : nextStatus === "served"
            ? { served_at: now }
            : {};

    const { error } = await supabase
      .from("pos_preparation_queue")
      .update({
        status: nextStatus,
        ...timestampPatch,
        updated_at: now,
      })
      .eq("id", ticket.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        nextStatus === "preparing"
          ? `${ticket.queue_no} is now preparing.`
          : nextStatus === "ready"
            ? `${ticket.queue_no} is ready for pickup.`
            : `${ticket.queue_no} marked served.`,
      );
      await load();
    }

    setUpdatingId(null);
  }

  return (
    <section className="pos-active-orders">
      <header className="pos-active-orders-head">
        <div>
          <span>PAID PREPARATION QUEUE</span>
          <h2>Active Orders</h2>
          <p>
            Controls stay on this POS monitor. The extended customer display is
            view-only.
          </p>
        </div>

        <div className="pos-order-counts">
          <b><i className="waiting" />{counts.waiting} Waiting</b>
          <b><i className="preparing" />{counts.preparing} Preparing</b>
          <b><i className="ready" />{counts.ready} Ready</b>
        </div>
      </header>

      {message && <div className="pos-queue-message">{message}</div>}

      {loading ? (
        <div className="pos-queue-empty">Loading paid orders…</div>
      ) : tickets.length === 0 ? (
        <div className="pos-queue-empty">
          <strong>No active paid orders</strong>
          <span>New checkout tickets will stay here until marked served.</span>
        </div>
      ) : (
        <div className="pos-ticket-grid">
          {tickets.map((ticket) => {
            const startedAt = ticket.preparing_at || ticket.paid_at;
            const firstItems = Array.isArray(ticket.items)
              ? ticket.items.slice(0, 3)
              : [];

            return (
              <article
                key={ticket.id}
                className={`pos-ticket status-${ticket.status}`}
              >
                <div className="pos-ticket-top">
                  <div>
                    <span>{ticket.status.toUpperCase()}</span>
                    <strong>{ticket.queue_no}</strong>
                  </div>

                  <div className="pos-ticket-time">
                    <small>
                      {ticket.status === "waiting" ? "Wait time" : "Production"}
                    </small>
                    <b>{elapsed(startedAt)}</b>
                  </div>
                </div>

                <div className="pos-ticket-customer">
                  <h3>{ticket.customer_name || "WALK-IN CUSTOMER"}</h3>
                  <p>
                    {ticket.receipt_no} · PAID · {money(ticket.total)}
                  </p>
                </div>

                <div className="pos-ticket-items">
                  {firstItems.map((item, index) => (
                    <div key={`${ticket.id}-${item.name}-${index}`}>
                      {item.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        <span className="pos-ticket-image-fallback">☕</span>
                      )}
                      <p>
                        <b>{item.qty}× {item.name}</b>
                        <small>
                          {[item.size, item.details].filter(Boolean).join(" · ")}
                        </small>
                      </p>
                    </div>
                  ))}

                  {ticket.items.length > 3 && (
                    <small className="pos-more-items">
                      +{ticket.items.length - 3} more item(s)
                    </small>
                  )}
                </div>

                {ticket.notes && (
                  <div className="pos-ticket-note">
                    <b>Note:</b> {ticket.notes}
                  </div>
                )}

                <div className="pos-ticket-actions">
                  {ticket.status === "waiting" && (
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => void updateStatus(ticket, "preparing")}
                      className="start"
                    >
                      {updatingId === ticket.id
                        ? "UPDATING…"
                        : "START PREPARING"}
                    </button>
                  )}

                  {ticket.status === "preparing" && (
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => void updateStatus(ticket, "ready")}
                      className="ready"
                    >
                      {updatingId === ticket.id
                        ? "UPDATING…"
                        : "MARK READY"}
                    </button>
                  )}

                  {ticket.status === "ready" && (
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => void updateStatus(ticket, "served")}
                      className="served"
                    >
                      {updatingId === ticket.id
                        ? "UPDATING…"
                        : "MARK SERVED"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
