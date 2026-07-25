"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "../site.css";

type ReviewRow = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  product_name: string | null;
  created_at: string;
  is_approved: boolean;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("customer_reviews")
        .select("id, customer_name, rating, comment, product_name, created_at, is_approved")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (active) {
        setReviews((data ?? []) as ReviewRow[]);
        setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const average = useMemo(() => {
    if (!reviews.length) return "—";
    return (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <main className="site-shell subpage-shell">
      <header className="site-nav">
        <Link className="site-brand" href="/"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" /><div><b>SYP ON CAFÉ</b><small>RATINGS & REVIEWS</small></div></Link>
        <nav><Link href="/menu">Menu</Link><Link href="/moments">Coffee Moments</Link><Link href="/member-login">Rewards</Link></nav>
        <Link className="site-order" href="/menu">Order Now</Link>
      </header>

      <section className="subpage-hero">
        <small>VERIFIED CUSTOMER FEEDBACK</small>
        <h1>Real orders. Real ratings.</h1>
        <p>Demo reviews have been removed. Only approved ratings connected to completed SYP ON CAFÉ orders appear here.</p>
        <div className="review-summary"><div><b>{average}</b><span>Average rating</span></div><div><b>{reviews.length}</b><span>Verified reviews</span></div></div>
      </section>

      <section className="site-section">
        {loading ? <p className="empty-state">Loading real customer reviews…</p> : reviews.length ? (
          <div className="real-review-grid">{reviews.map((review) => <article key={review.id}>
            <header><span>{review.customer_name.slice(0, 1).toUpperCase()}</span><div><b>{review.customer_name}</b><small>Verified completed order</small></div><em>{"★".repeat(Math.max(1, Math.min(5, review.rating)))}</em></header>
            <p>“{review.comment}”</p>
            <footer>{review.product_name ? <>Ordered: <b>{review.product_name}</b></> : "SYP ON CAFÉ customer"}<time>{new Date(review.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</time></footer>
          </article>)}</div>
        ) : (
          <div className="empty-review-panel"><img src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ logo" /><small>REVIEWS START HERE</small><h2>No published ratings yet.</h2><p>After a completed order, customers can submit a verified rating. The first approved rating will automatically appear here.</p><Link className="gold-button" href="/menu">Place an Order</Link></div>
        )}
      </section>
    </main>
  );
}
