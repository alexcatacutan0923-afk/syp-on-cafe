"use client";

import { useMemo, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
const FACEBOOK_URL = "https://www.facebook.com/SypOnCafe";

export default function CupWrapPage() {
  const [cup, setCup] = useState<"16oz" | "22oz">("16oz");
  const [quote, setQuote] = useState("THANKS FOR SUPPORTING SMALL BUSINESS!");
  const [drinkName, setDrinkName] = useState("Spanish Latte");
  const [customerName, setCustomerName] = useState("");
  const [orderNumber, setOrderNumber] = useState("001");
  const [orderDateTime, setOrderDateTime] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [showQr, setShowQr] = useState(true);

  // Starting estimates only: measure the actual cup before printing.
  const wrapLength = cup === "16oz" ? 250 : 280;
  const wrapHeight = 45;
  const qrUrl = useMemo(
    () => "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=1&data=" + encodeURIComponent(FACEBOOK_URL),
    [],
  );

  return (
    <main className="wrap-page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4eee5; color: #342317; font-family: Arial, sans-serif; }
        .wrap-page { min-height: 100vh; padding: 22px; }
        .wrap-shell { max-width: 1000px; margin: 0 auto; }
        .wrap-head { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
        .wrap-head img { width:58px; height:58px; object-fit:contain; border-radius:12px; background:#fff; }
        .wrap-head h1 { margin:0; font-size:clamp(22px,4vw,32px); }
        .wrap-head p { margin:5px 0 0; color:#85664b; font-size:11px; font-weight:800; letter-spacing:.13em; }
        .wrap-grid { display:grid; grid-template-columns:280px minmax(0,1fr); gap:18px; align-items:start; }
        .wrap-panel { background:#fffdf9; border:1px solid #e5d4c1; border-radius:16px; padding:18px; min-width:0; }
        .wrap-panel h2 { font-size:17px; margin:0 0 8px; }
        .wrap-muted { font-size:12px; color:#856f5a; line-height:1.55; }
        .wrap-field { display:grid; gap:7px; margin:14px 0; }
        .wrap-field label { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; }
        .wrap-field select,.wrap-field input { width:100%; border:1px solid #d9c4ac; border-radius:9px; padding:11px; background:white; color:#342317; }
        .wrap-btn { border:0; border-radius:9px; padding:12px 14px; background:#62442e; color:white; font-weight:800; cursor:pointer; }
        .wrap-btn.secondary { background:#eee1d0; color:#62442e; }
        .wrap-preview { overflow-x:auto; padding:14px; background:#e7d8c6; border-radius:12px; }
        .wrap-art { width:100%; min-width:620px; aspect-ratio:280 / 45; display:grid; grid-template-columns:1.2fr 1fr 1fr .65fr; gap:9px; align-items:center; padding:10px 14px; background:#43291b; color:#f8e9d1; border:2px solid #d2a879; }
        .wrap-block { height:100%; min-width:0; display:flex; flex-direction:column; justify-content:center; border-right:1px solid #b78b63; padding-right:8px; }
        .wrap-script { font-family:Georgia,serif; font-style:italic; font-weight:800; font-size:clamp(14px,2vw,23px); line-height:1.05; }
        .wrap-brand { font-size:clamp(16px,2.5vw,27px); font-weight:900; letter-spacing:.03em; line-height:1; }
        .wrap-tag { font-size:9px; font-weight:800; letter-spacing:.12em; margin-top:5px; }
        .wrap-drink { font-size:clamp(17px,2.5vw,30px); font-weight:900; text-align:center; line-height:1.05; overflow-wrap:anywhere; }\n        .wrap-order-meta { font-size:8px; font-weight:800; line-height:1.4; margin-top:5px; overflow-wrap:anywhere; }\n        .wrap-quote { font-family:Georgia,serif; font-size:clamp(12px,1.8vw,19px); font-style:italic; font-weight:800; line-height:1.12; }
        .wrap-logo { width:58px; height:58px; object-fit:contain; background:#fff; padding:2px; border-radius:5px; align-self:center; margin-bottom:4px; }\n        .wrap-qr { width:54px; height:54px; object-fit:contain; background:white; padding:2px; }
        .wrap-social { font-size:8px; font-weight:800; margin-top:4px; overflow-wrap:anywhere; }
        .wrap-notes { font-size:12px; line-height:1.55; color:#70553e; }
        @media(max-width:760px) { .wrap-page { padding:12px; } .wrap-grid { grid-template-columns:1fr; } }
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body { margin:0!important; padding:0!important; background:white!important; }
          body * { visibility:hidden!important; }
          .wrap-print-target, .wrap-print-target * { visibility:visible!important; }
          .wrap-page { padding:0!important; margin:0!important; }
          .wrap-shell, .wrap-head, .wrap-grid, .wrap-panel { display:block!important; width:80mm!important; max-width:80mm!important; margin:0!important; padding:0!important; border:0!important; background:white!important; }
          .wrap-head, .wrap-controls, .wrap-preview, .wrap-instructions { display:none!important; }
          .wrap-print-target { display:block!important; position:fixed!important; left:0!important; top:0!important; width:80mm!important; height:${wrapLength}mm!important; overflow:hidden!important; }
          .wrap-print-art { position:absolute!important; left:0!important; top:0!important; width:${wrapLength}mm!important; height:${wrapHeight}mm!important; transform-origin:top left!important; transform:translateX(80mm) rotate(90deg)!important; display:grid!important; grid-template-columns:1.2fr 1fr 1fr .65fr!important; gap:2mm!important; padding:2mm!important; background:#43291b!important; color:#f8e9d1!important; border:1px solid #d2a879!important; print-color-adjust:exact!important; -webkit-print-color-adjust:exact!important; }
          .wrap-print-art .wrap-script { font-size:16pt!important; }
          .wrap-print-art .wrap-brand { font-size:17pt!important; }
          .wrap-print-art .wrap-quote { font-size:13pt!important; }\n          .wrap-print-art .wrap-drink { font-size:17pt!important; }\n          .wrap-print-art .wrap-order-meta { font-size:6pt!important; }\n          .wrap-print-art .wrap-logo { width:14mm!important; height:14mm!important; object-fit:contain!important; }
          .wrap-print-art .wrap-qr { width:13mm!important; height:13mm!important; }
          .wrap-print-art .wrap-social { font-size:6pt!important; }
          .wrap-print-art .wrap-tag { font-size:6pt!important; }
        }
      `}</style>

      <div className="wrap-shell">
        <header className="wrap-head">
          <img src={LOGO_URL} alt="SYP ON CAFÉ logo" />
          <div>
            <h1>SYP Cup Wrap Studio</h1>
            <p>STREET • ICED • BREWED</p>
          </div>
        </header>

        <div className="wrap-grid">
          <section className="wrap-panel wrap-controls">
            <h2>Customize cup wrap</h2>
            <p className="wrap-muted">Long horizontal full-wrap design para sa thermal roll paper. Brown and cream café look, with large readable messages.</p>
            <div className="wrap-field">
              <label htmlFor="cup-size">Cup size</label>
              <select id="cup-size" value={cup} onChange={(e) => setCup(e.target.value as "16oz" | "22oz")}>
                <option value="16oz">16oz — estimated 250mm wrap</option>
                <option value="22oz">22oz — estimated 280mm wrap</option>
              </select>
            </div>
            <div className="wrap-field">
              <label htmlFor="main-quote">Large quote</label>
              <input id="main-quote" value={quote} onChange={(e) => setQuote(e.target.value.slice(0, 70))} maxLength={70} />
            </div>
            <div className="wrap-field">
              <label><input type="checkbox" checked={showQr} onChange={(e) => setShowQr(e.target.checked)} /> Include Facebook QR</label>
            </div>
            <button className="wrap-btn" onClick={() => window.print()}>Print cup wrap</button>
            <p className="wrap-muted">Print using thermal printer with continuous 80mm paper, portrait feed, and scaling at 100% / Actual size. Test on plain paper first.</p>
          </section>

          <section className="wrap-panel">
            <h2>360° wrap preview · {cup}</h2>
            <p className="wrap-muted">Preview only. Measure your actual cup circumference and wrap height before final printing.</p>
            <div className="wrap-preview">
              <WrapArt quote={quote} showQr={showQr} qrUrl={qrUrl} drinkName={drinkName} customerName={customerName} orderNumber={orderNumber} orderDateTime={orderDateTime} />
            </div>
            <div className="wrap-instructions wrap-notes">
              <p><strong>Important:</strong> 250mm (16oz) and 280mm (22oz) are starting estimates, not guaranteed fit. Cups vary by brand and taper. Measure around the cup where the strip will sit, then adjust the length in code if needed.</p>
              <p>For ordinary thermal paper, the print will be monochrome (black on paper). The brown/cream color is a design preview; thermal printers do not print brown ink. Use the wrap as a long paper band and secure the ends with tape.</p>
              <p>Facebook destination: <strong>facebook.com/SypOnCafe</strong></p>
            </div>
          </section>
        </div>

        <div className="wrap-print-target" aria-hidden="true">
          <div className="wrap-print-art">
            <div className="wrap-block">
              <div className="wrap-script">Thanks for<br />Supporting<br />Small Business!</div>
            </div>
            <div className="wrap-block">
              <div className="wrap-brand">SYP ON CAFÉ</div>
              <div className="wrap-tag">STREET • ICED • BREWED</div>
              
            </div>
            <div className="wrap-block">
              <div className="wrap-quote">{quote || "Good Drinks, Better Days"}</div>
              <div className="wrap-tag">SALAMAT SA SUPPORT, KASYP ♡</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {showQr && <img className="wrap-qr" src={qrUrl} alt="Facebook QR" />}
              <div className="wrap-social">/SypOnCafe</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function WrapArt({ quote, showQr, qrUrl, drinkName, customerName, orderNumber, orderDateTime }: { quote: string; showQr: boolean; qrUrl: string; drinkName: string; customerName: string; orderNumber: string; orderDateTime: string }) {
  return (
    <div className="wrap-art">
      <div className="wrap-block">
        <img className="wrap-logo" src={LOGO_URL} alt="SYP ON CAFÉ logo" />
        <div className="wrap-script">Thanks for<br />Supporting<br />Small Business!</div>
      </div>
      <div className="wrap-block">
        <div className="wrap-brand">SYP ON CAFÉ</div>
        <div className="wrap-tag">STREET • ICED • BREWED</div>
        <div className="wrap-drink">{drinkName || "YOUR DRINK"}</div>
        <div className="wrap-order-meta">
          {customerName ? <>FOR: {customerName}<br /></> : null}
          ORDER #{orderNumber || "—"}<br />
          {orderDateTime ? new Date(orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}
        </div>
      </div>
      <div className="wrap-block">
        <div className="wrap-quote">{quote || "Good Drinks, Better Days"}</div>
        <div className="wrap-tag">SALAMAT SA SUPPORT, KASYP ♡</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {showQr && <img className="wrap-qr" src={qrUrl} alt="Facebook QR" />}
        <div className="wrap-social">/SypOnCafe</div>
      </div>
    </div>
  );
}
