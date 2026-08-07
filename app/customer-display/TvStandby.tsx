"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import "./tv-standby.css";

type Props = {
  now: Date;
};

type Settings = {
  enabled: boolean;
  slide_seconds: number;
  show_queue: boolean;
  show_reviews: boolean;
  show_membership: boolean;
  show_store_status: boolean;
  show_social: boolean;
  footer_message: string;
};

type MediaRow = {
  id: string;
  title: string;
  public_url: string;
  media_type: "image" | "video";
  duration_seconds: number;
  featured: boolean;
  active: boolean;
  sort_order: number;
};

type Review = {
  id: string | number;
  customer_name?: string | null;
  name?: string | null;
  rating?: number | null;
  comment?: string | null;
  review?: string | null;
};

type Store = {
  store_status?: string | null;
  announcement?: string | null;
  closing_time?: string | null;
  free_delivery?: boolean | null;
};

type QueueItem = {
  name?: string;
  qty?: number;
};

type PreparationTicket = {
  id: string;
  queue_no: string;
  customer_name: string;
  status: "waiting" | "preparing" | "ready" | "served";
  items: QueueItem[];
  total?: number;
  paid_at: string;
};

type OnlineOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  queue_no?: string | null;
  status: string;
};

type PriorityEvent = {
  id: string;
  event_type: "birthday" | "spin_winner" | "new_menu" | "lucky_queue" | "announcement";
  title: string;
  subtitle?: string | null;
  body?: string | null;
  person_name?: string | null;
  reward?: string | null;
  image_url?: string | null;
  active: boolean;
  priority: number;
  duration_seconds: number;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
};

type ProductStat = {
  name: string;
  qty: number;
};

type Scene =
  | { id: string; type: "welcome"; duration: number }
  | { id: string; type: "trending"; duration: number }
  | { id: string; type: "promo"; duration: number }
  | { id: string; type: "review"; duration: number }
  | { id: string; type: "membership"; duration: number }
  | { id: string; type: "order"; duration: number }
  | { id: string; type: "fact"; duration: number }
  | { id: string; type: "media"; duration: number; media: MediaRow };

const defaults: Settings = {
  enabled: true,
  slide_seconds: 15,
  show_queue: true,
  show_reviews: true,
  show_membership: true,
  show_store_status: true,
  show_social: true,
  footer_message: "Good coffee. Good moments. Made for you.",
};

const facts = [
  "Espresso is concentrated coffee brewed by forcing hot water through finely ground coffee.",
  "Matcha is stone-ground green tea traditionally whisked into water or milk.",
  "Coffee aroma is created by hundreds of naturally occurring aromatic compounds.",
  "Ice changes dilution as it melts, which is why balance matters in every iced drink.",
  "Fresh grinding helps preserve the aroma released from roasted coffee beans.",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function greeting(hour: number) {
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

function normalizeQueue(value: string) {
  const raw = clean(value).toUpperCase();
  if (!raw) return "A-000";
  if (/^[A-Z]-\d{3,}$/.test(raw)) return raw;

  const letter = raw.match(/[A-Z]/)?.[0] || "A";
  const digits = raw.replace(/\D/g, "");

  return digits
    ? `${letter}-${digits.slice(-3).padStart(3, "0")}`
    : raw;
}

function isEventLive(event: PriorityEvent, now: Date) {
  if (!event.active) return false;

  const start = event.starts_at ? new Date(event.starts_at).getTime() : 0;
  const end = event.ends_at ? new Date(event.ends_at).getTime() : Number.MAX_SAFE_INTEGER;
  const current = now.getTime();

  return current >= start && current <= end;
}

export default function TvStandby({ now }: Props) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [store, setStore] = useState<Store>({});
  const [ticketsToday, setTicketsToday] = useState<PreparationTicket[]>([]);
  const [onlineQueue, setOnlineQueue] = useState<OnlineOrder[]>([]);
  const [priorityEvents, setPriorityEvents] = useState<PriorityEvent[]>([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState<"live" | "syncing">("syncing");
  const [activePriorityEvent, setActivePriorityEvent] = useState<PriorityEvent | null>(null);
  const [dismissedEventIds, setDismissedEventIds] = useState<string[]>([]);
  const priorityTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setConnectionState("syncing");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        settingsResult,
        mediaResult,
        reviewsResult,
        storeResult,
        prepResult,
        onlineResult,
        priorityResult,
      ] = await Promise.allSettled([
        supabase
          .from("tv_standby_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle(),

        supabase
          .from("tv_media_library")
          .select(
            "id,title,public_url,media_type,duration_seconds,featured,active,sort_order",
          )
          .eq("active", true)
          .order("featured", { ascending: false })
          .order("sort_order", { ascending: true })
          .limit(30),

        supabase
          .from("public_reviews")
          .select("*")
          .limit(20),

        supabase
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle(),

        supabase
          .from("pos_preparation_queue")
          .select("id,queue_no,customer_name,status,items,total,paid_at")
          .gte("paid_at", today.toISOString())
          .order("paid_at", { ascending: false })
          .limit(200),

        supabase
          .from("orders")
          .select("id,order_number,customer_name,queue_no,status")
          .in("status", ["pending", "accepted", "preparing", "ready"])
          .order("created_at", { ascending: true })
          .limit(6),

        supabase
          .from("tv_priority_events")
          .select("*")
          .eq("active", true)
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (!active) return;

      if (
        settingsResult.status === "fulfilled" &&
        !settingsResult.value.error &&
        settingsResult.value.data
      ) {
        setSettings({
          ...defaults,
          ...(settingsResult.value.data as Partial<Settings>),
        });
      }

      if (
        mediaResult.status === "fulfilled" &&
        !mediaResult.value.error
      ) {
        setMedia((mediaResult.value.data ?? []) as MediaRow[]);
      }

      if (
        reviewsResult.status === "fulfilled" &&
        !reviewsResult.value.error
      ) {
        setReviews((reviewsResult.value.data ?? []) as Review[]);
      }

      if (
        storeResult.status === "fulfilled" &&
        !storeResult.value.error &&
        storeResult.value.data
      ) {
        setStore(storeResult.value.data as Store);
      }

      if (
        prepResult.status === "fulfilled" &&
        !prepResult.value.error
      ) {
        setTicketsToday(
          (prepResult.value.data ?? []) as PreparationTicket[],
        );
      }

      if (
        onlineResult.status === "fulfilled" &&
        !onlineResult.value.error
      ) {
        setOnlineQueue(
          (onlineResult.value.data ?? []) as OnlineOrder[],
        );
      }

      if (
        priorityResult.status === "fulfilled" &&
        !priorityResult.value.error
      ) {
        setPriorityEvents(
          (priorityResult.value.data ?? []) as PriorityEvent[],
        );
      }

      setConnectionState("live");
    }

    void load();

    const refresh = window.setInterval(() => void load(), 15000);

    const channel = supabase
      .channel("tv-experience-v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "tv_media_library" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "tv_standby_settings" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "pos_preparation_queue" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "tv_priority_events" }, () => void load())
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(refresh);
      if (priorityTimerRef.current !== null) {
        window.clearTimeout(priorityTimerRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, []);

  const topProducts = useMemo<ProductStat[]>(() => {
    const counts = new Map<string, number>();

    ticketsToday.forEach((ticket) => {
      (ticket.items ?? []).forEach((item) => {
        const name = clean(item.name);
        if (!name) return;
        counts.set(
          name,
          (counts.get(name) || 0) + Math.max(1, Number(item.qty || 1)),
        );
      });
    });

    return Array.from(counts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [ticketsToday]);

  const livePriorityEvents = useMemo(
    () =>
      priorityEvents
        .filter((event) => isEventLive(event, now))
        .filter((event) => !dismissedEventIds.includes(event.id))
        .sort((a, b) => b.priority - a.priority),
    [priorityEvents, now, dismissedEventIds],
  );

  useEffect(() => {
    if (activePriorityEvent) return;
    const next = livePriorityEvents[0];
    if (!next) return;

    setActivePriorityEvent(next);

    if (priorityTimerRef.current !== null) {
      window.clearTimeout(priorityTimerRef.current);
    }

    priorityTimerRef.current = window.setTimeout(() => {
      setDismissedEventIds((current) =>
        current.includes(next.id) ? current : [...current, next.id],
      );
      setActivePriorityEvent(null);
      priorityTimerRef.current = null;
    }, Math.max(7, Number(next.duration_seconds || 12)) * 1000);
  }, [activePriorityEvent, livePriorityEvents]);

  const scenes = useMemo<Scene[]>(() => {
    const result: Scene[] = [
      { id: "welcome", type: "welcome", duration: 13 },
    ];

    if (topProducts.length) {
      result.push({ id: "trending", type: "trending", duration: 14 });
    }

    if (clean(store.announcement) || store.free_delivery) {
      result.push({ id: "promo", type: "promo", duration: 13 });
    }

    media.forEach((item) => {
      result.push({
        id: `media-${item.id}`,
        type: "media",
        media: item,
        duration: Math.max(7, Number(item.duration_seconds || 12)),
      });
    });

    if (settings.show_reviews) {
      result.push({ id: "review", type: "review", duration: 14 });
    }

    if (settings.show_membership) {
      result.push({ id: "membership", type: "membership", duration: 14 });
    }

    if (settings.show_social) {
      result.push({ id: "order", type: "order", duration: 14 });
    }

    result.push({ id: "fact", type: "fact", duration: 13 });

    return result;
  }, [
    media,
    settings.show_membership,
    settings.show_reviews,
    settings.show_social,
    store.announcement,
    store.free_delivery,
    topProducts,
  ]);

  useEffect(() => {
    if (!settings.enabled || !scenes.length || activePriorityEvent) return;

    const scene = scenes[sceneIndex % scenes.length];
    const timer = window.setTimeout(() => {
      setSceneIndex((current) => (current + 1) % scenes.length);
    }, Math.max(7, scene.duration || settings.slide_seconds) * 1000);

    return () => window.clearTimeout(timer);
  }, [
    activePriorityEvent,
    sceneIndex,
    scenes,
    settings.enabled,
    settings.slide_seconds,
  ]);

  useEffect(() => {
    setSceneIndex((current) =>
      scenes.length ? current % scenes.length : 0,
    );
  }, [scenes.length]);

  const scene = scenes[sceneIndex % Math.max(1, scenes.length)] ?? {
    id: "welcome",
    type: "welcome",
    duration: 13,
  };

  const review: Review = reviews.length
    ? reviews[sceneIndex % reviews.length]
    : {
        id: "fallback-review",
        customer_name: "Verified KaSYP",
        rating: 5,
        comment: "Good coffee, good vibes, and worth coming back for.",
        review: null,
        name: null,
      };

  const fact = facts[sceneIndex % facts.length];

  const memberUrl =
    mounted && typeof window !== "undefined"
      ? `${window.location.origin}/member-register?source=tv-experience`
      : "";

  const orderUrl =
    mounted && typeof window !== "undefined"
      ? `${window.location.origin}/menu`
      : "";

  const storeStatus =
    clean(store.store_status).toLowerCase() === "closed"
      ? "CLOSED"
      : clean(store.store_status).toLowerCase() === "busy"
        ? "BUSY • SHORT WAIT"
        : "OPEN NOW";

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }

  function renderPriorityEvent(event: PriorityEvent) {
    const type = event.event_type;

    if (type === "birthday") {
      return (
        <section className="tvx-priority tvx-birthday">
          <div className="tvx-confetti" aria-hidden="true">
            {Array.from({ length: 28 }, (_, index) => (
              <i key={index} style={{ "--i": index } as React.CSSProperties} />
            ))}
          </div>

          <div className="tvx-priority-card">
            <span>🎂 HAPPY BIRTHDAY</span>
            <h2>{event.person_name || event.title || "KaSYP!"}</h2>
            <p>{event.body || "Wishing you more coffee, good vibes, and great moments."}</p>
            <b>{event.reward || "ENJOY YOUR SPECIAL TREAT"}</b>
          </div>
        </section>
      );
    }

    if (type === "spin_winner") {
      return (
        <section className="tvx-priority tvx-winner">
          <div className="tvx-priority-card">
            <span>🎉 SPIN WINNER</span>
            <h2>{event.person_name || event.title || "Congratulations!"}</h2>
            <p>{event.body || "You just won a SYP ON CAFÉ reward."}</p>
            <b>{event.reward || "CLAIM YOUR PRIZE"}</b>
          </div>
        </section>
      );
    }

    if (type === "lucky_queue") {
      return (
        <section className="tvx-priority tvx-lucky">
          <div className="tvx-priority-card">
            <span>⭐ LUCKY QUEUE</span>
            <h2>{event.person_name || event.title || "A-000"}</h2>
            <p>{event.body || "Tonight's lucky queue has been selected."}</p>
            <b>{event.reward || "FREE SURPRISE REWARD"}</b>
          </div>
        </section>
      );
    }

    if (type === "new_menu") {
      return (
        <section className="tvx-priority tvx-new-menu">
          <div className="tvx-priority-copy">
            <span>✨ NEW MENU SPOTLIGHT</span>
            <h2>{event.title || "Something new is brewing."}</h2>
            <p>{event.body || event.subtitle || "Try the newest SYP ON CAFÉ creation tonight."}</p>
            <b>{event.reward || "AVAILABLE NOW"}</b>
          </div>

          {event.image_url ? (
            <div className="tvx-priority-product">
              <img src={event.image_url} alt={event.title} />
            </div>
          ) : (
            <div className="tvx-priority-product fallback">☕</div>
          )}
        </section>
      );
    }

    return (
      <section className="tvx-priority tvx-announcement">
        <div className="tvx-priority-card">
          <span>{event.subtitle || "SYP ON CAFÉ"}</span>
          <h2>{event.title}</h2>
          <p>{event.body}</p>
          {event.reward && <b>{event.reward}</b>}
        </div>
      </section>
    );
  }

  function renderScene() {
    if (scene.type === "media") {
      const item = scene.media;

      return (
        <section className="tvx-scene tvx-media-scene">
          <div className="tvx-media-frame">
            {item.media_type === "video" ? (
              <video
                key={item.id}
                src={item.public_url}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img key={item.id} src={item.public_url} alt={item.title} />
            )}
            <div className="tvx-media-shade" />
          </div>

          <div className="tvx-scene-copy">
            <span>{item.featured ? "FEATURED" : "SYP MOMENTS"}</span>
            <h2>{item.title || "Made for your moment."}</h2>
            <p>Fresh coffee, late-night vibes, and moments worth sharing.</p>
            <b>{item.featured ? "FEATURED TONIGHT" : "SYP ON CAFÉ"}</b>
          </div>
        </section>
      );
    }

    if (scene.type === "trending") {
      return (
        <section className="tvx-scene tvx-trending">
          <div className="tvx-scene-copy">
            <span>🔥 TRENDING TODAY</span>
            <h2>{topProducts[0]?.name || "Spanish Latte"}</h2>
            <p>One of tonight&apos;s most ordered drinks at SYP ON CAFÉ.</p>
            <b>{topProducts[0]?.qty || 0} cups today</b>
          </div>

          <div className="tvx-ranking">
            {topProducts.slice(0, 5).map((product, index) => (
              <article key={product.name}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <div>
                  <b>{product.name}</b>
                  <span>{product.qty} ordered</span>
                </div>
                <i
                  style={{
                    width: `${(product.qty / Math.max(1, topProducts[0]?.qty || 1)) * 100}%`,
                  }}
                />
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (scene.type === "review") {
      return (
        <section className="tvx-scene tvx-review">
          <div className="tvx-stars">
            {"★".repeat(Math.max(1, Math.min(5, Number(review.rating || 5))))}
          </div>
          <span>REAL CUSTOMER REVIEW</span>
          <blockquote>
            “{clean(review.comment || review.review) || "Good coffee, good vibes, and worth coming back for."}”
          </blockquote>
          <b>— {clean(review.customer_name || review.name) || "Verified KaSYP"}</b>
        </section>
      );
    }

    if (scene.type === "membership") {
      return (
        <section className="tvx-scene tvx-qr-scene">
          <div className="tvx-scene-copy">
            <span>KASYP DIGITAL MEMBERSHIP</span>
            <h2>Scan. Earn. Enjoy.</h2>
            <p>Collect stamps, unlock rewards, birthday treats, and selected Lucky Spin events.</p>
            <b>JOIN FREE</b>
          </div>

          {memberUrl ? (
            <div className="tvx-qr-card">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=5&format=png&data=${encodeURIComponent(memberUrl)}`}
                alt="KaSYP membership QR"
              />
              <strong>SCAN TO JOIN</strong>
            </div>
          ) : (
            <div className="tvx-qr-fallback">SYP</div>
          )}
        </section>
      );
    }

    if (scene.type === "order") {
      return (
        <section className="tvx-scene tvx-qr-scene">
          <div className="tvx-scene-copy">
            <span>ORDER ONLINE</span>
            <h2>One scan. Your next coffee.</h2>
            <p>Browse the menu and place your order from your phone.</p>
            <b>syponcafe.shop</b>
          </div>

          {orderUrl ? (
            <div className="tvx-qr-card">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=5&format=png&data=${encodeURIComponent(orderUrl)}`}
                alt="Order online QR"
              />
              <strong>SCAN TO ORDER</strong>
            </div>
          ) : (
            <div className="tvx-qr-fallback">SYP</div>
          )}
        </section>
      );
    }

    if (scene.type === "promo") {
      return (
        <section className="tvx-scene tvx-promo">
          <div className="tvx-promo-icon">
            {store.free_delivery ? "🛵" : "☕"}
          </div>
          <div className="tvx-scene-copy">
            <span>TONIGHT AT SYP</span>
            <h2>
              {store.free_delivery
                ? "Free delivery is active."
                : clean(store.announcement) || "Coffee made for your moment."}
            </h2>
            <p>
              {store.free_delivery
                ? "Order your favorite drinks and enjoy them wherever you are."
                : settings.footer_message}
            </p>
            <b>{store.free_delivery ? "ORDER NOW" : "SYP ON CAFÉ"}</b>
          </div>
        </section>
      );
    }

    if (scene.type === "fact") {
      return (
        <section className="tvx-scene tvx-fact">
          <div className="tvx-fact-bean">☕</div>
          <span>DID YOU KNOW?</span>
          <h2>{fact}</h2>
          <p>Good coffee tastes even better when you know the story.</p>
        </section>
      );
    }

    return (
      <section className="tvx-scene tvx-welcome">
        <div className="tvx-scene-copy">
          <span>{greeting(now.getHours())}</span>
          <h2>Welcome to SYP ON CAFÉ.</h2>
          <p>Street • Iced • Brewed</p>
          <b>OPEN DAILY • 5PM–4AM</b>
        </div>

        <div className="tvx-logo-stage">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ" />
          <div className="tvx-steam">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>
    );
  }

  if (!settings.enabled) {
    return (
      <main className="tvx-screen">
        <div className="tvx-disabled">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ" />
          <h1>SYP ON CAFÉ</h1>
          <p>TV standby is currently disabled.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="tvx-screen">
      <div className="tvx-background" aria-hidden="true">
        <video
          src="/videos/syp-cafe-background.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/syp-logo-glow-v2.webp"
        />
        <div className="tvx-bg-shade" />
        <div className="tvx-aurora" />
      </div>

      <div className="tvx-particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <i key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
      </div>

      {activePriorityEvent && renderPriorityEvent(activePriorityEvent)}

      <header className="tvx-header">
        <div className="tvx-brand">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ" />
          <div>
            <h1>SYP ON CAFÉ</h1>
            <p>Street · Iced · Brewed</p>
          </div>
        </div>

        <div className="tvx-header-right">
          {settings.show_store_status && (
            <span className="tvx-store-status">
              <i />
              {storeStatus}
            </span>
          )}

          <span className={`tvx-sync ${connectionState}`}>
            <i />
            {connectionState === "live" ? "LIVE" : "SYNCING"}
          </span>

          <button type="button" onClick={() => void toggleFullscreen()} className="tvx-fullscreen">
            {fullscreen ? "⤢ Exit" : "⛶ Fullscreen"}
          </button>

          <time>
            <b>
              {now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </b>
            <small>
              {now.toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </small>
          </time>
        </div>
      </header>

      <section className="tvx-layout">
        <article className="tvx-main">
          <div key={scene.id} className="tvx-scene-shell">
            {renderScene()}
          </div>

          <div className="tvx-scene-dots">
            {scenes.map((item, index) => (
              <i
                key={item.id}
                className={index === sceneIndex % scenes.length ? "active" : ""}
              />
            ))}
          </div>
        </article>

        <aside className="tvx-side">
          <section className="tvx-side-card">
            <header>
              <span>LIVE QUEUE</span>
              <b>● LIVE</b>
            </header>

            <div className="tvx-queue">
              {onlineQueue.length ? (
                onlineQueue.slice(0, 5).map((order) => (
                  <article key={order.id}>
                    <strong>
                      {normalizeQueue(clean(order.queue_no) || clean(order.order_number))}
                    </strong>
                    <div>
                      <b>{order.customer_name || "KaSYP"}</b>
                      <span>{order.status}</span>
                    </div>
                    <i className={clean(order.status).toLowerCase() === "ready" ? "ready" : ""}>
                      {clean(order.status).toLowerCase() === "ready" ? "READY" : "IN PROGRESS"}
                    </i>
                  </article>
                ))
              ) : (
                <div className="tvx-empty">
                  <strong>NO ACTIVE QUEUE</strong>
                  <span>New orders will appear here.</span>
                </div>
              )}
            </div>
          </section>

          <section className="tvx-side-card tvx-now-card">
            <span>TONIGHT</span>
            <h3>{topProducts[0]?.name || "Good coffee. Good moments."}</h3>
            <p>{topProducts.length ? `${topProducts[0].qty} orders today` : "Freshly made for every KaSYP."}</p>
          </section>

          <section className="tvx-side-card tvx-community-card">
            <span>EVENT ENGINE</span>
            <h3>{livePriorityEvents.length} priority event{livePriorityEvents.length === 1 ? "" : "s"}</h3>
            <p>Birthday, winner, new menu, and announcement scenes can interrupt the normal rotation.</p>
          </section>
        </aside>
      </section>

      <footer className="tvx-footer">
        <div>
          <span>
            {clean(store.announcement) ||
              settings.footer_message ||
              "Good coffee. Good moments. Made for you."}
          </span>
          <b>
            {store.free_delivery
              ? "FREE DELIVERY ACTIVE"
              : store.closing_time
                ? `OPEN UNTIL ${store.closing_time}`
                : "OPEN DAILY • 5PM–4AM"}
          </b>
        </div>

        <div className="tvx-footer-center">
          <i />
          <span>PRIORITY SCENE ENGINE</span>
          <b>TV EXPERIENCE V2</b>
        </div>

        <div className="tvx-footer-right">
          <span>ORDER ONLINE</span>
          <b>syponcafe.shop</b>
        </div>
      </footer>
    </main>
  );
}