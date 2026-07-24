"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import "../site.css";
import "./moments.css";

type Moment = { id: number; name: string; caption: string; tag: string; image_url: string; likes: number; created_at: string };
const tags = ["All", "Coffee Night", "Hot Collection", "Matcha Moment", "SYP Rewards", "KaSYP Tambay"];
const uploadTags = tags.filter((tag) => tag !== "All");

export default function MomentsPage() {
  const [items, setItems] = useState<Moment[]>([]);
  const [filter, setFilter] = useState("All");
  const [caption, setCaption] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState(uploadTags[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadMoments() {
    setLoading(true);
    const { data, error } = await supabase.from("coffee_moments").select("id,name,caption,tag,image_url,likes,created_at").eq("status", "approved").order("created_at", { ascending: false });
    if (!error) setItems((data ?? []) as Moment[]);
    setLoading(false);
  }
  useEffect(() => { void loadMoments(); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const shown = useMemo(() => filter === "All" ? items : items.filter((item) => item.tag === filter), [filter, items]);

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!selected.type.match(/^image\/(jpeg|png|webp)$/)) { setMessage("Use JPG, PNG, or WEBP only."); return; }
    if (selected.size > 5 * 1024 * 1024) { setMessage("Photo must be 5 MB or smaller."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || caption.trim().length < 5 || !file) { setMessage("Add your name, caption, and a photo."); return; }
    if (!isSupabaseConfigured) { setMessage("Uploads are temporarily unavailable."); return; }
    setSubmitting(true); setMessage("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage.from("coffee-moments").upload(path, file, { cacheControl: "3600", upsert: false });
    if (upload.error) { setSubmitting(false); setMessage(upload.error.message.includes("Bucket") ? "Setup required: create the coffee-moments bucket using the Build 09 SQL instructions." : upload.error.message); return; }
    const { data: publicUrl } = supabase.storage.from("coffee-moments").getPublicUrl(path);
    const insert = await supabase.from("coffee_moments").insert({ name: name.trim(), caption: caption.trim(), tag, image_url: publicUrl.publicUrl, storage_path: path, status: "pending" });
    setSubmitting(false);
    if (insert.error) { await supabase.storage.from("coffee-moments").remove([path]); setMessage(insert.error.message.includes("coffee_moments") ? "Setup required: run the Build 09 Supabase SQL file." : insert.error.message); return; }
    setName(""); setCaption(""); setFile(null); if (preview) URL.revokeObjectURL(preview); setPreview("");
    setMessage("Moment submitted! It will appear after admin approval.");
  }

  async function like(moment: Moment) {
    const nextLikes = moment.likes + 1;
    setItems((current) => current.map((item) => item.id === moment.id ? { ...item, likes: nextLikes } : item));
    const { error } = await supabase.from("coffee_moments").update({ likes: nextLikes }).eq("id", moment.id);
    if (error) setItems((current) => current.map((item) => item.id === moment.id ? { ...item, likes: moment.likes } : item));
  }

  return <main className="moments-page"><header className="community-nav"><Link className="site-brand" href="/"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>COFFEE MOMENTS</small></div></Link><nav><Link href="/">Home</Link><Link href="/menu">Menu</Link><Link href="/reviews">Reviews</Link></nav><Link className="gold-button" href="/member-login">Member Login</Link></header><section className="moments-hero"><div><small>THE KaSYP GALLERY</small><h1>Every cup has a story.</h1><p>Upload a real SYP photo. Approved moments appear in the public gallery.</p></div><form onSubmit={submit}><h2>Share a real moment</h2><label>Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="KaSYP name" maxLength={60}/></label><label>Category<select value={tag} onChange={(event) => setTag(event.target.value)}>{uploadTags.map((value) => <option key={value}>{value}</option>)}</select></label><label>Photo<input className="photo-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto}/></label>{preview && <img className="upload-preview" src={preview} alt="Selected moment preview"/>}<label>Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="What made this moment special?" rows={3} maxLength={300}/></label><button className="gold-button" disabled={submitting}>{submitting ? "Uploading…" : "Submit for Approval"}</button>{message && <span>{message}</span>}</form></section><section className="moments-content"><div className="moment-filters">{tags.map((value) => <button type="button" className={filter === value ? "active" : ""} key={value} onClick={() => setFilter(value)}>{value}</button>)}</div>{loading ? <div className="community-empty">Loading moments…</div> : shown.length === 0 ? <div className="community-empty">No approved moments yet. Upload the first real SYP moment.</div> : <div className="moments-grid">{shown.map((moment, index) => <article className={index % 5 === 0 ? "featured" : ""} key={moment.id}><div className="moment-art real-photo"><img src={moment.image_url} alt={`${moment.name}'s SYP moment`}/><span>{moment.tag}</span></div><section><header><i>{moment.name[0]?.toUpperCase()}</i><div><b>{moment.name}</b><small>{new Date(moment.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</small></div></header><p>{moment.caption}</p><footer><button type="button" onClick={() => void like(moment)}>♡ {moment.likes}</button><span>Approved moment</span></footer></section></article>)}</div>}</section></main>;
}
