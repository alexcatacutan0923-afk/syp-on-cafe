
"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
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
  quote: string;
};

const OPENINGS = [
  "Kape muna", "Dahan-dahan lang", "Laban lang", "Pahinga rin",
  "Ngiti muna", "Isang higop", "Ngayong gabi", "Sa bawat araw",
  "Konting pahinga", "Tuloy ang buhay", "Walang susuko", "Huminga muna",
  "Chill ka lang", "Para sa sarili", "Sa tamang oras", "Kaya mo 'yan",
  "Minsan talaga", "Kapag pagod", "Kahit mabagal", "Basta masaya",
  "Kape at kwento", "Tahimik muna", "Sapat na muna", "Isang araw",
  "Walang pressure", "Hindi kailangang", "Piliin ang saya", "Sulitin natin",
  "Ngayong sandali", "Bukas ulit", "Kahit puyat", "Sa bawat sip",
  "Tambay muna", "Puso muna", "Breathe in", "Walang madali",
  "Konting tiwala", "Sarili muna", "Good vibes lang", "Kahit umuulan",
  "Sa likod ng pagod", "Munting saya", "Lahat lilipas", "Kaya pa",
  "Dito ka muna", "Walang karera", "Isang pahinga", "Sige lang",
  "Maging mabait", "Huwag magmadali", "Pahinga is life",
];

const ENDINGS = [
  "may magandang bukas.", "deserve mo rin ang pahinga.",
  "hindi ka nahuhuli.", "hindi kailangang perfect.",
  "may dahilan para ngumiti.", "isa ka pa ring panalo.",
  "hindi mo kailangang patunayan lahat.", "may saya sa simpleng bagay.",
  "dahan-dahan, makakarating ka rin.", "hindi ka nag-iisa.",
  "okay lang magsimula ulit.", "may oras para sa lahat.",
  "hindi lahat kailangang madaliin.", "piliin mo rin ang sarili mo.",
  "hindi nasusukat sa bilis ang progreso.", "may bukas pang naghihintay.",
  "deserve mo ang good things.", "hindi bawal mapagod.",
  "bawat maliit na hakbang ay mahalaga.", "may ginhawa pagkatapos ng pagod.",
  "huwag kalimutang huminga.", "hindi kailangang laging malakas.",
  "ang mahalaga ay patuloy ka.", "may dahilan para magpatuloy.",
  "hindi lahat ng sagot ay ngayon.", "okay lang magpahinga sandali.",
  "mas mahalaga ang kapayapaan.", "sapat ka kahit may kulang.",
  "may sariling oras ang tagumpay.", "may bagong chance bukas.",
  "hindi mo kailangang madaliin ang buhay.", "may saya sa bawat simpleng higop.",
  "mas gumagaan kapag dahan-dahan.", "hindi sayang ang pahinga.",
  "ang mahalaga, hindi ka sumuko.", "may kwento ang bawat araw.",
  "piliin ang payapang isip.", "hindi lahat kailangan sagutin.",
  "may tamang panahon para sa iyo.", "sulit ang bawat munting saya.",
];

const FUNNY = [
  "Ang kape, hindi nang-iiwan.",
  "Puyat ngayon, bawi sa weekend.",
  "Kape ang sagot. Ano ulit ang tanong?",
  "Hindi tamad, naka-power saving mode.",
  "Ang sahod, dumadaan lang.",
  "Kung may problema, may kape muna.",
  "Ang tunay na relasyon, may refill.",
  "Busy kunwari, nagkakape talaga.",
  "Ang diet, bukas na ulit.",
  "Kalmado lang, may kape pa.",
  "Petsa de peligro pero may iced coffee.",
  "Hindi ako late, dramatic entrance lang.",
  "Mahal ang buhay, sulit ang kape.",
  "Walang jowa, may kape naman.",
  "Hindi overthink, extra strong lang.",
  "Ang adulting, walang tutorial.",
  "Kape muna bago magdesisyon.",
  "Kaya pa, may yelo pa.",
  "Puyat responsibly.",
  "Ang problema, huwag ihalo sa kape.",
  "Low battery, high caffeine.",
  "Sana all, may extra shot.",
  "Kape ang love language ko.",
  "Hindi bitter, dark roast lang.",
  "May deadline, pero may kape.",
  "Isang sip pa bago sumuko.",
  "Kung stress ka, order ka muna.",
  "Ang plot twist, ubos na ang kape.",
  "Masakit ang katotohanan, dagdagan ng yelo.",
  "Walang tulugan, may tambayan.",
];

const HUGOT = [
  "Hindi lahat ng matamis ay pangmatagalan.",
  "Minsan, kailangan mo lang ng space at kape.",
  "May mga bagay na mas okay nang bitawan.",
  "Hindi lahat ng nawala ay kawalan.",
  "Ang pahinga ay hindi pagsuko.",
  "May mga sagot na dumarating sa katahimikan.",
  "Hindi lahat ng tahimik ay walang iniisip.",
  "Minsan, sarili mo ang kailangan mong piliin.",
  "May mga alaala na sapat nang balikan.",
  "Hindi lahat ng miss mo ay dapat balikan.",
  "Kahit malamig ang gabi, puwedeng uminit ang puso.",
  "May mga kwentong hanggang dito na lang.",
  "Hindi lahat ng simula ay kailangang ipilit.",
  "May mga araw na survival na ang achievement.",
  "Okay lang hindi okay araw-araw.",
  "Ang paghilom ay hindi paligsahan.",
  "Hindi mo kailangang magpaliwanag sa lahat.",
  "May peace sa pagbitaw.",
  "Hindi ka mahina dahil napagod ka.",
  "May bagong kwento pagkatapos ng dulo.",
];

function buildQuotes() {
  const quotes = new Set<string>([...FUNNY, ...HUGOT]);

  for (const opening of OPENINGS) {
    for (const ending of ENDINGS) {
      quotes.add(`${opening}, ${ending}`);
    }
  }

  return Array.from(quotes);
}

const QUOTES = buildQuotes();

function randomQuote(excluded: Set<string>) {
  const available = QUOTES.filter((quote) => !excluded.has(quote));
  const pool = available.length ? available : QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

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
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const update = () => setDateTime(manilaDateTime());
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=2&ecc=H&data=${encodeURIComponent(QR_TARGET)}`,
    [],
  );

  function addStickers() {
    if (!drink.trim()) {
      setNotice("Ilagay muna ang drink name.");
      return;
    }

    const safeQuantity = Math.max(1, Math.min(100, quantity));
    const used = new Set(stickers.map((sticker) => sticker.quote));
    const added: Sticker[] = [];

    for (let i = 0; i < safeQuantity; i++) {
      const quote = randomQuote(used);
      used.add(quote);

      added.push({
        id: nextId + i,
        customer: customer.trim(),
        drink: drink.trim(),
        size,
        ice,
        sugar,
        notes: notes.trim(),
        dateTime: manilaDateTime(),
        quote,
      });
    }

    setStickers((current) => [...current, ...added]);
    setNextId((current) => current + added.length);
    setNotice(
      `${added.length} sticker(s) added. May ${QUOTES.length.toLocaleString()} quotes sa library.`,
    );
  }

  async function preparePrint() {
    if ("fonts" in document) await document.fonts.ready;

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(".sticker-sheet img"),
    );

    await Promise.all(
      images.map(async (img) => {
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          });
        }

        if (img.naturalWidth && img.decode) {
          try {
            await img.decode();
          } catch {}
        }
      }),
    );

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }

  function cleanupPrint() {
    document.body.classList.remove("printing-one");
    document
      .querySelectorAll<HTMLElement>(".sticker-sheet")
      .forEach((node) => node.classList.remove("print-selected"));
    window.removeEventListener("afterprint", cleanupPrint);
    setPrinting(false);
  }

  async function printStickers(id?: number) {
    if (!stickers.length || printing) {
      if (!stickers.length) setNotice("Wala pang sticker sa queue.");
      return;
    }

    cleanupPrint();

    if (id !== undefined) {
      document
        .querySelectorAll<HTMLElement>(".sticker-sheet")
        .forEach((node) => {
          node.classList.toggle(
            "print-selected",
            Number(node.dataset.stickerId) === id,
          );
        });
      document.body.classList.add("printing-one");
    }

    setPrinting(true);
    setNotice("Inihahanda ang print...");

    try {
      await preparePrint();
      setNotice("");
      window.addEventListener("afterprint", cleanupPrint, { once: true });
      window.print();
    } catch {
      cleanupPrint();
      setNotice("Hindi naihanda ang print. Subukan ulit.");
    }
  }

  function removeSticker(id: number) {
    setStickers((current) =>
      current.filter((sticker) => sticker.id !== id),
    );
    setNotice("Inalis ang sticker sa queue.");
  }

  function clearQueue() {
    setStickers([]);
    setNotice("Na-clear ang print queue.");
  }

  function reshuffleQuote(id: number) {
    const used = new Set(
      stickers.filter((sticker) => sticker.id !== id).map((s) => s.quote),
    );

    setStickers((current) =>
      current.map((sticker) =>
        sticker.id === id
          ? { ...sticker, quote: randomQuote(used) }
          : sticker,
      ),
    );
    setNotice("Bagong quote ang napili.");
  }

  return (
    <main className="studio-shell">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #f4eee5;
          color: #241b15;
          font-family: Arial, Helvetica, sans-serif;
        }
        .studio-shell { min-height: 100vh; padding: 26px clamp(12px,3vw,40px) 42px; }
        .studio-top {
          max-width: 1280px; margin: 0 auto 24px;
          display: flex; justify-content: space-between; align-items: center; gap: 14px;
        }
        .studio-brand { display: flex; align-items: center; gap: 12px; }
        .studio-brand img { width: 54px; height: 54px; object-fit: contain; background: white; border-radius: 10px; }
        .studio-brand h1 { margin: 0; font-size: clamp(22px,3vw,30px); letter-spacing: -.04em; }
        .studio-brand p { margin: 5px 0 0; font-size: 10px; letter-spacing: .16em; font-weight: 800; color: #80654d; }
        .studio-back { color: #62442e; text-decoration: none; font-size: 12px; font-weight: 800; border: 1px solid #d8c5af; border-radius: 30px; padding: 10px 14px; white-space: nowrap; }
        .studio-layout { max-width: 1280px; margin: auto; display: grid; grid-template-columns: minmax(280px,360px) minmax(0,1fr); gap: 20px; align-items: start; }
        .studio-panel { background: #fffdf9; border: 1px solid #e8d9c6; border-radius: 18px; padding: 20px; box-shadow: 0 12px 30px #482f1b0b; min-width: 0; }
        .studio-panel h2 { font-size: 17px; margin: 0 0 6px; }
        .studio-muted { color: #877461; font-size: 12px; line-height: 1.55; margin: 0 0 18px; }
        .studio-field { display: grid; gap: 6px; margin-bottom: 13px; }
        .studio-field label { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #80644c; font-weight: 850; }
        .studio-field input, .studio-field select, .studio-field textarea {
          width: 100%; min-width: 0; border: 1px solid #dfcfbd; background: white; color: #34251a;
          border-radius: 9px; padding: 11px; font: inherit; font-size: 13px; outline: none;
        }
        .studio-field textarea { resize: vertical; min-height: 65px; }
        .studio-field input:focus, .studio-field select:focus, .studio-field textarea:focus { border-color: #a67a48; box-shadow: 0 0 0 3px #c59a5822; }
        .studio-two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .studio-button { border: 0; border-radius: 9px; padding: 12px 14px; background: #62442e; color: white; font-weight: 800; cursor: pointer; font-size: 12px; }
        .studio-button.secondary { color: #62442e; background: #efe3d3; }
        .studio-button:disabled, .small-action:disabled { opacity: .45; cursor: not-allowed; }
        .studio-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .studio-notice { padding: 10px 12px; border-radius: 9px; background: #f5ead8; color: #6d4c2e; font-size: 12px; margin-top: 12px; }
        .studio-preview-head { display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: 16px; }
        .studio-count { font-size: 11px; font-weight: 850; color: #785a3d; background: #f3e7d7; border-radius: 30px; padding: 8px 10px; white-space: nowrap; }
        .studio-empty { min-height: 200px; border: 1px dashed #d7c4ae; border-radius: 14px; display: grid; place-items: center; padding: 25px; text-align: center; color: #927a64; font-size: 13px; line-height: 1.6; }
        .sticker-list { display: grid; gap: 12px; }
        .sticker-row { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 12px; border: 1px solid #e8d9c6; border-radius: 12px; background: #fffaf3; min-width: 0; }
        .sticker-thumb { width: 100%; aspect-ratio: 80 / 50; background: white; overflow: hidden; margin-inline: auto; border: 1px dashed #cdbba5; }
        .sticker-row-actions { display: flex; flex-direction: column; gap: 6px; }
        .small-action { border: 1px solid #d8c4ad; background: white; color: #67472f; padding: 8px 9px; border-radius: 7px; font-size: 10px; font-weight: 800; cursor: pointer; white-space: nowrap; }

        /* Exact label: 80 x 50 mm. The extra 2 mm is feed gap. */
        .sticker-sheet {
          display: none; width: 80mm; height: 52mm; margin: 0; padding: 0;
          overflow: hidden; background: white; color: black;
        }
        .sticker-art {
          width: 80mm; height: 50mm; overflow: hidden; background: white; color: black;
          display: grid; grid-template-columns: 17mm minmax(0,1fr) 13mm;
          grid-template-rows: minmax(0,1fr) auto;
          column-gap: 1.5mm; row-gap: 1mm; padding: 2mm 3mm 1.5mm 2mm;
          font-family: Arial, Helvetica, sans-serif; position: relative;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .sticker-brand-logo {
          grid-column: 1; grid-row: 1; width: 16mm; height: 16mm;
          object-fit: contain; align-self: start; justify-self: start;
        }
        .sticker-copy { grid-column: 2; grid-row: 1; min-width: 0; overflow: hidden; }
        .sticker-wordmark { font-size: 7pt; font-weight: 900; letter-spacing: -.03em; line-height: 1; white-space: nowrap; }
        .sticker-tagline { font-size: 4.5pt; font-weight: 800; margin-top: .8mm; letter-spacing: .03em; white-space: nowrap; }
        .sticker-drink { font-size: 17pt; font-weight: 900; line-height: 1; letter-spacing: -.045em; overflow-wrap: anywhere; margin-top: 2mm; }
        .sticker-pills { display: flex; flex-wrap: wrap; gap: .8mm; margin-top: 1.5mm; }
        .sticker-pill { border: .25mm solid #000; padding: .5mm .8mm; font-size: 5.5pt; font-weight: 800; line-height: 1.1; }
        .sticker-customer, .sticker-notes { font-size: 6pt; font-weight: 700; margin-top: 1mm; overflow-wrap: anywhere; }
        .sticker-qr { grid-column: 3; grid-row: 1; width: 13mm; display: flex; flex-direction: column; align-items: center; justify-content: start; }
        .sticker-qr img { display: block; width: 11mm; height: 11mm; object-fit: contain; }
        .sticker-qr span { font-size: 4pt; font-weight: 900; margin-top: .5mm; white-space: nowrap; }
        .sticker-quote {
          grid-column: 1 / 4; grid-row: 2; border-top: .45mm solid #000;
          padding-top: 1mm; min-width: 0; display: flex; gap: 1.5mm;
          align-items: center; overflow: hidden;
        }
        .quote-mark { font-size: 15pt; line-height: .8; font-weight: 900; flex: 0 0 auto; }
        .quote-text { font-size: 7pt; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
        .sticker-footer { font-size: 4pt; font-weight: 700; margin-top: .5mm; display: flex; justify-content: space-between; gap: 2mm; }
        @media (max-width: 900px) { .studio-layout { grid-template-columns: 1fr; } .studio-top { align-items: flex-start; } }
        @media (max-width: 520px) {
          .studio-shell { padding: 16px 10px 28px; }
          .studio-panel { padding: 15px; }
          .studio-brand img { width: 44px; height: 44px; }
          .studio-brand p { font-size: 8px; letter-spacing: .1em; }
          .studio-back { padding: 8px 10px; font-size: 10px; }
          .sticker-row { grid-template-columns: 1fr; }
          .sticker-row-actions { flex-direction: row; flex-wrap: wrap; }
        }

        @page { size: 80mm 52mm; margin: 0; }
        @media print {
          html, body { width: 80mm !important; margin: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; }
          body, body * { visibility: hidden !important; }
          .sticker-sheet, .sticker-sheet * { visibility: visible !important; }
          .studio-shell, .studio-layout, .studio-panel, .sticker-list {
            display: block !important; width: 80mm !important; min-width: 0 !important;
            max-width: none !important; margin: 0 !important; padding: 0 !important;
            border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: white !important;
          }
          .studio-top, .studio-form-panel, .studio-preview-head, .studio-empty, .sticker-row-actions, .studio-notice, .studio-actions, .studio-muted, .sticker-thumb { display: none !important; }
          .sticker-row { display: block !important; width: 80mm !important; margin: 0 !important; padding: 0 !important; border: 0 !important; background: white !important; break-inside: avoid !important; page-break-inside: avoid !important; }
          .sticker-sheet {
            display: block !important; position: relative !important; width: 80mm !important; height: 52mm !important;
            margin: 0 !important; padding: 0 !important; overflow: hidden !important;
            break-inside: avoid !important; page-break-inside: avoid !important;
            break-after: page !important; page-break-after: always !important;
          }
          .sticker-art { width: 80mm !important; height: 50mm !important; padding: 2mm 3mm 1.5mm 2mm !important; overflow: hidden !important; }
          .sticker-row:last-child .sticker-sheet { break-after: auto !important; page-break-after: auto !important; }
          body.printing-one .sticker-sheet { display: none !important; break-after: auto !important; page-break-after: auto !important; }
          body.printing-one .sticker-sheet.print-selected { display: block !important; }
          .sticker-brand-logo, .sticker-qr img { visibility: visible !important; }
        }
      `}</style>

      <header className="studio-top">
        <div className="studio-brand">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" />
          <div>
            <h1>SYP Sticker Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </div>
        <a className="studio-back" href="/">← Back to website</a>
      </header>

      <div className="studio-layout">
        <section className="studio-panel studio-form-panel">
          <h2>Create drink stickers</h2>
          <p className="studio-muted">
            Landscape 80 × 50 mm. May 2 mm feed gap at random Tagalog coffee quotes.
          </p>

          <div className="studio-field">
            <label htmlFor="customer">Customer name (optional)</label>
            <input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Alex" maxLength={42} />
          </div>

          <div className="studio-field">
            <label htmlFor="drink">Drink name *</label>
            <input id="drink" value={drink} onChange={(e) => setDrink(e.target.value)} placeholder="e.g. Oreo Matcha" maxLength={42} />
          </div>

          <div className="studio-two">
            <div className="studio-field">
              <label htmlFor="size">Cup size</label>
              <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                <option>16 oz</option><option>22 oz</option><option>Hot 8 oz</option><option>Hot 12 oz</option><option>Custom size</option>
              </select>
            </div>
            <div className="studio-field">
              <label htmlFor="quantity">Quantity</label>
              <input id="quantity" type="number" min={1} max={100} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
            </div>
          </div>

          <div className="studio-two">
            <div className="studio-field">
              <label htmlFor="ice">Ice preference</label>
              <select id="ice" value={ice} onChange={(e) => setIce(e.target.value)}>
                <option>Regular ice</option><option>Less ice</option><option>No ice</option><option>Extra ice</option><option>Hot</option>
              </select>
            </div>
            <div className="studio-field">
              <label htmlFor="sugar">Sugar preference</label>
              <select id="sugar" value={sugar} onChange={(e) => setSugar(e.target.value)}>
                <option>Regular sugar</option><option>Less sugar</option><option>Half sugar</option><option>No sugar</option><option>Extra sugar</option>
              </select>
            </div>
          </div>

          <div className="studio-field">
            <label htmlFor="notes">Custom notes (optional)</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Oat milk, no whipped cream" maxLength={100} />
          </div>

          <div className="studio-field">
            <label htmlFor="dateTime">Manila date &amp; time</label>
            <input id="dateTime" value={dateTime} readOnly />
          </div>

          <button className="studio-button" type="button" onClick={addStickers}>＋ Add to sticker queue</button>

          {notice && <div className="studio-notice" role="status">{notice}</div>}

          <div className="studio-actions">
            <button className="studio-button secondary" type="button" onClick={() => {
              setCustomer(""); setDrink(""); setSize("22 oz"); setIce("Regular ice");
              setSugar("Regular sugar"); setNotes(""); setQuantity(1); setNotice("Form cleared.");
            }}>Clear form</button>
            <button className="studio-button secondary" type="button" onClick={clearQueue}>Clear queue</button>
          </div>
        </section>

        <section className="studio-panel">
          <div className="studio-preview-head">
            <div>
              <h2>Print queue</h2>
              <p className="studio-muted" style={{ marginBottom: 0 }}>
                Label 80 × 50 mm + 2 mm feed gap. Check the preview before printing.
              </p>
            </div>
            <span className="studio-count">{stickers.length} sticker(s)</span>
          </div>

          {!stickers.length ? (
            <div className="studio-empty">Your sticker preview will appear here.<br />Add a drink to get started.</div>
          ) : (
            <div className="sticker-list">
              {stickers.map((sticker) => (
                <div className="sticker-row" key={sticker.id}>
                  <div className="sticker-thumb">
                    <StickerArt sticker={sticker} qrUrl={qrUrl} />
                  </div>
                  <div className="sticker-row-actions">
                    <button className="small-action" type="button" disabled={printing} onClick={() => printStickers(sticker.id)}>Print / reprint</button>
                    <button className="small-action" type="button" disabled={printing} onClick={() => reshuffleQuote(sticker.id)}>Random quote</button>
                    <button className="small-action" type="button" disabled={printing} onClick={() => removeSticker(sticker.id)}>Remove</button>
                  </div>
                  <div className="sticker-sheet" data-sticker-id={sticker.id}>
                    <StickerArt sticker={sticker} qrUrl={qrUrl} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="studio-actions">
            <button className="studio-button" type="button" disabled={!stickers.length || printing} onClick={() => printStickers()}>
              {printing ? "Preparing print..." : "Print all stickers"}
            </button>
          </div>

          <p className="studio-muted" style={{ marginTop: 14, marginBottom: 0 }}>
            Set paper to 80 × 52 mm if your driver allows custom size. The label artwork is 80 × 50 mm with a 2 mm feed gap. Print at 100% / Actual size, margins 0, headers and footers off. If the printer uses a gap sensor, calibrate the roll first.
          </p>
        </section>
      </div>
    </main>
  );
}

function StickerArt({ sticker, qrUrl }: { sticker: Sticker; qrUrl: string }) {
  return (
    <div className="sticker-art">
      <img className="sticker-brand-logo" src={LOGO_URL} alt="SYP ON CAFÉ logo" />
      <div className="sticker-copy">
        <div className="sticker-wordmark">SYP ON CAFÉ</div>
        <div className="sticker-tagline">STREET • ICED • BREWED</div>
        {sticker.customer && <div className="sticker-customer">FOR: {sticker.customer}</div>}
        <div className="sticker-drink">{sticker.drink}</div>
        <div className="sticker-pills">
          <span className="sticker-pill">{sticker.size}</span>
          <span className="sticker-pill">{sticker.ice}</span>
          <span className="sticker-pill">{sticker.sugar}</span>
        </div>
        {sticker.notes && <div className="sticker-notes">NOTE: {sticker.notes}</div>}
      </div>
      <div className="sticker-qr">
        <img src={qrUrl} alt="QR code to syponcafe.shop" />
        <span>SCAN SYP</span>
      </div>
      <div className="sticker-quote">
        <span className="quote-mark">“</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="quote-text">{sticker.quote}</div>
          <div className="sticker-footer">
            <span>{sticker.dateTime}</span>
            <span>syponcafe.shop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
