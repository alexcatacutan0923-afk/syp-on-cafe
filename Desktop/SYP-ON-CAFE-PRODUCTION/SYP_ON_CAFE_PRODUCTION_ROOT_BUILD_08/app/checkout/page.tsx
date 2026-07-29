"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase-messaging";

type Temperature = "iced" | "hot" | "regular";

type AddOn = {
  id: number;
  name: string;
  price: number;
  group: string;
};

type CartItem = {
  cartId: string;
  productId: number;
  name: string;
  category?: string;
  temperature?: Temperature;
  size: string;
  basePrice?: number;
  addOns?: AddOn[];
  price: number;
  quantity: number;
};

type OrderType = "pickup" | "delivery";
type PaymentMethod = "cash" | "gcash";

function formatTemperature(value?: Temperature) {
  if (value === "hot") return "Hot";
  if (value === "iced") return "Iced";
  return "";
}

function cleanPublicEnv(value: string | undefined) {
  return (value || "").trim().replace(/^['"]|['"]$/g, "");
}


export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [pushEnabled, setPushEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [orderType, setOrderType] =
    useState<OrderType>("pickup");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [riderTip, setRiderTip] = useState(0);
  const [customTip, setCustomTip] = useState("");

  const [submittedOrderNumber, setSubmittedOrderNumber] =
    useState("");
  const [submittedTotal, setSubmittedTotal] = useState(0);
  const [submittedPaymentMethod, setSubmittedPaymentMethod] =
    useState<PaymentMethod>("cash");
  const [showGcashQr, setShowGcashQr] = useState(false);
  const [copyNotice, setCopyNotice] = useState("");
  const [memberCode, setMemberCode] = useState("");
  const [memberQrTarget, setMemberQrTarget] = useState("");

  const gcashAccountName = cleanPublicEnv(process.env.NEXT_PUBLIC_GCASH_ACCOUNT_NAME) || "SYP ON CAFÉ";
  const gcashAccountNumber = cleanPublicEnv(process.env.NEXT_PUBLIC_GCASH_ACCOUNT_NUMBER);
  const gcashPaymentUrl = cleanPublicEnv(process.env.NEXT_PUBLIC_GCASH_PAYMENT_URL) || "https://gcash.com/";
  const gcashPaymentUrlTemplate = cleanPublicEnv(process.env.NEXT_PUBLIC_GCASH_PAYMENT_URL_TEMPLATE);
  const gcashQrImageUrl = cleanPublicEnv(process.env.NEXT_PUBLIC_GCASH_QR_IMAGE_URL) || "https://i.ibb.co/XfvgSJPb/IMG-3363.png";  

  function buildGcashPaymentUrl(amount: number, orderNumber: string) {
    const template = gcashPaymentUrlTemplate || gcashPaymentUrl;
    return template
      .replaceAll("{amount}", encodeURIComponent(amount.toFixed(2)))
      .replaceAll("{orderNumber}", encodeURIComponent(orderNumber))
      .replaceAll("{mobile}", encodeURIComponent(gcashAccountNumber));
  }

  async function copyPaymentValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyNotice(`${label} copied`);
      window.setTimeout(() => setCopyNotice(""), 1800);
    } catch {
      setCopyNotice(`Unable to copy ${label.toLowerCase()}`);
      window.setTimeout(() => setCopyNotice(""), 2200);
    }
  }

  async function enableOrderUpdates() {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      alert("Notifications are not supported on this browser.");
      return;
    }

    if (!messaging) {
      alert("Firebase Messaging is unavailable on this device.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Notifications were not enabled.");
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        alert("Unable to get a notification token.");
        return;
      }

      setFcmToken(token);
      setPushEnabled(true);
      alert("Live order updates enabled!");
    } catch (error) {
      console.error("Unable to enable order updates:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to enable live order updates.",
      );
    }
  }

  useEffect(() => {
    const savedCart = localStorage.getItem("sypCart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as CartItem[];
        setCart(
          parsedCart.map((item) => ({
            ...item,
            addOns: item.addOns ?? [],
            temperature: item.temperature ?? "regular",
          })),
        );
      } catch {
        localStorage.removeItem("sypCart");
      }
    }

    setIsLoading(false);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [cart]);

  const deliveryFee = orderType === "delivery" ? 30 : 0;
  const tipAmount = orderType === "delivery" ? riderTip : 0;
  const total = subtotal + deliveryFee + tipAmount;

  function chooseTip(amount: number) {
    setRiderTip(amount);
    setCustomTip("");
  }

  function updateCustomTip(value: string) {
    const digitsOnly = value.replace(/[^0-9]/g, "").slice(0, 4);
    setCustomTip(digitsOnly);
    setRiderTip(Number(digitsOnly || 0));
  }

  async function submitOrder() {
    if (isSubmitting) return;

    const cleanName = customerName.trim();
    const cleanMobile = mobile.replace(/\s+/g, "").trim();

    if (!cleanName) {
      alert("Please enter your name.");
      return;
    }

    if (!/^09\d{9}$/.test(cleanMobile)) {
      alert(
        "Please enter a valid Philippine mobile number, for example 09171234567.",
      );
      return;
    }

    if (orderType === "delivery" && !address.trim()) {
      alert("Please enter your complete delivery address.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        price: Number(item.price),
        quantity: Number(item.quantity),
        temperature: item.temperature ?? "regular",
        basePrice: Number(item.basePrice ?? item.price),
        addOns: (item.addOns ?? []).map((addOn) => ({
          id: Number(addOn.id),
          name: addOn.name,
          price: Number(addOn.price),
          group: addOn.group,
        })),
      }));

      const { data, error } = await supabase.rpc(
        "create_customer_order",
        {
          p_customer_name: cleanName,
          p_mobile: cleanMobile,
          p_order_type: orderType,
          p_payment_method: paymentMethod,
          p_address:
            orderType === "delivery" ? address.trim() : "",
          p_landmark:
            orderType === "delivery" ? landmark.trim() : "",
          p_notes: [
            notes.trim(),
            tipAmount > 0 ? `[RIDER TIP: ₱${tipAmount}]` : "",
            paymentMethod === "gcash"
              ? `[GCASH PAYMENT: ₱${total} — verify before accepting]`
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
          p_subtotal: subtotal,
          // Keep the RPC payload compatible with the existing database function.
          // Rider tips are recorded separately in the notes/local order and are
          // intentionally excluded from store sales totals and delivery-fee checks.
          p_delivery_fee: deliveryFee,
          p_total: subtotal + deliveryFee,
          p_items: orderItems,
        },
      );

      if (error) throw error;

      const createdOrder = Array.isArray(data) ? data[0] : data;

      if (!createdOrder?.order_number) {
        throw new Error(
          "The order was saved, but no order number was returned.",
        );
      }

     try {
  const { error: notificationError } = await supabase.functions.invoke(
    "send-admin-push",
    {
      body: {
        record: {
          id: createdOrder.order_id,
          order_number: createdOrder.order_number,
          customer_name: cleanName,
          mobile: cleanMobile,
          order_type: orderType,
          payment_method: paymentMethod,
          address:
            orderType === "delivery" ? address.trim() : "",
          landmark:
            orderType === "delivery" ? landmark.trim() : "",
          total,
          items: orderItems,
        },
      },
    },
  );

  if (notificationError) {
    console.error("Order notification failed:", notificationError);
  }
} catch (notificationError) {
  console.error("Order notification failed:", notificationError);
}

      // The order RPC already creates/finds the customer. Ensure every new
      // online customer also receives a permanent KaSYP member ID.
      let resolvedMemberCode = "";
      const { data: customerRow } = await supabase
        .from("customers")
        .select("id,customer_code")
        .eq("mobile", cleanMobile)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (customerRow?.id) {
        resolvedMemberCode = customerRow.customer_code || `SYP${String(customerRow.id).padStart(4, "0")}`;
        if (!customerRow.customer_code) {
          const { error: memberUpdateError } = await supabase
            .from("customers")
            .update({ customer_code: resolvedMemberCode })
            .eq("id", customerRow.id);
          if (memberUpdateError) console.warn("Member ID update failed:", memberUpdateError);
        }
      }

      if (fcmToken) {
  const { data: savedPushToken, error: pushTokenError } = await supabase
    .from("customer_push_tokens")
    .insert({
      customer_id: customerRow?.id ?? null,
      order_id: createdOrder.order_id,
      mobile: cleanMobile,
      fcm_token: fcmToken,
      platform: navigator.platform || "unknown",
      browser: navigator.userAgent,
      is_active: true,
    })
    .select()
    .single();

  if (pushTokenError) {
    console.error("Customer push token insert failed:", pushTokenError);
    alert(`Push token save failed: ${pushTokenError.message}`);
  } else {
    console.log("Customer push token saved:", savedPushToken);
  }
}
      if (resolvedMemberCode) {
        const target = `${window.location.origin}/member-login?identity=${encodeURIComponent(resolvedMemberCode)}&source=online-order`;
        setMemberCode(resolvedMemberCode);
        setMemberQrTarget(target);
      }

      const savedOrder = {
        orderId: createdOrder.order_id,
        orderNumber: createdOrder.order_number,
        customerName: cleanName,
        mobile: cleanMobile,
        orderType,
        paymentMethod,
        address:
          orderType === "delivery" ? address.trim() : "",
        landmark:
          orderType === "delivery" ? landmark.trim() : "",
        notes: notes.trim(),
        riderTip: tipAmount,
        items: cart,
        subtotal,
        deliveryFee,
        total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "latestSypOrder",
        JSON.stringify(savedOrder),
      );

      // Preserve the final payment details before clearing the cart.
      setSubmittedTotal(total);
      setSubmittedPaymentMethod(paymentMethod);
      setSubmittedOrderNumber(createdOrder.order_number);
      localStorage.removeItem("sypCart");
      setCart([]);
    } catch (error) {
      const supabaseError = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      console.error("Order submission failed:", {
        message: supabaseError?.message,
        details: supabaseError?.details,
        hint: supabaseError?.hint,
        code: supabaseError?.code,
        raw: error,
      });

      const message =
        supabaseError?.message ||
        supabaseError?.details ||
        (error instanceof Error ? error.message : "Unable to submit your order.");

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        Loading checkout...
      </main>
    );
  }

  if (submittedOrderNumber) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
            ✓
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Order submitted
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Thank you, {customerName}!
          </h1>

          <p className="mt-4 text-neutral-400">
            Your official order number is:
          </p>

          <p className="mt-3 text-2xl font-bold text-amber-400">
            {submittedOrderNumber}
          </p>

          {memberCode && memberQrTarget && (
            <div className="mt-7 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Your KaSYP Member Account</p>
              <p className="mt-2 text-2xl font-black text-white">{memberCode}</p>
              <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=5&format=png&data=${encodeURIComponent(memberQrTarget)}`} alt={`Member QR for ${memberCode}`} className="h-44 w-44 object-contain" />
              </div>
              <p className="mt-3 text-sm text-neutral-300">Screenshot this QR and member ID. Use it on your next order to collect stamps.</p>
              <Link href={memberQrTarget} className="mt-4 inline-flex rounded-full bg-amber-400 px-5 py-2.5 font-bold text-black">Open My Member Account</Link>
            </div>
          )}

          {submittedPaymentMethod === "gcash" && (
            <div className="mt-7 rounded-3xl border border-sky-500/30 bg-sky-500/10 p-5 text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                Complete GCash payment
              </p>
              <p className="mt-3 text-3xl font-bold">₱{submittedTotal}</p>
              <p className="mt-3 text-sm text-neutral-300">
                Send to <strong>{gcashAccountName}</strong>
                {gcashAccountNumber ? ` • ${gcashAccountNumber}` : ""}.
                Check the recipient and amount inside GCash before confirming.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href={buildGcashPaymentUrl(
                    submittedTotal,
                    submittedOrderNumber,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-center font-bold text-white transition hover:bg-sky-400"
                >
                  Open GCash • Pay ₱{submittedTotal}
                </a>
                <button
                  type="button"
                  onClick={() => setShowGcashQr(true)}
                  className="inline-flex items-center justify-center rounded-full border border-sky-400/50 px-5 py-3 font-bold text-sky-200 transition hover:border-sky-300 hover:bg-sky-400/10"
                >
                  Show QR for another phone
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyPaymentValue(
                      submittedTotal.toFixed(2),
                      "Amount",
                    )
                  }
                  className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-neutral-200 hover:border-white/25"
                >
                  Copy ₱{submittedTotal}
                </button>
                <button
                  type="button"
                  disabled={!gcashAccountNumber}
                  onClick={() =>
                    copyPaymentValue(gcashAccountNumber, "GCash number")
                  }
                  className="rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold text-neutral-200 hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Copy GCash number
                </button>
              </div>

              {copyNotice && (
                <p className="mt-3 text-center text-xs font-semibold text-emerald-300" aria-live="polite">
                  {copyNotice}
                </p>
              )}

              <p className="mt-3 text-xs text-neutral-400">
                Always confirm the recipient name and exact amount before sending.
              </p>
            </div>
          )}

          {showGcashQr && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
              role="dialog"
              aria-modal="true"
              aria-label="GCash payment QR"
            >
              <section className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
                      Scan using another phone
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      Pay ₱{submittedTotal}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">
                      Order {submittedOrderNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGcashQr(false)}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-neutral-300 hover:border-white/30"
                  >
                    Close
                  </button>
                </div>

                {gcashQrImageUrl ? (
                  <div className="mt-5 rounded-3xl bg-white p-4">
                    <img
                      src={gcashQrImageUrl}
                      alt={`GCash QR for ${gcashAccountName}`}
                      className="mx-auto aspect-square w-full max-w-[320px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-dashed border-white/20 p-8 text-center text-sm text-neutral-400">
                    GCash QR is temporarily unavailable. Please use the account number shown below.
                  </div>
                )}

                <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-neutral-300">
                  <p>Account: <strong>{gcashAccountName}</strong></p>
                  {gcashAccountNumber && (
                    <p className="mt-1">Number: <strong>{gcashAccountNumber}</strong></p>
                  )}
                  <p className="mt-1">Exact amount: <strong>₱{submittedTotal}</strong></p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyPaymentValue(
                        submittedTotal.toFixed(2),
                        "Amount",
                      )
                    }
                    className="rounded-full bg-sky-500 px-4 py-3 font-bold text-white hover:bg-sky-400"
                  >
                    Copy amount
                  </button>
                  <button
                    type="button"
                    disabled={!gcashAccountNumber}
                    onClick={() =>
                      copyPaymentValue(gcashAccountNumber, "GCash number")
                    }
                    className="rounded-full border border-white/15 px-4 py-3 font-bold text-white hover:border-white/30 disabled:opacity-40"
                  >
                    Copy number
                  </button>
                </div>
              </section>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/track/${encodeURIComponent(
                submittedOrderNumber,
              )}`}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-7 py-3 font-semibold text-black transition hover:bg-amber-300"
            >
              Track My Order
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3 font-semibold text-white transition hover:border-amber-400 hover:text-amber-400"
            >
              Order Again
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
        <section className="text-center">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-neutral-400">
            Add your favorite SYP products before checking out.
          </p>
          <Link
            href="/menu"
            className="mt-7 inline-block rounded-full bg-amber-400 px-7 py-3 font-semibold text-black"
          >
            Return to Menu
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/menu">
            <p className="font-bold">SYP ON CAFÉ</p>
            <p className="text-xs text-neutral-500">
              Street • Iced • Brewed
            </p>
          </Link>
          <p className="text-sm text-neutral-400">Secure Checkout</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <Link href="/menu" className="text-sm font-medium text-amber-400">
            ← Return to Menu
          </Link>

          <h1 className="mt-7 text-4xl font-bold">Checkout</h1>
          <p className="mt-3 text-neutral-400">
            Complete your information before submitting your order.
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-xl font-semibold">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="text-sm text-neutral-300">Full name</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400"
                  />
                </label>

                <label>
                  <span className="text-sm text-neutral-300">
                    Mobile number
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="09XXXXXXXXX"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-xl font-semibold">Order Method</h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={
                    orderType === "pickup"
                      ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 p-4 text-left"
                  }
                >
                  <span className="block font-semibold">Store Pickup</span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    No additional fee
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={
                    orderType === "delivery"
                      ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 p-4 text-left"
                  }
                >
                  <span className="block font-semibold">Delivery</span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    Starts at ₱30
                  </span>
                </button>
              </div>

              {orderType === "delivery" && (
                <div className="mt-5 space-y-5">
                  <label className="block">
                    <span className="text-sm text-neutral-300">
                      Complete address
                    </span>
                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="House number, street, barangay and municipality"
                      rows={3}
                      className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-neutral-300">Landmark</span>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(event) => setLandmark(event.target.value)}
                      placeholder="Nearby landmark"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400"
                    />
                  </label>
                </div>
              )}
            </div>

            {orderType === "delivery" && (
              <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Tip Your Rider</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Optional. 100% of this amount is recorded as rider tip.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-400">
                    ₱{tipAmount}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[5, 10, 15, 20, 30].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => chooseTip(amount)}
                      className={
                        riderTip === amount && customTip === ""
                          ? "rounded-xl border border-amber-400 bg-amber-400 px-3 py-3 font-bold text-black"
                          : "rounded-xl border border-white/10 bg-black px-3 py-3 font-semibold"
                      }
                    >
                      ₱{amount}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => chooseTip(0)}
                    className={
                      riderTip === 0
                        ? "rounded-xl border border-amber-400 bg-amber-400 px-3 py-3 font-bold text-black"
                        : "rounded-xl border border-white/10 bg-black px-3 py-3 font-semibold"
                    }
                  >
                    No tip
                  </button>
                </div>

                <label className="mt-4 block">
                  <span className="text-sm text-neutral-300">Customized tip</span>
                  <div className="mt-2 flex items-center rounded-2xl border border-white/10 bg-black px-4 focus-within:border-amber-400">
                    <span className="text-neutral-500">₱</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customTip}
                      onChange={(event) => updateCustomTip(event.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-transparent px-2 py-3 outline-none"
                    />
                  </div>
                </label>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-xl font-semibold">Payment Method</h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={
                    paymentMethod === "cash"
                      ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 p-4 text-left"
                  }
                >
                  <span className="block font-semibold">Cash</span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    Pay upon pickup or delivery
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("gcash")}
                  className={
                    paymentMethod === "gcash"
                      ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 p-4 text-left"
                  }
                >
                  <span className="block font-semibold">GCash</span>
                  <span className="mt-1 block text-sm text-neutral-500">
                    Open GCash after order submission
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <label className="block">
                <span className="text-xl font-semibold">Order Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Less ice, no straw, delivery instructions, etc."
                  rows={3}
                  className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400"
                />
              </label>
            </div>
          </div>
        </section>

        <aside>
          <div className="sticky top-6 rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <h2 className="text-2xl font-bold">Order Summary</h2>

            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="border-b border-white/10 pb-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {item.quantity}× {item.name}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {formatTemperature(item.temperature)}{" "}
                        {item.temperature !== "regular" && "• "}
                        {item.size} • Base ₱{Number(
                          item.basePrice ?? item.price,
                        )}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₱{item.price * item.quantity}
                    </p>
                  </div>

                  {item.addOns && item.addOns.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-amber-300">
                      {item.addOns.map((addOn) => (
                        <p key={addOn.id}>
                          + {addOn.name} (₱{addOn.price})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>₱{subtotal}</span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Delivery fee</span>
                <span>
                  {deliveryFee === 0 ? "Free" : `₱${deliveryFee}`}
                </span>
              </div>

              {orderType === "delivery" && (
                <div className="flex justify-between text-neutral-400">
                  <span>Rider tip</span>
                  <span>{tipAmount === 0 ? "No tip" : `₱${tipAmount}`}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-white/10 pt-4 text-xl font-bold">
                <span>Total</span>
                <span className="text-amber-400">₱{total}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5">
  <h3 className="font-bold text-lg">
    🔔 Live Order Updates
  </h3>

  <p className="mt-2 text-sm text-neutral-300">
    Receive notifications when your order is accepted,
    preparing, ready or out for delivery.
  </p>

  <button
    type="button"
    onClick={enableOrderUpdates}
    disabled={pushEnabled}
    className="mt-4 rounded-full bg-emerald-500 px-5 py-3 font-bold text-black"
  >
    {pushEnabled ? "Enabled ✓" : "Enable Updates"}
  </button>
</div>

            <button
              type="button"
              onClick={submitOrder}
              disabled={isSubmitting}
              className="mt-7 w-full rounded-full bg-amber-400 px-6 py-4 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Submitting Order..."
                : `Place Order • ₱${total}`}
            </button>

            {submitError && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                Order failed: {submitError}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}