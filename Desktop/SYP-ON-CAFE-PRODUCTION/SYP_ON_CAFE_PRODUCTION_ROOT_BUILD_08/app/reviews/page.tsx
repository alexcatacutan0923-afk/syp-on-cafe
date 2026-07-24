"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import "../site.css";
import "./reviews.css";

type Review = {
  id: number;
  name: string;
  drink: string;
  stars: number;
  review_text: string;
  badge: string | null;
  created_at: string;
  owner_reply: string | null;
};

const drinks = ["Spanish Latte", "Hot Salted Caramel", "Biscoff Matcha", "SYP Choco Boom", "Milo Dino", "Americano", "Oreo Latte"];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", drink: drinks[0], stars: 5, text: "", orderNumber: "" });

  async function loadReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_reviews")
      .select("id,name,drink,stars,review_text,badge,created_at,owner_reply")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (!error) setReviews((data ?? []) as Review[]);
    setLoading(false);
  }

  useEffect(() => { void loadReviews(); }, []);

  const shown = useMemo(() => filter === "All" ? reviews : reviews.filter((r) => String(r.stars) === filter), [filter, reviews]);
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1) : "0.0";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || form.text.trim().length < 8) {
      setMessage("Please enter your name and a review with at least 8 characters.");
      return;
    }
    if (!isSupabaseConfigured) {
      setMessage("Reviews are temporarily unavailable.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const { error } = await supabase.from("community_reviews").insert({
      name: form.name.trim(),
      drink: form.drink,
      stars: form.stars,
      review_text: form.text.trim(),
      order_number: form.orderNumber.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      setMessage(error.message.includes("community_reviews") ? "Setup required: run the Build 09 Supabase SQL file." : error.message);
      return;
    }
    setForm((current) => ({ ...current, name: "", text: "", orderNumber: "" }));
    setMessage("Thank you! Your review was submitted for admin approval.");
  }

  return <main className="community-page">
    <header className="community-nav"><Link className="site-brand" href="/"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>RATINGS & REVIEWS</small></div></Link><nav><Link href="/">Home</Link><Link href="/menu">Menu</Link><Link href="/moments">Coffee Moments</Link></nav><Link className="gold-button" href="/member-login">Member Login</Link></header>
    <section className="community-hero"><small>REAL SYP EXPERIENCES</small><h1>Reviews from our KaSYP community.</h1><p>Only admin-approved customer reviews appear here.</p><div className="rating-summary"><b>{average}</b><span><em>★★★★★</em><small>{reviews.length} approved reviews</small></span></div></section>
    <section className="community-layout"><div>
      <div className="review-toolbar"><div><h2>Latest reviews</h2><p>Verified orders can receive a badge after admin review.</p></div><select aria-label="Filter reviews" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option></select></div>
      {loading ? <div className="community-empty">Loading reviews…</div> : shown.length === 0 ? <div className="community-empty">No approved reviews yet. Be the first to submit one.</div> : <div className="all-reviews">{shown.map((review) => <article key={review.id}><header><i>{review.name[0]?.toUpperCase()}</i><div><b>{review.name}</b><span>{review.badge || "Customer review"} • {new Date(review.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span></div><em>{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</em></header><p>“{review.review_text}”</p>{review.owner_reply && <div className="owner-reply"><b>SYP ON CAFÉ replied</b><span>{review.owner_reply}</span></div>}<footer>Ordered: <b>{review.drink}</b></footer></article>)}</div>}
    </div><aside className="review-form-card"><small>SHARE YOUR EXPERIENCE</small><h2>Rate your SYP moment</h2><p>Your review will appear after admin approval.</p><form onSubmit={submit}><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" maxLength={60}/></label><label>Order number (optional)<input value={form.orderNumber} onChange={(event) => setForm({ ...form, orderNumber: event.target.value })} placeholder="SYP-…" maxLength={40}/></label><label>Drink<select value={form.drink} onChange={(event) => setForm({ ...form, drink: event.target.value })}>{drinks.map((drink) => <option key={drink}>{drink}</option>)}</select></label><label>Rating<select value={form.stars} onChange={(event) => setForm({ ...form, stars: Number(event.target.value) })}><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></label><label>Review<textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} placeholder="Tell us what you loved…" rows={5} maxLength={500}/></label><button className="gold-button" disabled={submitting}>{submitting ? "Submitting…" : "Submit Review"}</button>{message && <div className="submit-note">{message}</div>}</form></aside></section>
  </main>;
}
