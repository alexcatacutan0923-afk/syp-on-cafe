"use client";

import { useState } from "react";

const memories = [
  { src: "/community/IMG_3227.webp", label: "SYP Fam Moment 01" },
  { src: "/community/IMG_3228.webp", label: "SYP Fam Moment 02" },
  { src: "/community/IMG_3229.webp", label: "SYP Fam Moment 03" },
  { src: "/community/IMG_3230.webp", label: "SYP Fam Moment 04" },
  { src: "/community/IMG_3231.webp", label: "SYP Fam Moment 05" },
  { src: "/community/IMG_3232.webp", label: "SYP Fam Moment 06" },
];

export default function SypFamGalleryPage() {
  const [selected, setSelected] = useState<(typeof memories)[number] | null>(null);

  return (
    <main className="syp-gallery">
      <header className="gallery-header">
        <a href="/" aria-label="SYP ON CAFÉ home">
          <img src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ official logo" />
        </a>
        <a className="gallery-back" href="/socialmedia">← Social Media</a>
      </header>

      <section className="gallery-intro">
        <span className="gallery-kicker">THE PEOPLE. THE MOMENTS. THE SYP FAM.</span>
        <h1>Good drinks.<br /><em>Better memories.</em></h1>
        <p>Every visit, every tambay, every coffee date — part of the SYP story. Welcome to the SYP Fam Gallery.</p>
      </section>

      <section className="gallery-grid" aria-label="SYP Fam photo gallery">
        {memories.map((memory, index) => (
          <button className="gallery-photo" type="button" key={memory.src} onClick={() => setSelected(memory)} aria-label={`Open ${memory.label}`}>
            <img src={memory.src} alt={memory.label} loading={index > 2 ? "lazy" : "eager"} />
            <span><small>0{index + 1}</small>{memory.label}<b>↗</b></span>
          </button>
        ))}
      </section>

      <section className="gallery-cta">
        <img src="/brand/syp-logo-clean-v2.webp" alt="" />
        <div>
          <span>YOU’RE PART OF THE STORY</span>
          <h2>See you at SYP!</h2>
          <p>Tag us in your café moments and follow our socials for updates.</p>
        </div>
        <a href="/socialmedia">Follow SYP ON CAFÉ ↗</a>
      </section>

      <footer className="gallery-footer">
        <span>SYP ON CAFÉ • STREET • ICED • BREWED</span>
        <span>National Road, Apollo, Orani, Bataan</span>
      </footer>

      {selected && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.label} onClick={() => setSelected(null)}>
          <button type="button" className="lightbox-close" onClick={() => setSelected(null)} aria-label="Close image">×</button>
          <img src={selected.src} alt={selected.label} onClick={(event) => event.stopPropagation()} />
          <span>{selected.label}</span>
        </div>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #080c09; }
        .syp-gallery { min-height: 100vh; padding: 0 26px 38px; color: #f6f0df; background: radial-gradient(ellipse at 50% 0%, rgba(95,120,75,.22), transparent 42%), linear-gradient(180deg,#101710,#080c09 65%); font-family: Arial,Helvetica,sans-serif; }
        .gallery-header { width: min(100%,1100px); height: 88px; margin: auto; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,.1); }
        .gallery-header img { width:62px; height:62px; object-fit:contain; }
        .gallery-back { color:#e7bd62; text-decoration:none; font-size:11px; font-weight:700; letter-spacing:.08em; }
        .gallery-intro { max-width:760px; margin:0 auto; padding:76px 0 46px; text-align:center; }
        .gallery-kicker { color:#e7bd62; font-size:9px; letter-spacing:.24em; font-weight:800; }
        .gallery-intro h1 { margin:20px 0 16px; font:500 clamp(48px,8vw,78px)/.98 Georgia,serif; letter-spacing:-.05em; }
        .gallery-intro h1 em { color:#e7bd62; font-weight:400; }
        .gallery-intro p { max-width:520px; margin:auto; color:#a9b0a6; font-size:13px; line-height:1.8; }
        .gallery-grid { width:min(100%,1100px); margin:auto; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
        .gallery-photo { position:relative; display:block; padding:0; overflow:hidden; border:1px solid rgba(255,255,255,.13); border-radius:13px; background:#172018; cursor:pointer; text-align:left; color:#f6f0df; }
        .gallery-photo img { display:block; width:100%; aspect-ratio:4/5; object-fit:cover; transition:transform .35s ease; }
        .gallery-photo:hover img { transform:scale(1.045); }
        .gallery-photo > span { position:absolute; inset:auto 0 0; display:flex; align-items:center; gap:12px; padding:34px 15px 14px; background:linear-gradient(transparent,rgba(0,0,0,.86)); font:16px Georgia,serif; }
        .gallery-photo small { color:#e7bd62; font:9px Arial,sans-serif; }
        .gallery-photo b { margin-left:auto; color:#e7bd62; font:18px Arial,sans-serif; }
        .gallery-cta { width:min(100%,1100px); margin:62px auto 52px; padding:24px 28px; display:flex; align-items:center; gap:22px; border:1px solid rgba(231,189,98,.28); border-radius:15px; background:rgba(231,189,98,.07); }
        .gallery-cta img { width:76px; height:76px; object-fit:contain; }
        .gallery-cta div { flex:1; }
        .gallery-cta div > span { color:#e7bd62; font-size:9px; letter-spacing:.16em; font-weight:800; }
        .gallery-cta h2 { margin:6px 0; font:26px Georgia,serif; }
        .gallery-cta p { margin:0; color:#a9b0a6; font-size:11px; line-height:1.6; }
        .gallery-cta > a { color:#e7bd62; font-size:11px; font-weight:800; text-decoration:none; }
        .gallery-footer { width:min(100%,1100px); margin:auto; padding-top:22px; display:flex; justify-content:space-between; gap:15px; border-top:1px solid rgba(255,255,255,.1); color:#818a80; font-size:9px; letter-spacing:.1em; }
        .gallery-lightbox { position:fixed; z-index:50; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:30px; background:rgba(0,0,0,.92); }
        .gallery-lightbox img { max-width:min(92vw,900px); max-height:78vh; object-fit:contain; border-radius:8px; }
        .gallery-lightbox > span { color:#e7bd62; font:16px Georgia,serif; }
        .lightbox-close { position:absolute; top:18px; right:22px; width:42px; height:42px; border:1px solid rgba(255,255,255,.3); border-radius:50%; background:transparent; color:white; font-size:27px; cursor:pointer; }
        @media(max-width:760px) {
          .syp-gallery { padding:0 16px 28px; }
          .gallery-header { height:74px; }
          .gallery-header img { width:52px; height:52px; }
          .gallery-intro { padding:60px 0 34px; }
          .gallery-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
          .gallery-photo > span { padding:28px 10px 11px; gap:7px; font-size:13px; }
          .gallery-cta { margin:42px auto; padding:20px 16px; flex-wrap:wrap; gap:12px; }
          .gallery-cta img { width:58px; height:58px; }
          .gallery-cta div { min-width:calc(100% - 78px); }
          .gallery-cta > a { margin-left:70px; }
          .gallery-footer { flex-direction:column; text-align:center; }
        }
        @media(prefers-reduced-motion:reduce) { .gallery-photo img { transition:none; } }
      `}</style>
    </main>
  );
}
