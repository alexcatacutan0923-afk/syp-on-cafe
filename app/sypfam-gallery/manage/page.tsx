"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Item = { id: string; type: "photo" | "reel" | "barista"; title: string; media_url: string; created_at: string; };
type Submission = { id: string; name: string; media_url: string; storage_path: string; created_at: string; };

export default function GalleryManagerPage() {
  const [sessionEmail, setSessionEmail] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [baristaPhoto, setBaristaPhoto] = useState<File | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const { data } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
    setItems((data || []) as Item[]);
    const pending = await supabase.from("gallery_submissions").select("*").order("created_at", { ascending: false });
    setSubmissions((pending.data || []) as Submission[]);
  }
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => { if (data.session) { setSessionEmail(data.session.user.email || "Admin"); void refresh(); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email || "");
      if (session) void refresh(); else setItems([]);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false); setMessage(error ? error.message : "Signed in.");
  }
  async function addPhoto(event: FormEvent) {
    event.preventDefault(); if (!photo) return;
    setBusy(true); setMessage("");
    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const upload = await supabase.storage.from("syp-gallery").upload(path, photo, { upsert: false, contentType: photo.type });
    if (upload.error) { setMessage(upload.error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("syp-gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery_items").insert({ type: "photo", title: title.trim() || "SYP Fam Moment", media_url: data.publicUrl, storage_path: path });
    setMessage(error ? error.message : "Photo added to SYP Fam Gallery!");
    if (!error) { setPhoto(null); setTitle(""); await refresh(); }
    setBusy(false);
  }
  async function addBarista(event: FormEvent) {
    event.preventDefault(); if (!baristaPhoto) return;
    setBusy(true); setMessage("");
    const ext = baristaPhoto.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `baristas/${crypto.randomUUID()}.${ext}`;
    const upload = await supabase.storage.from("syp-gallery").upload(path, baristaPhoto, { upsert: false, contentType: baristaPhoto.type });
    if (upload.error) { setMessage(upload.error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("syp-gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery_items").insert({ type: "barista", title: title.trim() || "SYP Barista", media_url: data.publicUrl, storage_path: path });
    setMessage(error ? error.message : "SYP Barista added!");
    if (!error) { setTitle(""); setBaristaPhoto(null); await refresh(); }
    setBusy(false);
  }
  async function approveSubmission(item: Submission) {
    setBusy(true); setMessage("");
    const { error } = await supabase.from("gallery_items").insert({ type: "photo", title: item.name ? `${item.name} • SYP Fam Moment` : "SYP Fam Moment", media_url: item.media_url, storage_path: item.storage_path });
    if (!error) await supabase.from("gallery_submissions").delete().eq("id", item.id);
    setMessage(error ? error.message : "Photo approved and published."); await refresh(); setBusy(false);
  }
  async function rejectSubmission(item: Submission) {
    setBusy(true);
    await supabase.from("gallery_submissions").delete().eq("id", item.id);
    if (item.storage_path) await supabase.storage.from("syp-gallery").remove([item.storage_path]);
    setMessage("Submission removed."); await refresh(); setBusy(false);
  }
  async function addReel(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.from("gallery_items").insert({ type: "reel", title: title.trim() || "SYP ON CAFÉ Reel", media_url: reelUrl.trim() });
    setMessage(error ? error.message : "Reel added!");
    if (!error) { setTitle(""); setReelUrl(""); await refresh(); }
    setBusy(false);
  }
  async function removeItem(item: Item) {
    if (!confirm("Delete this item from the gallery?")) return;
    setBusy(true);
    if (item.type === "photo") {
      const path = item.media_url.split("/syp-gallery/")[1];
      if (path) await supabase.storage.from("syp-gallery").remove([decodeURIComponent(path)]);
    }
    const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
    setMessage(error ? error.message : "Item deleted.");
    await refresh(); setBusy(false);
  }

  if (!isSupabaseConfigured) return <main className="manager"><section><h1>Gallery Manager</h1><p>Supabase is not configured yet. Add the Supabase URL and publishable key to the site environment variables first.</p><a href="/sypfam-gallery">← Back to gallery</a></section></main>;

  return <main className="manager"><header><a href="/sypfam-gallery">← SYP Fam Gallery</a><span>SYP ON CAFÉ</span></header><section className="manager-wrap">
    <p className="eyebrow">PRIVATE CONTENT MANAGER</p><h1>Gallery <em>Studio.</em></h1>
    {!sessionEmail ? <form className="panel" onSubmit={login}><h2>Admin sign in</h2><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button disabled={busy}>{busy ? "Please wait…" : "Sign in"}</button><p>Only an authorized SYP admin account can manage gallery content.</p></form> : <>
      <div className="signed">Signed in as {sessionEmail}<button type="button" onClick={()=>supabase.auth.signOut()}>Sign out</button></div>
      <div className="manager-grid">
        <form className="panel" onSubmit={addPhoto}><h2>Add SYP Fam Photo</h2><label>Photo title (optional)<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Coffee date with the fam" /></label><label>Choose photo<input type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0] || null)} required /></label><button disabled={busy || !photo}>{busy ? "Saving…" : "Upload photo"}</button></form>
        <form className="panel" onSubmit={addReel}><h2>Add SYP ON CAFÉ Reel</h2><label>Reel title (optional)<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Latest café reel" /></label><label>Facebook / Instagram / TikTok URL<input type="url" value={reelUrl} onChange={e=>setReelUrl(e.target.value)} placeholder="Paste public Reel link" required /></label><button disabled={busy || !reelUrl.trim()}>{busy ? "Saving…" : "Add reel link"}</button><p>Public Facebook and Instagram Reel links can be embedded. TikTok links are listed with an open-original link.</p></form>
      </div>
      <div className="items"><h2>Customer photo submissions ({submissions.length})</h2>{submissions.map(item=><div className="item" key={item.id}><span>{item.name || "Guest"}<br/><img src={item.media_url} alt="Customer submission" style={{width:64,height:64,objectFit:"cover",borderRadius:8,marginTop:6}} /></span><div><button type="button" disabled={busy} onClick={()=>void approveSubmission(item)}>Approve</button> <button type="button" disabled={busy} onClick={()=>void rejectSubmission(item)}>Reject</button></div></div>)}{!submissions.length && <p>No pending customer photos.</p>}</div><div className="items"><h2>Published items ({items.length})</h2>{items.map(item=><div className="item" key={item.id}><span>{item.type === "photo" ? "📷" : "▶"} {item.title || item.type}</span><button type="button" disabled={busy} onClick={()=>void removeItem(item)}>Delete</button></div>)}{!items.length && <p>No items added yet.</p>}</div>
    </>}
    {message && <p className="message">{message}</p>}
  </section><style jsx global>{`
    *{box-sizing:border-box}body{margin:0;background:#090e0a}.manager{min-height:100vh;color:#f6f0df;background:radial-gradient(ellipse at top,rgba(95,120,75,.2),transparent 45%),#090e0a;font-family:Arial,sans-serif;padding:0 22px 60px}.manager header{height:72px;border-bottom:1px solid #283127;display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:auto}.manager a{color:#e7bd62;text-decoration:none;font-size:12px}.manager header span{font-size:11px;letter-spacing:.2em;font-weight:bold}.manager-wrap{max-width:900px;margin:60px auto}.eyebrow{font-size:10px;letter-spacing:.2em;color:#e7bd62}.manager h1{font:56px Georgia,serif;margin:12px 0 30px}.manager h1 em{color:#e7bd62;font-weight:normal}.manager-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.panel,.items{padding:22px;border:1px solid #303a2f;border-radius:14px;background:#111a12}.panel h2,.items h2{font:22px Georgia,serif;margin:0 0 20px}.panel label{display:grid;gap:8px;margin:14px 0;color:#c2c9bc;font-size:12px}.panel input{width:100%;padding:12px;border-radius:8px;border:1px solid #3c493b;background:#080e09;color:#fff}.panel button,.signed button,.item button{border:0;border-radius:8px;background:#e7bd62;color:#101710;padding:12px 16px;font-weight:bold;cursor:pointer}.panel button:disabled{opacity:.55}.panel p,.items p{font-size:11px;line-height:1.6;color:#a9b0a6}.signed{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;color:#a9b0a6;font-size:12px}.items{margin-top:20px}.item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-top:1px solid #293329;font-size:12px}.item button{padding:8px 12px;background:#4a2823;color:#ffe0d8}.message{color:#e7bd62;font-size:12px;margin-top:18px}@media(max-width:700px){.manager-grid{grid-template-columns:1fr}.manager-wrap{margin:38px auto}.manager h1{font-size:44px}}
  `}</style></main>;
}
