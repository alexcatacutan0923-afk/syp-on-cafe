
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
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const update = () => setDateTime(manilaDateTime());
    update();

    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=1&ecc=H&data=${encodeURIComponent(
        QR_TARGET,
      )}`,
    [],
  );

  function addStickers() {
    if (!drink.trim()) {
      setNotice("Ilagay muna ang drink name.");
      return;
    }

    const count = Math.max(1, Math.min(100, quantity));
    const createdAt = manilaDateTime();

    const added: Sticker[] = Array.from({ length: count }, (_, index) => ({
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
    setNotice(`${added.length} sticker(s) added to the queue.`);
  }

  async function prepareStickerPrint() {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

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

        if (img.naturalWidth > 0 && img.decode) {
          try {
            await img.decode();
          } catch {
            // Continue if image decoding fails.
          }
        }
      }),
    );

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  function cleanupPrint() {
    document.body.classList.remove("printing-one");

    document
      .querySelectorAll<HTMLElement>(".sticker-sheet")
      .forEach((node) => node.classList.remove("print-selected"));

    window.removeEventListener("afterprint", handleAfterPrint);
    setPrinting(false);
  }

  function handleAfterPrint() {
    cleanupPrint();
  }

  async function printAll() {
    if (!stickers.length || printing) {
      if (!stickers.length) {
        setNotice("Wala pang sticker sa queue.");
      }
      return;
    }

    cleanupPrint();
    setPrinting(true);
    setNotice("Preparing stickers...");

    try {
      await prepareStickerPrint();
      setNotice("");

      window.addEventListener("afterprint", handleAfterPrint, {
        once: true,
      });

      window.print();
    } catch {
      cleanupPrint();
      setNotice("Hindi naihanda ang print. Subukan ulit.");
    }
  }

  async function printOne(id: number) {
    if (printing || !stickers.some((sticker) => sticker.id === id)) {
      return;
    }

    cleanupPrint();

    document
      .querySelectorAll<HTMLElement>(".sticker-sheet")
      .forEach((node) => {
        node.classList.toggle(
          "print-selected",
          Number(node.dataset.stickerId) === id,
        );
      });

    document.body.classList.add("printing-one");
    setPrinting(true);
    setNotice("Preparing selected sticker...");

    try {
      await prepareStickerPrint();
      setNotice("");

      window.addEventListener("afterprint", handleAfterPrint, {
        once: true,
      });

      window.print();
    } catch {
      cleanupPrint();
      setNotice("Hindi naihanda ang sticker. Subukan ulit.");
    }
  }

  function removeSticker(id: number) {
    setStickers((current) =>
      current.filter((sticker) => sticker.id !== id),
    );
    setNotice("Sticker removed.");
  }

  function clearForm() {
    setCustomer("");
    setDrink("");
    setSize("22 oz");
    setIce("Regular ice");
    setSugar("Regular sugar");
    setNotes("");
    setQuantity(1);
    setNotice("Form cleared.");
  }

  function clearQueue() {
    setStickers([]);
    setNotice("Sticker queue cleared.");
  }

  return (
    <main className="studio-shell">
      <style jsx global>{`
        :root {
          --syp-brown: #49372a;
          --syp-muted: #817365;
          --syp-border: #e5ddd2;
          --syp-cream: #f8f5ef;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f4ee;
          color: #30271f;
          font-family: Arial, Helvetica, sans-serif;
        }

        .studio-shell {
          min-height: 100vh;
          padding: 28px clamp(14px, 3vw, 42px) 48px;
        }

        .studio-top {
          max-width: 1280px;
          margin: 0 auto 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .studio-brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .studio-brand img {
          width: 52px;
          height: 52px;
          object-fit: contain;
          border-radius: 50%;
          background: #fff;
        }

        .studio-brand h1 {
          margin: 0;
          font-size: clamp(21px, 3vw, 30px);
          letter-spacing: -0.04em;
        }

        .studio-brand p {
          margin: 5px 0 0;
          color: var(--syp-muted);
          font-size: 10px;
          letter-spacing: 0.15em;
          font-weight: 700;
        }

        .studio-back {
          color: var(--syp-brown);
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #d8cfc1;
          border-radius: 30px;
          padding: 10px 14px;
          white-space: nowrap;
        }

        .studio-layout {
          max-width: 1280px;
          margin: auto;
          display: grid;
          grid-template-columns: minmax(290px, 390px) minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .studio-panel {
          min-width: 0;
          padding: 23px;
          background: #fff;
          border: 1px solid var(--syp-border);
          border-radius: 18px;
          box-shadow: 0 8px 28px #30271f08;
        }

        .studio-panel h2 {
          font-size: 17px;
          margin: 0 0 7px;
        }

        .studio-muted {
          color: var(--syp-muted);
          font-size: 12px;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .studio-field {
          display: grid;
          gap: 7px;
          margin-bottom: 15px;
        }

        .studio-field label {
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #756353;
          font-weight: 700;
        }

        .studio-field input,
        .studio-field select,
        .studio-field textarea {
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid #ded6cb;
          border-radius: 9px;
          background: #fff;
          color: #30271f;
          font: inherit;
          font-size: 14px;
          outline: none;
        }

        .studio-field input:focus,
        .studio-field select:focus,
        .studio-field textarea:focus {
          border-color: #806b55;
          box-shadow: 0 0 0 2px #806b5518;
        }

        .studio-field textarea {
          resize: vertical;
          min-height: 70px;
        }

        .studio-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .studio-button {
          border: 1px solid var(--syp-brown);
          border-radius: 9px;
          padding: 12px 15px;
          background: var(--syp-brown);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .studio-button.secondary {
          color: var(--syp-brown);
          background: #fff;
        }

        .studio-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .studio-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }

        .studio-notice {
          margin-top: 13px;
          padding: 11px 12px;
          border-radius: 8px;
          background: var(--syp-cream);
          color: var(--syp-brown);
          font-size: 12px;
        }

        .studio-preview-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .studio-count {
          font-size: 11px;
          font-weight: 700;
          color: var(--syp-brown);
          background: var(--syp-cream);
          border-radius: 30px;
          padding: 8px 11px;
          white-space: nowrap;
        }

        .studio-empty {
          min-height: 220px;
          border: 1px dashed #d8cfc1;
          border-radius: 12px;
          display: grid;
          place-items: center;
          padding: 30px;
          text-align: center;
          color: var(--syp-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .sticker-list {
          display: grid;
          gap: 13px;
        }

        .sticker-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--syp-border);
          border-radius: 12px;
          background: #fff;
          min-width: 0;
        }

        .sticker-thumb {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 80 / 50;
          margin-inline: auto;
          background: #fff;
          overflow: hidden;
        }

        .sticker-row-actions {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .small-action {
          border: 1px solid #ded6cb;
          background: #fff;
          color: var(--syp-brown);
          padding: 8px 10px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .small-action:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* LANDSCAPE STICKER: 80 mm wide x 50 mm high */

        .sticker-sheet {
          display: none;
          width: 80mm;
          height: 50mm;
          min-height: 50mm;
          max-height: 50mm;
          margin: 0;
          padding: 0;
          background: #fff;
          overflow: hidden;
        }

        .sticker-art {
          width: 80mm;
          height: 50mm;
          min-width: 80mm;
          min-height: 50mm;
          max-width: 80mm;
          max-height: 50mm;
          display: grid;
          grid-template-columns: 21mm minmax(0, 1fr) 15mm;
          grid-template-rows: minmax(0, 1fr) auto;
          column-gap: 2.5mm;
          align-items: center;
          padding: 3mm;
          overflow: hidden;
          background: #fff;
          color: #30271f;
          font-family: Arial, Helvetica, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .sticker-logo-area {
          grid-column: 1;
          grid-row: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 0;
          text-align: center;
        }

        .sticker-logo {
          display: block;
          width: 19mm;
          height: 19mm;
          object-fit: contain;
          margin: 0 auto 1.5mm;
        }

        .sticker-brand-name {
          width: 100%;
          font-size: 7pt;
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -0.025em;
          white-space: nowrap;
        }

        .sticker-tagline {
          margin-top: 1mm;
          font-size: 3.7pt;
          line-height: 1.1;
          letter-spacing: 0.04em;
          color: #786b5d;
          font-weight: 700;
          white-space: nowrap;
        }

        .sticker-details {
          grid-column: 2;
          grid-row: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          overflow: hidden;
          padding-left: 2mm;
          border-left: 0.35mm solid #d9d0c4;
        }

        .sticker-customer {
          width: 100%;
          font-size: 6pt;
          line-height: 1.15;
          font-weight: 700;
          margin-bottom: 1.5mm;
          overflow-wrap: anywhere;
        }

        .sticker-drink {
          width: 100%;
          margin: 0 0 2mm;
          font-size: 18pt;
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -0.045em;
          overflow-wrap: anywhere;
        }

        .sticker-size {
          display: inline-block;
          margin-bottom: 1.5mm;
          padding: 1mm 1.5mm;
          border: 0.35mm solid #49372a;
          border-radius: 1mm;
          font-size: 7pt;
          line-height: 1;
          font-weight: 900;
        }

        .sticker-options {
          width: 100%;
          font-size: 7pt;
          line-height: 1.35;
          font-weight: 700;
          color: #51463a;
          overflow-wrap: anywhere;
        }

        .sticker-notes {
          width: 100%;
          margin-top: 1.5mm;
          font-size: 6pt;
          line-height: 1.2;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .sticker-qr-area {
          grid-column: 3;
          grid-row: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 0;
          text-align: center;
        }

        .sticker-qr {
          display: block;
          width: 13mm;
          height: 13mm;
          object-fit: contain;
        }

        .sticker-scan {
          margin-top: 1mm;
          font-size: 5pt;
          font-weight: 900;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .sticker-website {
          margin-top: 1mm;
          font-size: 4.2pt;
          color: #786b5d;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .sticker-footer {
          grid-column: 1 / span 3;
          grid-row: 2;
          width: 100%;
          border-top: 0.3mm solid #d9d0c4;
          padding-top: 1.5mm;
          margin-top: 1.5mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2mm;
          font-size: 5pt;
          line-height: 1.1;
          color: #786b5d;
          font-weight: 700;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .studio-layout {
            grid-template-columns: 1fr;
          }

          .studio-top {
            align-items: flex-start;
          }
        }

        @media (max-width: 520px) {
          .studio-shell {
            padding: 18px 12px 30px;
          }

          .studio-panel {
            padding: 16px;
            border-radius: 14px;
          }

          .studio-brand img {
            width: 43px;
            height: 43px;
          }

          .studio-brand p {
            font-size: 8px;
            letter-spacing: 0.1em;
          }

          .studio-back {
            padding: 9px 10px;
            font-size: 10px;
          }

          .sticker-row {
            grid-template-columns: 1fr;
          }

          .sticker-row-actions {
            flex-direction: row;
          }
        }

        @page {
          size: 80mm 50mm;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 80mm !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .sticker-sheet,
          .sticker-sheet * {
            visibility: visible !important;
          }

          .studio-shell,
          .studio-layout,
          .studio-panel,
          .sticker-list {
            display: block !important;
            width: 80mm !important;
            min-width: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .studio-top,
          .studio-form-panel,
          .studio-preview-head,
          .studio-empty,
          .sticker-row-actions,
          .studio-notice,
          .studio-actions,
          .studio-muted {
            display: none !important;
          }

          .sticker-list {
            display: block !important;
          }

          .sticker-row {
            display: block !important;
            width: 80mm !important;
            min-width: 0 !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #fff !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .sticker-thumb {
            display: none !important;
          }

          .sticker-sheet {
            display: block !important;
            position: relative !important;
            width: 80mm !important;
            height: 50mm !important;
            min-width: 0 !important;
            min-height: 50mm !important;
            max-width: none !important;
            max-height: 50mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
          }

          .sticker-row:last-child .sticker-sheet {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          body.printing-one .sticker-sheet {
            display: none !important;
            page-break-after: auto !important;
            break-after: auto !important;
          }

          body.printing-one .sticker-sheet.print-selected {
            display: block !important;
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .sticker-art {
            display: grid !important;
            grid-template-columns: 21mm minmax(0, 1fr) 15mm !important;
            grid-template-rows: minmax(0, 1fr) auto !important;
            width: 80mm !important;
            height: 50mm !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 3mm !important;
            overflow: hidden !important;
            transform: none !important;
            zoom: 1 !important;
            background: #fff !important;
            color: #30271f !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .sticker-logo,
          .sticker-qr {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <header className="studio-top">
        <div className="studio-brand">
          <img
            src={LOGO_URL}
            alt="SYP ON CAFÉ logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div>
            <h1>SYP Sticker Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </div>

        <a className="studio-back" href="/">
          ← Back to website
        </a>
      </header>

      <div className="studio-layout">
        <section className="studio-panel studio-form-panel">
          <h2>Create drink stickers</h2>
          <p className="studio-muted">
            Clean landscape labels with a large logo and easy-to-read drink
            details. Sticker size: 80 × 50 mm.
          </p>

          <div className="studio-field">
            <label htmlFor="customer">Customer name (optional)</label>
            <input
              id="customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={42}
            />
          </div>

          <div className="studio-field">
            <label htmlFor="drink">Drink name *</label>
            <input
              id="drink"
              value={drink}
              onChange={(e) => setDrink(e.target.value)}
              placeholder="e.g. Spanish Latte"
              maxLength={42}
            />
          </div>

          <div className="studio-two">
            <div className="studio-field">
              <label htmlFor="size">Cup size</label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option>16 oz</option>
                <option>22 oz</option>
                <option>Hot 8 oz</option>
                <option>Hot 12 oz</option>
                <option>Custom size</option>
              </select>
            </div>

            <div className="studio-field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                  )
                }
              />
            </div>
          </div>

          <div className="studio-two">
            <div className="studio-field">
              <label htmlFor="ice">Ice preference</label>
              <select
                id="ice"
                value={ice}
                onChange={(e) => setIce(e.target.value)}
              >
                <option>Regular ice</option>
                <option>Less ice</option>
                <option>No ice</option>
                <option>Extra ice</option>
                <option>Hot</option>
              </select>
            </div>

            <div className="studio-field">
              <label htmlFor="sugar">Sugar preference</label>
              <select
                id="sugar"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
              >
                <option>Regular sugar</option>
                <option>Less sugar</option>
                <option>Half sugar</option>
                <option>No sugar</option>
                <option>Extra sugar</option>
              </select>
            </div>
          </div>

          <div className="studio-field">
            <label htmlFor="notes">Custom notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Oat milk, no whipped cream"
              maxLength={100}
            />
          </div>

          <div className="studio-field">
            <label htmlFor="dateTime">Manila date &amp; time</label>
            <input id="dateTime" value={dateTime} readOnly />
          </div>

          <button
            className="studio-button"
            type="button"
            onClick={addStickers}
          >
            + Add to sticker queue
          </button>

          {notice && (
            <div className="studio-notice" role="status">
              {notice}
            </div>
          )}

          <div className="studio-actions">
            <button
              className="studio-button secondary"
              type="button"
              onClick={clearForm}
            >
              Clear form
            </button>

            <button
              className="studio-button secondary"
              type="button"
              onClick={clearQueue}
            >
              Clear queue
            </button>
          </div>
        </section>

        <section className="studio-panel">
          <div className="studio-preview-head">
            <div>
              <h2>Print queue</h2>
              <p className="studio-muted" style={{ marginBottom: 0 }}>
                80 × 50 mm landscape • Large logo • Clear text
              </p>
            </div>

            <span className="studio-count">
              {stickers.length} sticker{stickers.length === 1 ? "" : "s"}
            </span>
          </div>

          {!stickers.length ? (
            <div className="studio-empty">
              Your sticker preview will appear here.
              <br />
              Add a drink to get started.
            </div>
          ) : (
            <div className="sticker-list">
              {stickers.map((sticker) => (
                <div className="sticker-row" key={sticker.id}>
                  <div className="sticker-thumb">
                    <StickerArt sticker={sticker} qrUrl={qrUrl} />
                  </div>

                  <div className="sticker-row-actions">
                    <button
                      className="small-action"
                      type="button"
                      disabled={printing}
                      onClick={() => printOne(sticker.id)}
                    >
                      Print / reprint
                    </button>

                    <button
                      className="small-action"
                      type="button"
                      disabled={printing}
                      onClick={() => removeSticker(sticker.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div
                    className="sticker-sheet"
                    data-sticker-id={sticker.id}
                  >
                    <StickerArt sticker={sticker} qrUrl={qrUrl} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="studio-actions">
            <button
              className="studio-button"
              type="button"
              onClick={printAll}
              disabled={!stickers.length || printing}
            >
              {printing ? "Preparing print..." : "Print all stickers"}
            </button>

            <button
              className="studio-button secondary"
              type="button"
              onClick={printAll}
              disabled={!stickers.length || printing}
            >
              Reprint queue
            </button>
          </div>

          <p
            className="studio-muted"
            style={{ marginTop: 15, marginBottom: 0 }}
          >
            Set printer paper size to 80 × 50 mm, Landscape, 100% / Actual Size,
            and margins to None. Disable headers and footers. Test one sticker
            first.
          </p>
        </section>
      </div>
    </main>
  );
}

function StickerArt({
  sticker,
  qrUrl,
}: {
  sticker: Sticker;
  qrUrl: string;
}) {
  return (
    <div className="sticker-art">
      <div className="sticker-logo-area">
        <img
          className="sticker-logo"
          src={LOGO_URL}
          alt="SYP ON CAFÉ logo"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="sticker-brand-name">SYP ON CAFÉ</div>
        <div className="sticker-tagline">STREET • ICED • BREWED</div>
      </div>

      <div className="sticker-details">
        {sticker.customer && (
          <div className="sticker-customer">
            FOR: {sticker.customer}
          </div>
        )}

        <div className="sticker-drink">{sticker.drink}</div>

        <div className="sticker-size">{sticker.size}</div>

        <div className="sticker-options">
          {sticker.ice}
          <br />
          {sticker.sugar}
        </div>

        {sticker.notes && (
          <div className="sticker-notes">NOTE: {sticker.notes}</div>
        )}
      </div>

      <div className="sticker-qr-area">
        <img className="sticker-qr" src={qrUrl} alt="SYP ON CAFÉ QR code" />
        <div className="sticker-scan">SCAN HERE</div>
        <div className="sticker-website">syponcafe.shop</div>
      </div>

      <div className="sticker-footer">
        <span>{sticker.dateTime}</span>
        <span>SYP ON CAFÉ • STREET • ICED • BREWED</span>
      </div>
    </div>
  );
}
