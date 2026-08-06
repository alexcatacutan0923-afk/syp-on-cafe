"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  status: "waiting" | "preparing" | "ready" | "served";
  items: QueueItem[];
  paid_at: string;
  preparing_at?: string | null;
  ready_at?: string | null;
};

type Props = {
  now: Date;
  standby: ReactNode;
};

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

function elapsed(from?: string | null) {
  if (!from) return "00:00";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(from).getTime()) / 1000),
  );

  return `${String(Math.floor(seconds / 60)).padStart(
    2,
    "0",
  )}:${String(seconds % 60).padStart(2, "0")}`;
}

function itemSummary(items: QueueItem[]) {
  return (items ?? [])
    .slice(0, 2)
    .map((item) => item.name)
    .filter(Boolean)
    .join(", ");
}

function money(value?: number) {
  if (value == null) return "";
  return `₱${Math.max(0, Number(value)).toLocaleString(
    "en-PH",
  )}`;
}

function playReadyChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const gain = context.createGain();

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.18,
      context.currentTime + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 1.05,
    );
    gain.connect(context.destination);

    [880, 1174.66, 1396.91].forEach(
      (frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start(
          context.currentTime + index * 0.19,
        );
        oscillator.stop(
          context.currentTime + 0.45 + index * 0.19,
        );
      },
    );

    window.setTimeout(() => void context.close(), 1300);
  } catch {
    // Some TV browsers require one interaction before sound.
  }
}

export default function PreparationDisplay({
  now,
  standby,
}: Props) {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [readyAnnouncement, setReadyAnnouncement] =
    useState<QueueTicket | null>(null);
  const [, setTick] = useState(0);

  const readyTimerRef = useRef<number | null>(null);

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from("pos_preparation_queue")
      .select("*")
      .neq("status", "served")
      .order("paid_at", { ascending: true })
      .limit(30);

    if (!error) {
      setTickets((data ?? []) as QueueTicket[]);
    }
  }, []);

  useEffect(() => {
    void loadTickets();

    const clockTimer = window.setInterval(
      () => setTick((value) => value + 1),
      1000,
    );
    const refreshTimer = window.setInterval(
      () => void loadTickets(),
      10000,
    );

    const channel = supabase
      .channel("syp-customer-display-v5")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pos_preparation_queue",
        },
        (payload) => {
          const next = payload.new as QueueTicket;
          const previous = payload.old as QueueTicket;

          if (
            payload.eventType === "UPDATE" &&
            next?.status === "ready" &&
            previous?.status !== "ready"
          ) {
            if (readyTimerRef.current !== null) {
              window.clearTimeout(readyTimerRef.current);
            }

            setReadyAnnouncement(next);
            playReadyChime();

            readyTimerRef.current = window.setTimeout(() => {
              setReadyAnnouncement(null);
              readyTimerRef.current = null;
            }, 9000);
          }

          void loadTickets();
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(clockTimer);
      window.clearInterval(refreshTimer);

      if (readyTimerRef.current !== null) {
        window.clearTimeout(readyTimerRef.current);
      }

      void supabase.removeChannel(channel);
    };
  }, [loadTickets]);

  const active = tickets.filter(
    (ticket) => ticket.status !== "served",
  );

  const featured = useMemo(
    () =>
      active.find(
        (ticket) => ticket.status === "preparing",
      ) ||
      active.find((ticket) => ticket.status === "waiting") ||
      active.find((ticket) => ticket.status === "ready") ||
      null,
    [active],
  );

  const ready = active.filter(
    (ticket) => ticket.status === "ready",
  );

  if (!featured && !readyAnnouncement) {
    return <>{standby}</>;
  }

  const items = featured?.items ?? [];
  const primary = items[0];
  const startedAt =
    featured?.preparing_at || featured?.paid_at || null;

  return (
    <main className="prep5-screen">
      <div className="prep5-background" aria-hidden="true">
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

      {readyAnnouncement && (
        <section className="prep5-ready-overlay">
          <div className="prep5-ready-rings">
            <i />
            <i />
            <i />
          </div>

          <article className="prep5-ready-card">
            <span>🔔 ORDER READY</span>
            <strong>
              {queueLabel(readyAnnouncement.queue_no)}
            </strong>
            <h2>
              {readyAnnouncement.customer_name || "KaSYP"}
            </h2>
            <p>Please claim your freshly prepared order.</p>
            <b>READY FOR PICKUP</b>
          </article>
        </section>
      )}

      <header className="prep5-header">
        <div className="prep5-brand">
          <img
            src="/brand/syp-logo-glow-v2.webp"
            alt="SYP ON CAFÉ"
          />
          <div>
            <h1>SYP ON CAFÉ POS</h1>
            <p>Street · Iced · Brewed</p>
          </div>
        </div>

        <time>
          <b>
            {now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </b>
          <small>
            {now.toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </small>
        </time>
      </header>

      <section className="prep5-layout">
        <article className="prep5-main-card">
          <section className="prep5-hero">
            <div className="prep5-copy">
              <span className="prep5-status">
                ☕{" "}
                {featured?.status === "preparing"
                  ? "NOW PREPARING"
                  : featured?.status === "ready"
                    ? "READY FOR PICKUP"
                    : "ORDER RECEIVED • PAID"}
              </span>

              <strong className="prep5-number">
                {queueLabel(featured?.queue_no || "")}
              </strong>

              <h2>{featured?.customer_name || "KaSYP"}</h2>
              <p>☎ Walk-in Order</p>

              <div className="prep5-times">
                <div>
                  <span>ORDER TIME</span>
                  <b>
                    {featured?.paid_at
                      ? new Date(
                          featured.paid_at,
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </b>
                </div>

                <div>
                  <span>ELAPSED TIME</span>
                  <b>{elapsed(startedAt)}</b>
                </div>
              </div>
            </div>

            <div className="prep5-product">
              <div className="prep5-product-glow" />

              {primary?.image ? (
                <img src={primary.image} alt={primary.name} />
              ) : (
                <span>☕</span>
              )}

              <i />

              <div className="prep5-product-specs">
                <b>{primary?.size || "16oz"}</b>
                <em>•</em>
                <b>Iced</b>
                <em>•</em>
                <b>100% sugar</b>
                <em>•</em>
                <b>Normal Ice</b>
              </div>
            </div>
          </section>

          <section className="prep5-items">
            <header>🛒 ORDER ITEMS</header>

            <div>
              {items.slice(0, 4).map((item, index) => (
                <article key={`${item.name}-${index}`}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>☕</span>
                  )}

                  <strong>{item.qty}×</strong>

                  <p>
                    <b>{item.name}</b>
                    <small>
                      {[item.size, item.details]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </p>

                  {item.unitPrice != null && (
                    <em>{money(item.unitPrice * item.qty)}</em>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="prep5-progress">
            <div className="done">
              <i>✓</i>
              <span>
                <b>PAID</b>
                <small>
                  {featured?.paid_at
                    ? new Date(
                        featured.paid_at,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </small>
              </span>
            </div>

            <em />

            <div
              className={
                featured?.status !== "waiting" ? "done" : ""
              }
            >
              <i>☕</i>
              <span>
                <b>PREPARING</b>
                <small>
                  {featured?.status === "preparing"
                    ? elapsed(startedAt)
                    : "--:--"}
                </small>
              </span>
            </div>

            <em />

            <div
              className={
                featured?.status === "ready" ? "done" : ""
              }
            >
              <i>🔔</i>
              <span>
                <b>READY</b>
                <small>
                  {featured?.ready_at
                    ? new Date(
                        featured.ready_at,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--:--"}
                </small>
              </span>
            </div>

            <em />

            <div>
              <i>▣</i>
              <span>
                <b>SERVED</b>
                <small>--:--</small>
              </span>
            </div>
          </section>

          <footer className="prep5-tip">
            💡 Please wait for the ready announcement.
          </footer>
        </article>

        <aside className="prep5-sidebar">
          <section className="prep5-panel prep5-active">
            <header>
              <span>ACTIVE QUEUE</span>
              <b>● LIVE</b>
            </header>

            <div>
              {active.slice(0, 6).map((ticket) => (
                <article
                  key={ticket.id}
                  className={
                    ticket.id === featured?.id ? "current" : ""
                  }
                >
                  <strong>{queueLabel(ticket.queue_no)}</strong>

                  <p>
                    <b>{ticket.customer_name || "KaSYP"}</b>
                    <small>
                      {itemSummary(ticket.items) || "Order items"}
                    </small>
                  </p>

                  <div>
                    <span className={`status-${ticket.status}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                    <small>
                      {elapsed(
                        ticket.preparing_at || ticket.paid_at,
                      )}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="prep5-panel prep5-pickup">
            <header>
              <span>🔔 READY FOR PICKUP</span>
            </header>

            {ready.length ? (
              <div className="prep5-ready-numbers">
                {ready.slice(0, 6).map((ticket) => (
                  <strong key={ticket.id}>
                    {queueLabel(ticket.queue_no)}
                  </strong>
                ))}
              </div>
            ) : (
              <div className="prep5-empty">
                <div>▢</div>
                <b>No orders ready yet</b>
                <p>
                  Orders will appear here once marked ready.
                </p>
              </div>
            )}
          </section>
        </aside>
      </section>

      <footer className="prep5-footer">
        <div>
          <i />
          <span>
            <b>CONNECTED</b>
            <small>Realtime sync active</small>
          </span>
        </div>

        <div>
          <span>
            <b>SOUND ON</b>
            <small>Notifications enabled</small>
          </span>
          🔊
        </div>
      </footer>
    </main>
  );
}
