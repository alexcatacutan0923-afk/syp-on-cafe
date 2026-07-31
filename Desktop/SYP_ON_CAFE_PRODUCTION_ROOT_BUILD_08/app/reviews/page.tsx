"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "../site.css";

type ReviewRow = {
  id: string;
  customer_name: string;
  customer_location: string | null;
  rating: number;
  comment: string;
  product_name: string | null;
  created_at: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  order_number: string | null;
};

function renderStars(rating: number) {
  const safe = Math.max(1, Math.min(5, Math.round(Number(rating || 0))));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setErrorMessage("");

      const { data, error } = await supabase
        .from("customer_reviews")
        .select("id, customer_name, customer_location, rating, comment, product_name, created_at, is_approved, is_verified_purchase, order_number")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Unable to load reviews:", error);
        setErrorMessage(error.message);
        setReviews([]);
      } else {
        setReviews((data ?? []) as ReviewRow[]);
      }

      setLoading(false);
    };

    void load();

    const channel = supabase
      .channel("public-customer-reviews")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_reviews" },
        () => void load(),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const average = useMemo(() => {
    if (!reviews.length) return "—";
    return (
      reviews.reduce((sum, item) => sum + Number(item.rating), 0) /
      reviews.length
    ).toFixed(1);
  }, [reviews]);

  const verifiedCount = useMemo(
    () => reviews.filter((review) => review.is_verified_purchase).length,
    [reviews],
  );

  return (
    <main className="site-shell subpage-shell">
      <header className="site-nav">
        <Link className="site-brand" href="/">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" />
          <div>
            <b>SYP ON CAFÉ</b>
            <small>RATINGS & REVIEWS</small>
          </div>
        </Link>

        <nav>
          <Link href="/menu">Menu</Link>
          <Link href="/moments">Coffee Moments</Link>
          <Link href="/member-login">Rewards</Link>
        </nav>

        <Link className="site-order" href="/menu">
          Order Now
        </Link>
      </header>

      <section className="subpage-hero">
        <small>PUBLIC CUSTOMER FEEDBACK</small>
        <h1>Real ratings from the KaSYP community.</h1>
        <p>
          Ratings appear immediately. Reviews connected to completed online
          orders receive the Verified Purchase badge.
        </p>

        <div className="review-summary">
          <div>
            <b>{average}</b>
            <span>Average rating</span>
          </div>
          <div>
            <b>{reviews.length}</b>
            <span>Total public ratings</span>
          </div>
          <div>
            <b>{verifiedCount}</b>
            <span>Verified purchases</span>
          </div>
        </div>
      </section>

      <section className="site-section">
        {loading ? (
          <p className="empty-state">Loading customer reviews…</p>
        ) : errorMessage ? (
          <div className="empty-review-panel">
            <small>REVIEWS TEMPORARILY UNAVAILABLE</small>
            <h2>Unable to load ratings.</h2>
            <p>{errorMessage}</p>
          </div>
        ) : reviews.length ? (
          <div className="real-review-grid">
            {reviews.map((review) => (
              <article key={review.id}>
                <header>
                  <span>
                    {review.customer_name.slice(0, 1).toUpperCase()}
                  </span>

                  <div>
                    <b>{review.customer_name}</b>
                    <small>
                      {review.is_verified_purchase
                        ? "✓ Verified Purchase"
                        : "Public Rating"}
                      {review.customer_location
                        ? ` • ${review.customer_location}`
                        : ""}
                    </small>
                  </div>

                  <em aria-label={`${review.rating} out of 5 stars`}>
                    {renderStars(review.rating)}
                  </em>
                </header>

                <p>
                  {review.comment.trim()
                    ? `“${review.comment}”`
                    : "Rated this SYP ON CAFÉ experience."}
                </p>

                <footer>
                  {review.product_name ? (
                    <>
                      Ordered: <b>{review.product_name}</b>
                    </>
                  ) : (
                    "SYP ON CAFÉ customer"
                  )}

                  <time>
                    {new Date(review.created_at).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "Asia/Manila",
                    })}
                  </time>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-review-panel">
            <img
              src="/brand/syp-logo-clean-v2.webp"
              alt="SYP ON CAFÉ logo"
            />
            <small>REVIEWS START HERE</small>
            <h2>No public ratings yet.</h2>
            <p>
              Customers can leave a rating after a completed order. The first
              rating will automatically appear here.
            </p>
            <Link className="gold-button" href="/menu">
              Place an Order
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}