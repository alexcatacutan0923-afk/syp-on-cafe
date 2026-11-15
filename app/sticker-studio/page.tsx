"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL = "/IMG_5996.jpeg";
const QR_TARGET = "https://syponcafe.shop/member-register";

const MENU = [
  ["Americano","16oz",69,"Coffee"],["Americano","22oz",79,"Coffee"],
  ["Spanish Latte","16oz",89,"Coffee"],["Spanish Latte","22oz",109,"Coffee"],
  ["Oreo Latte","16oz",79,"Coffee"],["Oreo Latte","22oz",99,"Coffee"],
  ["Iced Milo Latte","16oz",79,"Coffee"],["Iced Milo Latte","22oz",99,"Coffee"],
  ["Vanilla Latte","16oz",89,"Coffee"],["Vanilla Latte","22oz",109,"Coffee"],
  ["French Vanilla Latte","16oz",89,"Coffee"],["French Vanilla Latte","22oz",109,"Coffee"],
  ["Roasted Almond Latte","16oz",99,"Coffee"],["Roasted Almond Latte","22oz",119,"Coffee"],
  ["Biscoff Latte","16oz",99,"Coffee"],["Biscoff Latte","22oz",119,"Coffee"],
  ["Salted Caramel","16oz",89,"Coffee"],["Salted Caramel","22oz",109,"Coffee"],
  ["Hot Americano","8oz",49,"Coffee"],["Hot Americano","12oz",69,"Coffee"],
  ["Hot Spanish Latte","8oz",79,"Coffee"],["Hot Spanish Latte","12oz",89,"Coffee"],
  ["Hot Oreo Latte","8oz",69,"Coffee"],["Hot Oreo Latte","12oz",79,"Coffee"],
  ["Hot Milo Latte","8oz",69,"Coffee"],["Hot Milo Latte","12oz",79,"Coffee"],
  ["Hot Salted Caramel","8oz",69,"Coffee"],["Hot Salted Caramel","12oz",89,"Coffee"],
  ["Milo Dino","16oz",79,"Milky"],["Milo Dino","22oz",99,"Milky"],
  ["Oreo Milky","16oz",79,"Milky"],["Oreo Milky","22oz",99,"Milky"],
  ["Caramel Macchiato","16oz",99,"Milky"],["Caramel Macchiato","22oz",119,"Milky"],
  ["Milky White Choco","16oz",99,"Milky"],["Milky White Choco","22oz",119,"Milky"],
  ["Milky Choco","16oz",99,"Milky"],["Milky Choco","22oz",119,"Milky"],
  ["Matcha Latte","16oz",109,"Matcha"],["Matcha Latte","22oz",129,"Matcha"],
  ["Strawberry Matcha","16oz",109,"Matcha"],["Strawberry Matcha","22oz",129,"Matcha"],
  ["Mango Matcha","16oz",109,"Matcha"],["Mango Matcha","22oz",129,"Matcha"],
  ["Blueberry Matcha","16oz",109,"Matcha"],["Blueberry Matcha","22oz",129,"Matcha"],
  ["Biscoff Matcha","16oz",119,"Matcha"],["Biscoff Matcha","22oz",139,"Matcha"],
  ["Oreo Matcha","16oz",119,"Matcha"],["Oreo Matcha","22oz",139,"Matcha"],
  ["Green Apple","16oz",39,"Soda"],["Green Apple","22oz",49,"Soda"],
  ["Mango Soda","16oz",39,"Soda"],["Mango Soda","22oz",49,"Soda"],
  ["Orange Soda","16oz",39,"Soda"],["Orange Soda","22oz",49,"Soda"],
  ["Strawberry Soda","16oz",39,"Soda"],["Strawberry Soda","22oz",49,"Soda"],
  ["Watermelon Soda","16oz",39,"Soda"],["Watermelon Soda","22oz",49,"Soda"],
  ["Blueberry Soda","16oz",39,"Soda"],["Blueberry Soda","22oz",49,"Soda"],
  ["Peach Soda","16oz",39,"Soda"],["Peach Soda","22oz",49,"Soda"],
  ["SYP Choco Boom","16oz",99,"Signature"],["SYP Choco Boom","22oz",119,"Signature"],
  ["SYP White Rush","16oz",99,"Signature"],["SYP White Rush","22oz",119,"Signature"],
  ["SYP Bites","Small",49,"Fries"],["SYP Cravings","Medium",79,"Fries"],["SYP Overload","Barkada",119,"Fries"],
] as const;

const expandQuotes = (lines:string[]) => lines.flatMap(line=>[line,"POV: "+line,"Real talk: "+line,"Current mood: "+line,"Not me: "+line,"Plot twist: "+line]);

const QUOTES: Record<string,string[]> = {
  Coffee:expandQuotes([
    "Kape muna. Wala pa akong patience today.","Hindi ako late, dramatic entrance lang.","My salary disappears faster than my coffee.","Gising ang katawan, tulog ang motivation.","May deadline ako, pero may kape rin ako.","Adulting is just saying 'next sweldo na'.","Kung kaya ng kape, kaya pang ngumiti.","Busy ako. Nag-iisip kung anong kakainin.","My love language is someone buying me coffee.","Hindi lahat ng problema kailangan sagutin ngayon. May kape muna.","I need a break, not another group chat.","Puyat na naman. At least consistent ako.","Coffee: dahil hindi pa option ang mag-resign.","Sana all may assurance. Ako, caffeine lang.","Walang tulugan kung may bills na naghihintay.","I came. I saw. I needed coffee.","Minsan kailangan mo lang ng tahimik at iced coffee.","Hindi ako masungit. Low coffee lang.","Work hard, sip harder.","Kung hindi ako nag-reply, baka nagre-recharge ako.","One coffee away from being productive.","Kape ang witness sa lahat ng desisyon ko.","My budget said no, but my coffee said yes.","Hindi lahat ng strong, emotionally available.","Kape muna bago magpanggap na okay."
  ]),
  Matcha:expandQuotes([
    "Green flag ang matcha. Yung iba, seen zone.","Matcha first. Red flags later.","At least itong green, hindi mixed signals.","Soft life, strong matcha.","Hindi ako bitter. Matcha lang 'to.","If it's not giving peace, let it go.","Green drink, clear mind. Sana all.","Matcha ang pinili ko. Sana siya rin ako.","No bad vibes, just matcha sips.","Hindi lahat ng green ay good sign. Itong matcha, oo.","My standards are high. My matcha is higher.","Stay sweet, kahit hindi siya nag-stay.","Matcha muna bago mag-overthink.","I like my matcha like my peace: worth it.","Dear self, piliin mo naman ang sarili mo.","Matcha date? At least sure akong darating.","Green flag spotted. Nasa cup lang pala.","No chasing. Just sipping.","Hindi ako naghihintay. Nag-e-enjoy lang ako.","May peace of mind sa bawat sip. Sana all.","Matcha is my kind of commitment.","Kung mixed signals, pass. Kung matcha, yes.","Less drama, more matcha.","You deserve better. At least better matcha.","Walang bitterness kung matcha ang kasama."
  ]),
  Soda:expandQuotes([
    "Fizz happens. Drink anyway.","Chill ka lang, hindi ka naman deadline.","Bubbly outside, pagod inside.","Too cool to be stressed. Medyo lang.","Good vibes lang, wala tayong budget sa drama.","Sana lahat ng problema, kayang i-refill.","Pop the top, drop the stress.","Mainit ang panahon, malamig dapat ang ulo.","Energy level: soda na may extra ice.","Kung magulo ang life, dagdagan ang fizz.","Stay fizzy, not busy.","Walang ambag ang stress sa bayarin.","Sip happens. Move on.","Ice cold drink, hot chika.","Hindi ako hyper. Carbonated lang ang energy.","Relax. Hindi lahat kailangan patulan.","Mas okay pang maubusan ng yelo kaysa pasensya.","Keep calm and add ice.","Buhay ay short. Order ka na ng soda.","Less overthinking, more overflowing bubbles.","Sana all may spark tulad ng soda.","Kung may issue, palamigin muna natin.","Today’s forecast: 100% chance of refreshments.","Fresh ka dapat kahit sabog ang schedule.","Bubbles up, worries down."
  ]),
  Milky:expandQuotes([
    "Sweet tooth, strong attitude.","Creamy comfort, zero judgment.","Soft drink para sa hard days.","Deserve ko 'to. Wala nang meeting.","Sweet lang ako kapag busog.","A little sweetness never hurt.","Milk mood: soft pero may boundaries.","Hindi ako clingy. Creamy lang ang order.","Comfort in a cup. Huwag na magtanong.","Kung walang lambing, at least may milky drink.","Sweet ka sana, hindi confusing.","Extra creamy, extra confident.","One sip closer to a better mood.","Ang buhay mapait minsan. Kaya milky tayo.","Love yourself. Treat yourself. Sip slowly.","Soft heart, strong cravings.","Hindi lahat ng sweet, red flag.","Araw-araw akong nagtitipid. Except today.","Creamy ang drink, complicated ang feelings.","Sweet escape muna sa adulting.","May good days, may milky days.","I deserve a treat, and that's final.","Less drama, more creamy goodness.","Hindi ako maarte. Alam ko lang ang gusto ko.","Sana all smooth, tulad ng first sip."
  ]),
  Signature:expandQuotes([
    "Ordinary day? Make it a signature one.","Main character energy, kahit extra lang ang budget.","One of a kind. No explanation needed.","Special ka. Huwag mong kalimutan.","Not basic. Never was.","A little extra looks good on you.","Make today worth remembering.","Confidence served cold.","Good taste is a personality trait.","Hindi lahat kayang maging original.","Your vibe deserves a signature sip.","Be bold. Order what you love.","Limited edition? Ikaw na 'yon.","Stay iconic, stay hydrated.","Big mood in a small moment.","The best choice you made today? This one.","Own your moment. Enjoy your drink.","Hindi kailangan ng dahilan para mag-treat yourself.","Extraordinary starts with one good sip.","Be the plot twist, not the problem.","Keep it classy, keep it tasty.","A signature kind of day.","You do you. Sip by sip.","Hindi ito ordinaryong craving.","Make room for something special."
  ]),
  Fries:expandQuotes([
    "Fries before guys. Always.","Share your fries? That's a trust issue.","Diet starts tomorrow. Sabi ko na last week.","Crunch muna bago chika.","Walang forever, pero may extra fries.","If you love me, huwag mong kunin fries ko.","Small fries, big feelings.","Stress eating? More like stress healing.","Hindi ako galit. Gutom lang talaga.","My type? Someone who buys extra fries.","Barkada rule: bayad muna bago kuha.","One more bite. Last na talaga. Promise.","Fries are cheaper than therapy. Usually.","Huwag mong bilangin ang fries ko.","Good friends share. Best friends order their own.","Ang tunay na betrayal: huling piraso, kinuha mo.","Crunch time, best time.","No fries left behind.","Kahit broken, basta may fries.","My happiness is deep-fried.","Walang problema na hindi gumagaan sa fries.","If lost, follow the smell of fries.","Hindi ako selfish. Fries ko 'to.","Order extra. Future you will say thanks.","Less talk, more crunch."
  ])
};

type Sticker = { id:number; customer:string; drink:string; size:string; price:number; category:string; sugar:string; ice:string; note:string; quote:string; createdAt:string; orderNo:string };
const QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=1&data="+encodeURIComponent(QR_TARGET);
const stamp = () => new Intl.DateTimeFormat("en-PH",{timeZone:"Asia/Manila",dateStyle:"medium",timeStyle:"short"}).format(new Date());

export default function StickerStudioPage() {
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(0);
  const [customer,setCustomer]=useState("");
  const [sugar,setSugar]=useState("Regular sugar");
  const [ice,setIce]=useState("Regular ice");
  const [note,setNote]=useState("");
  const [orderNo,setOrderNo]=useState("001");
  const [quantity,setQuantity]=useState(1);
  const [quote,setQuote]=useState(QUOTES.Coffee[0]);
  const [queue,setQueue]=useState<Sticker[]>([]);
  const [history,setHistory]=useState<Sticker[]>([]);
  const [nextId,setNextId]=useState(1);
  const [ready,setReady]=useState(false);
  const [notice,setNotice]=useState("");

  useEffect(()=>{try{const q=localStorage.getItem("syp-signature-queue");const h=localStorage.getItem("syp-signature-history");const n=localStorage.getItem("syp-signature-id");if(q)setQueue(JSON.parse(q));if(h)setHistory(JSON.parse(h));if(n)setNextId(Number(n)||1);const savedOrder=localStorage.getItem("syp-signature-order-no");if(savedOrder)setOrderNo(savedOrder);}catch{}setReady(true);},[]);
  useEffect(()=>{if(!ready)return;localStorage.setItem("syp-signature-queue",JSON.stringify(queue));localStorage.setItem("syp-signature-history",JSON.stringify(history));localStorage.setItem("syp-signature-id",String(nextId));localStorage.setItem("syp-signature-order-no",orderNo);},[queue,history,nextId,orderNo,ready]);

  const filtered=useMemo(()=>MENU.map((m,i)=>({m,i})).filter(({m})=>m[0].toLowerCase().includes(search.toLowerCase())||m[3].toLowerCase().includes(search.toLowerCase())),[search]);
  const product=MENU[selected] ?? MENU[0];
  function randomQuote(category:string){const list=QUOTES[category]||QUOTES.Coffee;setQuote(list[Math.floor(Math.random()*list.length)]);}
  function add(){const count=Math.max(1,Math.min(100,quantity));const list=QUOTES[product[3]]||QUOTES.Coffee;const item:Sticker={id:nextId,customer:customer.trim(),drink:product[0],size:product[1],price:product[2],category:product[3],sugar,ice,note:note.trim(),quote,createdAt:stamp(),orderNo};const made=Array.from({length:count},(_,i)=>({...item,id:nextId+i,quote:list[Math.floor(Math.random()*list.length)]}));setQueue(q=>[...q,...made]);setNextId(n=>n+count);setQuote(made[made.length-1].quote);setOrderNo(String((Number.parseInt(orderNo,10)||0)+1).toString().padStart(3,"0"));setNotice(count+" sticker(s) added. Next order: #"+String((Number.parseInt(orderNo,10)||0)+1).padStart(3,"0")+".");}
  function print(ids?:number[]){const selectedItems=ids?queue.filter(x=>ids.includes(x.id)):queue;if(!selectedItems.length)return;const done=()=>{setHistory(h=>[...selectedItems,...h].slice(0,250));setQueue(q=>q.filter(x=>!selectedItems.some(y=>y.id===x.id)));setNotice("Print dialog finished. Nasa history na ang stickers.");window.removeEventListener("afterprint",done);};window.addEventListener("afterprint",done,{once:true});window.print();window.setTimeout(()=>window.removeEventListener("afterprint",done),60000);}
  function reprint(s:Sticker){setQueue(q=>[...q,{...s,id:nextId}]);setNextId(n=>n+1);window.scrollTo({top:0,behavior:"smooth"});}
  return <main className="studio">
    <style jsx global>{`
      *{box-sizing:border-box}body{margin:0;background:#f3ede4;color:#2e241c;font-family:Arial,sans-serif}.studio{min-height:100vh;padding:22px}.head,.layout{max-width:1200px;margin:0 auto 18px}.head{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:flex;align-items:center;gap:13px}.brand img{width:58px;height:58px;object-fit:contain;background:#fff;border-radius:12px}.brand h1{font-size:25px;margin:0}.brand p{font-size:10px;letter-spacing:.18em;font-weight:800;color:#876b51;margin:5px 0}.layout{display:grid;grid-template-columns:minmax(270px,360px) minmax(0,1fr);gap:18px;align-items:start}.panel{background:#fffdf9;border:1px solid #e6d8c8;border-radius:16px;padding:18px;min-width:0}.panel h2{font-size:18px;margin:0 0 6px}.muted{font-size:12px;line-height:1.5;color:#897762;margin:0 0 15px}.field{display:grid;gap:6px;margin:0 0 12px}.field label{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#80644c}.field input,.field select{width:100%;min-width:0;border:1px solid #ddcbb7;border-radius:9px;background:white;padding:11px;font-size:14px;color:#30251c}.btn{border:0;border-radius:9px;background:#65472f;color:white;padding:11px 14px;font-weight:800;font-size:12px;cursor:pointer}.btn.alt{background:#efe4d6;color:#65472f}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.notice{margin-top:12px;padding:10px;background:#f4e9d9;border-radius:8px;font-size:12px;color:#684a31}.queue{display:grid;gap:12px}.queue-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #eadfD2;border-radius:12px;padding:12px}.preview{width:100%;aspect-ratio:1/1;overflow:hidden;background:white;border:1px dashed #cdbba5}.small{font-size:11px;color:#6b4c33}.queue-buttons{display:flex;flex-direction:column;gap:6px}.smallbtn{border:1px solid #d8c5b0;border-radius:7px;background:#fff;padding:8px;color:#684a31;font-weight:800;font-size:10px;cursor:pointer}.history{margin-top:24px;display:grid;gap:8px}.history-row{display:flex;justify-content:space-between;align-items:center;gap:8px;border-bottom:1px solid #eee4d9;padding:8px 0;font-size:12px}
      .art{width:80mm;height:80mm;background:white;color:#000;overflow:hidden;padding:2.5mm;display:flex;flex-direction:column;font-family:Arial,sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}.art-top{display:flex;align-items:center;justify-content:space-between;border-bottom:.45mm solid #000;padding-bottom:1.5mm;gap:2mm}.art-logo{width:17mm;height:14mm;object-fit:contain}.art-brand{flex:1;text-align:center}.art-brand strong{display:block;font-size:13pt;letter-spacing:.02em}.art-brand span{font-size:5.5pt;font-weight:800;letter-spacing:.14em}.art-qr{width:13mm;height:13mm;object-fit:contain}.art-order{font-size:6pt;font-weight:900;text-align:center;margin-top:1.4mm;letter-spacing:.12em}.art-drink{font-size:20pt;line-height:1.05;text-align:center;font-weight:900;overflow-wrap:anywhere;margin:1.5mm 0 .8mm}.art-price{text-align:center;font-size:13pt;font-weight:900}.art-meta{display:flex;justify-content:center;gap:3mm;font-size:6.5pt;font-weight:800;margin-top:1mm;flex-wrap:wrap}.art-customer{text-align:center;font-size:7pt;font-weight:800;margin-top:1mm}.art-note{text-align:center;font-size:6pt;margin-top:.8mm}.art-quote{border-top:.45mm solid #000;border-bottom:.45mm solid #000;margin-top:auto;padding:1.5mm 1mm;text-align:center;font-size:9pt;font-weight:900;line-height:1.15;min-height:12mm;display:flex;align-items:center;justify-content:center}.art-foot{display:flex;justify-content:space-between;align-items:center;font-size:5pt;font-weight:800;padding-top:1mm;letter-spacing:.04em}.print-sheet{display:none}
      @media(max-width:800px){.layout{grid-template-columns:1fr}.studio{padding:13px}}@media(max-width:480px){.head{align-items:flex-start}.queue-row{grid-template-columns:1fr}.queue-buttons{flex-direction:row;flex-wrap:wrap}}
      @page{size:80mm 80mm;margin:0}@media print{html,body{width:80mm!important;margin:0!important;padding:0!important;background:white!important}body,body *{visibility:hidden!important}.print-sheet,.print-sheet *{visibility:visible!important}.studio,.layout,.panel,.queue{display:block!important;width:80mm!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;background:white!important}.head,.form-panel,.panel-head,.queue-buttons,.preview,.notice,.actions,.muted,.history{display:none!important}.queue-row{display:block!important;width:80mm!important;margin:0!important;padding:0!important;border:0!important;break-inside:avoid!important}.print-sheet{display:block!important;width:80mm!important;height:80mm!important;break-after:page!important;page-break-after:always!important;overflow:hidden!important}.queue-row:last-child .print-sheet{break-after:auto!important;page-break-after:auto!important}.art{width:80mm!important;height:80mm!important}}
    `}</style>
    <header className="head"><div className="brand"><img src={LOGO_URL} alt="SYP logo"/><div><h1>SYP Signature Sticker Studio</h1><p>STREET • ICED • BREWED</p></div></div><a href="/" style={{color:"#65472f",fontSize:12,fontWeight:800}}>← Back</a></header>
    <div className="layout">
      <section className="panel form-panel"><h2>Create signature sticker</h2><p className="muted">Piliin ang drink sa menu. Automatic ang drink name, size at presyo gaya ng Cup Wrap Studio.</p>
        <div className="field"><label>Search menu</label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drink / category"/></div>
        <div className="field"><label>Drink & size — auto price</label><select size={Math.min(7,Math.max(3,filtered.length))} value={String(selected)} onChange={e=>{const idx=Number(e.target.value);setSelected(idx);randomQuote(MENU[idx][3]);}}>{filtered.map(({m,i})=><option key={i} value={i}>{m[0]} · {m[1]} — ₱{m[2]}</option>)}</select></div>
        <p className="muted">Selected: <strong>{product[0]} · {product[1]} — ₱{product[2]}</strong></p>
        <div className="field"><label>Customer name (optional)</label><input value={customer} onChange={e=>setCustomer(e.target.value.slice(0,35))} placeholder="Walk-in / customer name"/></div>
        <div className="field"><label>Order number</label><input value={orderNo} onChange={e=>setOrderNo(e.target.value.slice(0,12))}/><button className="btn alt" type="button" onClick={()=>{if(confirm("I-reset ang next order number sa 001? Hindi mababago ang dating stickers sa queue at history.")){setOrderNo("001");setNotice("Next order number reset to #001.");}}}>↺ Reset order number</button></div>
        <div className="field"><label>Sugar level — default regular</label><select value={sugar} onChange={e=>setSugar(e.target.value)}><option>Regular sugar</option><option>75% sugar</option><option>50% sugar</option><option>25% sugar</option><option>No sugar</option></select></div>
        <div className="field"><label>Ice level</label><select value={ice} onChange={e=>setIce(e.target.value)}><option>Regular ice</option><option>Less ice</option><option>Extra ice</option><option>No ice</option><option>Hot</option></select></div>
        <div className="field"><label>Optional note</label><input value={note} onChange={e=>setNote(e.target.value.slice(0,50))} placeholder="e.g. no straw, less foam"/></div>
        <div className="field"><label>Signature quote</label><input value={quote} onChange={e=>setQuote(e.target.value.slice(0,100))}/><button className="btn alt" type="button" onClick={()=>randomQuote(product[3])}>🎲 Random {product[3]} quote</button></div>
        <div className="field"><label>Quantity</label><input type="number" min="1" max="100" value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></div>
        <div className="actions"><button className="btn" onClick={add}>＋ Add to print queue</button><button className="btn alt" onClick={()=>{setCustomer("");setNote("");setQuantity(1);setNotice("Form cleared.");}}>Clear form</button><button className="btn alt" onClick={()=>{if(confirm("Clear print queue?"))setQueue([]);}}>Clear queue</button></div>
        {notice&&<div className="notice" role="status">{notice}</div>}
      </section>
      <section className="panel"><div className="panel-head" style={{display:"flex",justifyContent:"space-between"}}><div><h2>Print queue</h2><p className="muted">80mm × 80mm · square portrait feed · Portrait · Actual size 100%</p></div><strong>{queue.length}</strong></div>
        {!queue.length?<p className="muted">Wala pang sticker sa queue.</p>:<div className="queue">{queue.map(s=><div className="queue-row" key={s.id}><div className="preview"><StickerArt sticker={s}/></div><div className="queue-buttons"><button className="smallbtn" onClick={()=>print([s.id])}>Print / reprint</button><button className="smallbtn" onClick={()=>setQueue(q=>q.map(x=>x.id===s.id?{...x,quote:(QUOTES[x.category]||QUOTES.Coffee)[Math.floor(Math.random()*(QUOTES[x.category]||QUOTES.Coffee).length)]}:x))}>Random quote</button><button className="smallbtn" onClick={()=>setQueue(q=>q.filter(x=>x.id!==s.id))}>Remove</button></div><div className="print-sheet"><StickerArt sticker={s}/></div></div>)}</div>}
        <div className="actions"><button className="btn" disabled={!queue.length} onClick={()=>print()}>Print all stickers</button></div>
        <div className="history"><h2>Print history</h2><p className="muted">Saved sa browser na ito. Puwedeng i-reprint anytime.</p>{history.slice(0,40).map((s,i)=><div className="history-row" key={s.id+"-"+i}><span><strong>{s.drink}</strong><br/><span className="small">#{s.orderNo} · {s.customer||"Walk-in"} · {s.createdAt}</span></span><button className="smallbtn" onClick={()=>reprint(s)}>Reprint</button></div>)}{history.length===0&&<p className="muted">Wala pang print history.</p>}</div>
        <p className="muted" style={{marginTop:18}}>Printer setup: 80mm × 80mm, Portrait, Actual size / 100%, margins none, headers & footers off. I-test muna sa plain paper.</p>
      </section>
    </div>
  </main>;
}

function StickerArt({sticker}:{sticker:Sticker}){
  return <div className="art"><div className="art-top"><img className="art-logo" src={LOGO_URL} alt="SYP"/><div className="art-brand"><strong>SYP ON CAFÉ</strong><span>STREET • ICED • BREWED</span></div><img className="art-qr" src={QR_URL} alt="Membership QR"/></div><div className="art-order">ORDER #{sticker.orderNo||"001"} · {sticker.createdAt}</div><div className="art-drink">{sticker.drink}</div><div className="art-price">₱{sticker.price} <span style={{fontSize:"7pt"}}>· {sticker.size}</span></div>{sticker.customer&&<div className="art-customer">MADE FOR {sticker.customer}</div>}<div className="art-meta"><span>{sticker.sugar}</span><span>•</span><span>{sticker.ice}</span></div>{sticker.note&&<div className="art-note">NOTE: {sticker.note}</div>}<div className="art-quote">“{sticker.quote}”</div><div className="art-foot"><span>THANK YOU, KASYP!</span><span>SYP ON CAFÉ</span></div></div>;
}
