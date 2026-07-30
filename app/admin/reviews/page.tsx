"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "../../components/ProtectedRoute";

type ReviewRow = {
  id: string;
  order_id: number | null;
  order_number: string | null;
  customer_name: string;
  customer_location: string | null;
  rating: number;
  comment: string;
  product_name: string | null;
  is_verified_purchase: boolean;
  device_id: string | null;
  user_agent: string | null;
  suspicious_reason: string | null;
  created_at: string;
};

function renderStars(score: number) {
  const safe = Math.max(1, Math.min(5, Math.round(Number(score || 0))));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "suspicious" | "low">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setErrorMessage("");

    const { data, error } = await supabase
      .from("customer_reviews")
      .select("id, order_id, order_number, customer_name, customer_location, rating, comment, product_name, is_verified_purchase, device_id, user_agent, suspicious_reason, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load admin reviews:", error);
      setErrorMessage(error.message);
    } else {
      setReviews((data ?? []) as ReviewRow[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadReviews();

    const channel = supabase
      .channel("admin-review-manager")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_reviews" },
        () => void loadReviews(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesQuery =
        !query ||
        review.customer_name.toLowerCase().includes(query) ||
        review.customer_location?.toLowerCase().includes(query) ||
        review.order_number?.toLowerCase().includes(query) ||
        review.product_name?.toLowerCase().includes(query) ||
        review.device_id?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "verified" && review.is_verified_purchase) ||
        (filter === "suspicious" && Boolean(review.suspicious_reason)) ||
        (filter === "low" && review.rating <= 2);

      return matchesQuery && matchesFilter;
    });
  }, [reviews, search, filter]);

  const average = useMemo(() => {
    if (!reviews.length) return "—";
    return (
      reviews.reduce((total, review) => total + Number(review.rating), 0) /
      reviews.length
    ).toFixed(1);
  }, [reviews]);

  async function deleteReview(review: ReviewRow) {
    const confirmed = window.confirm(
      `Delete ${review.customer_name}'s ${review.rating}-star rating?`,
    );
    if (!confirmed) return;

    setDeletingId(review.id);
    setErrorMessage("");

    const { error } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", review.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setReviews((current) =>
        current.filter((item) => item.id !== review.id),
      );
    }

    setDeletingId(null);
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#080808] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-black">SYP ON CAFÉ ADMIN</p>
              <p className="text-xs text-neutral-500">
                Ratings & Review Monitoring
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-bold"
              >
                ← Orders
              </Link>
              <Link
                href="/reviews"
                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-black"
              >
                Public Reviews
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Average Rating" value={average} />
            <SummaryCard label="Total Ratings" value={String(reviews.length)} />
            <SummaryCard
              label="Verified Purchases"
              value={String(reviews.filter((item) => item.is_verified_purchase).length)}
            />
            <SummaryCard
              label="Suspicious Alerts"
              value={String(reviews.filter((item) => item.suspicious_reason).length)}
              alert
            />
          </section>

          <section className="mt-6 rounded-[2rem] border border-white/10 bg-neutral-950 p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, location, order, product, or device ID"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-amber-400/50"
              />

              <div className="flex flex-wrap gap-2">
                {(["all", "verified", "suspicious", "low"] as const).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`rounded-full px-4 py-2 text-sm font-black ${
                        filter === item
                          ? "bg-amber-400 text-black"
                          : "border border-white/10 text-neutral-400"
                      }`}
                    >
                      {item === "all"
                        ? "All"
                        : item === "verified"
                          ? "Verified"
                          : item === "suspicious"
                            ? "Suspicious"
                            : "1–2 Stars"}
                    </button>
                  ),
                )}
              </div>
            </div>
          </section>

          {errorMessage && (
            <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {errorMessage}
            </p>
          )}

          <section className="mt-6">
            {loading ? (
              <p className="rounded-3xl border border-white/10 bg-neutral-950 p-8 text-center text-neutral-500">
                Loading ratings…
              </p>
            ) : filteredReviews.length ? (
              <div className="grid gap-4">
                {filteredReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[2rem] border border-white/10 bg-neutral-950 p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-black">
                            {review.customer_name}
                          </h2>

                          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-sm font-black text-amber-300">
                            {renderStars(review.rating)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                              review.is_verified_purchase
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-white/5 text-neutral-400"
                            }`}
                          >
                            {review.is_verified_purchase
                              ? "✓ Verified Purchase"
                              : "Public Rating"}
                          </span>

                          {review.suspicious_reason && (
                            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black uppercase text-red-300">
                              ⚠ Suspicious
                            </span>
                          )}
                        </div>

                        <p className="mt-3 leading-7 text-neutral-300">
                          {review.comment || "No written review."}
                        </p>

                        <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2 xl:grid-cols-4">
                          <p>
                            <b className="text-neutral-300">Location:</b>{" "}
                            {review.customer_location || "Not provided"}
                          </p>
                          <p>
                            <b className="text-neutral-300">Order:</b>{" "}
                            {review.order_number || "Not linked"}
                          </p>
                          <p>
                            <b className="text-neutral-300">Product:</b>{" "}
                            {review.product_name || "Not specified"}
                          </p>
                          <p>
                            <b className="text-neutral-300">Submitted:</b>{" "}
                            {formatDate(review.created_at)}
                          </p>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-neutral-500">
                          <p>
                            <b className="text-neutral-300">Browser ID:</b>{" "}
                            {review.device_id || "Unavailable"}
                          </p>
                          <p className="break-all">
                            <b className="text-neutral-300">Device/Browser:</b>{" "}
                            {review.user_agent || "Unavailable"}
                          </p>
                          {review.suspicious_reason && (
                            <p className="mt-2 text-red-300">
                              <b>Warning:</b> {review.suspicious_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-start">
                        <button
                          type="button"
                          onClick={() => void deleteReview(review)}
                          disabled={deletingId === review.id}
                          className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 font-black text-red-300 disabled:opacity-50"
                        >
                          {deletingId === review.id
                            ? "Deleting..."
                            : "Delete Rating"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-3xl border border-white/10 bg-neutral-950 p-8 text-center text-neutral-500">
                No ratings match this filter.
              </p>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function SummaryCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <article
      className={`rounded-3xl border p-5 ${
        alert
          ? "border-red-500/20 bg-red-500/[0.06]"
          : "border-white/10 bg-neutral-950"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-wider ${
          alert ? "text-red-300" : "text-neutral-500"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}