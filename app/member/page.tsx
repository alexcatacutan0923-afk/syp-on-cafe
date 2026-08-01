"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MemberShell from "../components/member/MemberShell";
import { clearMemberSession, getCurrentMember, MemberProfile, saveCloudMember, updateCurrentMember } from "@/lib/member-store";
import { changeCloudMemberPin, getCloudMember, getCloudMemberVisits } from "@/lib/member-cloud";
import "./member.css";

type CustomerOrder = {
  id: number;
  order_number: string;
  status: string;
  order_type: string;
  payment_method: string | null;
  total: number;
  created_at: string;
};

type SpinPrize = { id: string; title: string; description: string; icon: string; weight: number; active: boolean; sort_order: number; is_try_again: boolean };
type SpinSettings = { enabled: boolean; access_mode: "off" | "all" | "selected"; force_try_again: boolean; max_spins_per_member: number; minimum_stamps: number };
const fallbackSpinPrizes: SpinPrize[] = [
  { id: "free-fries", title: "Free Fries", description: "One free small fries", icon: "🍟", weight: 1, active: true, sort_order: 1, is_try_again: false },
  { id: "ten-off", title: "₱10 OFF", description: "₱10 off one eligible drink", icon: "₱", weight: 1, active: true, sort_order: 2, is_try_again: false },
  { id: "free-drink", title: "Free 16oz Drink", description: "One selected 16oz drink", icon: "🥤", weight: 1, active: true, sort_order: 3, is_try_again: false },
  { id: "try-again", title: "Try Again", description: "Better luck next time", icon: "↻", weight: 6, active: true, sort_order: 4, is_try_again: true },
  { id: "bonus-stamp", title: "Bonus Stamp", description: "One bonus loyalty stamp", icon: "★", weight: 1, active: true, sort_order: 5, is_try_again: false },
  { id: "free-addon", title: "Free Add-on", description: "One selected add-on", icon: "+", weight: 1, active: true, sort_order: 6, is_try_again: false },
];

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: "", birthday: "", favoriteDrink: "" });
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [memberRefreshing, setMemberRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [cloudVisits, setCloudVisits] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [pinDraft, setPinDraft] = useState({ current: "", next: "", confirm: "" });
  const [pinStatus, setPinStatus] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [spinSettings, setSpinSettings] = useState<SpinSettings | null>(null);
  const [spinPrizes, setSpinPrizes] = useState<SpinPrize[]>(fallbackSpinPrizes);
  const [spinAllowed, setSpinAllowed] = useState(false);
  const [spinAccessLoading, setSpinAccessLoading] = useState(true);
  const [spinCount, setSpinCount] = useState(0);

  useEffect(() => {
    const current = getCurrentMember();
    if (!current) { router.replace("/member-login"); return; }
    setMember(current);
    setProfileDraft({ name: current.name, birthday: current.birthday, favoriteDrink: current.favoriteDrink });
  }, [router]);

  useEffect(() => {
    if (!member?.id) return;

    const memberCode = member.id;
    let active = true;

    const refreshMember = async (showSpinner = false) => {
      if (showSpinner) setMemberRefreshing(true);

      try {
        const [cloudResult, visitsResult] = await Promise.allSettled([
          getCloudMember(memberCode),
          getCloudMemberVisits(memberCode, calendarMonth),
        ]);

        if (!active) return;

        if (visitsResult.status === "fulfilled" && visitsResult.value.length > 0) {
          setCloudVisits(visitsResult.value);
        }

        if (cloudResult.status === "fulfilled" && cloudResult.value) {
          const updated = saveCloudMember(cloudResult.value);
          setMember(updated);
          setProfileDraft({
            name: updated.name,
            birthday: updated.birthday,
            favoriteDrink: updated.favoriteDrink,
          });
          setLastSyncedAt(new Date());
        }
      } finally {
        if (active && showSpinner) setMemberRefreshing(false);
      }
    };

    void refreshMember(true);
    const interval = window.setInterval(() => void refreshMember(false), 10000);
    const onFocus = () => void refreshMember(false);
    const onVisibility = () => { if (document.visibilityState === "visible") void refreshMember(false); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const channel = supabase
      .channel(`member-live-${memberCode}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "loyalty_members", filter: `member_code=eq.${memberCode}` }, () => void refreshMember(false))
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      void supabase.removeChannel(channel);
    };
  }, [member?.id, calendarMonth]);

  useEffect(() => {
    if (!member?.mobile) return;

    const memberMobile = member.mobile.replace(/\s+/g, "");
    let active = true;
    setOrdersLoading(true);

    void supabase
      .from("orders")
      .select("id, order_number, status, order_type, payment_method, total, created_at")
      .eq("mobile", memberMobile)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Unable to load member orders:", error);
          setCustomerOrders([]);
        } else {
          setCustomerOrders((data ?? []).map((order) => ({
            ...order,
            total: Number(order.total ?? 0),
          })) as CustomerOrder[]);
        }
        setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [member?.mobile]);

  useEffect(() => {
    if (!member?.id) return;

    const memberCode = member.id;
    const memberStamps = member.stamps;
    let active = true;

    async function loadSpinAccess() {
      setSpinAccessLoading(true);

      try {
        const [settingsResult, prizesResult, accessResult, resultsResult] = await Promise.all([
          supabase.from("spin_settings").select("enabled,access_mode,force_try_again,max_spins_per_member,minimum_stamps").eq("id", 1).maybeSingle(),
          supabase.from("spin_prizes").select("id,title,description,icon,weight,active,sort_order,is_try_again").eq("active", true).order("sort_order", { ascending: true }),
          supabase.from("spin_member_access").select("enabled").eq("member_code", memberCode).maybeSingle(),
          supabase.from("spin_results").select("id", { count: "exact", head: true }).eq("member_code", memberCode),
        ]);
        if (!active) return;
        if (settingsResult.error) throw settingsResult.error;
        if (prizesResult.error) throw prizesResult.error;
        if (accessResult.error) throw accessResult.error;
        if (resultsResult.error) throw resultsResult.error;

        const settings = (settingsResult.data as SpinSettings | null) ?? { enabled: false, access_mode: "off", force_try_again: true, max_spins_per_member: 1, minimum_stamps: 0 };
        const prizes = ((prizesResult.data ?? []) as SpinPrize[]).map((prize) => ({ ...prize, weight: Number(prize.weight ?? 1), sort_order: Number(prize.sort_order ?? 0) }));
        const selectedEnabled = Boolean(accessResult.data?.enabled);
        const allowedByMode = settings.enabled && (settings.access_mode === "all" || (settings.access_mode === "selected" && selectedEnabled));
        const usedSpins = Number(resultsResult.count ?? 0);

        setSpinSettings(settings);
        setSpinPrizes(prizes.length >= 2 ? prizes : fallbackSpinPrizes);
        setSpinCount(usedSpins);
        setSpinAllowed(
          allowedByMode &&
          memberStamps >= Number(settings.minimum_stamps || 0) &&
          usedSpins < Number(settings.max_spins_per_member || 1)
        );
      } catch (error) {
        console.error("Unable to load Lucky Spin access:", error);
        if (active) {
          setSpinSettings(null);
          setSpinPrizes(fallbackSpinPrizes);
          setSpinAllowed(false);
        }
      } finally {
        if (active) setSpinAccessLoading(false);
      }
    }

    void loadSpinAccess();
    return () => { active = false; };
  }, [member?.id, member?.stamps]);

  const currentMonth = calendarMonth;
  const visitedDays = useMemo(() => new Set(cloudVisits.filter(date => date.startsWith(currentMonth)).map(date => Number(date.slice(-2)))), [cloudVisits, currentMonth]);
  const calendarDate = useMemo(() => new Date(`${currentMonth}-01T00:00:00`), [currentMonth]);
  const daysInMonth = useMemo(() => new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate(), [calendarDate]);
  const firstWeekday = calendarDate.getDay();
  const calendarCells = useMemo(() => [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ], [firstWeekday, daysInMonth]);
  const monthTitle = calendarDate.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
  const todayKey = new Date().toISOString().slice(0, 10);
  const initials = useMemo(() => member?.name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "SY", [member]);
  const nextReward = Math.max(0, 10 - (member?.stamps ?? 0));
  const spinLocked = member?.spinAvailableAt ? new Date(member.spinAvailableAt).getTime() > Date.now() : false;
  const totalSpent = customerOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);

  function spin() {
    if (!member || spinning || result || !spinAllowed) return;

    const memberCode = member.id;
    const activePrizes = spinPrizes.filter((prize) => prize.active);
    if (!activePrizes.length) return;

    setSpinning(true);
    const forcedTryAgain = spinSettings?.force_try_again !== false;
    const tryAgainPrize = activePrizes.find((prize) => prize.is_try_again) ?? activePrizes[0];
    const totalWeight = activePrizes.reduce((sum, prize) => sum + Math.max(0, Number(prize.weight || 0)), 0);
    let selectedPrize = tryAgainPrize;

    if (!forcedTryAgain && totalWeight > 0) {
      let cursor = Math.random() * totalWeight;
      selectedPrize = activePrizes.find((prize) => {
        cursor -= Math.max(0, Number(prize.weight || 0));
        return cursor <= 0;
      }) ?? tryAgainPrize;
    }

    const selectedIndex = Math.max(0, activePrizes.findIndex((prize) => prize.id === selectedPrize.id));
    const segmentSize = 360 / activePrizes.length;
    const segmentCenter = selectedIndex * segmentSize + segmentSize / 2;
    setRotation((current) => Math.ceil(current / 360) * 360 + 5 * 360 + (360 - segmentCenter));

    window.setTimeout(async () => {
      const won = !selectedPrize.is_try_again && !forcedTryAgain;
      setResult(won ? `${selectedPrize.icon} ${selectedPrize.title}` : "Try Again");
      setSpinning(false);
      setSpinAllowed(false);
      setSpinCount((current) => current + 1);

      const { error } = await supabase.from("spin_results").insert({
        member_code: memberCode,
        prize_id: selectedPrize.id,
        prize_title: won ? selectedPrize.title : "Try Again",
        won,
      });
      if (error) console.error("Unable to save Lucky Spin result:", error);
    }, 3200);
  }

  function claimReward(id: string) {
    const updated = updateCurrentMember(current => ({
      ...current,
      rewardsClaimed: current.rewardsClaimed + 1,
      rewards: current.rewards.map(reward => reward.id === id ? { ...reward, status: "claimed" as const, claimedAt: new Date().toISOString() } : reward),
    }));
    setMember(updated);
  }

  function saveProfile() {
    const updated = updateCurrentMember(current => ({ ...current, ...profileDraft }));
    setMember(updated);
    setEditing(false);
  }

  async function changePin() {
    if (!member) return;

    const memberCode = member.id;
    setPinStatus("");
    if (!/^\d{4,6}$/.test(pinDraft.current) || !/^\d{4,6}$/.test(pinDraft.next)) { setPinStatus("PIN must be 4 to 6 digits."); return; }
    if (pinDraft.next !== pinDraft.confirm) { setPinStatus("New PIN confirmation does not match."); return; }
    if (pinDraft.current === pinDraft.next) { setPinStatus("Choose a different new PIN."); return; }
    setPinSaving(true);
    try {
      await changeCloudMemberPin(memberCode, pinDraft.current, pinDraft.next);
      const updated = updateCurrentMember(current => ({ ...current, pin: pinDraft.next }));
      if (updated) setMember(updated);
      setPinDraft({ current: "", next: "", confirm: "" });
      setPinStatus("PIN changed successfully.");
    } catch (error) {
      setPinStatus(error instanceof Error ? error.message : "Unable to change PIN.");
    } finally { setPinSaving(false); }
  }

  if (!member) return <main className="member-loading">Loading your membership...</main>;

  return (
    <MemberShell>
      <main className="member-content">
        <section className="member-welcome">
          <div><small>GOOD EVENING, KASYP!</small><h2>Your coffee story keeps getting better.</h2><p>{nextReward === 0 ? "Your free drink reward is ready." : `You are ${nextReward} stamps away from your next free drink.`}</p></div>
          <div className="member-status"><span>{memberRefreshing ? "SYNCING..." : "LIVE MEMBER"}</span><b>{lastSyncedAt ? `Updated ${lastSyncedAt.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}` : `Since ${formatMonthYear(member.joinedAt)}`}</b></div>
        </section>

        <section className="member-stats">
          <Stat label="LOYALTY STAMPS" value={`${member.stamps} / 10`} note={nextReward === 0 ? "Free drink ready" : `${nextReward} more to a free drink`} icon="★" />
          <Stat label="TOTAL VISITS" value={String(member.totalVisits)} note={`${visitedDays.size} visits this month`} icon="☕" />
          <Stat label="REWARDS CLAIMED" value={String(member.rewardsClaimed)} note={`${member.rewards.filter(item => item.status === "available").length} available now`} icon="◇" />
          <Stat label="REFERRALS" value={String(member.referrals)} note={`${Math.max(0, member.referrals - 1)} active friends`} icon="↗" />
        </section>

        <section className="member-grid">
          <article id="loyalty" className="member-card loyalty-panel">
            <CardTitle eyebrow="DIGITAL LOYALTY CARD" title="Sip. Stamp. Reward." action={member.id} />
            <div className="digital-card">
              <div className="digital-card-head"><span><b>SYP ON CAFÉ</b><small>STREET • ICED • BREWED</small></span><i>{initials}</i></div>
              <div className="stamp-grid">{Array.from({ length: 10 }, (_, i) => <span key={i} className={i < member.stamps ? "filled" : ""}>{i < member.stamps ? "★" : i + 1}</span>)}</div>
              <div className="digital-card-foot"><span>{member.name.toUpperCase()}</span><b>{member.stamps} OF 10 STAMPS</b></div>
            </div>
            <p className="card-note">Present your QR or member ID at checkout. Your stamps refresh automatically after the cashier completes the sale.</p>
          </article>

          <article id="visits" className="member-card visits-panel">
            <CardTitle eyebrow="MY CAFÉ JOURNEY" title={monthTitle} action={`${visitedDays.size} visits`} />
            <div className="calendar-month-nav">
              <button type="button" onClick={() => setCalendarMonth(previousMonth(calendarMonth))}>‹</button>
              <span>{monthTitle}</span>
              <button type="button" onClick={() => setCalendarMonth(nextMonth(calendarMonth))}>›</button>
            </div>
            <div className="calendar-head">{["S","M","T","W","T","F","S"].map((d,i)=><span key={i}>{d}</span>)}</div>
            <div className="visit-calendar">{calendarCells.map((day, index) => day === null ? <span key={`blank-${index}`} className="calendar-blank" /> : <span key={day} className={`${visitedDays.has(day) ? "visited" : ""} ${`${currentMonth}-${String(day).padStart(2,"0")}` === todayKey ? "today" : ""}`}>{day}{visitedDays.has(day) && <i>•</i>}</span>)}</div>
            <div className="calendar-legend"><span><i className="gold-dot"/> Café visit</span><span><i className="ring-dot"/> Today</span></div>
          </article>

          <article id="wheel" className="member-card wheel-panel">
            <CardTitle eyebrow="KASYP REWARDS" title="KaSYP Lucky Spin" action={spinAccessLoading ? "Checking access" : spinAllowed ? "Ready to spin" : result ? "Spin completed" : "Admin controlled"} />
            <div className="wheel-zone">
              <div className="wheel-pointer">▼</div>
              <div className="reward-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                {spinPrizes.map((prize, index) => {
                  const angle = index * (360 / spinPrizes.length) + (360 / spinPrizes.length) / 2;
                  return <span key={prize.id} style={{ transform: `rotate(${angle}deg) translateY(-74px) rotate(-${angle}deg)` }}>{prize.icon} {prize.title}</span>;
                })}
              </div>
              <button type="button" onClick={spin} disabled={spinning || !!result || !spinAllowed || spinAccessLoading}>{spinning ? "..." : spinAccessLoading ? "WAIT" : spinAllowed ? "SPIN" : "LOCKED"}</button>
            </div>
            {result ? (
              <div className="wheel-result"><small>KASYP LUCKY SPIN</small><b>{result === "Try Again" ? "Better luck next time!" : result}</b><span>{result === "Try Again" ? "No reward was added to your account." : "Show this reward to the cashier for verification."}</span></div>
            ) : spinAccessLoading ? (
              <p className="card-note">Checking your Lucky Spin access…</p>
            ) : spinAllowed ? (
              <p className="card-note">You are selected to spin. Prize labels and availability are managed by SYP ON CAFÉ.</p>
            ) : (
              <p className="card-note">Lucky Spin is currently unavailable for this account. The admin may enable all members or select specific KaSYP members.</p>
            )}
            {spinSettings && <p className="member-demo-note"><b>{spinCount}</b> of <b>{spinSettings.max_spins_per_member}</b> spin(s) used • Minimum <b>{spinSettings.minimum_stamps}</b> stamp(s)</p>}
          </article>

          <article className="member-card rewards-panel">
            <CardTitle eyebrow="AVAILABLE REWARDS" title="Your Reward Wallet" action={`${member.rewards.filter(item => item.status === "available").length} available`} />
            {member.rewards.slice(0, 5).map(reward => (
              <div className={`reward-item ${reward.status === "available" ? "active" : ""}`} key={reward.id}>
                <i>{reward.status === "claimed" ? "✓" : reward.id === "birthday" ? "🎂" : "★"}</i>
                <div><b>{reward.title}</b><span>{reward.description}</span></div>
                {reward.status === "available" ? <button onClick={() => claimReward(reward.id)}>Claim</button> : <em>{reward.status === "claimed" ? "Claimed" : reward.id === "loyalty" ? `${member.stamps}/10` : "Locked"}</em>}
              </div>
            ))}
          </article>

          <article id="referrals" className="member-card rewards-panel">
            <CardTitle eyebrow="REFER & EARN" title="Invite your café friends" action={`${member.referrals} referrals`} />
            <div className="reward-item active"><i>↗</i><div><b>Your referral code</b><span>{member.id}-SYP • Share it with a friend</span></div><button onClick={() => { navigator.clipboard?.writeText(`${member.id}-SYP`); setReferralCopied(true); }}>{referralCopied ? "Copied" : "Copy"}</button></div>
            <div className="reward-item"><i>1</i><div><b>Friend registers</b><span>They use your referral code</span></div><em>Step 1</em></div>
            <div className="reward-item"><i>2</i><div><b>First eligible visit</b><span>Referral becomes active</span></div><em>{Math.max(0, member.referrals - 1)} active</em></div>
          </article>

          <article id="orders" className="member-card orders-panel">
            <CardTitle eyebrow="ORDER HISTORY" title="Your SYP Orders" action={`${customerOrders.length} orders`} />
            <div className="profile-lines" style={{marginBottom: 14}}>
              <div><span>Total spent</span><b>₱{totalSpent.toLocaleString("en-PH")}</b></div>
              <div><span>Latest status</span><b>{customerOrders[0]?.status || "No orders yet"}</b></div>
            </div>
            {ordersLoading ? (
              <p className="member-empty">Loading your orders...</p>
            ) : customerOrders.length ? (
              customerOrders.map((order) => (
                <div className="member-order" key={order.id}>
                  <i>{order.order_type === "delivery" ? "🛵" : "☕"}</i>
                  <div>
                    <b>{order.order_number}</b>
                    <span>{order.order_type} • {order.payment_method || "cash"} • {order.status}</span>
                    <small>{formatDateTime(order.created_at)}</small>
                  </div>
                  <strong>₱{order.total.toLocaleString("en-PH")}</strong>
                  <Link href={`/track/${encodeURIComponent(order.order_number)}`}>Track</Link>
                </div>
              ))
            ) : (
              <p className="member-empty">Orders using your registered mobile number will appear here.</p>
            )}
          </article>

          <article id="profile" className="member-card profile-panel">
            <CardTitle eyebrow="MEMBER PROFILE" title={member.name} action={editing ? "Editing" : "Verified"} />
            {editing ? (
              <div className="member-profile-form">
                <label>Full name<input value={profileDraft.name} onChange={event => setProfileDraft(current => ({ ...current, name: event.target.value }))} /></label>
                <label>Birthday<input type="date" value={profileDraft.birthday} onChange={event => setProfileDraft(current => ({ ...current, birthday: event.target.value }))} /></label>
                <label>Favorite drink<input value={profileDraft.favoriteDrink} onChange={event => setProfileDraft(current => ({ ...current, favoriteDrink: event.target.value }))} /></label>
                <div><button className="member-primary compact" onClick={saveProfile}>Save changes</button><button className="member-secondary" onClick={() => setEditing(false)}>Cancel</button></div>
              </div>
            ) : (
              <>
                <div className="profile-lines"><div><span>Member ID</span><b>{member.id}</b></div><div><span>Mobile</span><b>{member.mobile}</b></div><div><span>Birthday</span><b>{formatBirthday(member.birthday)}</b></div><div><span>Favorite drink</span><b>{member.favoriteDrink}</b></div><div><span>Member since</span><b>{formatDate(member.joinedAt)}</b></div></div>
                <button className="member-edit-btn" onClick={() => setEditing(true)}>Edit profile</button>
              </>
            )}
            <div className="change-pin-panel">
              <div><small>ACCOUNT SECURITY</small><h3>Change Member PIN</h3><p>Old imported accounts use the temporary PIN <b>1234</b>. Change it after your first login.</p></div>
              <div className="pin-change-grid">
                <label>Current PIN<input type="password" inputMode="numeric" value={pinDraft.current} onChange={event => setPinDraft(current => ({...current,current:event.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="1234" /></label>
                <label>New PIN<input type="password" inputMode="numeric" value={pinDraft.next} onChange={event => setPinDraft(current => ({...current,next:event.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="4–6 digits" /></label>
                <label>Confirm new PIN<input type="password" inputMode="numeric" value={pinDraft.confirm} onChange={event => setPinDraft(current => ({...current,confirm:event.target.value.replace(/\D/g,"").slice(0,6)}))} placeholder="Repeat PIN" /></label>
              </div>
              {pinStatus && <p className={`pin-change-status ${pinStatus.includes("successfully") ? "success" : ""}`}>{pinStatus}</p>}
              <button className="member-primary compact" onClick={changePin} disabled={pinSaving}>{pinSaving ? "Saving..." : "Change PIN"}</button>
            </div>
            <div className="profile-lines"><div><span>Community</span><b><a href="/reviews" style={{color:"#e8b94f"}}>Reviews</a> · <a href="/moments" style={{color:"#e8b94f"}}>Coffee Moments</a></b></div></div>
            <button className="logout-btn" onClick={() => { clearMemberSession(); router.push("/member-login"); }}>Sign out of member portal</button>
          </article>
        </section>
      </main>
    </MemberShell>
  );
}

function Stat({label,value,note,icon}:{label:string;value:string;note:string;icon:string}){return <article className="member-stat"><i>{icon}</i><div><small>{label}</small><b>{value}</b><span>{note}</span></div></article>}
function CardTitle({eyebrow,title,action}:{eyebrow:string;title:string;action:string}){return <div className="member-card-title"><div><small>{eyebrow}</small><h3>{title}</h3></div><span>{action}</span></div>}
function Order({name,detail,price,date}:{name:string;detail:string;price:string;date:string}){return <div className="member-order"><i>☕</i><div><b>{name}</b><span>{detail}</span><small>{date}</small></div><strong>{price}</strong><button>Reorder</button></div>}
function formatDate(value:string){return new Intl.DateTimeFormat("en-PH",{year:"numeric",month:"long",day:"numeric"}).format(new Date(`${value}T00:00:00`))}
function formatMonthYear(value:string){return new Intl.DateTimeFormat("en-PH",{year:"numeric",month:"long"}).format(new Date(`${value}T00:00:00`))}
function formatBirthday(value:string){return new Intl.DateTimeFormat("en-PH",{month:"long",day:"numeric"}).format(new Date(`${value}T00:00:00`))}
function formatDateTime(value:string){return new Intl.DateTimeFormat("en-PH",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(value))}

function previousMonth(value:string){const d=new Date(`${value}-01T00:00:00`);d.setMonth(d.getMonth()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
function nextMonth(value:string){const d=new Date(`${value}-01T00:00:00`);d.setMonth(d.getMonth()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}