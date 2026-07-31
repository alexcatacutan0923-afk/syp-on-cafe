"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type Review = { id:number; name:string; drink:string; stars:number; review_text:string; order_number:string|null; status:string; created_at:string; owner_reply:string|null };
type Moment = { id:number; name:string; caption:string; tag:string; image_url:string; storage_path:string|null; status:string; created_at:string };

export default function CommunityModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [reviewResult, momentResult] = await Promise.all([
      supabase.from("community_reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("coffee_moments").select("*").order("created_at", { ascending: false }),
    ]);
    if (reviewResult.error || momentResult.error) setMessage("Run BUILD_09_COMMUNITY_SQL.sql in Supabase first.");
    setReviews((reviewResult.data ?? []) as Review[]);
    setMoments((momentResult.data ?? []) as Moment[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function updateReview(id:number, status:string) { await supabase.from("community_reviews").update({ status, badge: status === "approved" ? "Approved customer" : null }).eq("id", id); await load(); }
  async function replyReview(review:Review) { const reply = window.prompt("Owner reply", review.owner_reply ?? ""); if (reply === null) return; await supabase.from("community_reviews").update({ owner_reply: reply.trim() || null }).eq("id", review.id); await load(); }
  async function deleteReview(id:number) { if (!window.confirm("Delete this review permanently?")) return; await supabase.from("community_reviews").delete().eq("id", id); await load(); }
  async function updateMoment(id:number, status:string) { await supabase.from("coffee_moments").update({ status }).eq("id", id); await load(); }
  async function deleteMoment(moment:Moment) { if (!window.confirm("Delete this moment and photo permanently?")) return; if (moment.storage_path) await supabase.storage.from("coffee-moments").remove([moment.storage_path]); await supabase.from("coffee_moments").delete().eq("id", moment.id); await load(); }

  return <ProtectedRoute><main className="min-h-screen bg-[#080808] text-white"><header className="sticky top-0 z-40 border-b border-white/10 bg-black/90"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-bold">COMMUNITY MODERATION</p><p className="text-xs text-neutral-500">Reviews & Coffee Moments</p></div><div className="flex gap-2"><Link href="/admin" className="rounded-full border border-white/15 px-4 py-2 text-sm">Live Orders</Link><Link href="/reviews" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black">Public Reviews</Link></div></div></header><div className="mx-auto max-w-7xl space-y-10 px-5 py-8">{message && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{message}</div>}{loading ? <p className="text-neutral-400">Loading…</p> : <><section><h1 className="text-3xl font-bold">Reviews</h1><p className="mt-1 text-sm text-neutral-500">Approve, reject, reply, or delete.</p><div className="mt-5 grid gap-4 lg:grid-cols-2">{reviews.length === 0 ? <p className="text-neutral-500">No reviews yet.</p> : reviews.map((review) => <article key={review.id} className="rounded-3xl border border-white/10 bg-white/[.03] p-5"><div className="flex justify-between gap-3"><div><b>{review.name}</b><p className="text-xs text-neutral-500">{review.drink} • {review.order_number || "No order number"}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs">{review.status}</span></div><p className="mt-4 text-amber-400">{"★".repeat(review.stars)}{"☆".repeat(5-review.stars)}</p><p className="mt-3 text-neutral-200">{review.review_text}</p>{review.owner_reply && <p className="mt-3 rounded-xl bg-white/5 p-3 text-sm text-neutral-300"><b>Reply:</b> {review.owner_reply}</p>}<div className="mt-5 flex flex-wrap gap-2"><button onClick={() => void updateReview(review.id,"approved")} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black">Approve</button><button onClick={() => void updateReview(review.id,"rejected")} className="rounded-full border border-white/15 px-4 py-2 text-sm">Reject</button><button onClick={() => void replyReview(review)} className="rounded-full border border-amber-400/40 px-4 py-2 text-sm text-amber-300">Owner Reply</button><button onClick={() => void deleteReview(review.id)} className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300">Delete</button></div></article>)}</div></section><section><h2 className="text-3xl font-bold">Coffee Moments</h2><p className="mt-1 text-sm text-neutral-500">Approve only real and appropriate SYP photos.</p><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{moments.length === 0 ? <p className="text-neutral-500">No moments yet.</p> : moments.map((moment) => <article key={moment.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]"><img src={moment.image_url} alt="Submitted coffee moment" className="h-64 w-full object-cover"/><div className="p-5"><div className="flex justify-between gap-3"><div><b>{moment.name}</b><p className="text-xs text-neutral-500">{moment.tag}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs">{moment.status}</span></div><p className="mt-4 text-neutral-200">{moment.caption}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => void updateMoment(moment.id,"approved")} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black">Approve</button><button onClick={() => void updateMoment(moment.id,"rejected")} className="rounded-full border border-white/15 px-4 py-2 text-sm">Reject</button><button onClick={() => void deleteMoment(moment)} className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300">Delete</button></div></div></article>)}</div></section></>}</div></main></ProtectedRoute>;
}
