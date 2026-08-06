"use client";

import { useEffect, useMemo, useState } from "react";
import "./customer-display.css";
import TvStandby from "./TvStandby";
import PreparationDisplay from "./PreparationDisplay";
import "./preparation-display.css";

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

const empty: Snapshot = {
  mode: "cart",
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  updatedAt: new Date().toISOString(),
};

const money = (value: number) =>
  `₱${Math.max(0, Number(value || 0)).toLocaleString("en-PH")}`;

export default function CustomerDisplayPage() {
  const [data, setData] = useState<Snapshot>(empty);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const load = () => {
      try {
        setData(
          JSON.parse(
            localStorage.getItem(KEY) || JSON.stringify(empty),
          ) as Snapshot,
        );
      } catch {
        setData(empty);
      }
    };

    load();

    const syncTimer = window.setInterval(load, 250);
    const clockTimer = window.setInterval(
      () => setNow(new Date()),
      1000,
    );

    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) load();
    };

    window.addEventListener("storage", onStorage);

    let channel: BroadcastChannel | undefined;

    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "live-order") {
          setData(event.data.payload as Snapshot);
        }
      };
    } catch {
      // BroadcastChannel is optional; polling remains active.
    }

    return () => {
      window.clearInterval(syncTimer);
      window.clearInterval(clockTimer);
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, []);

  const itemCount = useMemo(
    () => data.items.reduce((sum, item) => sum + item.qty, 0),
    [data.items],
  );

  const stamps = Math.max(
    0,
    Math.min(10, Number(data.memberStamps ?? 0)),
  );
  const cashReceived = Number(data.cashReceived ?? 0);
  const changeDue = Number(data.changeDue ?? 0);
  const amountDue = Number(
    data.amountDue ?? Math.max(0, data.total - cashReceived),
  );

  const registerUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/member-register?source=customer-display&receipt=${encodeURIComponent(
          data.receiptNo || "",
        )}`
      : "/member-register";

  const memberUrl =
    typeof window !== "undefined" && data.memberCode
      ? `${window.location.origin}/member-login?identity=${encodeURIComponent(
          data.memberCode,
        )}&source=customer-display&receipt=${encodeURIComponent(
          data.receiptNo || "",
        )}`
      : "/member-login";

  if (data.mode !== "thank-you" && data.items.length === 0) {
    return (
      <PreparationDisplay
        now={now}
        standby={<TvStandby now={now} />}
      />
    );
  }

  return (
    <main className="cd5-screen">
      <div className="cd5-background" aria-hidden="true">
        <video
          src="/videos/syp-cafe-background.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/brand/syp-logo-glow-v2.webp"
        />
        <div />
      </div>

      <header className="cd5-header">
        <div className="cd5-brand">
          <img
            src="/brand/syp-logo-glow-v2.webp"
            alt="SYP ON CAFÉ"
          />
          <div>
            <h1>SYP ON CAFÉ</h1>
            <p>Street · Iced · Brewed</p>
          </div>
        </div>

        <time>
          <b>
            {now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </b>
          <span>
            {now.toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </time>
      </header>

      {data.mode === "thank-you" ? (
        <section className="cd5-thank-you">
          <article className="cd5-thank-card">
            <div className="cd5-success">✓</div>
            <span>ORDER SAVED</span>
            <h2>{data.queueNo || "A-000"}</h2>
            <h3>THANK YOU, KASYP!</h3>

            {data.customerName && (
              <h4>Salamat, {data.customerName}!</h4>
            )}

            <p>
              Your paid order was received and sent to our
              preparation queue.
            </p>

            {data.memberCode ? (
              <div className="cd5-reward">
                <div>
                  <strong>
                    {data.rewardClaimed
                      ? "★"
                      : data.stampAdded
                        ? "+1"
                        : "✓"}
                  </strong>
                  <span>
                    <b>
                      {data.rewardClaimed
                        ? "REWARD CLAIMED"
                        : data.stampAdded
                          ? "+1 STAMP ADDED"
                          : "KASYP MEMBER RECOGNIZED"}
                    </b>
                    <small>
                      {data.rewardClaimed
                        ? "Your free-drink reward was used."
                        : `${stamps}/10 loyalty stamps`}
                    </small>
                  </span>
                </div>

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=5&format=png&data=${encodeURIComponent(
                    memberUrl,
                  )}`}
                  alt="KaSYP member QR"
                />
              </div>
            ) : (
              <div className="cd5-join">
                <div>
                  <b>CREATE A FREE KASYP ACCOUNT</b>
                  <p>
                    Scan to save future stamps, rewards, and order
                    history.
                  </p>
                </div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=5&format=png&data=${encodeURIComponent(
                    registerUrl,
                  )}`}
                  alt="Create KaSYP account QR"
                />
              </div>
            )}

            {data.paymentMethod === "Cash" && (
              <div className="cd5-payment">
                <div>
                  <span>Cash received</span>
                  <b>{money(cashReceived)}</b>
                </div>
                <div>
                  <span>Your change</span>
                  <b>{money(changeDue)}</b>
                </div>
              </div>
            )}

            <div className="cd5-thank-status">
              ☕ Paid · Waiting for preparation
            </div>

            <small className="cd5-receipt">
              {data.receiptNo}
            </small>
          </article>
        </section>
      ) : (
        <section className="cd5-cart-layout">
          <section className="cd5-cart-main">
            <header>
              <div>
                <span>YOUR ORDER</span>
                <h2>
                  {itemCount
                    ? `${itemCount} item${itemCount > 1 ? "s" : ""}`
                    : "Ready when you are"}
                </h2>
              </div>
              <b>● LIVE</b>
            </header>

            <div className="cd5-cart-progress">
              <div className="active">
                <i>1</i>
                <span>
                  <b>Order received</b>
                  <small>Items confirmed</small>
                </span>
              </div>
              <em />
              <div>
                <i>2</i>
                <span>
                  <b>Preparing</b>
                  <small>Barista at work</small>
                </span>
              </div>
              <em />
              <div>
                <i>3</i>
                <span>
                  <b>Ready</b>
                  <small>Pickup soon</small>
                </span>
              </div>
            </div>

            <div className="cd5-live-items">
              {data.items.map((item, index) => (
                <article key={`${item.name}-${index}`}>
                  <img src={item.image} alt="" />
                  <div>
                    <small>
                      ITEM {String(index + 1).padStart(2, "0")}
                    </small>
                    <h3>
                      {item.qty}× {item.name}
                    </h3>
                    <p>
                      {item.size} · {item.details}
                    </p>
                  </div>
                  <strong>
                    {money(item.unitPrice * item.qty)}
                  </strong>
                </article>
              ))}
            </div>
          </section>

          <aside className="cd5-cart-side">
            {data.customerName ? (
              <section className="cd5-customer-card">
                <span>WELCOME, KASYP</span>
                <div>
                  <strong>
                    {data.customerName
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </strong>
                  <section>
                    <h2>{data.customerName}</h2>
                    <p>
                      {data.memberCode || "Walk-in customer"}
                    </p>
                  </section>
                </div>

                {data.memberCode && (
                  <>
                    <header>
                      <span>LOYALTY PROGRESS</span>
                      <b>{stamps}/10 stamps</b>
                    </header>
                    <div className="cd5-stamps">
                      {Array.from(
                        { length: 10 },
                        (_, index) => (
                          <i
                            key={index}
                            className={
                              index < stamps ? "filled" : ""
                            }
                          >
                            {index + 1}
                          </i>
                        ),
                      )}
                    </div>
                  </>
                )}
              </section>
            ) : (
              <section className="cd5-promo">
                <span>KASYP REWARDS</span>
                <h2>Every sip gets you closer.</h2>
                <p>
                  Collect 10 stamps and enjoy a FREE eligible
                  16oz drink.
                </p>
              </section>
            )}

            <section className="cd5-bill">
              <div>
                <span>Subtotal</span>
                <b>{money(data.subtotal)}</b>
              </div>

              {data.discount > 0 && (
                <div className="discount">
                  <span>Discount</span>
                  <b>-{money(data.discount)}</b>
                </div>
              )}

              <div className="total">
                <span>TOTAL</span>
                <b>{money(data.total)}</b>
              </div>
            </section>

            <section className="cd5-payment-card">
              <header>
                <span>PAYMENT</span>
                <b>{data.paymentMethod || "Not selected"}</b>
              </header>

              {data.paymentMethod === "Cash" ? (
                <>
                  <div>
                    <span>Cash received</span>
                    <b>{money(cashReceived)}</b>
                  </div>

                  <strong
                    className={
                      amountDue > 0 ? "due" : "change"
                    }
                  >
                    <span>
                      {amountDue > 0
                        ? "AMOUNT DUE"
                        : "YOUR CHANGE"}
                    </span>
                    <b>
                      {money(
                        amountDue > 0 ? amountDue : changeDue,
                      )}
                    </b>
                  </strong>
                </>
              ) : (
                <p>
                  Please complete payment using{" "}
                  {data.paymentMethod || "the selected method"}.
                </p>
              )}
            </section>
          </aside>
        </section>
      )}
    </main>
  );
}
