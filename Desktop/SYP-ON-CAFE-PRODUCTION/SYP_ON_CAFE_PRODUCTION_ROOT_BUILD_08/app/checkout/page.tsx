"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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


export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const gcashAccountName =
    process.env.NEXT_PUBLIC_GCASH_ACCOUNT_NAME?.trim() || "SYP ON CAFÉ";
  const gcashAccountNumber =
    process.env.NEXT_PUBLIC_GCASH_ACCOUNT_NUMBER?.trim() || "";
  const gcashPaymentUrl =
    process.env.NEXT_PUBLIC_GCASH_PAYMENT_URL?.trim() || "https://gcash.com/";

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
              <a
                href={gcashPaymentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-400"
              >
                Open GCash • Pay ₱{submittedTotal}
              </a>
              <p className="mt-3 text-xs text-neutral-400">
                The order stays pending until staff verifies the payment. Automatic prefilled merchant checkout requires an approved GCash for Business payment gateway.
              </p>
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