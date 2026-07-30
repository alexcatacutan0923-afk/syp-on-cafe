"use client";

import { useEffect, useMemo, useState } from "react";
import "./customer-display.css";

type LiveItem = { name: string; size: string; qty: number; unitPrice: number; image: string; details: string };
type Snapshot = { mode: "cart" | "thank-you"; queueNo?: string; receiptNo?: string; items: LiveItem[]; subtotal: number; discount: number; total: number; customerName?: string; updatedAt: string };
const KEY = "syp-live-order-v1";
const CHANNEL = "syp-cafe-live-v1";
const money = (v:number)=>`₱${Math.max(0,v).toLocaleString("en-PH")}`;
const empty:Snapshot={mode:"cart",items:[],subtotal:0,discount:0,total:0,updatedAt:new Date().toISOString()};

export default function CustomerDisplayPage(){
  const [data,setData]=useState<Snapshot>(empty);
  const [now,setNow]=useState(new Date());
  useEffect(()=>{
    const load=()=>{try{setData(JSON.parse(localStorage.getItem(KEY)||JSON.stringify(empty)))}catch{setData(empty)}};
    load();
    const timer=setInterval(()=>setNow(new Date()),1000);
    const onStorage=(e:StorageEvent)=>{if(e.key===KEY)load()};
    window.addEventListener("storage",onStorage);
    let bc:BroadcastChannel|undefined;
    try{bc=new BroadcastChannel(CHANNEL);bc.onmessage=(e)=>{if(e.data?.type==="live-order")setData(e.data.payload)}}catch{}
    return()=>{clearInterval(timer);window.removeEventListener("storage",onStorage);bc?.close()};
  },[]);
  const count=useMemo(()=>data.items.reduce((s,i)=>s+i.qty,0),[data.items]);
  return <main className="customer-screen">
    <header><div className="cd-brand"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ"/><div><h1>SYP ON CAFÉ</h1><p>Street · Iced · Brewed</p></div></div><div className="cd-time"><b>{now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</b><span>{now.toLocaleDateString("en-PH",{month:"long",day:"numeric"})}</span></div></header>
    {data.mode==="thank-you" ? <section className="thank-you"><span>ORDER CONFIRMED</span><h2>{data.queueNo}</h2><h3>Thank you{data.customerName?`, ${data.customerName}`:""}!</h3><p>Your order is now sent to our barista.</p><div className="status-pill">☕ Preparing your drinks</div><small>{data.receiptNo}</small></section> : <section className="cd-layout">
      <div className="order-area"><div className="title-row"><div><span>YOUR ORDER</span><h2>{count?`${count} item${count>1?"s":""}`:"Ready when you are"}</h2></div><b>LIVE</b></div>
      <div className="live-items">{data.items.length===0?<div className="idle"><div>☕</div><h3>Welcome, KaSYP!</h3><p>Your order will appear here.</p></div>:data.items.map((i,n)=><article key={`${i.name}-${n}`}><img src={i.image} alt=""/><div><h3>{i.qty}× {i.name}</h3><p>{i.size} · {i.details}</p></div><strong>{money(i.unitPrice*i.qty)}</strong></article>)}</div></div>
      <aside><div className="promo"><span>KaSYP REWARDS</span><h2>Every sip gets you closer.</h2><p>Collect 10 stamps and enjoy a FREE eligible 16oz drink.</p></div><div className="bill"><div><span>Subtotal</span><b>{money(data.subtotal)}</b></div>{data.discount>0&&<div className="discount"><span>Discount</span><b>-{money(data.discount)}</b></div>}<div className="total"><span>TOTAL</span><b>{money(data.total)}</b></div></div><div className="message">Good coffee. Good moments. <b>Made for you.</b></div></aside>
    </section>}
  </main>
}
