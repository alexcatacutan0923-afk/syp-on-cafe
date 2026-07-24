"use client";

import { useMemo, useState } from "react";
import "./customers.css";

type Trust = "Trusted" | "Good" | "Watchlist";
type Customer = {
  id: string;
  name: string;
  mobile: string;
  stamps: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  favorite: string;
  birthday: string;
  lastVisit: string;
  joined: string;
  trust: Trust;
};

const customers: Customer[] = [
  { id:"SYP0021", name:"Juan Dela Cruz", mobile:"0917 123 4567", stamps:6, completed:43, cancelled:0, totalSpent:4870, favorite:"Spanish Latte", birthday:"Jul 28", lastVisit:"Today, 1:24 AM", joined:"Feb 12, 2026", trust:"Trusted" },
  { id:"SYP0018", name:"Angeline Santos", mobile:"0928 334 9120", stamps:9, completed:39, cancelled:1, totalSpent:4360, favorite:"Biscoff Matcha", birthday:"Aug 04", lastVisit:"Yesterday, 11:42 PM", joined:"Jan 29, 2026", trust:"Trusted" },
  { id:"SYP0034", name:"Keith Ramos", mobile:"0919 820 3314", stamps:4, completed:27, cancelled:0, totalSpent:3190, favorite:"SYP White Rush", birthday:"Sep 17", lastVisit:"Jul 23, 10:18 PM", joined:"Mar 07, 2026", trust:"Trusted" },
  { id:"SYP0052", name:"Maria Lopez", mobile:"0966 110 7782", stamps:2, completed:12, cancelled:1, totalSpent:1480, favorite:"Strawberry Matcha", birthday:"Oct 09", lastVisit:"Jul 22, 8:03 PM", joined:"Apr 15, 2026", trust:"Good" },
  { id:"SYP0061", name:"Paolo Reyes", mobile:"0995 442 8910", stamps:7, completed:16, cancelled:3, totalSpent:1960, favorite:"Americano", birthday:"Nov 21", lastVisit:"Jul 20, 2:50 AM", joined:"May 01, 2026", trust:"Good" },
  { id:"SYP0073", name:"Carlo Mendoza", mobile:"0908 774 2211", stamps:1, completed:5, cancelled:4, totalSpent:620, favorite:"Milo Dino", birthday:"Dec 12", lastVisit:"Jul 18, 7:25 PM", joined:"Jun 11, 2026", trust:"Watchlist" },
];

const money = (n:number) => `₱${n.toLocaleString("en-PH")}`;

export default function CustomersPage(){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState<"All"|Trust>("All");
  const [selectedId,setSelectedId]=useState(customers[0].id);
  const [tab,setTab]=useState<"Overview"|"Orders"|"Rewards">("Overview");

  const filtered=useMemo(()=>customers.filter(c=>{
    const q=search.trim().toLowerCase();
    const match=!q || `${c.name} ${c.id} ${c.mobile}`.toLowerCase().includes(q);
    return match && (filter==="All" || c.trust===filter);
  }),[search,filter]);
  const selected=customers.find(c=>c.id===selectedId) ?? filtered[0] ?? customers[0];
  const completed=customers.reduce((s,c)=>s+c.completed,0);
  const cancelled=customers.reduce((s,c)=>s+c.cancelled,0);
  const totalSpent=customers.reduce((s,c)=>s+c.totalSpent,0);
  const ready=customers.filter(c=>c.stamps>=10).length;

  return <main className="customer-shell">
    <header className="customer-topbar">
      <div className="customer-brand"><div className="customer-logo">S</div><div><h1>SYP ON CAFÉ</h1><p>Customer Dashboard</p></div></div>
      <label className="customer-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, ID or mobile..."/><kbd>Ctrl K</kbd></label>
      <a className="back-pos" href="/pos">← Back to POS</a>
      <div className="admin-box"><div className="admin-avatar">A</div><div><b>Admin</b><span>Manager</span></div></div>
    </header>

    <section className="summary-row">
      <Summary icon="👥" label="TOTAL MEMBERS" value={customers.length.toString()} note="Registered customers"/>
      <Summary icon="✓" label="COMPLETED ORDERS" value={completed.toString()} note="All customer orders"/>
      <Summary icon="⚠" label="CANCELLED" value={cancelled.toString()} note="Needs monitoring" danger/>
      <Summary icon="₱" label="CUSTOMER SALES" value={money(totalSpent)} note="Recorded spend"/>
      <Summary icon="🎁" label="FREE DRINK READY" value={ready.toString()} note="10 loyalty stamps"/>
    </section>

    <section className="customer-workspace">
      <aside className="customer-list-panel">
        <div className="panel-title"><div><small>CUSTOMERS</small><h2>Members</h2></div><button className="add-customer">＋ Add</button></div>
        <div className="trust-filters">
          {(["All","Trusted","Good","Watchlist"] as const).map(x=><button key={x} onClick={()=>setFilter(x)} className={filter===x?"active":""}>{x}</button>)}
        </div>
        <div className="customer-count">Showing {filtered.length} customers</div>
        <div className="customer-list">
          {filtered.map(c=><button key={c.id} onClick={()=>setSelectedId(c.id)} className={`customer-row ${selected.id===c.id?"selected":""}`}>
            <div className="initials">{c.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
            <div className="customer-row-main"><strong>{c.name}</strong><span>{c.id} · {c.mobile}</span><small>Last visit: {c.lastVisit}</small></div>
            <div className={`trust-badge ${c.trust.toLowerCase()}`}>{c.trust}</div>
          </button>)}
        </div>
      </aside>

      <section className="customer-detail">
        <div className="profile-hero">
          <div className="profile-avatar">{selected.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
          <div className="profile-copy"><div className="profile-name-row"><h2>{selected.name}</h2><span className={`trust-badge ${selected.trust.toLowerCase()}`}>{selected.trust}</span></div><p>{selected.id} · {selected.mobile}</p><div className="profile-tags"><span>Joined {selected.joined}</span><span>Last visit {selected.lastVisit}</span></div></div>
          <div className="profile-actions"><button>✎ Edit</button><button>⋮</button></div>
        </div>

        <div className="detail-tabs">{(["Overview","Orders","Rewards"] as const).map(t=><button className={tab===t?"active":""} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>

        {tab==="Overview" && <>
          <div className="metric-grid">
            <Metric label="COMPLETED" value={selected.completed.toString()} hint="Successful orders"/>
            <Metric label="CANCELLED" value={selected.cancelled.toString()} hint="Cancelled orders" danger={selected.cancelled>=3}/>
            <Metric label="TOTAL SPENT" value={money(selected.totalSpent)} hint="Lifetime value"/>
            <Metric label="AVG. ORDER" value={money(Math.round(selected.totalSpent/Math.max(1,selected.completed)))} hint="Per completed order"/>
          </div>

          <div className="detail-columns">
            <article className="loyalty-card">
              <div className="card-heading"><div><small>LOYALTY</small><h3>Stamp Progress</h3></div><strong>{selected.stamps} / 10</strong></div>
              <div className="stamp-track">{Array.from({length:10}).map((_,i)=><i className={i<selected.stamps?"filled":""} key={i}>{i<selected.stamps?"★":"○"}</i>)}</div>
              <div className="progress"><span style={{width:`${Math.min(100,selected.stamps*10)}%`}}/></div>
              <p>{10-selected.stamps} more stamp{10-selected.stamps===1?"":"s"} until a free drink.</p>
              <div className="loyalty-buttons"><button>＋ Add Stamp</button><button>Redeem Reward</button></div>
            </article>

            <article className="preferences-card">
              <div className="card-heading"><div><small>PREFERENCES</small><h3>Customer Details</h3></div></div>
              <div className="pref-list"><div><span>Favorite drink</span><b>{selected.favorite}</b></div><div><span>Birthday</span><b>{selected.birthday}</b></div><div><span>Preferred payment</span><b>Cash</b></div><div><span>Customer since</span><b>{selected.joined}</b></div></div>
            </article>
          </div>

          <article className="activity-card"><div className="card-heading"><div><small>RECENT ACTIVITY</small><h3>Customer Timeline</h3></div><button>View all</button></div><div className="timeline">
            <Activity icon="☕" title={`Ordered ${selected.favorite}`} note="Completed · Cash payment" time={selected.lastVisit}/>
            <Activity icon="★" title="Loyalty stamp added" note={`${selected.stamps} of 10 stamps`} time="After checkout"/>
            <Activity icon="👤" title="Profile updated" note="Customer details verified" time="Jul 16, 2026"/>
          </div></article>
        </>}

        {tab==="Orders" && <article className="empty-tab"><div>🧾</div><h3>Order history</h3><p>Recent order records will appear here when connected to your existing orders table.</p></article>}
        {tab==="Rewards" && <article className="empty-tab"><div>🎁</div><h3>Rewards history</h3><p>Loyalty stamps, redeemed free drinks, and birthday rewards will appear here.</p></article>}
      </section>

      <aside className="insights-panel">
        <article className="insight-card trust-score"><small>TRUST SCORE</small><div className="score-ring"><strong>{selected.completed+selected.cancelled===0?100:Math.round(selected.completed/(selected.completed+selected.cancelled)*100)}</strong><span>/ 100</span></div><h3>{selected.trust} Customer</h3><p>{selected.completed} completed · {selected.cancelled} cancelled</p></article>
        <article className="insight-card"><div className="card-heading"><div><small>QUICK ACTIONS</small><h3>Manage Customer</h3></div></div><div className="quick-actions"><button>＋ Add Loyalty Stamp</button><button>🎁 Mark Free Drink</button><button>🧾 Start New Order</button><button>☎ Contact Customer</button></div></article>
        <article className="insight-card warning-card"><div className="card-heading"><div><small>ORDER RELIABILITY</small><h3>Customer Status</h3></div></div><div className="reliability"><div><span>Completion rate</span><b>{Math.round(selected.completed/Math.max(1,selected.completed+selected.cancelled)*100)}%</b></div><div><span>Cancelled orders</span><b className={selected.cancelled>=3?"red":""}>{selected.cancelled}</b></div><div><span>Risk level</span><b>{selected.trust==="Watchlist"?"High":selected.trust==="Good"?"Low":"Very low"}</b></div></div></article>
      </aside>
    </section>
  </main>
}

function Summary({icon,label,value,note,danger=false}:{icon:string,label:string,value:string,note:string,danger?:boolean}){return <article className={`summary-card ${danger?"danger":""}`}><div className="summary-icon">{icon}</div><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>}
function Metric({label,value,hint,danger=false}:{label:string,value:string,hint:string,danger?:boolean}){return <article className={`metric-card ${danger?"danger":""}`}><small>{label}</small><strong>{value}</strong><span>{hint}</span></article>}
function Activity({icon,title,note,time}:{icon:string,title:string,note:string,time:string}){return <div className="activity"><div className="activity-icon">{icon}</div><div><strong>{title}</strong><span>{note}</span></div><time>{time}</time></div>}
