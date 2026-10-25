"use client";

import { useMemo, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
const FACEBOOK_URL = "https://www.facebook.com/SypOnCafe";

const QUOTE_STARTS = [
  "Kape muna, ", "Iced coffee kasi ", "Hindi ako tamad, ", "Adulting na naman, ",
  "Puyat pero ", "Walang jowa pero ", "Wallet ko payat, ", "Pahinga saglit, ",
  "Kung stressed ka, ", "Dasurv mo ’to, ", "Bawal sumuko, ", "Ang buhay ay ",
  "Love yourself, ", "Kape ang sagot, ", "Pagod na ang beshie, ", "Trabaho nang trabaho, ",
  "Laban lang, ", "Manifesting na ", "Budget kuno, ", "Sabi ko isa lang, ",
  "Nagtitipid ako, ", "May problema? ", "Hindi lahat ng ", "Kung walang plot twist, ",
  "Lowbat na ako, ", "Puso ko marupok, ", "Minsan kailangan lang ", "Wag kang mag-alala, ",
  "Chill ka lang, ", "Main character ka, ", "Kape muna bago ", "Gising pa rin dahil ",
  "Sana all, ", "Walang forever pero ", "Petsa de peligro, ", "Ang importante, ",
  "Kung pagod ka na, ", "Hindi man mayaman, ", "Self-care muna, ", "Buhay ay maikli, ",
  "Kape ang therapy, ", "May exam bukas, ", "May deadline mamaya, ", "Hindi ako late, ",
  "Sabi ng puso ko, ", "Sabi ng utak ko, ", "Nandito para sa kape, ", "Tambay responsibly, ",
  "Konting sip lang, ", "Kaya pa ’yan, ", "Walang perfect, ", "Laban mga ka-SYP, ",
  "Kalmado lang kunwari, ", "Ngiti muna, ", "Hinga nang malalim, ", "Kapag may sahod, ",
  "Kapag walang sahod, ", "Ang tunay na plot twist, ", "Minsan ang sagot ay ", "Sana kasing tamis ng kape "
];

const QUOTE_ENDINGS = [
  "ang problema, bukas na.", "kape muna bago breakdown.", "pero cute pa rin.", "at least may caffeine.",
  "bahala na si future me.", "ang bills, hindi nawawala.", "pero laban pa rin.", "deserve ko ng extra shot.",
  "hindi kasama sa budget.", "pero masarap ang buhay.", "wag lang maubusan ng yelo.", "kaya natin ’to, besh.",
  "at least may iced coffee.", "sa susunod na sweldo na.", "sana all may pahinga.", "wag lang i-chat ang ex.",
  "pahinga, hindi pagsuko.", "ang importante, may kape.", "puso lang ang walang sukli.", "kaya pala kailangan ng large.",
  "pero order muna tayo.", "hindi bayad ang overthink.", "may free therapy sa bawat sip.", "bukas na ang pagiging productive.",
  "hindi lahat nadadaan sa tulog.", "pero may pag-asa pa.", "kape muna bago desisyon.", "mas okay kapag may kasama.",
  "ang tunay na love language ay fries.", "hindi dapat minamadali ang happiness.", "pero ubos na ang allowance.",
  "pahingi naman ng plot armor.", "sana pati sweldo, extra large.", "pero hindi tayo susuko.", "at least hindi tubig ang order.",
  "wag kalimutang mag-water din.", "konting arte, malaking saya.", "may resibo ang kaligayahan.", "basta may kape, may laban.",
  "hindi lahat ng tahimik ay okay.", "pero okay lang magpahinga.", "ang stress, walang loyalty card.", "ang saya, dagdagan ng pearls.",
  "piliin ang peace at cheese fries.", "hindi kasama ang problema sa refill.", "mas masarap kapag libre—charot.", "puro ka na lang 'next time'.",
  "pero sige, one day at a time.", "ang importante, hindi ka nag-give up.", "may caffeine, may chance.", "hindi ito gastos, investment sa mood.",
  "wag puro seen, mag-reply ka rin.", "pero hindi tayo marupok ngayon.", "sana all may extra income.", "hindi lahat ng tanong kailangan sagutin.",
  "ang tunay na glow-up ay tulog.", "sana may add-to-cart sa sahod.", "pero chill muna tayo tonight.", "kaya order ka na, deserve mo ’yan.",
  "hindi lahat ng desisyon dapat 3AM.", "may bukas pa para magpaka-responsable.", "wag lang maubos ang pasensya.", "basta wag kalimutan ang sarili.",
  "at least may dahilan para ngumiti.", "pero wag kalimutan magbayad, besh.", "sana all may stable na Wi-Fi.", "dahan-dahan lang, hindi karera ang buhay.",
  "may kape na, kulang na lang peace of mind.", "at least masaya ang taste buds.", "ang importante, may pang-order ulit.",
  "pahinga ka rin, hindi ka robot.", "hindi ka weak, kailangan mo lang ng kape.", "kahit sabog, present pa rin.",
  "kung di kaya ngayon, sip muna.", "wag gawing personality ang puyat.", "pero ang saya maging KasYP.",
  "kaya ngumiti ka naman diyan.", "ang budget ay suggestion lang—joke!", "pero wag na nating bilangin ang calories.",
  "sana may promo rin sa responsibilities.", "may bayad ang stress, walang overtime.", "tuloy lang kahit loading ang utak.",
  "ang tunay na flex ay may peace of mind.", "hindi man perfect, at least may caffeine.", "basta masarap, walang debate.",
  "sana pati problema may closing time.", "pwedeng mapagod, bawal mawalan ng kape.", "at least may magandang cup ka.",
  "wag i-overthink ang straw.", "hindi ka nag-iisa, may iced coffee ka.", "small wins count, pati first sip.",
  "ang bukas ay problema ni bukas.", "pero tonight, tambay muna.", "kaya mo ’yan, wag lang walang tulog.",
  "sana lahat ng red flag ay kulay brown sugar.", "mas okay ang mixed feelings kapag mixed coffee.",
  "ang love life ay seasonal, kape ay available.", "kung walang lambing, dagdagan ng whipped cream.",
  "wag i-judge ang order, i-enjoy ang sip.", "hindi lahat ng malaki ay problema—minsan 22oz.",
  "ang tunay na commitment ay bumalik sa SYP.", "at least hindi ka nag-order ng sama ng loob.",
  "kape ang plot twist na deserve mo.", "tama na ang drama, dagdagan ang crema.",
  "kung may problema, upuan muna natin.", "pwedeng magpahinga habang nagcha-charge ang phone.",
  "mas masarap ang buhay kapag may tambayan.", "ang tunay na rich ay may oras mag-chill.",
  "sana ang deadline marunong mag-adjust.", "wag magmadali, natutunaw din ang yelo.",
  "kung walang clue, iced coffee muna.", "hindi lahat ng cravings dapat pigilan.",
  "basta wag lang 'last order' na pala.", "may kape, may kwento, may dahilan bumalik."
];

function getRandomQuote(current = "") {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const start = QUOTE_STARTS[Math.floor(Math.random() * QUOTE_STARTS.length)];
    const ending = QUOTE_ENDINGS[Math.floor(Math.random() * QUOTE_ENDINGS.length)];
    const candidate = start + ending;
    if (candidate !== current) return candidate;
  }
  return QUOTE_STARTS[Math.floor(Math.random() * QUOTE_STARTS.length)] +
    QUOTE_ENDINGS[Math.floor(Math.random() * QUOTE_ENDINGS.length)];
}

export default function CupWrapPage() {
  const [cup, setCup] = useState<"16oz" | "22oz">("16oz");
  const [quote, setQuote] = useState(() => getRandomQuote());
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
        .wrap-art { width:100%; min-width:620px; aspect-ratio:280 / 45; display:grid; grid-template-columns:1.05fr 1.05fr 1.1fr .65fr; gap:9px; align-items:center; padding:10px 14px; background:#fff; color:#000; border:2px solid #000; outline:1px solid #000; outline-offset:3px; }
        .wrap-block { height:100%; min-width:0; display:flex; flex-direction:column; justify-content:center; border-right:1px solid #aaa; padding-right:8px; }
        .wrap-script { font-family:Georgia,serif; font-style:italic; font-weight:800; font-size:clamp(14px,2vw,23px); line-height:1.05; }
        .wrap-brand { font-size:clamp(16px,2.5vw,27px); font-weight:900; letter-spacing:.03em; line-height:1; }
        .wrap-tag { font-size:9px; font-weight:800; letter-spacing:.12em; margin-top:5px; }
        .wrap-drink { font-size:clamp(17px,2.5vw,30px); font-weight:900; text-align:center; line-height:1.05; overflow-wrap:anywhere; }
        .wrap-order-meta { font-size:8px; font-weight:800; line-height:1.4; margin-top:5px; overflow-wrap:anywhere; }
        .wrap-quote { font-family:Georgia,serif; font-size:clamp(12px,1.8vw,19px); font-style:italic; font-weight:800; line-height:1.12; }
        .wrap-logo { display:none!important; }
        .wrap-print-logo { display:block; width:34mm; max-width:100%; height:13mm; object-fit:contain; object-position:center; filter:grayscale(1) contrast(2); margin:0 auto 1mm; }
        .wrap-qr { width:54px; height:54px; object-fit:contain; background:white; padding:2px; }
        .wrap-social { font-size:8px; font-weight:800; margin-top:4px; overflow-wrap:anywhere; }
        .wrap-side-date { font-size:7px; font-weight:800; text-align:center; line-height:1.2; margin-top:4px; overflow-wrap:anywhere; }
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
          .wrap-print-target { display:block!important; position:fixed!important; left:0!important; top:0!important; width:80mm!important; height:297mm!important; overflow:hidden!important; background:#fff!important; }
          .wrap-print-art { position:absolute!important; left:50%!important; top:50%!important; width:${wrapLength}mm!important; height:62mm!important; transform-origin:center center!important; transform:translate(-50%,-50%) rotate(90deg)!important; display:grid!important; grid-template-columns:1.05fr 1.05fr 1.1fr .65fr!important; gap:3mm!important; padding:4mm!important; background:#fff!important; color:#000!important; border:1.2mm solid #000!important; outline:0.35mm solid #000!important; outline-offset:1mm!important; print-color-adjust:exact!important; -webkit-print-color-adjust:exact!important; }
          .wrap-print-art .wrap-script { font-size:20pt!important; }
          .wrap-print-art .wrap-brand { font-size:20pt!important; }
          .wrap-print-art .wrap-quote { font-size:17pt!important; }
          .wrap-print-art .wrap-drink { font-size:21pt!important; }
          .wrap-print-art .wrap-order-meta { font-size:6pt!important; }
          .wrap-print-art .wrap-logo { display:none!important; }
          .wrap-print-art .wrap-print-logo { width:35mm!important; height:15mm!important; object-fit:contain!important; filter:grayscale(1) contrast(2)!important; margin:0 auto 1mm!important; }
          
          .wrap-print-art .wrap-side-date { font-size:7pt!important; }
          .wrap-print-art .wrap-qr { width:16mm!important; height:16mm!important; }
          .wrap-print-art .wrap-social { font-size:6pt!important; }
          .wrap-print-art .wrap-tag { font-size:8pt!important; }
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
              <label htmlFor="drink-name">Drink name (editable)</label>
              <input id="drink-name" value={drinkName} onChange={(e) => setDrinkName(e.target.value.slice(0, 40))} maxLength={40} placeholder="e.g. Spanish Latte" />
            </div>
            <div className="wrap-field">
              <label htmlFor="customer-name">Customer name (optional)</label>
              <input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value.slice(0, 40))} maxLength={40} placeholder="e.g. Alex" />
            </div>
            <div className="wrap-field">
              <label htmlFor="order-number">Order number / pang-ilan</label>
              <input id="order-number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.slice(0, 12))} maxLength={12} placeholder="e.g. 001" />
            </div>
            <div className="wrap-field">
              <label htmlFor="order-date-time">Order date &amp; time</label>
              <input id="order-date-time" type="datetime-local" value={orderDateTime} onChange={(e) => setOrderDateTime(e.target.value)} />
            </div>
            <div className="wrap-field">
              <label htmlFor="main-quote">Large quote · 1,000+ random Tagalog/Taglish combinations</label>
              <input id="main-quote" value={quote} onChange={(e) => setQuote(e.target.value.slice(0, 120))} maxLength={120} />
              <button type="button" className="wrap-btn secondary" onClick={() => setQuote(getRandomQuote(quote))}>🎲 Random funny quote</button>
              <p className="wrap-muted">Automatic random quote pag-open ng page. Pindutin ulit ang button para sa bagong funny line, o i-edit ang text kung gusto mo.</p>
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
              
              <img className="wrap-print-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
              <div className="wrap-tag">STREET • ICED • BREWED</div>
              <div className="wrap-drink">{drinkName || "YOUR DRINK"}</div>
              <div className="wrap-order-meta">
                {customerName ? <>FOR: {customerName}<br /></> : null}
                ORDER #{orderNumber || "—"}
              </div>
            </div>
            <div className="wrap-block">
              <div className="wrap-quote">{quote || "Good Drinks, Better Days"}</div>
              <div className="wrap-tag">SALAMAT SA SUPPORT, KASYP ♡</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {showQr && <img className="wrap-qr" src={qrUrl} alt="Facebook QR" />}
              <div className="wrap-social">/SypOnCafe</div>
              <div className="wrap-side-date">{orderDateTime ? new Date(orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}</div>
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
        
        <div className="wrap-script">Thanks for<br />Supporting<br />Small Business!</div>
      </div>
      <div className="wrap-block">
        <img className="wrap-print-logo" src={LOGO_URL} alt="SYP ON CAFÉ" />
        <div className="wrap-tag">STREET • ICED • BREWED</div>
        <div className="wrap-drink">{drinkName || "YOUR DRINK"}</div>
        <div className="wrap-order-meta">
          {customerName ? <>FOR: {customerName}<br /></> : null}
          ORDER #{orderNumber || "—"}
        </div>
      </div>
      <div className="wrap-block">
        <div className="wrap-quote">{quote || "Good Drinks, Better Days"}</div>
        <div className="wrap-tag">SALAMAT SA SUPPORT, KASYP ♡</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {showQr && <img className="wrap-qr" src={qrUrl} alt="Facebook QR" />}
        <div className="wrap-social">/SypOnCafe</div>
        <div className="wrap-side-date">{orderDateTime ? new Date(orderDateTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }) : ""}</div>
      </div>
    </div>
  );
}
