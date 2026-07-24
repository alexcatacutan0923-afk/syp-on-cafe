"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getCurrentMember, MemberProfile } from "@/lib/member-store";

export default function MemberShell({ children, active = "dashboard" }: { children: ReactNode; active?: string }) {
  const [member, setMember] = useState<MemberProfile | null>(null);
  useEffect(() => setMember(getCurrentMember()), []);
  const initials = useMemo(() => member?.name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "SY", [member]);
  const unread = member?.notifications.filter(item => !item.read).length ?? 0;
  const links = [
    ["dashboard", "/member", "⌂", "Dashboard"],
    ["loyalty", "/member#loyalty", "★", "Loyalty"],
    ["visits", "/member#visits", "▦", "Visit Calendar"],
    ["wheel", "/member#wheel", "◉", "Spin & Rewards"],
    ["orders", "/member#orders", "▤", "Orders"],
    ["profile", "/member#profile", "○", "Profile"],
  ];

  return (
    <div className="member-app">
      <aside className="member-sidebar">
        <Link className="member-brand" href="/">
          <span className="member-mark">S</span>
          <span><b>SYP ON CAFÉ</b><small>Member Portal</small></span>
        </Link>
        <nav>
          {links.map(([id, href, icon, label]) => (
            <Link key={id} className={active === id ? "active" : ""} href={href}>
              <i>{icon}</i><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="member-side-card">
          <small>YOUR NEXT REWARD</small>
          <strong>{Math.max(0, 10 - (member?.stamps ?? 0))} stamps away</strong>
          <div><span style={{ width: `${Math.min(100, (member?.stamps ?? 0) * 10)}%` }} /></div>
          <p>Keep sipping. Your free drink is getting closer.</p>
        </div>
        <Link className="member-menu-link" href="/menu">View Café Menu →</Link>
      </aside>
      <div className="member-main">
        <header className="member-topbar">
          <div><small>WELCOME BACK</small><h1>SYP Member Dashboard</h1></div>
          <div className="member-top-actions">
            <button aria-label="Notifications">♢{unread > 0 && <span>{unread}</span>}</button>
            <div className="member-user"><i>{initials}</i><div><b>{member?.name || "SYP Member"}</b><small>{member?.id || "Loading..."}</small></div></div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
