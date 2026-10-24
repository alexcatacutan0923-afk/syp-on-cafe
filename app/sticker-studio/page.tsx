
"use client";

import { useEffect, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg";

// Palitan ng eksaktong Facebook page URL kapag available na.
const QR_TARGET = "https://www.facebook.com/share/19sRNkRpda/?mibextid=wwXIfr";

type Sticker = {
  id: number;
  customer: string;
  drink: string;
  price: string;
  quote: string;
  createdAt: string;
};

const QUOTES = [
  "Kape muna, may magandang bukas.",
  "Dahan-dahan lang, hindi ka nahuhuli.",
  "Laban lang, KasYP!",
  "Pahinga rin, hindi kailangang perfect.",
  "One sip at a time.",
  "You deserve this little break.",
  "Better days are brewing.",
  "Kape, hinga, laban ulit.",
  "Small wins are still wins.",
  "Chill ka lang, hindi ka nag-iisa.",
  "Ang kape, hindi nang-iiwan.",
  "Kape muna bago mag-overthink.",
  "Hindi tamad, naka-power saving mode.",
  "Low battery, high caffeine.",
  "Coffee first, chismis later.",
  "Puyat responsibly.",
  "Kape ang love language ko.",
  "Walang forever, pero may refill.",
  "Life update: buhay pa, antok lang.",
  "Petsa de peligro pero may iced coffee.",
  "Hindi ako bitter, dark roast lang.",
  "Sana all may good morning.",
  "Kape at chika: essential needs.",
  "Pagod na maging strong independent.",
  "Ang sahod parang bisita, saglit lang.",
  "Walang budget pero may cravings.",
  "Basta may kape, may pag-asa.",
  "Your story is still unfolding.",
  "You are doing better than you think.",
  "Choose peace over pressure.",
  "Hindi mo kailangang maging okay agad.",
  "Your peace is worth protecting.",
  "Grow at your own pace.",
  "You are more than your bad days.",
  "Rest is part of the journey.",
  "You can start over anytime.",
  "Keep going, kahit dahan-dahan.",
  "Trust your effort.",
  "Hindi man mabilis, basta umuusad.",
  "Your future self will thank you.",
  "Dream big, start small.",
  "May bunga rin ang tiyaga.",
  "One day at a time.",
  "Make room for good things.",
  "Hindi lahat kailangang sagutin ngayon.",
  "May peace sa pagbitaw.",
  "Hindi ka mahina dahil napagod ka.",
  "You deserve love without confusion.",
  "Some endings make room for peace.",
  "Choose yourself without guilt.",
  "Be gentle with your own heart.",
  "Healing is not a race.",
  "Keep your heart soft and boundaries strong.",
  "Kape at kwento hanggang gumaan.",
  "Late nights, warm lights, good vibes.",
  "Good coffee, better company.",
  "Tambay now, worry less.",
  "A little café, a little peace.",
  "Chill lang, KasYP.",
  "Sa SYP, pahinga muna ang mundo.",
  "Dito, puwedeng maging ikaw lang.",
  "Salamat sa pagdaan, KasYP.",
  "Bawat higop, may munting saya.",
  "Your happy place, one sip away.",
  "Made with coffee, served with care.",
  "Good coffee, good mood.",
  "Take a sip, make a memory.",
  "Small cup, big comfort.",
  "Kape mo, moment mo.",
  "Life's better with a little ice.",
  "A good day starts with a good sip.",
  "Kahit simpleng araw, puwedeng maging special.",
  "Sip happens. Enjoy it anyway.",
  "Esmeringhoy, kape muna bago magkalat.",
  "Kape na lang, wala namang tayo.",
  "Sana all may ka-talking stage.",
  "Hindi ako marupok, kulang lang sa lambing.",
  "Lord, bigyan Mo ako ng pera.",
  "Nagtipid ako today. Bukas ulit.",
  "Kape ang sagot kahit di alam ang tanong.",
  "Hindi ako late, cinematic entrance lang.",
  "Gusto ko ng peace, hindi dagdag problema.",
  "Kape muna bago magpanggap na okay.",
  "Walang jowa, pero may loyalty card.",
  "Kung may problema, dagdagan ng pearls.",
  "Nag-pray ako ng sign, nag-story siya.",
  "Ang alarm ko parang suggestion lang.",
  "Kape ang breakfast at emotional support.",
  "Tambay muna, baka may plot twist.",
  "Pahinga, recharge, repeat.",
  "Keep showing up for your dreams.",
  "May magandang bukas pagkatapos ng mahabang gabi.",
  "A little coffee, a little courage.",
  "Choose joy in the little things.",
  "Make tonight a little lighter.",
  "Thanks for being part of our story.",
  "Every cup holds a new beginning.",
  "Stay kind, stay caffeinated.",
  "Kape na may kasamang good vibes.",
  "Mas masaya ang kape kapag may kasama.",
];

const QR_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&data=" +
  encodeURIComponent(QR_TARGET);

function makeQuote(previous: string[] = []) {
  const available = QUOTES.filter((quote) => !previous.includes(quote));
  const pool = available.length ? available : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function timeNow() {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
}

export default function StickerStudioPage() {
  const [customer, setCustomer] = useState("");
  const [drink, setDrink] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [history, setHistory] = useState<Sticker[]>([]);
  const [nextId, setNextId] = useState(1);
  const [notice, setNotice] = useState("");
  const [printing, setPrinting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const queue = localStorage.getItem("syp-studio-queue");
      const savedHistory = localStorage.getItem("syp-studio-history");
      const savedId = localStorage.getItem("syp-studio-next-id");

      if (queue) setStickers(JSON.parse(queue));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedId) setNextId(Math.max(1, Number(savedId) || 1));
    } catch {
      // Ignore invalid saved browser data.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("syp-studio-queue", JSON.stringify(stickers));
    localStorage.setItem("syp-studio-history", JSON.stringify(history));
    localStorage.setItem("syp-studio-next-id", String(nextId));
  }, [stickers, history, nextId, ready]);

  function addStickers() {
    if (!drink.trim()) {
      setNotice("Ilagay muna ang pangalan ng drink.");
      return;
    }

    const count = Math.max(1, Math.min(100, quantity));
    const used = stickers.map((sticker) => sticker.quote);
    const added: Sticker[] = [];

    for (let i = 0; i < count; i++) {
      const quote = makeQuote(used);
      used.push(quote);

      added.push({
        id: nextId + i,
        customer: customer.trim(),
        drink: drink.trim(),
        price: price.trim(),
        quote,
        createdAt: timeNow(),
      });
    }

    setStickers((current) => [...current, ...added]);
    setNextId((current) => current + count);
    setNotice(`${count} sticker(s) added sa print queue.`);
  }

  function changeQuote(id: number) {
    const used = stickers
      .filter((sticker) => sticker.id !== id)
      .map((sticker) => sticker.quote);

    setStickers((current) =>
      current.map((sticker) =>
        sticker.id === id
          ? { ...sticker, quote: makeQuote(used) }
          : sticker,
      ),
    );
  }

  function removeSticker(id: number) {
    setStickers((current) => current.filter((item) => item.id !== id));
    setNotice("Inalis ang sticker sa queue.");
  }

  function clearQueue() {
    if (!window.confirm("I-clear lahat ng stickers sa print queue?")) return;
    setStickers([]);
    setNotice("Na-clear na ang print queue.");
  }

  function printStickers(id?: number) {
    if (printing) return;

    const selected = id === undefined
      ? stickers
      : stickers.filter((sticker) => sticker.id === id);

    if (!selected.length) {
      setNotice("Walang sticker na ipi-print.");
      return;
    }

    setPrinting(true);
    document.body.classList.toggle("syp-print-one", id !== undefined);

    document.querySelectorAll<HTMLElement>(".syp-print-sheet").forEach((node) => {
      node.classList.toggle(
        "syp-selected",
        id !== undefined && Number(node.dataset.stickerId) === id,
      );
    });

    const finish = () => {
      document.body.classList.remove("syp-print-one");
      document.querySelectorAll<HTMLElement>(".syp-print-sheet").forEach((node) => {
        node.classList.remove("syp-selected");
      });
      setPrinting(false);
    };

    const afterPrint = () => {
      finish();
      setHistory((current) => [
        ...selected,
        ...current.filter((old) => !selected.some((item) => item.id === old.id)),
      ].slice(0, 200));
      setStickers((current) =>
        current.filter((item) => !selected.some((done) => done.id === item.id)),
      );
      setNotice(
        "Natapos ang print dialog. Nailipat ang sticker sa history para puwedeng i-reprint.",
      );
    };

    window.addEventListener("afterprint", afterPrint, { once: true });

    window.setTimeout(() => {
      window.print();
      // Fallback cleanup for browsers that don't fire afterprint.
      window.setTimeout(() => {
        if (document.body.classList.contains("syp-print-one")) finish();
      }, 60000);
    }, 100);
  }

  function reprint(sticker: Sticker) {
    const copy = { ...sticker, id: nextId };
    setNextId((current) => current + 1);
    setStickers((current) => [...current, copy]);
    setNotice("Naibalik sa queue. Pindutin ang Print / reprint.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() {
    if (!window.confirm("Burahin ang buong print history?")) return;
    setHistory([]);
    setNotice("Na-clear ang print history.");
  }

  return (
    <main className="syp-studio">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4eee5; color: #2c2119; font-family: Arial, sans-serif; }
        .syp-studio { min-height: 100vh; padding: 24px; }
        .syp-header, .syp-layout { max-width: 1180px; margin: 0 auto 20px; }
        .syp-header { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .syp-brand { display:flex; align-items:center; gap:12px; }
        .syp-brand img { width:54px; height:54px; object-fit:contain; background:white; border-radius:10px; }
        .syp-brand h1 { margin:0; font-size:clamp(22px,4vw,30px); }
        .syp-brand p { margin:5px 0 0; font-size:10px; font-weight:800; letter-spacing:.13em; color:#80644c; }
        .syp-layout { display:grid; grid-template-columns:minmax(260px,340px) minmax(0,1fr); gap:18px; align-items:start; }
        .syp-panel { min-width:0; background:#fffdf9; border:1px solid #e8d9c6; border-radius:16px; padding:18px; }
        .syp-panel h2 { margin:0 0 6px; font-size:18px; }
        .syp-muted { margin:0 0 16px; font-size:12px; line-height:1.5; color:#877461; }
        .syp-field { display:grid; gap:6px; margin-bottom:13px; }
        .syp-field label { font-size:10px; font-weight:800; color:#80644c; text-transform:uppercase; letter-spacing:.07em; }
        .syp-field input { width:100%; min-width:0; border:1px solid #dfcfbd; border-radius:9px; padding:11px; font-size:14px; background:white; color:#2c2119; }
        .syp-btn { border:0; border-radius:9px; padding:11px 13px; background:#62442e; color:white; font-size:12px; font-weight:800; cursor:pointer; }
        .syp-btn.light { background:#efe3d3; color:#62442e; }
        .syp-btn:disabled { opacity:.5; cursor:not-allowed; }
        .syp-actions { display:flex; flex-wrap:wrap; gap:7px; margin-top:12px; }
        .syp-notice { margin-top:12px; padding:10px; border-radius:8px; background:#f5ead8; color:#6d4c2e; font-size:12px; }
        .syp-list { display:grid; gap:12px; }
        .syp-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; align-items:center; padding:12px; border:1px solid #e8d9c6; border-radius:12px; }
        .syp-thumb { width:100%; aspect-ratio:70 / 50; overflow:hidden; border:1px dashed #cdbba5; background:white; }
        .syp-row-actions { display:flex; flex-direction:column; gap:6px; }
        .syp-small { border:1px solid #d8c4ad; background:white; color:#67472f; padding:8px; border-radius:7px; font-size:10px; font-weight:800; cursor:pointer; }
        .syp-print-sheet { display:none; width:70mm; height:50mm; overflow:hidden; background:white; }
        .syp-art { width:70mm; height:50mm; overflow:hidden; padding:2mm; background:white; color:#000; display:grid; grid-template-columns:15mm minmax(0,1fr) 15mm; grid-template-rows:minmax(0,1fr) 12mm; gap:1mm; font-family:Arial,sans-serif; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
        .syp-logo { grid-column:1; grid-row:1; width:14mm; height:14mm; object-fit:contain; }
        .syp-copy { grid-column:2; grid-row:1; min-width:0; overflow:hidden; }
        .syp-wordmark { font-size:7pt; font-weight:900; white-space:nowrap; }
        .syp-tagline { margin-top:.5mm; font-size:4.5pt; font-weight:800; white-space:nowrap; }
        .syp-drink { margin-top:2mm; font-size:20pt; line-height:1; font-weight:900; letter-spacing:-.04em; overflow-wrap:anywhere; }
        .syp-price { margin-top:1.5mm; font-size:11pt; font-weight:900; }
        .syp-customer { margin-top:1mm; font-size:5.5pt; font-weight:700; overflow-wrap:anywhere; }
        .syp-qr { grid-column:3; grid-row:1; width:15mm; display:flex; flex-direction:column; align-items:center; }
        .syp-qr img { width:14mm; height:14mm; object-fit:contain; }
        .syp-qr span { font-size:4.5pt; font-weight:900; margin-top:.5mm; }
        .syp-quote { grid-column:1 / 4; grid-row:2; border-top:.4mm solid #000; padding-top:1mm; display:flex; gap:1mm; align-items:center; overflow:hidden; }
        .syp-quote-mark { font-size:15pt; font-weight:900; }
        .syp-quote-text { font-size:7pt; line-height:1.15; font-weight:800; overflow-wrap:anywhere; }
        .syp-quote-footer { margin-top:.7mm; display:flex; justify-content:space-between; gap:1mm; font-size:4pt; font-weight:700; }
        .syp-history { display:grid; gap:8px; margin-top:12px; }
        .syp-history-row { display:flex; justify-content:space-between; align-items:center; gap:8px; border-bottom:1px solid #eee2d5; padding:9px 0; font-size:12px; }
        @media(max-width:800px) { .syp-layout { grid-template-columns:1fr; } .syp-studio { padding:14px; } }
        @media(max-width:480px) { .syp-row { grid-template-columns:1fr; } .syp-row-actions { flex-direction:row; flex-wrap:wrap; } .syp-header { align-items:flex-start; } }
        @page { size:70mm 50mm landscape; margin:0; }
        @media print {
          html, body { width:70mm !important; height:50mm !important; min-width:70mm !important; min-height:50mm !important; margin:0 !important; padding:0 !important; background:white !important; overflow:hidden !important; }
          body, body * { visibility:hidden !important; }
          .syp-print-sheet, .syp-print-sheet * { visibility:visible !important; }
          .syp-studio, .syp-layout, .syp-panel, .syp-list { display:block !important; width:70mm !important; min-width:0 !important; max-width:none !important; margin:0 !important; padding:0 !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:white !important; }
          .syp-header, .syp-form, .syp-panel-head, .syp-row-actions, .syp-thumb, .syp-notice, .syp-actions, .syp-muted, .syp-history { display:none !important; }
          .syp-row { display:block !important; width:70mm !important; margin:0 !important; padding:0 !important; border:0 !important; break-inside:avoid !important; page-break-inside:avoid !important; }
          .syp-print-sheet { display:block !important; box-sizing:border-box !important; width:70mm !important; min-width:70mm !important; max-width:70mm !important; height:50mm !important; min-height:50mm !important; max-height:50mm !important; margin:0 !important; padding:0 !important; overflow:hidden !important; break-after:page !important; page-break-after:always !important; }
          .syp-row:last-child .syp-print-sheet { break-after:auto !important; page-break-after:auto !important; }
          body.syp-print-one .syp-print-sheet { display:none !important; break-after:auto !important; page-break-after:auto !important; }
          body.syp-print-one .syp-print-sheet.syp-selected { display:block !important; }
          .syp-art { box-sizing:border-box !important; width:70mm !important; min-width:70mm !important; max-width:70mm !important; height:50mm !important; min-height:50mm !important; max-height:50mm !important; }
        }
      `}</style>

      <header className="syp-header">
        <div className="syp-brand">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" />
          <div>
            <h1>SYP Sticker Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </div>
        <a href="/" style={{ color: "#62442e", fontWeight: 800, fontSize: 12 }}>
          ← Back
        </a>
      </header>

      <div className="syp-layout">
        <section className="syp-panel syp-form">
          <h2>Create stickers</h2>
          <p className="syp-muted">
            Gumawa ng stickers para sa drinks. Walang login at walang POS connection.
          </p>

          <div className="syp-field">
            <label htmlFor="syp-customer">Customer name (optional)</label>
            <input id="syp-customer" value={customer} onChange={(e) => setCustomer(e.target.value)} maxLength={35} placeholder="Walk-in / customer name" />
          </div>

          <div className="syp-field">
            <label htmlFor="syp-drink">Drink name *</label>
            <input id="syp-drink" value={drink} onChange={(e) => setDrink(e.target.value)} maxLength={35} placeholder="Oreo Matcha" />
          </div>

          <div className="syp-field">
            <label htmlFor="syp-price">Price (optional)</label>
            <input id="syp-price" value={price} onChange={(e) => setPrice(e.target.value)} maxLength={12} placeholder="₱109" />
          </div>

          <div className="syp-field">
            <label htmlFor="syp-quantity">Quantity</label>
            <input id="syp-quantity" type="number" min={1} max={100} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
          </div>

          <button className="syp-btn" type="button" onClick={addStickers}>
            + Add to print queue
          </button>

          <div className="syp-actions">
            <button className="syp-btn light" type="button" onClick={() => { setCustomer(""); setDrink(""); setPrice(""); setQuantity(1); setNotice("Form cleared."); }}>
              Clear form
            </button>
            <button className="syp-btn light" type="button" onClick={clearQueue}>
              Clear queue
            </button>
          </div>

          {notice && <div className="syp-notice" role="status">{notice}</div>}
        </section>

        <section className="syp-panel">
          <div className="syp-panel-head" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2>Print queue</h2>
              <p className="syp-muted">Label size: 70 × 50 mm · Landscape · One label per page · Actual size / 100%.</p>
            </div>
            <strong>{stickers.length}</strong>
          </div>

          {!stickers.length ? (
            <p className="syp-muted">Wala pang sticker. Gumawa ng sticker sa form.</p>
          ) : (
            <div className="syp-list">
              {stickers.map((sticker) => (
                <div className="syp-row" key={sticker.id}>
                  <div className="syp-thumb">
                    <StickerArt sticker={sticker} />
                  </div>
                  <div className="syp-row-actions">
                    <button className="syp-small" disabled={printing} onClick={() => printStickers(sticker.id)}>Print / reprint</button>
                    <button className="syp-small" disabled={printing} onClick={() => changeQuote(sticker.id)}>Random quote</button>
                    <button className="syp-small" disabled={printing} onClick={() => removeSticker(sticker.id)}>Remove</button>
                  </div>
                  <div className="syp-print-sheet" data-sticker-id={sticker.id}>
                    <StickerArt sticker={sticker} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="syp-actions">
            <button className="syp-btn" disabled={!stickers.length || printing} onClick={() => printStickers()}>
              {printing ? "Preparing print..." : "Print all stickers"}
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2>Print history</h2>
            <p className="syp-muted">Naka-save sa browser na ito. Puwede mong ibalik ang sticker sa queue para i-reprint.</p>
            {!history.length ? (
              <p className="syp-muted">Wala pang print history.</p>
            ) : (
              <div className="syp-history">
                {history.map((sticker, index) => (
                  <div className="syp-history-row" key={`${sticker.id}-${index}`}>
                    <div>
                      <strong>{sticker.drink}</strong>
                      <div style={{ color: "#877461", fontSize: 10 }}>
                        {sticker.customer || "Walk-in"} · {sticker.createdAt}
                      </div>
                    </div>
                    <button className="syp-small" disabled={printing} onClick={() => reprint(sticker)}>Reprint</button>
                  </div>
                ))}
                <button className="syp-btn light" onClick={clearHistory}>Clear history</button>
              </div>
            )}
          </div>

          <p className="syp-muted" style={{ marginTop: 20, marginBottom: 0 }}>
            Sa print dialog, piliin ang 70 × 50 mm paper, Landscape, Actual size / 100%, margins: none, at i-off ang headers at footers. Bawat sticker ay isang label/page.
          </p>
        </section>
      </div>
    </main>
  );
}

function StickerArt({ sticker }: { sticker: Sticker }) {
  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&data=" +
    encodeURIComponent(QR_TARGET);

  return (
    <div className="syp-art">
      <img className="syp-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
      <div className="syp-copy">
        <div className="syp-wordmark">SYP ON CAFÉ</div>
        <div className="syp-tagline">STREET • ICED • BREWED</div>
        {sticker.customer && <div className="syp-customer">FOR: {sticker.customer}</div>}
        <div className="syp-drink">{sticker.drink}</div>
        {sticker.price && <div className="syp-price">{sticker.price.startsWith("₱") ? sticker.price : `₱${sticker.price}`}</div>}
      </div>
      <div className="syp-qr">
        <img src={qrUrl} alt="Scan SYP QR code" />
        <span>SCAN SYP</span>
      </div>
      <div className="syp-quote">
        <span className="syp-quote-mark">“</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="syp-quote-text">{sticker.quote}</div>
          <div className="syp-quote-footer">
            <span>{sticker.createdAt}</span>
            <span>SYP ON CAFÉ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
