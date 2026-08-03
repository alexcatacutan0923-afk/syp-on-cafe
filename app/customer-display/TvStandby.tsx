"use client";

import { useEffect, useMemo, useState } from "react";
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

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  badge: string;
  image_url: string;
  video_url: string;
  duration_seconds: number;
  active: boolean;
  sort_order: number;
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

type QueueOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  queue_no?: string | null;
  status: string;
};

type Review = {
  id: number | string;
  customer_name?: string | null;
  name?: string | null;
  rating?: number | null;
  comment?: string | null;
  review?: string | null;
};

type Store = {
  store_status?: string;
  announcement?: string;
  closing_time?: string;
  free_delivery?: boolean;
};

const defaults: Settings = {
  enabled: true,
  slide_seconds: 10,
  show_queue: true,
  show_reviews: true,
  show_membership: true,
  show_store_status: true,
  show_social: true,
  footer_message: "Perfect weather for coffee.",
};

const fallback: Slide[] = [
  {
    id: "welcome",
    title: "Good coffee. Good moments.",
    subtitle: "WELCOME TO SYP ON CAFÉ",
    body: "Street • Iced • Brewed",
    badge: "OPEN DAILY • 5PM–4AM",
    image_url: "",
    video_url: "/videos/syp-cafe-background.mp4",
    duration_seconds: 12,
    active: true,
    sort_order: 1,
  },
  {
    id: "best",
    title: "Tonight's favorites",
    subtitle: "BEST SELLERS",
    body: "Spanish Latte • Biscoff Matcha • SYP White Rush • Milo Dino",
    badge: "MADE FRESH FOR EVERY ORDER",
    image_url: "/brand/syp-logo-glow-v2.webp",
    video_url: "",
    duration_seconds: 11,
    active: true,
    sort_order: 2,
  },
  {
    id: "member",
    title: "Every sip gets you closer.",
    subtitle: "KASYP DIGITAL MEMBERSHIP",
    body:
      "Earn stamps, unlock rewards, birthday treats, and selected Lucky Spin events.",
    badge: "SCAN TO JOIN FREE",
    image_url: "",
    video_url: "",
    duration_seconds: 12,
    active: true,
    sort_order: 3,
  },
  {
    id: "late",
    title: "Your late-night coffee stop.",
    subtitle: "OPEN UNTIL 4AM",
    body:
      "Tambay, board games, Wi‑Fi, Netflix, YouTube, and freshly made drinks.",
    badge: "APOLLO, ORANI, BATAAN",
    image_url: "",
    video_url: "/videos/syp-cafe-background.mp4",
    duration_seconds: 12,
    active: true,
    sort_order: 4,
  },
  {
    id: "local",
    title: "Thank you for supporting local.",
    subtitle: "MADE IN ORANI",
    body:
      "Every order helps our small café grow, improve, and serve more KaSYP moments.",
    badge: "SYP ON CAFÉ",
    image_url: "/brand/syp-logo-glow-v2.webp",
    video_url: "",
    duration_seconds: 10,
    active: true,
    sort_order: 5,
  },
];

const clean = (value: unknown) => String(value ?? "").trim();

export default function TvStandby({ now }: Props) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [slides, setSlides] = useState<Slide[]>(fallback);
  const [index, setIndex] = useState(0);
  const [queue, setQueue] = useState<QueueOrder[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [store, setStore] = useState<Store>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      const [
        settingsResult,
        mediaResult,
        queueResult,
        reviewsResult,
        storeResult,
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
          .order("sort_order", { ascending: true }),

        supabase
          .from("orders")
          .select("id,order_number,customer_name,queue_no,status")
          .in("status", ["pending", "accepted", "preparing", "ready"])
          .order("created_at", { ascending: true })
          .limit(6),

        supabase.from("public_reviews").select("*").limit(12),

        supabase
          .from("store_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle(),
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
        !mediaResult.value.error &&
        Array.isArray(mediaResult.value.data)
      ) {
        const rows = mediaResult.value.data as MediaRow[];

        const mediaSlides: Slide[] = rows.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.featured ? "FEATURED" : "SYP ON CAFÉ",
          body: "",
          badge: item.featured ? "FEATURED MEDIA" : "",
          image_url:
            item.media_type === "image" ? item.public_url : "",
          video_url:
            item.media_type === "video" ? item.public_url : "",
          duration_seconds: Math.max(
            5,
            Number(item.duration_seconds || 10),
          ),
          active: Boolean(item.active),
          sort_order: Number(item.sort_order || 1),
        }));

        setSlides(mediaSlides.length > 0 ? mediaSlides : fallback);
        setIndex((current) =>
          mediaSlides.length > 0
            ? current % mediaSlides.length
            : current % fallback.length,
        );
      }

      if (
        queueResult.status === "fulfilled" &&
        !queueResult.value.error
      ) {
        setQueue((queueResult.value.data ?? []) as QueueOrder[]);
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
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 15000);

    const channel = supabase
      .channel("tv-standby")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tv_standby_settings",
        },
        () => void load(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tv_media_library",
        },
        () => void load(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => void load(),
      )
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, []);

  const slide =
    slides[index % Math.max(1, slides.length)] ?? fallback[0];

  useEffect(() => {
    if (!settings.enabled || !slide) return;

    const timer = window.setTimeout(() => {
      setIndex(
        (current) =>
          (current + 1) % Math.max(1, slides.length),
      );
    }, Math.max(5, Number(slide.duration_seconds || settings.slide_seconds)) * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    slide,
    slides.length,
    settings.enabled,
    settings.slide_seconds,
  ]);

  const review = useMemo<Review>(
    () =>
      reviews.length > 0
        ? reviews[index % reviews.length]
        : {
            id: "fallback-review",
            customer_name: "Verified KaSYP",
            rating: 5,
            comment:
              "Good coffee, good vibes, and worth coming back for.",
          },
    [reviews, index],
  );

  const memberUrl =
    mounted && typeof window !== "undefined"
      ? `${window.location.origin}/member-register?source=tv-standby`
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
        : clean(store.store_status).toLowerCase() ===
            "temporarily_closed"
          ? "TEMPORARILY CLOSED"
          : "OPEN NOW";

  return (
    <main className="tv-standby">
      <header className="tv-header">
        <div className="tv-brand">
          <img
            src="/brand/syp-logo-glow-v2.webp"
            alt="SYP ON CAFÉ"
          />

          <div>
            <h1>SYP ON CAFÉ</h1>
            <p>Street · Iced · Brewed</p>
          </div>
        </div>

        <div className="tv-header-right">
          {settings.show_store_status && (
            <span className="tv-status">
              <i />
              {storeStatus}
            </span>
          )}

          <div className="tv-clock">
            <b>
              {now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </b>

            <span>
              {now.toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      <section className="tv-layout">
        <div className="tv-hero">
          {slide.video_url ? (
            <video
              key={slide.id}
              src={slide.video_url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : slide.image_url ? (
            <img
              key={slide.id}
              src={slide.image_url}
              alt={slide.title}
            />
          ) : (
            <div className="tv-gradient" />
          )}

          <div className="tv-overlay" />

          <div className="tv-copy">
            <span>{slide.subtitle}</span>
            <h2>{slide.title}</h2>

            {slide.body && <p>{slide.body}</p>}
            {slide.badge && <b>{slide.badge}</b>}
          </div>

          <div className="tv-dots">
            {slides.map((item, slideIndex) => (
              <i
                key={item.id}
                className={
                  slideIndex === index % Math.max(1, slides.length)
                    ? "active"
                    : ""
                }
              />
            ))}
          </div>
        </div>

        <aside className="tv-rail">
          {settings.show_queue && (
            <section className="tv-card">
              <div className="tv-card-head">
                <span>LIVE QUEUE</span>
                <b>● LIVE</b>
              </div>

              <div className="tv-queue">
                {queue.length > 0 ? (
                  queue.slice(0, 5).map((order) => (
                    <article key={order.id}>
                      <strong>
                        {order.queue_no ||
                          order.order_number
                            .split("-")
                            .slice(-1)[0]}
                      </strong>

                      <div>
                        <b>{order.customer_name || "KaSYP"}</b>
                        <span>{order.status}</span>
                      </div>

                      <i
                        className={
                          order.status === "ready" ? "ready" : ""
                        }
                      >
                        {order.status === "ready"
                          ? "READY"
                          : "IN PROGRESS"}
                      </i>
                    </article>
                  ))
                ) : (
                  <div className="tv-empty">
                    <strong>NO ACTIVE QUEUE</strong>
                    <span>Your order will appear here.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {settings.show_reviews && (
            <section className="tv-card tv-review">
              <div className="tv-card-head">
                <span>REAL CUSTOMER REVIEW</span>

                <b>
                  {"★".repeat(
                    Math.max(
                      1,
                      Math.min(5, Number(review.rating || 5)),
                    ),
                  )}
                </b>
              </div>

              <blockquote>
                “
                {clean(review.comment || review.review) ||
                  "Good coffee, good vibes, and worth coming back for."}
                ”
              </blockquote>

              <small>
                —{" "}
                {clean(review.customer_name || review.name) ||
                  "Verified KaSYP"}
              </small>
            </section>
          )}

          {settings.show_membership && (
            <section className="tv-card tv-membership">
              <div>
                <span>KASYP MEMBERSHIP</span>
                <h3>Scan. Earn. Enjoy.</h3>
                <p>
                  Collect stamps, unlock rewards, and keep every
                  café visit in one place.
                </p>
              </div>

              {mounted && memberUrl ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=5&format=png&data=${encodeURIComponent(
                    memberUrl,
                  )}`}
                  alt="Membership QR"
                />
              ) : (
                <div className="tv-qr-placeholder">
                  <span>SYP</span>
                </div>
              )}
            </section>
          )}
        </aside>

        <footer className="tv-footer">
          <div>
            <span>
              {store.announcement ||
                settings.footer_message ||
                "Perfect weather for coffee."}
            </span>

            <b>
              {store.free_delivery
                ? "FREE DELIVERY ACTIVE"
                : store.closing_time
                  ? `OPEN UNTIL ${store.closing_time}`
                  : "OPEN DAILY • 5PM–4AM"}
            </b>
          </div>

          {settings.show_social && (
            <div className="tv-order">
              <span>ORDER ONLINE</span>
              <b>syponcafe.shop</b>

              {mounted && orderUrl ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=4&format=png&data=${encodeURIComponent(
                    orderUrl,
                  )}`}
                  alt="Order QR"
                />
              ) : (
                <div className="tv-qr-placeholder small">
                  <span>SYP</span>
                </div>
              )}
            </div>
          )}
        </footer>
      </section>
    </main>
  );
}