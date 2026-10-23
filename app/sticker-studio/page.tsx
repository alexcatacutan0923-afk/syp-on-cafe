
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
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const update = () => setDateTime(manilaDateTime());
    update();

    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=2&ecc=H&data=${encodeURIComponent(
        QR_TARGET,
      )}`,
    [],
  );

  function addStickers() {
    if (!drink.trim()) {
      setNotice("Ilagay muna ang drink name bago gumawa ng sticker.");
      return;
    }

    const createdAt = manilaDateTime();
    const safeQuantity = Math.max(1, Math.min(100, quantity));

    const added: Sticker[] = Array.from(
      { length: safeQuantity },
      (_, index) => ({
        id: nextId + index,
        customer: customer.trim(),
        drink: drink.trim(),
        size,
        ice,
        sugar,
        notes: notes.trim(),
        dateTime: createdAt,
        theme,
      }),
    );

    setStickers((current) => [...current, ...added]);
    setNextId((current) => current + added.length);
    setNotice(
      `${added.length} sticker${added.length > 1 ? "s" : ""} added to the print queue.`,
    );
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
            const finish = () => resolve();
            img.addEventListener("load", finish, { once: true });
            img.addEventListener("error", finish, { once: true });
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
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  function cleanupStickerPrint() {
    document.body.classList.remove("printing-one");

    document
      .querySelectorAll<HTMLElement>(".sticker-sheet")
      .forEach((node) => node.classList.remove("print-selected"));

    window.removeEventListener("afterprint", handleAfterPrint);
    setPrinting(false);
  }

  function handleAfterPrint() {
    cleanupStickerPrint();
  }

  async function printAll() {
    if (!stickers.length || printing) {
      if (!stickers.length) {
        setNotice("Wala pang stickers sa print queue. Gumawa muna ng sticker.");
      }
      return;
    }

    cleanupStickerPrint();
    setPrinting(true);
    setNotice("Preparing stickers for printing...");

    try {
      await prepareStickerPrint();
      setNotice("");

      window.addEventListener("afterprint", handleAfterPrint, {
        once: true,
      });

      window.print();
    } catch {
      cleanupStickerPrint();
      setNotice("Hindi naihanda ang print. Subukan ulit.");
    }
  }

  async function printOne(id: number) {
    if (!stickers.some((sticker) => sticker.id === id) || printing) {
      return;
    }

    cleanupStickerPrint();

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
      cleanupStickerPrint();
      setNotice("Hindi naihanda ang sticker. Subukan ulit.");
    }
  }

  function removeSticker(id: number) {
    setStickers((current) =>
      current.filter((sticker) => sticker.id !== id),
    );
    setNotice("Sticker removed from queue.");
  }

  function clearForm() {
    setCustomer("");
    setDrink("");
    setSize("22 oz");
    setIce("Regular ice");
    setSugar("Regular sugar");
    setNotes("");
    setQuantity(1);
    setTheme("horror");
    setNotice("Form cleared.");
  }

  function clearQueue() {
    setStickers([]);
    setNotice("Sticker queue cleared.");
  }

  return (
    <main className="studio-shell">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap");

        :root {
          --syp-ink: #2f2118;
          --syp-brown: #68452f;
          --syp-gold: #c59a58;
          --syp-cream: #f8f1e6;
          --syp-line: #e8d9c6;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f4eee5;
          color: var(--syp-ink);
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
          width: 58px;
          height: 58px;
          object-fit: contain;
          border-radius: 12px;
          background: #fff;
        }

        .studio-brand h1 {
          margin: 0;
          font-size: clamp(22px, 3vw, 32px);
          letter-spacing: -0.04em;
        }

        .studio-brand p {
          margin: 5px 0 0;
          color: #8b715c;
          font-size: 11px;
          letter-spacing: 0.19em;
          font-weight: 800;
        }

        .studio-back {
          color: var(--syp-brown);
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          border: 1px solid #d8c5af;
          border-radius: 999px;
          padding: 11px 16px;
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
          background: #fffdf9;
          border: 1px solid var(--syp-line);
          border-radius: 22px;
          padding: 23px;
          box-shadow: 0 14px 38px #482f1b0e;
          min-width: 0;
        }

        .studio-panel h2 {
          font-size: 17px;
          margin: 0 0 6px;
        }

        .studio-muted {
          color: #8a7664;
          font-size: 12px;
          line-height: 1.55;
          margin: 0 0 20px;
        }

        .studio-field {
          display: grid;
          gap: 7px;
          margin: 0 0 15px;
        }

        .studio-field label {
          font-size: 11px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #80644c;
          font-weight: 850;
        }

        .studio-field input,
        .studio-field select,
        .studio-field textarea {
          width: 100%;
          min-width: 0;
          border: 1px solid #dfcfbd;
          background: #fff;
          color: #34251a;
          border-radius: 10px;
          padding: 12px;
          font: inherit;
          font-size: 14px;
          outline: none;
        }

        .studio-field input:focus,
        .studio-field select:focus,
        .studio-field textarea:focus {
          border-color: #a67a48;
          box-shadow: 0 0 0 3px #c59a5822;
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
          border: 0;
          border-radius: 11px;
          padding: 13px 16px;
          background: var(--syp-brown);
          color: #fff;
          font-weight: 850;
          cursor: pointer;
          font-size: 13px;
        }

        .studio-button.secondary {
          color: var(--syp-brown);
          background: #efe3d3;
        }

        .studio-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .studio-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 15px;
        }

        .studio-notice {
          padding: 11px 13px;
          border-radius: 10px;
          background: #f5ead8;
          color: #6d4c2e;
          font-size: 12px;
          margin-top: 14px;
        }

        .studio-preview-head {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .studio-count {
          font-size: 11px;
          font-weight: 850;
          color: #8a6c50;
          background: #f3e7d7;
          border-radius: 999px;
          padding: 8px 11px;
          white-space: nowrap;
        }

        .studio-empty {
          min-height: 230px;
          border: 1px dashed #d7c4ae;
          border-radius: 16px;
          display: grid;
          place-items: center;
          padding: 30px;
          text-align: center;
          color: #927a64;
          font-size: 13px;
          line-height: 1.6;
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
          border: 1px solid #e8d9c6;
          border-radius: 14px;
          background: #fffaf3;
          min-width: 0;
        }

        .sticker-thumb {
          width: 100%;
          max-width: 560px;
          aspect-ratio: 50 / 80;
          background: #fff;
          overflow: hidden;
          margin-inline: auto;
        }

        .sticker-row-actions {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .small-action {
          border: 1px solid #d8c4ad;
          background: #fff;
          color: #67472f;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .small-action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* PORTRAIT STICKER: 50 mm wide x 80 mm high */
        .sticker-sheet {
          display: none;
          width: 50mm;
          height: 80mm;
          min-height: 80mm;
          max-height: 80mm;
          padding: 0;
          margin: 0;
          background: #fff;
          color: #000;
          overflow: hidden;
        }

        .sticker-art {
          position: relative;
          isolation: isolate;
          width: 50mm;
          height: 80mm;
          min-width: 50mm;
          min-height: 80mm;
          max-width: 50mm;
          max-height: 80mm;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          background: #fff;
          color: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          text-align: left;
          transform: none;
        }

        .sticker-art.theme-horror {
          --theme-ink: #111;
        }

        .sticker-art.theme-regular {
          --theme-ink: #38271b;
        }

        .sticker-art.theme-christmas,
        .sticker-art.theme-valentines {
          --theme-ink: #111;
        }

        .theme-artwork {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .sticker-main {
          position: relative;
          z-index: 1;
          background: #fff;
          border: 0.45mm solid var(--theme-ink, #000);
          outline: 0.25mm solid var(--theme-ink, #000);
          outline-offset: -1.25mm;
          padding: 1.5mm;
          margin: 2.5mm;
          width: calc(100% - 5mm);
          height: calc(100% - 5mm);
          min-height: 0;
          box-shadow: 0 0 0 0.7mm #fff;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 12mm;
          grid-template-rows: auto auto minmax(0, 1fr) auto;
          column-gap: 1.2mm;
          row-gap: 1mm;
          overflow: hidden;
        }

        .sticker-head {
          grid-column: 1 / span 2;
          grid-row: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 1.2mm;
          min-width: 0;
          border-bottom: 0.45mm solid #000;
          padding: 0 0 1.2mm;
        }

        .sticker-logo {
          width: 9mm;
          height: 9mm;
          object-fit: contain;
          flex: 0 0 auto;
          background: #fff;
        }

        .sticker-wordmark {
          min-width: 0;
          width: 100%;
        }

        .sticker-wordmark strong {
          display: block;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.045em;
          white-space: nowrap;
          color: #000;
        }

        .sticker-wordmark span {
          display: block;
          margin-top: 0.7mm;
          font-size: 4pt;
          font-weight: 900;
          letter-spacing: 0.04em;
          white-space: nowrap;
          color: #000;
        }

        .sticker-qr {
          grid-column: 2;
          grid-row: 2 / span 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 1mm;
          min-width: 0;
        }

        .sticker-qr img {
          display: block;
          width: 11mm;
          height: 11mm;
          object-fit: contain;
        }

        .sticker-qr span {
          font-size: 4.5pt;
          margin-top: 0.5mm;
          font-weight: 900;
          white-space: nowrap;
        }

        .sticker-details {
          grid-column: 1;
          grid-row: 2 / span 2;
          min-width: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding-top: 1mm;
          overflow: hidden;
        }

        .horror-mascot {
          grid-column: 1 / span 2;
          grid-row: 2;
          align-self: stretch;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          min-height: 0;
          height: 19mm;
          overflow: hidden;
          background: #111;
          border: 0.5mm solid #111;
          border-radius: 1.5mm;
          padding: 0.5mm;
        }

        .horror-mascot svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .theme-horror .sticker-details {
          grid-column: 1 / span 2;
          grid-row: 3;
          padding-top: 0;
        }

        .theme-horror .sticker-qr {
          grid-column: 2;
          grid-row: 3;
          justify-content: flex-end;
          padding-bottom: 1mm;
        }

        .theme-horror .sticker-details {
          padding-right: 13mm;
        }

        .theme-regular .horror-mascot,
        .theme-christmas .horror-mascot,
        .theme-valentines .horror-mascot {
          display: none;
        }

        .theme-regular .sticker-main,
        .theme-christmas .sticker-main,
        .theme-valentines .sticker-main {
          grid-template-columns: minmax(0, 1fr) 12mm;
          grid-template-rows: auto minmax(0, 1fr) auto;
        }

        .theme-regular .sticker-head,
        .theme-christmas .sticker-head,
        .theme-valentines .sticker-head {
          grid-column: 1 / span 2;
          grid-row: 1;
        }

        .theme-regular .sticker-details,
        .theme-christmas .sticker-details,
        .theme-valentines .sticker-details {
          grid-column: 1;
          grid-row: 2;
          padding-right: 0;
        }

        .theme-regular .sticker-qr,
        .theme-christmas .sticker-qr,
        .theme-valentines .sticker-qr {
          grid-column: 2;
          grid-row: 2;
          justify-content: flex-start;
          padding-bottom: 0;
        }

        .sticker-customer {
          font-size: 6pt;
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 0.7mm;
          overflow-wrap: anywhere;
        }

        .sticker-drink {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12pt;
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -0.035em;
          overflow-wrap: anywhere;
          margin: 0.5mm 0 1.1mm;
        }

        .sticker-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7mm;
        }

        .sticker-pill {
          border: 0.3mm solid #000;
          border-radius: 1mm;
          padding: 0.45mm 0.8mm;
          font-size: 5pt;
          line-height: 1.1;
          font-weight: 900;
          white-space: nowrap;
        }

        .sticker-notes {
          font-size: 5.5pt;
          font-weight: 800;
          line-height: 1.15;
          margin-top: 1mm;
          overflow-wrap: anywhere;
        }

        .sticker-footer {
          grid-column: 1 / span 2;
          grid-row: 4;
          border-top: 0.6mm double #000;
          margin-top: 1mm;
          padding-top: 0.8mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          gap: 0.8mm;
          font-size: 4.5pt;
          line-height: 1.1;
          font-weight: 800;
          color: #000;
          overflow-wrap: anywhere;
        }

        .theme-horror .sticker-footer {
          grid-row: 4;
        }

        .theme-regular .sticker-footer,
        .theme-christmas .sticker-footer,
        .theme-valentines .sticker-footer {
          grid-column: 1 / span 2;
          grid-row: 3;
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
            padding: 17px;
            border-radius: 16px;
          }

          .studio-brand img {
            width: 46px;
            height: 46px;
          }

          .studio-brand p {
            font-size: 8px;
            letter-spacing: 0.12em;
          }

          .studio-back {
            padding: 9px 11px;
            font-size: 11px;
          }

          .sticker-row {
            grid-template-columns: 1fr;
          }

          .sticker-row-actions {
            flex-direction: row;
          }
        }

        @page {
          size: 50mm 80mm;
          margin: 0;
        }

        @media print {
          html,
          body {
            width: 50mm !important;
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
            width: 50mm !important;
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
            width: 50mm !important;
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
            width: 50mm !important;
            height: 80mm !important;
            min-width: 0 !important;
            min-height: 80mm !important;
            max-width: none !important;
            max-height: 80mm !important;
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
            display: flex !important;
            position: relative !important;
            width: 50mm !important;
            height: 80mm !important;
            min-width: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            transform: none !important;
            zoom: 1 !important;
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .theme-artwork {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
          }

          .sticker-main {
            width: calc(100% - 5mm) !important;
            height: calc(100% - 5mm) !important;
            min-height: 0 !important;
            margin: 2.5mm !important;
            overflow: hidden !important;
          }

          .horror-mascot {
            display: flex !important;
            background: #111 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .theme-regular .horror-mascot,
          .theme-christmas .horror-mascot,
          .theme-valentines .horror-mascot {
            display: none !important;
          }

          .sticker-wordmark strong,
          .sticker-wordmark span,
          .sticker-customer,
          .sticker-drink,
          .sticker-pill,
          .sticker-notes,
          .sticker-footer,
          .sticker-qr span {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }

          .sticker-logo,
          .sticker-qr img {
            visibility: visible !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
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
            Portrait 50 × 80 mm labels designed for thermal printing. Each
            quantity creates a separate sticker.
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
              placeholder="e.g. Oreo Matcha"
              maxLength={42}
            />
          </div>

          <div className="studio-field">
            <label htmlFor="theme">Sticker theme</label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="horror">Undas / Horror</option>
              <option value="regular">Regular SYP</option>
              <option value="christmas">Christmas</option>
              <option value="valentines">Valentine’s</option>
            </select>
            <p className="studio-muted" style={{ margin: 0 }}>
              Theme applies to new stickers added to the queue.
            </p>
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
            <input
              id="dateTime"
              value={dateTime}
              readOnly
              aria-label="Current Manila date and time"
            />
          </div>

          <button
            className="studio-button"
            type="button"
            onClick={addStickers}
          >
            ＋ Add to sticker queue
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
                Each sticker is 50 × 80 mm, portrait. Check printer settings
                for the correct label size and feed direction.
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
              Add a drink on the left to get started.
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
            Print at 100% / Actual size, set margins to None, and disable
            headers and footers. Select the correct 50 × 80 mm portrait label
            size in your printer driver. Test one sticker first.
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
  const isHorror = (sticker.theme || "horror") === "horror";

  return (
    <div className={`sticker-art theme-${sticker.theme || "horror"}`}>
      <ThemeArtwork theme={sticker.theme || "horror"} />

      <div className="sticker-main">
        {isHorror && (
          <div className="horror-mascot" aria-hidden="true">
            <svg viewBox="0 0 100 160" role="presentation">
              <path
                d="M50 8 C25 8 12 28 13 57 L17 88 L28 104 L28 126 L42 118 L50 133 L58 118 L72 126 L72 104 L83 88 L87 57 C88 28 75 8 50 8Z"
                fill="#fff"
                stroke="#fff"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M21 49 L43 59 L29 70Z M79 49 L57 59 L71 70Z" fill="#111" />
              <path
                d="M39 77 L45 84 L50 76 L55 84 L61 77"
                fill="none"
                stroke="#111"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M34 94 L39 104 L45 94 L50 104 L55 94 L61 104 L66 94"
                fill="none"
                stroke="#111"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M50 8 Q45 0 55 2 Q63 4 58 14"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x="50"
                y="151"
                fill="#fff"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
                letterSpacing="1"
              >
                SYP
              </text>
            </svg>
          </div>
        )}

        <div className="sticker-head">
          <img
            className="sticker-logo"
            src={LOGO_URL}
            alt="SYP logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="sticker-wordmark">
            <strong>SYP ON CAFÉ</strong>
            <span>STREET • ICED • BREWED</span>
          </div>
        </div>

        <div className="sticker-qr">
          <img src={qrUrl} alt="QR code to syponcafe.shop" />
          <span>SCAN SYP</span>
        </div>

        <div className="sticker-details">
          {sticker.customer && (
            <div className="sticker-customer">
              FOR: {sticker.customer}
            </div>
          )}

          <div className="sticker-drink">{sticker.drink}</div>

          <div className="sticker-meta">
            <span className="sticker-pill">{sticker.size}</span>
            <span className="sticker-pill">{sticker.ice}</span>
            <span className="sticker-pill">{sticker.sugar}</span>
          </div>

          {sticker.notes && (
            <div className="sticker-notes">NOTE: {sticker.notes}</div>
          )}
        </div>

        <div className="sticker-footer">
          <span>{sticker.dateTime}</span>
          <span>syponcafe.shop</span>
        </div>
      </div>
    </div>
  );
}

function ThemeArtwork({ theme }: { theme: string }) {
  const ink = theme === "regular" ? "#38271b" : "#111111";

  const common = {
    fill: "none",
    stroke: ink,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      className="theme-artwork"
      viewBox="0 0 320 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`pattern-${theme}`}
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          {theme === "horror" && (
            <g {...common}>
              <path d="M0 0 Q15 6 30 0 M0 0 Q6 15 0 30 M30 0 Q24 15 30 30 M0 30 Q15 24 30 30" />
              <circle cx="15" cy="15" r="2" />
              <path d="M15 15 L0 0 M15 15 L30 0 M15 15 L0 30 M15 15 L30 30" />
            </g>
          )}

          {theme === "regular" && (
            <g {...common}>
              <ellipse
                cx="14"
                cy="14"
                rx="5"
                ry="9"
                transform="rotate(-35 14 14)"
              />
              <path d="M9 7 Q14 14 19 21" />
              <path d="M22 3 Q27 8 22 13 Q17 8 22 3Z" />
            </g>
          )}

          {theme === "christmas" && (
            <g {...common}>
              <path d="M15 3 V27 M3 15 H27 M6.5 6.5 L23.5 23.5 M23.5 6.5 L6.5 23.5" />
              <circle cx="15" cy="15" r="3" />
            </g>
          )}

          {theme === "valentines" && (
            <g {...common}>
              <path d="M14 23 C10 19 3 14 5 9 C7 4 12 6 14 10 C17 5 23 5 24 10 C26 15 18 20 14 23Z" />
              <path d="M2 27 Q14 22 27 27" />
            </g>
          )}
        </pattern>
      </defs>

      <rect
        width="320"
        height="200"
        fill={`url(#pattern-${theme})`}
        opacity=".65"
      />

      <rect
        x="3"
        y="3"
        width="314"
        height="194"
        rx="5"
        fill="none"
        stroke={ink}
        strokeWidth="2.5"
      />

      <rect
        x="7"
        y="7"
        width="306"
        height="186"
        rx="3"
        fill="none"
        stroke={ink}
        strokeWidth=".8"
        strokeDasharray="2 3"
      />

      {theme === "horror" && (
        <g {...common}>
          <path d="M0 0 L42 0 L0 42 M320 0 L278 0 L320 42 M0 200 L42 200 L0 158 M320 200 L278 200 L320 158" />
          <circle cx="20" cy="25" r="9" />
          <path d="M11 22 L17 26 L22 20 L29 26 M14 31 L27 31" />
          <path d="M300 15 L305 24 L300 33 L295 24Z M292 24 H308" />
        </g>
      )}

      {theme === "regular" && (
        <g {...common}>
          <ellipse cx="18" cy="22" rx="5" ry="9" />
          <path d="M15 16 Q22 22 20 28 M302 22 l-5 -8 l-5 8 l5 8Z M18 178 l-5 -8 l-5 8 l5 8Z M302 178 l-5 -8 l-5 8 l5 8Z" />
        </g>
      )}

      {theme === "christmas" && (
        <g {...common}>
          <path d="M20 12 V30 M11 21 H29 M14 15 L26 27 M26 15 L14 27 M300 12 V30 M291 21 H309 M294 15 L306 27 M306 15 L294 27 M20 170 V188 M11 179 H29 M300 170 V188 M291 179 H309" />
        </g>
      )}

      {theme === "valentines" && (
        <g {...common}>
          <path d="M20 32 C13 26 5 20 9 14 C12 9 18 12 20 16 C24 10 31 11 33 16 C36 23 26 29 20 32Z M300 32 C293 26 285 20 289 14 C292 9 298 12 300 16 C304 10 311 11 313 16 C316 23 306 29 300 32Z M20 168 C13 162 5 156 9 150 C12 145 18 148 20 152 C24 146 31 147 33 152 C36 159 26 165 20 168Z M300 168 C293 162 285 156 289 150 C292 145 298 148 300 152 C304 146 311 147 313 152 C316 159 306 165 300 168Z" />
        </g>
      )}
    </svg>
  );
}
