"use client";

import { useState } from "react";

const socials = [
  {
    name: "Facebook",
    handle: "SYP ON CAFÉ",
    description: "Promos, announcements, and café updates.",
    href: "https://www.facebook.com/share/153BfsYhXbj/?mibextid=wwXIfr",
    mark: "f",
    className: "facebook",
  },
  {
    name: "Instagram",
    handle: "@syponcafe",
    description: "Coffee moments, drinks, and snapshots from the café.",
    href: "https://www.instagram.com/syponcafe/",
    mark: "◎",
    className: "instagram",
  },
  {
    name: "TikTok",
    handle: "@syponcafe",
    description: "Short videos, café vibes, and behind the scenes.",
    href: "https://www.tiktok.com/@syponcafe",
    mark: "♪",
    className: "tiktok",
  },
];

const hubUrl = "https://syponcafe.shop/socialmedia";
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&color=101510&bgcolor=ffffff&data=${encodeURIComponent(hubUrl)}`;

export default function SocialMediaPage() {
  const [copied, setCopied] = useState(false);

  async function copyHubLink() {
    try {
      await navigator.clipboard.writeText(hubUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy the SYP ON CAFÉ social link:", hubUrl);
    }
  }

  return (
    <main className="social-page">
      <div className="social-glow social-glow-one" />
      <div className="social-glow social-glow-two" />

      <header className="social-topbar">
        <a className="social-wordmark" href="/" aria-label="SYP ON CAFÉ home">
          <img className="social-brand-logo" src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ official logo" />
          <span>SYP ON <b>CAFÉ</b></span>
        </a>
        <div className="social-topbar-actions">
          <a href="/sypfam-gallery">SYP FAM GALLERY ↗</a>
          <span className="topbar-note">OFFICIAL SOCIALS</span>
        </div>
      </header>

      <section className="social-hero">
        <div className="hero-kicker"><span /> THE SYP COMMUNITY <span /></div>
        <h1>Let’s stay<br /><em>connected.</em></h1>
        <p className="hero-copy">
          Follow SYP ON CAFÉ for the latest drinks, promos, café moments,
          and good vibes. Find us on your favorite platform.
        </p>
      </section>

      <section className="social-links" aria-label="Official SYP ON CAFÉ social media links">
        {socials.map((social, index) => (
          <a
            className={`social-card ${social.className}`}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            key={social.name}
          >
            <span className="social-number">0{index + 1}</span>
            <span className="platform-mark" aria-hidden="true">{social.mark}</span>
            <span className="social-card-copy">
              <strong>{social.name}</strong>
              <small>{social.handle}</small>
              <span>{social.description}</span>
            </span>
            <span className="social-arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </section>

      <section className="social-qr-section">
        <div className="qr-copy">
          <span className="section-eyebrow">ONE SCAN. ALL OUR SOCIALS.</span>
          <h2>Scan. Follow.<br /><em>Be a KaSYP.</em></h2>
          <p>Scan this QR code to open the official SYP ON CAFÉ social media page. From here, you can choose Facebook, Instagram, or TikTok.</p>
          <button className="copy-link-button" type="button" onClick={copyHubLink}>
            <span aria-hidden="true">↗</span> {copied ? "Link copied!" : "Copy page link"}
          </button>
        </div>
        <div className="qr-card">
          <div className="qr-image-wrap">
            <img src={qrUrl} alt="QR code linking to syponcafe.shop/socialmedia" width="280" height="280" />
          </div>
          <strong>SCAN TO CONNECT</strong>
          <small>syponcafe.shop/socialmedia</small>
          <a className="qr-download" href={qrUrl} target="_blank" rel="noopener noreferrer" download="syp-on-cafe-social-qr.png">
            Open QR image ↗
          </a>
        </div>
      </section>

      <footer className="social-footer">
        <img className="social-footer-logo" src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ official logo" />
        <div className="footer-brand">SYP ON <b>CAFÉ</b></div>
        <a href="/sypfam-gallery">SYP Fam Gallery ↗</a>
        <p>Street • Iced • Brewed</p>
        <span>National Road, Apollo, Orani, Bataan</span>
        <a href="/">Visit our website ↗</a>
        <small>© {new Date().getFullYear()} SYP ON CAFÉ. All good vibes reserved.</small>
      </footer>

      <style jsx global>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #080c09; }
        .social-page {
          --gold: #e7bd62;
          --cream: #f6f0df;
          --muted: #a9b0a6;
          min-height: 100vh;
          overflow: hidden;
          position: relative;
          isolation: isolate;
          padding: 0 24px 34px;
          color: var(--cream);
          background:
            radial-gradient(ellipse at 50% 5%, rgba(98, 120, 76, .22), transparent 40%),
            linear-gradient(180deg, #101710 0%, #090d0a 52%, #070a08 100%);
          font-family: Arial, Helvetica, sans-serif;
        }
        .social-glow { position: absolute; z-index: -1; width: 380px; height: 380px; border-radius: 50%; filter: blur(100px); opacity: .13; pointer-events: none; }
        .social-glow-one { background: #c59b4b; top: 360px; left: -250px; }
        .social-glow-two { background: #557b56; top: 760px; right: -250px; }
        .social-topbar { width: min(100%, 980px); margin: auto; height: 82px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.09); }
        .social-wordmark { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; color: var(--cream); font-size: 13px; letter-spacing: .19em; font-weight: 800; }
        .social-wordmark b, .footer-brand b { color: var(--gold); }
        .social-brand-logo { width: 48px; height: 48px; object-fit: contain; display: block; }
        .social-topbar-actions { display: flex; align-items: center; gap: 22px; }
        .social-topbar-actions > a { color: var(--gold); font-size: 10px; letter-spacing: .08em; text-decoration: none; font-weight: 800; }
        .social-footer-logo { width: 86px; height: 86px; object-fit: contain; margin-bottom: 10px; }
        .topbar-note, .section-eyebrow { color: var(--gold); font-size: 9px; letter-spacing: .23em; font-weight: 800; }
        .social-hero { width: min(100%, 720px); margin: 0 auto; text-align: center; padding: 78px 0 46px; }
        .hero-kicker { display: flex; align-items: center; justify-content: center; gap: 12px; color: #c9cfc4; font-size: 9px; letter-spacing: .25em; font-weight: 700; }
        .hero-kicker span { width: 22px; height: 1px; background: var(--gold); }
        .social-hero h1 { margin: 22px 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(54px, 10vw, 88px); line-height: .94; letter-spacing: -.055em; font-weight: 500; }
        .social-hero h1 em, .qr-copy h2 em { color: var(--gold); font-weight: 400; }
        .hero-copy { max-width: 490px; margin: 0 auto; color: var(--muted); font-size: 14px; line-height: 1.8; }
        .social-links { width: min(100%, 620px); margin: 0 auto; display: grid; gap: 12px; }
        .social-card { position: relative; min-height: 112px; display: flex; align-items: center; gap: 18px; padding: 20px 22px; border: 1px solid rgba(255,255,255,.12); border-radius: 13px; background: linear-gradient(110deg, rgba(255,255,255,.075), rgba(255,255,255,.025)); color: var(--cream); text-decoration: none; transition: transform .2s ease, border-color .2s ease, background .2s ease; }
        .social-card:hover { transform: translateY(-3px); border-color: rgba(231,189,98,.65); background: rgba(255,255,255,.09); }
        .social-number { align-self: flex-start; color: #788176; font-size: 9px; letter-spacing: .1em; padding-top: 4px; }
        .platform-mark { width: 48px; height: 48px; flex: 0 0 48px; display: grid; place-items: center; border-radius: 12px; color: white; font-size: 29px; font-weight: 800; background: #26352a; }
        .facebook .platform-mark { background: #1877f2; font-family: Arial, sans-serif; }
        .instagram .platform-mark { background: linear-gradient(135deg, #7651c8, #df4778 58%, #f3a34a); }
        .tiktok .platform-mark { background: #171717; text-shadow: 2px 1px #25f4ee, -2px -1px #fe2c55; }
        .social-card-copy { display: grid; gap: 3px; min-width: 0; }
        .social-card-copy strong { font-family: Georgia, serif; font-size: 21px; font-weight: 500; }
        .social-card-copy small { color: var(--gold); font-size: 11px; letter-spacing: .04em; }
        .social-card-copy > span { color: var(--muted); font-size: 11px; line-height: 1.5; }
        .social-arrow { margin-left: auto; align-self: flex-start; color: var(--gold); font-size: 20px; }
        .social-qr-section { width: min(100%, 820px); margin: 88px auto 70px; padding: 38px; display: grid; grid-template-columns: 1fr 300px; align-items: center; gap: 36px; border: 1px solid rgba(231,189,98,.28); border-radius: 18px; background: linear-gradient(135deg, rgba(231,189,98,.09), rgba(255,255,255,.025) 55%); }
        .qr-copy h2 { margin: 15px 0; font-family: Georgia, serif; font-size: clamp(35px, 5vw, 48px); line-height: 1.03; font-weight: 500; letter-spacing: -.04em; }
        .qr-copy p { max-width: 390px; color: var(--muted); font-size: 13px; line-height: 1.8; }
        .copy-link-button { margin-top: 14px; padding: 12px 16px; border: 1px solid rgba(231,189,98,.55); border-radius: 7px; background: transparent; color: var(--gold); font-size: 11px; font-weight: 700; cursor: pointer; }
        .copy-link-button span { margin-right: 7px; }
        .qr-card { padding: 20px; border-radius: 13px; background: #f8f7f1; color: #182018; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .qr-image-wrap { width: 100%; max-width: 250px; padding: 6px; background: #fff; }
        .qr-image-wrap img { display: block; width: 100%; height: auto; }
        .qr-card strong { margin-top: 14px; font-size: 11px; letter-spacing: .16em; }
        .qr-card small { margin-top: 5px; color: #667064; font-size: 10px; }
        .qr-download { margin-top: 13px; color: #4e653e; font-size: 11px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
        .social-footer { width: min(100%, 980px); margin: 0 auto; padding-top: 28px; border-top: 1px solid rgba(255,255,255,.09); text-align: center; display: flex; flex-direction: column; align-items: center; }
        .footer-brand { font-size: 14px; font-weight: 800; letter-spacing: .2em; }
        .social-footer p { margin: 9px 0 5px; color: var(--gold); font-family: Georgia, serif; font-size: 14px; font-style: italic; }
        .social-footer > span { color: var(--muted); font-size: 11px; }
        .social-footer > a { margin-top: 14px; color: var(--cream); font-size: 11px; text-decoration: none; }
        .social-footer > small { margin-top: 28px; color: #707a70; font-size: 9px; }
        @media (max-width: 650px) {
          .social-page { padding: 0 17px 28px; }
          .social-topbar { height: 70px; }
          .social-wordmark { font-size: 11px; }
          .topbar-note { font-size: 8px; }
          .social-topbar-actions { gap: 10px; }
          .social-topbar-actions > a { font-size: 8px; }
          .social-brand-logo { width: 40px; height: 40px; }
          .social-hero { padding: 65px 0 35px; }
          .hero-copy { font-size: 13px; }
          .social-card { min-height: 104px; padding: 17px 13px; gap: 11px; }
          .social-number { font-size: 8px; }
          .platform-mark { width: 42px; height: 42px; flex-basis: 42px; font-size: 25px; }
          .social-card-copy strong { font-size: 19px; }
          .social-card-copy > span { font-size: 10px; }
          .social-qr-section { margin: 62px auto 52px; padding: 25px 18px; grid-template-columns: 1fr; gap: 24px; }
          .qr-copy { text-align: center; }
          .qr-copy p { margin-left: auto; margin-right: auto; }
          .qr-card { width: min(100%, 300px); margin: auto; }
        }
        @media (prefers-reduced-motion: reduce) { .social-card { transition: none; } }
      `}</style>
    </main>
  );
}
