"use client";
import { useMemo, useState } from "react";
import "./online-order.css";

type Product={id:string;name:string;size:string;price:number;image:string;category:string};
type CartLine=Product&{qty:number};
type OnlineOrder={id:string;queueNo:string;receiptNo:string;items:{name:string;size:string;qty:number;details:string}[];status:"new"|"preparing"|"ready"|"served";deliveryStatus:"pending"|"accepted"|"out-for-delivery"|"delivered";createdAt:string;note?:string;customer:{name:string;mobile:string;address:string};source:"online";total:number};
const PRODUCTS:Product[]=[
{id:"spanish-16",name:"Spanish Latte",size:"16oz",price:89,image:"/products/spanish-latte.webp",category:"Coffee"},
{id:"oreo-16",name:"Oreo Latte",size:"16oz",price:79,image:"/products/oreo-latte-corrected.webp",category:"Coffee"},
{id:"matcha-16",name:"Matcha Latte",size:"16oz",price:109,image:"/products/matcha-latte.webp",category:"Matcha"},
{id:"strawberry-matcha-16",name:"Strawberry Matcha",size:"16oz",price:109,image:"/products/strawberry-matcha.webp",category:"Matcha"},
{id:"milo-dino-16",name:"Milo Dino",size:"16oz",price:79,image:"/products/milo-dino.webp",category:"Milky"},
{id:"choco-boom-16",name:"SYP Choco Boom",size:"16oz",price:99,image:"/products/syp-choco-boom.webp",category:"Signature"},
{id:"fries-medium",name:"SYP Cravings",size:"Medium",price:79,image:"/products/syp-fries.webp",category:"Fries"},
{id:"green-apple-16",name:"Green Apple",size:"16oz",price:39,image:"/products/green-apple.webp",category:"Soda"},
];
const KITCHEN_KEY="syp-kitchen-orders-v1", ONLINE_KEY="syp-online-orders-v1", CHANNEL="syp-cafe-live-v1";
const money=(v:number)=>`₱${v.toLocaleString("en-PH")}`;
function nextQueue(){const key=`syp-online-queue-${new Date().toISOString().slice(0,10)}`;const n=Number(localStorage.getItem(key)||0)+1;localStorage.setItem(key,String(n));return `D-${String(n).padStart(3,"0")}`}
export default function OnlineOrderPage(){
 const[cart,setCart]=useState<CartLine[]>([]),[name,setName]=useState(""),[mobile,setMobile]=useState(""),[address,setAddress]=useState(""),[note,setNote]=useState(""),[done,setDone]=useState<OnlineOrder|null>(null);
 const total=useMemo(()=>cart.reduce((s,i)=>s+i.price*i.qty,0),[cart]);
 const add=(p:Product)=>setCart(c=>{const hit=c.find(i=>i.id===p.id);return hit?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});
 const qty=(id:string,d:number)=>setCart(c=>c.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0));
 const place=()=>{if(!cart.length||!name.trim()||!mobile.trim()||!address.trim())return;const now=new Date(),queueNo=nextQueue(),receiptNo=`WEB-${now.getTime()}`;const order:OnlineOrder={id:receiptNo,queueNo,receiptNo,items:cart.map(i=>({name:i.name,size:i.size,qty:i.qty,details:"Online order"})),status:"new",deliveryStatus:"pending",createdAt:now.toISOString(),note:note.trim()||undefined,customer:{name:name.trim(),mobile:mobile.trim(),address:address.trim()},source:"online",total};
 const online:OnlineOrder[]=JSON.parse(localStorage.getItem(ONLINE_KEY)||"[]");localStorage.setItem(ONLINE_KEY,JSON.stringify([order,...online].slice(0,100)));
 const kitchen:any[]=JSON.parse(localStorage.getItem(KITCHEN_KEY)||"[]");localStorage.setItem(KITCHEN_KEY,JSON.stringify([order,...kitchen].slice(0,100)));
 try{const bc=new BroadcastChannel(CHANNEL);bc.postMessage({type:"kitchen-order",payload:order});bc.postMessage({type:"online-order",payload:order});bc.close()}catch{}
 setDone(order);setCart([]);
 };
 if(done)return <main className="oo-shell"><section className="oo-success"><span>ORDER RECEIVED</span><h1>{done.queueNo}</h1><h2>Salamat, {done.customer.name}!</h2><p>Your order was sent to the barista and rider dashboard.</p><a href={`/track?id=${encodeURIComponent(done.id)}`}>TRACK MY ORDER</a><button onClick={()=>setDone(null)}>PLACE ANOTHER ORDER</button></section></main>;
 return <main className="oo-shell"><header><div><b>SYP ON CAFÉ</b><span>Online Ordering</span></div><a href="/track">Track Order</a></header><section className="oo-grid"><div><div className="oo-hero"><span>DELIVERY & PICKUP</span><h1>Your SYP favorites, one click away.</h1><p>Order online and follow every step from preparing to delivery.</p></div><div className="oo-products">{PRODUCTS.map(p=><article key={p.id}><img src={p.image} alt={p.name}/><div><small>{p.category}</small><h3>{p.name}</h3><p>{p.size}</p><b>{money(p.price)}</b></div><button onClick={()=>add(p)}>+</button></article>)}</div></div><aside><h2>Your Order</h2>{cart.length===0?<p className="oo-empty">Add drinks or snacks to begin.</p>:<div className="oo-cart">{cart.map(i=><div key={i.id}><span><b>{i.name}</b><small>{i.size}</small></span><div><button onClick={()=>qty(i.id,-1)}>−</button><b>{i.qty}</b><button onClick={()=>qty(i.id,1)}>+</button></div><strong>{money(i.price*i.qty)}</strong></div>)}</div>}<div className="oo-total"><span>Total</span><b>{money(total)}</b></div><input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/><input placeholder="Mobile number" value={mobile} onChange={e=>setMobile(e.target.value)}/><textarea placeholder="Complete delivery address" value={address} onChange={e=>setAddress(e.target.value)}/><textarea placeholder="Order note (optional)" value={note} onChange={e=>setNote(e.target.value)}/><button className="oo-place" disabled={!cart.length||!name.trim()||!mobile.trim()||!address.trim()} onClick={place}>PLACE ORDER · {money(total)}</button><small className="oo-note">Build 37 local live-sync mode: use the same browser profile/domain for POS, Kitchen, Rider, and Tracking.</small></aside></section></main>
}
