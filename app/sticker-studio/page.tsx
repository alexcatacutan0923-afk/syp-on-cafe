"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL = "/logo.png"; // Upload the actual SYP logo to public/logo.png
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
        .sticker-thumb { width: 100%; max-width: 560px; aspect-ratio: 50 / 80; background: #fff; overflow: hidden; }
        .sticker-row-actions { display: flex; flex-direction: column; gap: 7px; }
        .small-action { border: 1px solid #d8c4ad; background: white; color: #67472f; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; }
        .sticker-sheet { display: none; width: 50mm; height: 82mm; padding: 0; margin: 0 auto; background: #fff; color: #23180f; overflow: hidden; page-break-after: always; break-after: page; }
        .sticker-art { width: 50mm; height: 80mm; display: flex; flex-direction: column; align-items: center; padding: 3mm 3mm 2mm; gap: 0; overflow: hidden; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; text-align: center; }
        .sticker-head { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; min-width: 0; border-bottom: .5mm solid #000; padding-bottom: 2mm; }
        .sticker-logo { width: 17mm; height: 17mm; object-fit: contain; flex: 0 0 auto; background: #fff; }
        .sticker-wordmark { min-width: 0; width: 100%; }
        .sticker-wordmark strong { display: block; font-size: 15pt; line-height: 1; font-weight: 1000; letter-spacing: -.045em; white-space: nowrap; color: #000; }
        .sticker-wordmark span { display: block; margin-top: 1mm; font-size: 5.5pt; font-weight: 900; letter-spacing: .12em; white-space: nowrap; color: #000; }
        .sticker-customer { width: 100%; font-size: 7pt; font-weight: 900; margin-top: 2mm; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #000; }
        .sticker-drink { width: 100%; font-size: 20pt; font-weight: 1000; line-height: .98; letter-spacing: -.035em; margin-top: 3mm; overflow-wrap: anywhere; max-height: 20mm; overflow: hidden; color: #000; text-transform: uppercase; }
        .sticker-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 1mm; margin-top: 2.5mm; width: 100%; }
        .sticker-pill { display: inline-block; border: .4mm solid #000; border-radius: 1mm; padding: 1mm 1.4mm; font-size: 5.5pt; line-height: 1.1; font-weight: 900; color: #000; }
        .sticker-notes { width: 100%; font-size: 6pt; line-height: 1.15; font-weight: 800; margin-top: 2mm; max-height: 7mm; overflow: hidden; overflow-wrap: anywhere; color: #000; }
        .sticker-qr { margin-top: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 2mm; }
        .sticker-qr img { width: 13mm; height: 13mm; object-fit: contain; image-rendering: pixelated; }
        .sticker-qr span { font-size: 4.5pt; margin-top: .6mm; font-weight: 900; }
        .sticker-footer { width: 100%; border-top: .35mm solid #000; margin-top: 2mm; padding-top: 1mm; display: flex; flex-direction: column; align-items: center; gap: .6mm; font-size: 4.8pt; line-height: 1; font-weight: 800; color: #000; white-space: nowrap; }
        .sticker-sheet.print-selected { display: block; }
        @media (max-width: 900px) { .studio-layout { grid-template-columns: 1fr; } .studio-top { align-items: flex-start; } }
        @media (max-width: 520px) { .studio-shell { padding: 18px 12px 30px; } .studio-panel { padding: 17px; border-radius: 16px; } .studio-brand img { width: 46px; height: 46px; } .studio-brand p { font-size: 8px; letter-spacing: .12em; } .studio-back { padding: 9px 11px; font-size: 11px; } .sticker-row { grid-template-columns: 1fr; } .sticker-row-actions { flex-direction: row; } }
        @page { size: 50mm 82mm; margin: 0; }
        @media print {
          html, body { width: 50mm !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .sticker-sheet, .sticker-sheet * { visibility: visible !important; }
          .studio-shell, .studio-layout, .studio-panel, .sticker-list { display: block !important; width: 50mm !important; margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; background: #fff !important; }
          .studio-top, .studio-form-panel, .studio-preview-head, .studio-empty, .sticker-row-actions, .studio-notice { display: none !important; }
          .sticker-row { display: block !important; width: 50mm !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; background: #fff !important; break-inside: avoid !important; }
          .sticker-thumb { display: none !important; }
          .sticker-sheet { display: block !important; width: 50mm !important; height: 82mm !important; margin: 0 !important; padding: 0 !important; page-break-after: always !important; break-after: page !important; overflow: hidden !important; }
          body.printing-one .sticker-sheet:not(.print-selected) { display: none !important; }
          .sticker-art { width: 50mm !important; height: 80mm !important; }
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
          <div className="studio-actions"><button className="studio-button secondary" type="button" onClick={() => { setCustomer(""); setDrink(""); setSize("22 oz"); setIce("Regular ice"); setSugar("Regular sugar"); setNotes(""); setQuantity(1); setNotice("Form cleared."); }}>Clear form</button><button className="studio-button secondary" type="button" onClick={() => { setStickers([]); setNotice("Sticker queue cleared."); }}>Clear queue</button></div>
        </section>

        <section className="studio-panel">
          <div className="studio-preview-head"><div><h2>Print queue</h2><p className="studio-muted" style={{ marginBottom: 0 }}>Each sticker is 50 × 80 mm, portrait, with a 2 mm feed gap (82 mm print step).</p></div><span className="studio-count">{stickers.length} sticker{stickers.length === 1 ? "" : "s"}</span></div>
          {!stickers.length ? <div className="studio-empty">Your sticker preview will appear here.<br />Add a drink on the left to get started.</div> : <div className="sticker-list">{stickers.map((sticker) => <div className="sticker-row" key={sticker.id}>
            <div className="sticker-thumb"><StickerArt sticker={sticker} qrUrl={qrUrl} /></div>
            <div className="sticker-row-actions"><button className="small-action" type="button" onClick={() => printOne(sticker.id)}>Print / reprint</button><button className="small-action" type="button" onClick={() => removeSticker(sticker.id)}>Remove</button></div>
            <div className="sticker-sheet" data-sticker-id={sticker.id}><StickerArt sticker={sticker} qrUrl={qrUrl} /></div>
          </div>)}</div>}
          <div className="studio-actions"><button className="studio-button" type="button" onClick={printAll} disabled={!stickers.length}>Print all stickers</button><button className="studio-button secondary" type="button" onClick={() => window.print()} disabled={!stickers.length}>Reprint queue</button></div>
          <p className="studio-muted" style={{ marginTop: 15, marginBottom: 0 }}>Print dialog: choose the Epson printer, set scale to 100% / Actual size, disable headers and footers, and test one sticker first. Browser/printer drivers may override roll dimensions.</p>
        </section>
      </div>
    </main>
  );
}

function StickerArt({ sticker, qrUrl }: { sticker: Sticker; qrUrl: string }) {
  return <div className="sticker-art">
    <div>
      <div className="sticker-head"><img className="sticker-logo" src={LOGO_URL} alt="SYP logo" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="sticker-wordmark"><strong>SYP ON CAFÉ</strong><span>STREET • ICED • BREWED</span></div></div>
      {sticker.customer && <div className="sticker-customer">FOR: {sticker.customer}</div>}
      <div className="sticker-drink">{sticker.drink}</div>
      <div className="sticker-meta"><span className="sticker-pill">{sticker.size}</span><span className="sticker-pill">{sticker.ice}</span><span className="sticker-pill">{sticker.sugar}</span></div>
      {sticker.notes && <div className="sticker-notes">NOTE: {sticker.notes}</div>}
    </div>
    <div className="sticker-qr"><img src={qrUrl} alt="QR code to syponcafe.shop" /><span>SCAN SYP</span></div>
    <div className="sticker-footer"><span>{sticker.dateTime}</span><span>syponcafe.shop</span></div>
  </div>;
}
