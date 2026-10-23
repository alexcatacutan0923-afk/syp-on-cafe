"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg"; // Actual SYP logo uploaded to public/IMG_5996.jpeg
const QR_TARGET = "https://syponcafe.shop";

type Sticker = {
  id: number;
  customer: string;
  drink: string;
  size: string;
  ice: string;
  sugar: string;
  notes: string;
  dateTime: string;
  theme: string;
};

function manilaDateTime() {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export default function StickerStudioPage() {
  const [customer, setCustomer] = useState("");
  const [drink, setDrink] = useState("");
  const [size, setSize] = useState("22 oz");
  const [ice, setIce] = useState("Regular ice");
  const [sugar, setSugar] = useState("Regular sugar");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [theme, setTheme] = useState("horror");
  const [dateTime, setDateTime] = useState(manilaDateTime);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [nextId, setNextId] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const update = () => setDateTime(manilaDateTime());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(QR_TARGET)}`,
    [],
  );

  function addStickers() {
    if (!drink.trim()) {
      setNotice("Ilagay muna ang drink name bago gumawa ng sticker.");
      return;
    }
    const createdAt = manilaDateTime();
    const added = Array.from({ length: Math.max(1, Math.min(100, quantity)) }, (_, index) => ({
      id: nextId + index,
      customer: customer.trim(),
      drink: drink.trim(),
      size,
      ice,
      sugar,
      notes: notes.trim(),
      dateTime: createdAt,
      theme,
    }));
    setStickers((current) => [...current, ...added]);
    setNextId((current) => current + added.length);
    setNotice(`${added.length} sticker${added.length > 1 ? "s" : ""} added to the print queue.`);
  }

  function printAll() {
    if (!stickers.length) {
      setNotice("Wala pang stickers sa print queue. Gumawa muna ng sticker.");
      return;
    }
    setNotice("");
    window.print();
  }

  function printOne(id: number) {
    document.querySelectorAll<HTMLElement>(".sticker-sheet").forEach((node) => {
      node.classList.toggle("print-selected", Number(node.dataset.stickerId) === id);
    });
    document.body.classList.add("printing-one");
    window.print();
    document.body.classList.remove("printing-one");
    document.querySelectorAll<HTMLElement>(".sticker-sheet").forEach((node) => node.classList.remove("print-selected"));
  }

  function removeSticker(id: number) {
    setStickers((current) => current.filter((sticker) => sticker.id !== id));
    setNotice("Sticker removed from queue.");
  }

  return (
    <main className="studio-shell">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Montserrat:wght@700;800;900&family=Special+Elite&display=swap');
        :root { --syp-ink: #2f2118; --syp-brown: #68452f; --syp-gold: #c59a58; --syp-cream: #f8f1e6; --syp-line: #e8d9c6; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4eee5; color: var(--syp-ink); font-family: Arial, Helvetica, sans-serif; }
        .studio-shell { min-height: 100vh; padding: 28px clamp(14px, 3vw, 42px) 48px; }
        .studio-top { max-width: 1280px; margin: 0 auto 26px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .studio-brand { display: flex; align-items: center; gap: 13px; }
        .studio-brand img { width: 58px; height: 58px; object-fit: contain; border-radius: 12px; background: white; }
        .studio-brand h1 { margin: 0; font-size: clamp(22px, 3vw, 32px); letter-spacing: -.04em; }
        .studio-brand p { margin: 5px 0 0; color: #8b715c; font-size: 11px; letter-spacing: .19em; font-weight: 800; }
        .studio-back { color: var(--syp-brown); text-decoration: none; font-size: 13px; font-weight: 800; border: 1px solid #d8c5af; border-radius: 999px; padding: 11px 16px; white-space: nowrap; }
        .studio-layout { max-width: 1280px; margin: auto; display: grid; grid-template-columns: minmax(290px, 390px) minmax(0, 1fr); gap: 22px; align-items: start; }
        .studio-panel { background: #fffdf9; border: 1px solid var(--syp-line); border-radius: 22px; padding: 23px; box-shadow: 0 14px 38px rgba(72, 47, 27, .055); }
        .studio-panel h2 { font-size: 17px; margin: 0 0 6px; }
        .studio-muted { color: #8a7664; font-size: 12px; line-height: 1.55; margin: 0 0 20px; }
        .studio-field { display: grid; gap: 7px; margin: 0 0 15px; }
        .studio-field label { font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: #80644c; font-weight: 850; }
        .studio-field input, .studio-field select, .studio-field textarea { width: 100%; min-width: 0; border: 1px solid #dfcfbd; background: #fff; color: #34251a; border-radius: 10px; padding: 12px; font: inherit; font-size: 14px; outline: none; }
        .studio-field input:focus, .studio-field select:focus, .studio-field textarea:focus { border-color: #a67a48; box-shadow: 0 0 0 3px #c59a5822; }
        .studio-field textarea { resize: vertical; min-height: 70px; }
        .studio-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .studio-button { border: 0; border-radius: 11px; padding: 13px 16px; background: var(--syp-brown); color: white; font-weight: 850; cursor: pointer; font-size: 13px; }
        .studio-button.secondary { color: var(--syp-brown); background: #efe3d3; }
        .studio-button:disabled { opacity: .4; cursor: not-allowed; }
        .studio-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 15px; }
        .studio-notice { padding: 11px 13px; border-radius: 10px; background: #f5ead8; color: #6d4c2e; font-size: 12px; margin-top: 14px; }
        .studio-preview-head { display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: 18px; }
        .studio-count { font-size: 11px; font-weight: 850; color: #8a6c50; background: #f3e7d7; border-radius: 999px; padding: 8px 11px; white-space: nowrap; }
        .studio-empty { min-height: 230px; border: 1px dashed #d7c4ae; border-radius: 16px; display: grid; place-items: center; padding: 30px; text-align: center; color: #927a64; font-size: 13px; line-height: 1.6; }
        .sticker-list { display: grid; gap: 13px; }
        .sticker-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e8d9c6; border-radius: 14px; background: #fffaf3; }
        .sticker-thumb { width: 100%; max-width: 560px; aspect-ratio: 80 / 50; background: #fff; overflow: hidden; }
        .sticker-row-actions { display: flex; flex-direction: column; gap: 7px; }
        .small-action { border: 1px solid #d8c4ad; background: white; color: #67472f; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; }
        .sticker-sheet { display: none; width: 80mm; height: 50mm; padding: 0; margin: 0 auto; background: #fff; color: #000; overflow: hidden; page-break-after: always; break-after: page; }
        /* Premium label frame: real vector artwork is rendered by ThemeArtwork below. */
        .sticker-art { position: relative; isolation: isolate; width: 80mm; height: 50mm; display: flex; flex-direction: column; padding: 0; overflow: hidden; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; text-align: left; }
        .sticker-art.theme-horror { --theme-ink: #111; --theme-paper: #fff; }
        .sticker-art.theme-regular { --theme-ink: #38271b; --theme-paper: #fff; }
        .sticker-art.theme-christmas { --theme-ink: #111; --theme-paper: #fff; }
        .sticker-art.theme-valentines { --theme-ink: #222; --theme-paper: #fff; }
        .theme-artwork { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .sticker-main { position: relative; z-index: 1; background: #fff; border: .45mm solid var(--theme-ink, #000); outline: .25mm solid var(--theme-ink, #000); outline-offset: -1.25mm; padding: 1.4mm; margin: 3mm; width: calc(100% - 6mm); height: calc(100% - 6mm); box-shadow: 0 0 0 .7mm #fff; }
        .sticker-main { display: grid; grid-template-columns: minmax(0, 1fr) 15mm; grid-template-rows: auto 1fr auto; column-gap: 2mm; height: 100%; min-height: 0; }
        .sticker-head { grid-column: 1; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 1.5mm; min-width: 0; border-bottom: .45mm solid #000; padding: 0 0 1.2mm; }
        .sticker-logo { width: 11mm; height: 11mm; object-fit: contain; flex: 0 0 auto; background: #fff; }
        .sticker-wordmark { min-width: 0; width: 100%; }
        .sticker-wordmark strong { display: block; font-family: Montserrat, Impact, sans-serif; font-size: 13pt; line-height: 1; font-weight: 900; letter-spacing: -.045em; white-space: nowrap; color: #000; }
        .sticker-wordmark span { display: block; margin-top: .7mm; font-family: Montserrat, Arial, sans-serif; font-size: 4.5pt; font-weight: 900; letter-spacing: .12em; white-space: nowrap; color: #000; }
        .sticker-qr { grid-column: 2; grid-row: 1 / span 2; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 2mm; }
        .sticker-qr img { width: 12mm; height: 12mm; object-fit: contain; image-rendering: pixelated; }
        .sticker-qr span { font-size: 4.2pt; margin-top: .5mm; font-weight: 900; }
        .sticker-details { grid-column: 1; min-width: 0; display: flex; flex-direction: column; padding-top: 1mm; }
        .sticker-customer { width: 100%; font-family: Special Elite, Courier, monospace; font-size: 6pt; font-weight: 900; line-height: 1.05; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #000; }
        .sticker-drink { width: 100%; font-family: Creepster, Impact, Haettenschweiler, "Arial Narrow Bold", fantasy, sans-serif; font-size: 27pt; font-weight: 900; line-height: .88; letter-spacing: .005em; margin-top: 1mm; overflow-wrap: anywhere; max-height: 15mm; overflow: hidden; color: #000; text-transform: uppercase; -webkit-text-stroke: .12px #000; }
        .sticker-meta { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: .8mm; margin-top: 1.5mm; width: 100%; }
        .sticker-pill { display: inline-block; border: .35mm solid #000; border-radius: 1mm; padding: .7mm 1mm; font-size: 4.8pt; line-height: 1; font-weight: 900; color: #000; }
        .sticker-notes { width: 100%; font-family: Special Elite, Courier, monospace; font-size: 5pt; line-height: 1.05; font-weight: 800; margin-top: 1mm; max-height: 4mm; overflow: hidden; overflow-wrap: anywhere; color: #000; }
        .sticker-footer { grid-column: 1 / span 2; border-top: .6mm double #000; margin-top: 1mm; padding-top: .8mm; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 1mm; font-size: 4.5pt; line-height: 1; font-weight: 800; color: #000; white-space: nowrap; }
        .sticker-sheet.print-selected { display: block; }
        @media (max-width: 900px) { .studio-layout { grid-template-columns: 1fr; } .studio-top { align-items: flex-start; } }
        @media (max-width: 520px) { .studio-shell { padding: 18px 12px 30px; } .studio-panel { padding: 17px; border-radius: 16px; } .studio-brand img { width: 46px; height: 46px; } .studio-brand p { font-size: 8px; letter-spacing: .12em; } .studio-back { padding: 9px 11px; font-size: 11px; } .sticker-row { grid-template-columns: 1fr; } .sticker-row-actions { flex-direction: row; } }
        @page { size: 80mm 50mm; margin: 0; }
        @media print {
          html, body { width: 80mm !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .sticker-sheet, .sticker-sheet * { visibility: visible !important; }
          .studio-shell, .studio-layout, .studio-panel, .sticker-list { display: block !important; width: 80mm !important; margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; background: #fff !important; }
          .studio-top, .studio-form-panel, .studio-preview-head, .studio-empty, .sticker-row-actions, .studio-notice { display: none !important; }
          .sticker-row { display: block !important; width: 80mm !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; background: #fff !important; break-inside: avoid !important; }
          .sticker-thumb { display: none !important; }
          .sticker-sheet { display: block !important; width: 80mm !important; height: 50mm !important; margin: 0 !important; padding: 0 !important; page-break-after: always !important; break-after: page !important; overflow: hidden !important; }
          body.printing-one .sticker-sheet:not(.print-selected) { display: none !important; }
          .sticker-art { width: 80mm !important; height: 50mm !important; }
        }
      `}</style>

      <header className="studio-top">
        <div className="studio-brand">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          <div><h1>SYP Sticker Studio</h1><p>STREET • ICED • BREWED</p></div>
        </div>
        <a className="studio-back" href="/">← Back to website</a>
      </header>

      <div className="studio-layout">
        <section className="studio-panel studio-form-panel">
          <h2>Create drink stickers</h2>
          <p className="studio-muted">Bold, high-contrast labels for clearer thermal printing. Each quantity creates a separate sticker.</p>
          <div className="studio-field"><label htmlFor="customer">Customer name (optional)</label><input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Alex" maxLength={42} /></div>
          <div className="studio-field"><label htmlFor="drink">Drink name *</label><input id="drink" value={drink} onChange={(e) => setDrink(e.target.value)} placeholder="e.g. Oreo Matcha" maxLength={42} /></div>
          <div className="studio-field"><label htmlFor="theme">Sticker theme</label><select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="horror">Undas / Horror</option><option value="regular">Regular SYP</option><option value="christmas">Christmas</option><option value="valentines">Valentine’s</option></select><p className="studio-muted" style={{ margin: 0 }}>Theme applies to new stickers added to the queue.</p></div>
          <div className="studio-two">
            <div className="studio-field"><label htmlFor="size">Cup size</label><select id="size" value={size} onChange={(e) => setSize(e.target.value)}><option>16 oz</option><option>22 oz</option><option>Hot 8 oz</option><option>Hot 12 oz</option><option>Custom size</option></select></div>
            <div className="studio-field"><label htmlFor="quantity">Quantity</label><input id="quantity" type="number" min={1} max={100} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} /></div>
          </div>
          <div className="studio-two">
            <div className="studio-field"><label htmlFor="ice">Ice preference</label><select id="ice" value={ice} onChange={(e) => setIce(e.target.value)}><option>Regular ice</option><option>Less ice</option><option>No ice</option><option>Extra ice</option><option>Hot</option></select></div>
            <div className="studio-field"><label htmlFor="sugar">Sugar preference</label><select id="sugar" value={sugar} onChange={(e) => setSugar(e.target.value)}><option>Regular sugar</option><option>Less sugar</option><option>Half sugar</option><option>No sugar</option><option>Extra sugar</option></select></div>
          </div>
          <div className="studio-field"><label htmlFor="notes">Custom notes (optional)</label><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Oat milk, no whipped cream" maxLength={100} /></div>
          <div className="studio-field"><label>Manila date & time</label><input value={dateTime} readOnly aria-label="Current Manila date and time" /></div>
          <button className="studio-button" type="button" onClick={addStickers}>＋ Add to sticker queue</button>
          {notice && <div className="studio-notice" role="status">{notice}</div>}
          <div className="studio-actions"><button className="studio-button secondary" type="button" onClick={() => { setCustomer(""); setDrink(""); setSize("22 oz"); setIce("Regular ice"); setSugar("Regular sugar"); setNotes(""); setQuantity(1); setTheme("horror"); setNotice("Form cleared."); }}>Clear form</button><button className="studio-button secondary" type="button" onClick={() => { setStickers([]); setNotice("Sticker queue cleared."); }}>Clear queue</button></div>
        </section>

        <section className="studio-panel">
          <div className="studio-preview-head"><div><h2>Print queue</h2><p className="studio-muted" style={{ marginBottom: 0 }}>Each sticker is 80 × 50 mm, landscape, with no extra blank gap (50 mm print step).</p></div><span className="studio-count">{stickers.length} sticker{stickers.length === 1 ? "" : "s"}</span></div>
          {!stickers.length ? <div className="studio-empty">Your sticker preview will appear here.<br />Add a drink on the left to get started.</div> : <div className="sticker-list">{stickers.map((sticker) => <div className="sticker-row" key={sticker.id}>
            <div className="sticker-thumb"><StickerArt sticker={sticker} qrUrl={qrUrl} /></div>
            <div className="sticker-row-actions"><button className="small-action" type="button" onClick={() => printOne(sticker.id)}>Print / reprint</button><button className="small-action" type="button" onClick={() => removeSticker(sticker.id)}>Remove</button></div>
            <div className="sticker-sheet" data-sticker-id={sticker.id}><StickerArt sticker={sticker} qrUrl={qrUrl} /></div>
          </div>)}</div>}
          <div className="studio-actions"><button className="studio-button" type="button" onClick={printAll} disabled={!stickers.length}>Print all stickers</button><button className="studio-button secondary" type="button" onClick={() => window.print()} disabled={!stickers.length}>Reprint queue</button></div>
          <p className="studio-muted" style={{ marginTop: 15, marginBottom: 0 }}>Choose a theme for each new sticker: Horror, Regular, Christmas or Valentine’s. Print at 100% / Actual size, disable headers and footers, and test one sticker first.</p>
        </section>
      </div>
    </main>
  );
}

function StickerArt({ sticker, qrUrl }: { sticker: Sticker; qrUrl: string }) {
  return <div className={`sticker-art theme-${sticker.theme || "horror"}`}><ThemeArtwork theme={sticker.theme || "horror"} />
    <div className="sticker-main">
      <div className="sticker-head"><img className="sticker-logo" src={LOGO_URL} alt="SYP logo" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="sticker-wordmark"><strong>SYP ON CAFÉ</strong><span>STREET • ICED • BREWED</span></div></div>
      <div className="sticker-qr"><img src={qrUrl} alt="QR code to syponcafe.shop" /><span>SCAN SYP</span></div>
      <div className="sticker-details">
        {sticker.customer && <div className="sticker-customer">FOR: {sticker.customer}</div>}
        <div className="sticker-drink">{sticker.drink}</div>
        <div className="sticker-meta"><span className="sticker-pill">{sticker.size}</span><span className="sticker-pill">{sticker.ice}</span><span className="sticker-pill">{sticker.sugar}</span></div>
        {sticker.notes && <div className="sticker-notes">NOTE: {sticker.notes}</div>}
      </div>
      <div className="sticker-footer"><span>{sticker.dateTime}</span><span>syponcafe.shop</span></div>
    </div>
  </div>;
}


function ThemeArtwork({ theme }: { theme: string }) {
  const ink = theme === "regular" ? "#38271b" : "#111111";
  const common = { fill: "none", stroke: ink, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg className="theme-artwork" viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <pattern id={`pattern-${theme}`} width={theme === "regular" ? 28 : 30} height={theme === "regular" ? 28 : 30} patternUnits="userSpaceOnUse">
        {theme === "horror" && <g {...common}><path d="M0 0 Q15 6 30 0 M0 0 Q6 15 0 30 M30 0 Q24 15 30 30 M0 30 Q15 24 30 30"/><circle cx="15" cy="15" r="2"/><path d="M15 15 L0 0 M15 15 L30 0 M15 15 L0 30 M15 15 L30 30"/></g>}
        {theme === "regular" && <g {...common}><ellipse cx="14" cy="14" rx="5" ry="9" transform="rotate(-35 14 14)"/><path d="M9 7 Q14 14 19 21"/><path d="M22 3 Q27 8 22 13 Q17 8 22 3Z"/></g>}
        {theme === "christmas" && <g {...common}><path d="M15 3 V27 M3 15 H27 M6.5 6.5 L23.5 23.5 M23.5 6.5 L6.5 23.5"/><circle cx="15" cy="15" r="3"/><path d="M2 27 L7 23 L12 27"/></g>}
        {theme === "valentines" && <g {...common}><path d="M14 23 C10 19 3 14 5 9 C7 4 12 6 14 10 C17 5 23 5 24 10 C26 15 18 20 14 23Z"/><path d="M2 27 Q14 22 27 27"/></g>}
      </pattern>
      <g id="pumpkin" {...common}><path d="M0 7 C-9 -1 -16 7 -14 16 C-12 25 -3 27 0 22 C5 28 14 24 15 16 C17 7 9 0 0 7Z"/><path d="M0 7 Q-4 15 0 22 M0 7 Q5 15 0 22 M0 6 Q-1 0 4 -3"/><path d="M-8 12 L-3 14 L-7 18 M8 12 L3 14 L7 18"/></g>
      <g id="spider" {...common}><ellipse cx="0" cy="0" rx="4" ry="5"/><circle cx="0" cy="-5" r="2.5"/><path d="M-3 -2 L-9 -7 M-4 0 L-11 -1 M-3 2 L-9 7 M3 -2 L9 -7 M4 0 L11 -1 M3 2 L9 7"/><path d="M0 -8 V-12"/></g>
      <g id="bean" {...common}><ellipse cx="0" cy="0" rx="5" ry="8" transform="rotate(35)"/><path d="M-3 -6 Q3 0 3 6"/></g>
      <g id="holly" {...common}><path d="M0 0 Q-12 -12 -14 -2 Q-8 2 -14 8 Q-4 10 0 0 Q7 -12 14 -5 Q8 2 14 7 Q3 10 0 0Z"/><circle cx="-2" cy="2" r="2"/><circle cx="3" cy="3" r="2"/></g>
      <g id="rose" {...common}><circle cx="0" cy="0" r="8"/><path d="M0 -7 Q8 -5 3 0 Q-4 4 -5 -2 Q-6 -7 0 -7Z M0 8 Q-3 15 -9 13 M3 8 Q10 14 13 8"/></g>
    </defs>
    <rect x="0" y="0" width="320" height="200" fill={`url(#pattern-${theme})`} opacity=".65"/>
    <rect x="3" y="3" width="314" height="194" rx="5" fill="none" stroke={ink} strokeWidth="2.5"/>
    <rect x="7" y="7" width="306" height="186" rx="3" fill="none" stroke={ink} strokeWidth=".8" strokeDasharray="2 3"/>
    {theme === "horror" && <g><use href="#pumpkin" transform="translate(20 25) scale(.8)"/><use href="#spider" transform="translate(300 25) scale(.9)"/><use href="#spider" transform="translate(20 175) scale(.7)"/><use href="#pumpkin" transform="translate(300 175) scale(.75)"/><path d="M0 0 L42 0 L0 42 M320 0 L278 0 L320 42 M0 200 L42 200 L0 158 M320 200 L278 200 L320 158" {...common}/></g>}
    {theme === "regular" && <g><use href="#bean" transform="translate(18 22) scale(.85)"/><use href="#bean" transform="translate(302 22) scale(.85)"/><use href="#bean" transform="translate(18 178) scale(.85)"/><use href="#bean" transform="translate(302 178) scale(.85)"/><path d="M0 40 Q18 30 32 45 M320 40 Q302 30 288 45 M0 160 Q18 170 32 155 M320 160 Q302 170 288 155" {...common}/></g>}
    {theme === "christmas" && <g><use href="#holly" transform="translate(20 22) scale(.85)"/><use href="#holly" transform="translate(300 22) scale(-.85 .85)"/><use href="#holly" transform="translate(20 178) scale(.85)"/><use href="#holly" transform="translate(300 178) scale(-.85 .85)"/><path d="M0 38 L7 31 L14 38 L21 31 L28 38 M292 38 L299 31 L306 38 L313 31 L320 38 M0 162 L7 169 L14 162 L21 169 L28 162 M292 162 L299 169 L306 162 L313 169 L320 162" {...common}/></g>}
    {theme === "valentines" && <g><use href="#rose" transform="translate(20 22) scale(.8)"/><use href="#rose" transform="translate(300 22) scale(.8)"/><use href="#rose" transform="translate(20 178) scale(.8)"/><use href="#rose" transform="translate(300 178) scale(.8)"/><path d="M0 40 Q10 30 20 40 T40 40 M280 40 Q290 30 300 40 T320 40 M0 160 Q10 170 20 160 T40 160 M280 160 Q290 170 300 160 T320 160" {...common}/></g>}
  </svg>;
}
