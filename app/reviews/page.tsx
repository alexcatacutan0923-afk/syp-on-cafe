"use client";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import "../site.css";
import "./reviews.css";

type Review = { id:number; name:string; drink:string; stars:number; text:string; badge:string; date:string };
const initial:Review[]=[
{id:1,name:"Angeline",drink:"Spanish Latte",stars:5,text:"Smooth at balanced. Hindi sobrang tamis at perfect pang late-night tambay.",badge:"Verified order",date:"July 23"},
{id:2,name:"Keith",drink:"Hot Salted Caramel",stars:5,text:"Comforting at premium ang lasa. Sweet-salty finish pero hindi nakakaumay.",badge:"Loyalty member",date:"July 22"},
{id:3,name:"Mika",drink:"Biscoff Matcha",stars:5,text:"Creamy matcha at malinaw ang Biscoff flavor. Sulit ang 22oz.",badge:"Verified visit",date:"July 21"},
{id:4,name:"Jana",drink:"SYP Choco Boom",stars:4,text:"Chocolatey at strong enough ang coffee. Babalikan ko ulit.",badge:"Verified order",date:"July 20"},
{id:5,name:"Paolo",drink:"Milo Dino",stars:5,text:"Comfort drink talaga. Gustong-gusto rin ng mga kasama ko.",badge:"Loyalty member",date:"July 18"},
{id:6,name:"Rica",drink:"Strawberry Matcha",stars:5,text:"Maganda ang balance ng strawberry at matcha. Instagrammable pa.",badge:"Verified visit",date:"July 17"},
];
export default function ReviewsPage(){
 const [reviews,setReviews]=useState(initial); const [filter,setFilter]=useState("All"); const [sent,setSent]=useState(false);
 const [form,setForm]=useState({name:"",drink:"Spanish Latte",stars:5,text:""});
 const shown=useMemo(()=>filter==="All"?reviews:reviews.filter(r=>String(r.stars)===filter),[filter,reviews]);
 const average=(reviews.reduce((s,r)=>s+r.stars,0)/reviews.length).toFixed(1);
 function submit(e:FormEvent){e.preventDefault();if(!form.name.trim()||form.text.trim().length<8)return;setReviews([{id:Date.now(),...form,badge:"Pending verification",date:"Just now"},...reviews]);setSent(true);setForm(v=>({...v,name:"",text:""}));}
 return <main className="community-page">
  <header className="community-nav"><Link className="site-brand" href="/"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>RATINGS & REVIEWS</small></div></Link><nav><Link href="/">Home</Link><Link href="/menu">Menu</Link><Link href="/moments">Coffee Moments</Link></nav><Link className="gold-button" href="/member-login">Member Login</Link></header>
  <section className="community-hero"><small>REAL SYP EXPERIENCES</small><h1>Reviews from our KaSYP community.</h1><p>See what customers love, discover top-rated drinks, and share your own SYP experience.</p><div className="rating-summary"><b>{average}</b><span><em>★★★★★</em><small>{reviews.length} featured reviews</small></span></div></section>
  <section className="community-layout"><div>
   <div className="review-toolbar"><div><h2>Latest reviews</h2><p>Verified orders and member visits appear with a badge.</p></div><select aria-label="Filter reviews" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option value="5">5 stars</option><option value="4">4 stars</option></select></div>
   <div className="all-reviews">{shown.map(r=><article key={r.id}><header><i>{r.name[0]}</i><div><b>{r.name}</b><span>{r.badge} • {r.date}</span></div><em>{"★".repeat(r.stars)}{"☆".repeat(5-r.stars)}</em></header><p>“{r.text}”</p><footer>Ordered: <b>{r.drink}</b></footer></article>)}</div>
  </div><aside className="review-form-card"><small>SHARE YOUR EXPERIENCE</small><h2>Rate your SYP moment</h2><p>Demo submission muna. Sa production, dadaan ito sa admin approval.</p><form onSubmit={submit}><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><label>Drink<select value={form.drink} onChange={e=>setForm({...form,drink:e.target.value})}><option>Spanish Latte</option><option>Hot Salted Caramel</option><option>Biscoff Matcha</option><option>SYP Choco Boom</option><option>Milo Dino</option></select></label><label>Rating<select value={form.stars} onChange={e=>setForm({...form,stars:Number(e.target.value)})}><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option></select></label><label>Review<textarea value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Tell us what you loved..." rows={5}/></label><button className="gold-button">Submit Review</button>{sent&&<div className="submit-note">Review added to the demo preview.</div>}</form></aside></section>
 </main>
}
