"use client";

import { useEffect, useMemo, useState } from "react";
import "./customer-display.css";

type LiveItem = {
  name: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
  details: string;
};

type Snapshot = {
  mode: "cart" | "thank-you";
  queueNo?: string;
  receiptNo?: string;
  items: LiveItem[];
  subtotal: number;
  discount: number;
  total: number;
  customerName?: string;
  memberCode?: string;
  memberStamps?: number;
  paymentMethod?: "Cash" | "GCash" | "Maya";
  cashReceived?: number;
  changeDue?: number;
  amountDue?: number;
  stampAdded?: boolean;
  rewardClaimed?: boolean;
  updatedAt: string;
};

const KEY = "syp-live-order-v1";
const CHANNEL = "syp-cafe-live-v1";
const money = (value: number) => `₱${Math.max(0, value).toLocaleString("en-PH")}`;
const empty: Snapshot = {
  mode: "cart",
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  updatedAt: new Date().toISOString(),
};

export default function CustomerDisplayPage() {
  const [data, setData] = useState<Snapshot>(empty);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const load = () => {
      try {
        setData(JSON.parse(localStorage.getItem(KEY) || JSON.stringify(empty)));
      } catch {
        setData(empty);
      }
    };

    load();
    // Poll the shared snapshot too, so the display still updates even when
    // BroadcastChannel/storage events are delayed by the browser.
    const syncTimer = window.setInterval(load, 250);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) load();
    };

    window.addEventListener("storage", onStorage);
    let channel: BroadcastChannel | undefined;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "live-order") setData(event.data.payload);
      };
    } catch {}

    return () => {
      window.clearInterval(timer);
      window.clearInterval(syncTimer);
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, []);

  const itemCount = useMemo(
    () => data.items.reduce((sum, item) => sum + item.qty, 0),
    [data.items],
  );
  const stamps = Math.max(0, Math.min(10, Number(data.memberStamps ?? 0)));
  const cashReceived = Number(data.cashReceived ?? 0);
  const changeDue = Number(data.changeDue ?? 0);
  const amountDue = Number(data.amountDue ?? Math.max(0, data.total - cashReceived));
  const registerUrl = typeof window !== "undefined"
    ? `${window.location.origin}/member-register?source=customer-display&receipt=${encodeURIComponent(data.receiptNo || "")}`
    : "/member-register";
  const memberUrl = typeof window !== "undefined" && data.memberCode
    ? `${window.location.origin}/member-login?identity=${encodeURIComponent(data.memberCode)}&source=customer-display&receipt=${encodeURIComponent(data.receiptNo || "")}`
    : "/member-login";

  return (
    <main className="customer-screen">
      <div className="entry-media" aria-hidden="true">
        <video src="/videos/syp-cafe-background.mp4" autoPlay muted loop playsInline poster="/brand/syp-logo-glow-v2.webp" />
        <div className="entry-shade" />
      </div>
      <header>
        <div className="cd-brand">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ" />
          <div>
            <h1>SYP ON CAFÉ</h1>
            <p>Street · Iced · Brewed</p>
          </div>
        </div>
        <div className="cd-time">
          <b>{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</b>
          <span>{now.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </header>

      {data.mode === "thank-you" ? (
        <section className="thank-you">
          <div className="success-burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          <div className="thank-card">
            <div className="success-check">✓</div>
            <span>ORDER SAVED</span>
            <h2>{data.queueNo}</h2>
            <h3 className="mega-thanks">THANK YOU, KASYP!</h3>
            {data.customerName && <h4 className="customer-thanks">Salamat, {data.customerName}!</h4>}
            <p>Your order is saved and now sent to our barista.</p>

            {data.memberCode ? (
              <div className={`reward-pop member-reward-pop ${data.rewardClaimed ? "claimed" : ""}`}>
                <div className="reward-main">
                  <div className="reward-icon">{data.rewardClaimed ? "★" : data.stampAdded ? "+1" : "✓"}</div>
                  <div>
                    <span>{data.rewardClaimed ? "REWARD CLAIMED" : data.stampAdded ? "+1 STAMP ADDED" : "KASYP MEMBER RECOGNIZED"}</span>
                    <strong>{data.rewardClaimed ? "Your free drink reward was used!" : data.stampAdded ? `You now have ${stamps}/10 stamps.` : `${stamps}/10 loyalty stamps`}</strong>
                    <small>{data.memberCode}</small>
                  </div>
                </div>
                <div className="member-qr-wrap">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=5&format=png&data=${encodeURIComponent(memberUrl)}`} alt={`KaSYP member QR for ${data.memberCode}`} />
                  <b>MY KASYP QR</b>
                  <small>Scan to open member account</small>
                </div>
              </div>
            ) : (
              <div className="join-pop">
                <div>
                  <span>WALK-IN CUSTOMER</span>
                  <strong>Create your free KaSYP account</strong>
                  <p>Scan to save future stamps, rewards, and order history.</p>
                </div>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=5&format=png&data=${encodeURIComponent(registerUrl)}`} alt="Create KaSYP account QR" />
              </div>
            )}

            {data.paymentMethod === "Cash" && (
              <div className="thank-payment">
                <div><span>Cash received</span><b>{money(cashReceived)}</b></div>
                <div className="change-box"><span>Your change</span><b>{money(changeDue)}</b></div>
              </div>
            )}
            <div className="status-pill">☕ Preparing your drinks</div>
            <small className="receipt-code">{data.receiptNo}</small>
          </div>
        </section>
      ) : (
        <section className="cd-layout">
          <div className="order-area">
            <div className="title-row">
              <div>
                <span>YOUR ORDER</span>
                <h2>{itemCount ? `${itemCount} item${itemCount > 1 ? "s" : ""}` : "Ready when you are"}</h2>
              </div>
              <b>• LIVE</b>
            </div>

            <div className="order-progress">
              <div className="active"><i>1</i><span><b>Order received</b><small>Items confirmed</small></span></div>
              <em />
              <div><i>2</i><span><b>Preparing</b><small>Barista at work</small></span></div>
              <em />
              <div><i>3</i><span><b>Ready</b><small>Pickup soon</small></span></div>
            </div>

            <div className="live-items">
              {data.items.length === 0 ? (
                <div className="idle">
                  <div>☕</div>
                  <h3>Welcome, KaSYP!</h3>
                  <p>Your order will appear here.</p>
                </div>
              ) : (
                data.items.map((item, index) => (
                  <article key={`${item.name}-${index}`}>
                    <img src={item.image} alt="" />
                    <div>
                      <small className="item-number">ITEM {String(index + 1).padStart(2, "0")}</small>
                      <h3>{item.qty}× {item.name}</h3>
                      <p>{item.size} · {item.details}</p>
                    </div>
                    <strong>{money(item.unitPrice * item.qty)}</strong>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside>
            {data.customerName ? (
              <div className="customer-card">
                <span>WELCOME, KASYP</span>
                <div className="customer-head">
                  <div className="customer-avatar">{data.customerName.trim().charAt(0).toUpperCase()}</div>
                  <div>
                    <h2>{data.customerName}</h2>
                    <p>{data.memberCode || "Walk-in customer"}</p>
                  </div>
                </div>
                {data.memberCode && (
                  <>
                    <div className="stamp-label"><span>LOYALTY PROGRESS</span><b>{stamps}/10 stamps</b></div>
                    <div className="stamp-grid">
                      {Array.from({ length: 10 }, (_, index) => (
                        <i key={index} className={index < stamps ? "filled" : ""}>{index + 1}</i>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="promo">
                <span>KaSYP REWARDS</span>
                <h2>Every sip gets you closer.</h2>
                <p>Collect 10 stamps and enjoy a FREE eligible 16oz drink.</p>
              </div>
            )}

            <div className="bill">
              <div><span>Subtotal</span><b>{money(data.subtotal)}</b></div>
              {data.discount > 0 && <div className="discount"><span>Discount</span><b>-{money(data.discount)}</b></div>}
              <div className="total"><span>TOTAL</span><b>{money(data.total)}</b></div>
            </div>

            <div className="payment-card">
              <div className="payment-title">
                <span>PAYMENT</span>
                <b>{data.paymentMethod || "Not selected"}</b>
              </div>
              {data.paymentMethod === "Cash" ? (
                <>
                  <div className="payment-row"><span>Cash received</span><b>{money(cashReceived)}</b></div>
                  {amountDue > 0 ? (
                    <div className="payment-result due"><span>Amount due</span><b>{money(amountDue)}</b></div>
                  ) : (
                    <div className="payment-result change"><span>YOUR CHANGE</span><b>{money(changeDue)}</b></div>
                  )}
                </>
              ) : (
                <div className="digital-payment">Please complete payment using {data.paymentMethod || "the selected method"}.</div>
              )}
            </div>

            <div className="message"><span>MADE FOR YOUR MOMENT</span><p>Good coffee. Good moments. <b>Made for you.</b></p></div>
          </aside>
        </section>
      )}
    </main>
  );
}
