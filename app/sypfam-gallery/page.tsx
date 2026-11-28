"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type GalleryItem = { id: string; type: "photo" | "reel"; title: string; media_url: string; created_at: string; };
const fallbackPhotos: GalleryItem[] = [];

function reelEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("instagram.com")) return `https://www.instagram.com/p/${parsed.pathname.split("/").filter(Boolean)[1]}/embed`;
    if (parsed.hostname.includes("facebook.com") || parsed.hostname.includes("fb.watch")) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=500`;
    if (parsed.hostname.includes("tiktok.com")) return url;
  } catch {}
  return url;
}

export default function SypFamGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [tab, setTab] = useState<"photos" | "reels">("photos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!isSupabaseConfigured) { if (alive) { setItems(fallbackPhotos); setLoading(false); } return; }
      const { data, error } = await supabase.from("gallery_items").select("id,type,title,media_url,created_at").order("created_at", { ascending: false });
      if (alive) { setItems(!error && data ? data as GalleryItem[] : fallbackPhotos); setLoading(false); }
    }
    void load();
    return () => { alive = false; };
  }, []);

  const photos = items.filter((item) => item.type === "photo");
  const reels = items.filter((item) => item.type === "reel");

  return (
    <main className="syp-gallery">
      <header className="gallery-header">
        <a href="/" aria-label="SYP ON CAFÉ home"><img src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ official logo" /></a>
        <div className="gallery-header-links"><a className="gallery-back" href="/sypfam-gallery/manage">MANAGE GALLERY</a><a className="gallery-back" href="/socialmedia">← Social Media</a></div>
      </header>
      <section className="gallery-intro">
        <span className="gallery-kicker">THE PEOPLE. THE MOMENTS. THE SYP FAM.</span>
        <h1>Good drinks.<br /><em>Better memories.</em></h1>
        <p>Every visit, every tambay, every coffee date — part of the SYP story. Welcome to the SYP Fam Gallery.</p>
      </section>
      <nav className="gallery-tabs" aria-label="Gallery categories">
        <button className={tab === "reels" ? "active" : ""} onClick={() => setTab("reels")}>▶ SYP ON CAFÉ REELS</button>
        <button className={tab === "photos" ? "active" : ""} onClick={() => setTab("photos")}>✦ SYP FAM PHOTOS</button>
      </nav>
      {loading ? <p className="gallery-status">Loading gallery…</p> : tab === "photos" ? (
        photos.length ? <section className="gallery-grid" aria-label="SYP Fam photo gallery">
          {photos.map((item, index) => <button className="gallery-photo" type="button" key={item.id} onClick={() => setSelected(item)}>
            <img src={item.media_url} alt={item.title || "SYP Fam moment"} loading={index > 2 ? "lazy" : "eager"} />
            <span><small>{String(index + 1).padStart(2, "0")}</small>{item.title || "SYP Fam Moment"}<b>↗</b></span>
          </button>)}
        </section> : <p className="gallery-status">Wala pang photos dito. Check back for more SYP Fam moments!</p>
      ) : reels.length ? <section className="reels-grid" aria-label="SYP ON CAFÉ reels">
        {reels.map((item) => <article className="reel-card" key={item.id}>
          <div className="reel-frame"><iframe src={reelEmbed(item.media_url)} title={item.title || "SYP ON CAFÉ Reel"} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen /></div>
          <h3>{item.title || "SYP ON CAFÉ Reel"}</h3>
          <a href={item.media_url} target="_blank" rel="noreferrer">Watch on original platform ↗</a>
        </article>)}
      </section> : <p className="gallery-status">Wala pang reels dito. Abangan ang SYP ON CAFÉ moments!</p>}
      <section className="gallery-cta">
        <img src="/brand/syp-logo-clean-v2.webp" alt="" />
        <div><span>YOU’RE PART OF THE STORY</span><h2>See you at SYP!</h2><p>Tag us in your café moments and follow our socials for updates.</p></div>
        <a href="/socialmedia">Follow SYP ON CAFÉ ↗</a>
      </section>
      <footer className="gallery-footer"><span>SYP ON CAFÉ • STREET • ICED • BREWED</span><span>National Road, Apollo, Orani, Bataan</span></footer>
      {selected && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}>
        <button type="button" className="lightbox-close" onClick={() => setSelected(null)} aria-label="Close image">×</button>
        <img src={selected.media_url} alt={selected.title} onClick={(event) => event.stopPropagation()} /><span>{selected.title}</span>
      </div>}
      <style jsx global>{`
        *{box-sizing:border-box} body{margin:0;background:#080c09}
        .syp-gallery{min-height:100vh;padding:0 26px 38px;color:#f6f0df;background:radial-gradient(ellipse at 50% 0%,rgba(95,120,75,.22),transparent 42%),linear-gradient(180deg,#101710,#080c09 65%);font-family:Arial,Helvetica,sans-serif}
        .gallery-header{width:min(100%,1100px);height:88px;margin:auto;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.1)}
        .gallery-header img{width:62px;height:62px;object-fit:contain}.gallery-header-links{display:flex;align-items:center;gap:18px}.gallery-back{color:#e7bd62;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.08em}
        .gallery-intro{max-width:760px;margin:0 auto;padding:76px 0 38px;text-align:center}.gallery-kicker{color:#e7bd62;font-size:9px;letter-spacing:.24em;font-weight:800}
        .gallery-intro h1{margin:20px 0 16px;font:500 clamp(48px,8vw,78px)/.98 Georgia,serif;letter-spacing:-.05em}.gallery-intro h1 em{color:#e7bd62;font-weight:400}
        .gallery-intro p{max-width:520px;margin:auto;color:#a9b0a6;font-size:13px;line-height:1.8}
        .gallery-tabs{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:0 auto 28px}.gallery-tabs button{border:1px solid rgba(231,189,98,.35);border-radius:30px;padding:12px 19px;background:transparent;color:#c5cbbf;font-size:10px;font-weight:800;letter-spacing:.1em;cursor:pointer}.gallery-tabs button.active{background:#e7bd62;color:#101710;border-color:#e7bd62}
        .gallery-grid,.reels-grid{width:min(100%,1100px);margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        .gallery-photo{position:relative;display:block;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:#172018;cursor:pointer;text-align:left;color:#f6f0df}
        .gallery-photo img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;transition:transform .35s ease}.gallery-photo:hover img{transform:scale(1.045)}
        .gallery-photo>span{position:absolute;inset:auto 0 0;display:flex;align-items:center;gap:12px;padding:34px 15px 14px;background:linear-gradient(transparent,rgba(0,0,0,.86));font:16px Georgia,serif}
        .gallery-photo small{color:#e7bd62;font:9px Arial,sans-serif}.gallery-photo b{margin-left:auto;color:#e7bd62;font:18px Arial,sans-serif}
        .reel-card{overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(255,255,255,.04);padding:10px}.reel-frame{aspect-ratio:9/16;background:#000;border-radius:9px;overflow:hidden}.reel-frame iframe{width:100%;height:100%;border:0}.reel-card h3{font:17px Georgia,serif;margin:12px 5px 7px}.reel-card>a{display:inline-block;margin:0 5px 7px;color:#e7bd62;font-size:10px;text-decoration:none}
        .gallery-status{min-height:150px;display:grid;place-items:center;text-align:center;color:#a9b0a6;font-size:13px}
        .gallery-cta{width:min(100%,1100px);margin:62px auto 52px;padding:24px 28px;display:flex;align-items:center;gap:22px;border:1px solid rgba(231,189,98,.28);border-radius:15px;background:rgba(231,189,98,.07)}
        .gallery-cta img{width:76px;height:76px;object-fit:contain}.gallery-cta div{flex:1}.gallery-cta div>span{color:#e7bd62;font-size:9px;letter-spacing:.16em;font-weight:800}
        .gallery-cta h2{margin:6px 0;font:26px Georgia,serif}.gallery-cta p{margin:0;color:#a9b0a6;font-size:11px;line-height:1.6}.gallery-cta>a{color:#e7bd62;font-size:11px;font-weight:800;text-decoration:none}
        .gallery-footer{width:min(100%,1100px);margin:auto;padding-top:22px;display:flex;justify-content:space-between;gap:15px;border-top:1px solid rgba(255,255,255,.1);color:#818a80;font-size:9px;letter-spacing:.1em}
        .gallery-lightbox{position:fixed;z-index:50;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:30px;background:rgba(0,0,0,.92)}.gallery-lightbox img{max-width:min(92vw,900px);max-height:78vh;object-fit:contain;border-radius:8px}.gallery-lightbox>span{color:#e7bd62;font:16px Georgia,serif}
        .lightbox-close{position:absolute;top:18px;right:22px;width:42px;height:42px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:transparent;color:white;font-size:27px;cursor:pointer}
        @media(max-width:760px){.syp-gallery{padding:0 16px 28px}.gallery-header{height:74px}.gallery-header img{width:52px;height:52px}.gallery-header-links{gap:10px}.gallery-back{font-size:9px}.gallery-intro{padding:60px 0 30px}.gallery-grid,.reels-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gallery-photo>span{padding:28px 10px 11px;gap:7px;font-size:13px}.gallery-cta{margin:42px auto;padding:20px 16px;flex-wrap:wrap;gap:12px}.gallery-cta img{width:58px;height:58px}.gallery-cta div{min-width:calc(100% - 78px)}.gallery-cta>a{margin-left:70px}.gallery-footer{flex-direction:column;text-align:center}}
        @media(max-width:480px){.reels-grid{grid-template-columns:1fr;max-width:360px}}
        @media(prefers-reduced-motion:reduce){.gallery-photo img{transition:none}}
      `}</style>
    </main>
  );
}
