"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./pos.css";
import { chooseReceiptQuote, getSeasonalReceiptTheme } from "@/lib/receipt-quotes";
import { supabase } from "@/lib/supabase";
import { addCloudStamp, claimCloudFreeDrink, CloudMember, listCloudMembers, searchCloudMembers } from "@/lib/member-cloud";

type Category = "All" | "Coffee" | "Matcha" | "Soda" | "Milky" | "Fries" | "Signature" | "ADDS";
type Payment = "Cash" | "GCash" | "Maya";
type ReceiptStyle = "eco" | "classic" | "premium";
type DiscountReason = "None" | "Loyalty Reward" | "Promo" | "Senior/PWD" | "Manager Adjustment" | "Other";
type ShiftStats = { sales: number; orders: number; members: number; freeDrinks: number; loading: boolean; error: string };

type LiveOrderItem = { name: string; size: string; qty: number; unitPrice: number; image: string; details: string };
type LiveOrderSnapshot = {
  mode: "cart" | "thank-you";
  queueNo?: string;
  receiptNo?: string;
  items: LiveOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  customerName?: string;
  memberCode?: string;
  memberStamps?: number;
  paymentMethod?: Payment;
  cashReceived?: number;
  changeDue?: number;
  amountDue?: number;
  stampAdded?: boolean;
  rewardClaimed?: boolean;
  updatedAt: string;
};
type KitchenOrder = LiveOrderSnapshot & {
  id: string;
  queueNo: string;
  receiptNo: string;
  status: "new" | "preparing" | "ready" | "served";
  createdAt: string;
  note?: string;
};

type OnlineOrderRow = {
  id: number;
  order_number: string;
  customer_name: string;
  mobile: string;
  order_type: "pickup" | "delivery";
  payment_method: "cash" | "gcash";
  payment_status?: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string | null;
  created_at: string;
};

type OnlineOrderItemRow = {
  product_name: string;
  size?: string | null;
  price: number;
  quantity: number;
  line_total?: number | null;
  temperature?: string | null;
};

function playOnlineOrderTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(1180, context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.16, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.48);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.48);
    oscillator.addEventListener("ended", () => void context.close());
  } catch (error) {
    console.error("Unable to play online order alert:", error);
  }
}

function printOnlineOrderReceipt(order: OnlineOrderRow, items: OnlineOrderItemRow[], cashierName: string) {
  const popup = window.open("", "_blank", "width=420,height=900");
  if (!popup) return false;

  const rows = items.map((item) => `<tr><td>${item.quantity}× ${escapeReceiptText(item.product_name)}<small>${escapeReceiptText([item.temperature, item.size].filter(Boolean).join(" · "))}</small></td><td>₱${Number(item.line_total ?? item.price * item.quantity).toLocaleString("en-PH")}</td></tr>`).join("");
  const preparationCopy = order.order_type === "delivery" ? "RIDER COPY" : "STORE / PREPARATION COPY";

  const receiptCopy = (copyLabel: string, footer: string) => `<main class="r">
    <div class="c"><div class="brand">SYP ON CAFÉ</div><div class="copy">${copyLabel}</div><div class="muted">ONLINE ORDER RECEIPT</div></div>
    <div class="dash"></div>
    <div class="line"><span>Order</span><b>${escapeReceiptText(order.order_number)}</b></div>
    <div class="line"><span>Date</span><b>${new Date(order.created_at).toLocaleString("en-PH")}</b></div>
    <div class="line"><span>Cashier</span><b>${escapeReceiptText(cashierName || "Alex")}</b></div>
    <div class="line"><span>Customer</span><b>${escapeReceiptText(order.customer_name)}</b></div>
    <div class="line"><span>Mobile</span><b>${escapeReceiptText(order.mobile)}</b></div>
    <div class="tag">${order.order_type.toUpperCase()} · ${order.payment_method.toUpperCase()}${order.payment_status ? ` · ${escapeReceiptText(order.payment_status.toUpperCase())}` : ""}</div>
    <div class="dash"></div><table>${rows}</table><div class="dash"></div>
    <div class="line"><span>Subtotal</span><b>₱${Number(order.subtotal || 0).toLocaleString("en-PH")}</b></div>
    <div class="line"><span>Delivery</span><b>₱${Number(order.delivery_fee || 0).toLocaleString("en-PH")}</b></div>
    <div class="line total"><span>TOTAL</span><b>₱${Number(order.total || 0).toLocaleString("en-PH")}</b></div>
    ${order.notes ? `<div class="dash"></div><div class="notes"><b>Notes:</b><br>${escapeReceiptText(order.notes).replaceAll("\n", "<br>")}</div>` : ""}
    <div class="dash"></div><div class="c muted">${footer}</div>
  </main>`;

  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeReceiptText(order.order_number)}</title><style>
    @page{size:80mm auto;margin:3mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0}.r{width:72mm;margin:0 auto;padding:1mm 0}.c{text-align:center}.brand{font-size:20px;font-weight:900}.copy{display:inline-block;margin:5px 0 2px;padding:4px 9px;border:2px solid #111;font-size:13px;font-weight:900;letter-spacing:.08em}.muted{font-size:11px;color:#555}.dash{border-top:1px dashed #333;margin:8px 0}table{width:100%;border-collapse:collapse;font-size:12px}td{padding:4px 0;vertical-align:top}td:last-child{text-align:right;font-weight:700}small{display:block;color:#555;margin-top:2px}.line{display:flex;justify-content:space-between;gap:8px;font-size:12px;margin:4px 0}.line b{text-align:right}.total{font-size:18px;font-weight:900}.tag{border:1px solid #111;padding:6px;text-align:center;font-weight:800;margin:8px 0}.notes{font-size:11px}.cut{width:72mm;margin:8mm auto;border-top:2px dashed #111;text-align:center;position:relative}.cut span{position:relative;top:-9px;background:#fff;padding:0 6px;font-size:10px;font-weight:800}@media print{.copy-break{break-before:page;page-break-before:always}.cut{display:none}}
  </style></head><body>
    ${receiptCopy("CUSTOMER COPY", "Keep this receipt for order claiming.<br>Thank you, KaSYP!")}
    <div class="cut"><span>✂ CUT HERE</span></div>
    <div class="copy-break">${receiptCopy(preparationCopy, order.order_type === "delivery" ? "For rider handoff and delivery verification.<br>Please verify payment before release." : "For barista preparation and counter release.<br>Please verify payment before preparing.")}</div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),700)}<\/script>
  </body></html>`);
  popup.document.close();
  return true;
}

const LIVE_ORDER_KEY = "syp-live-order-v1";
const KITCHEN_ORDERS_KEY = "syp-kitchen-orders-v1";
const DISPLAY_CHANNEL = "syp-cafe-live-v1";
const LAST_POS_RECEIPT_KEY = "syp-last-pos-receipt-html-v1";

function openReceiptWindow(receiptHtml: string, existingWindow?: Window | null) {
  const printWindow =
    existingWindow && !existingWindow.closed
      ? existingWindow
      : window.open("", "_blank", "width=420,height=780");

  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  return true;
}

function publishCafeEvent(type: string, payload: unknown) {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(DISPLAY_CHANNEL);
    channel.postMessage({ type, payload });
    channel.close();
  } catch {
    // localStorage remains the cross-tab fallback.
  }
}

function makeQueueNumber(date: Date) {
  const shiftStart = new Date(date);
  if (date.getHours() < 4) shiftStart.setDate(shiftStart.getDate() - 1);
  shiftStart.setHours(17, 0, 0, 0);
  const key = `syp-queue-${shiftStart.toISOString().slice(0, 10)}`;
  const next = Math.max(1, Number(window.localStorage.getItem(key) || "0") + 1);
  window.localStorage.setItem(key, String(next));
  return `A-${String(next).padStart(3, "0")}`;
}


type Product = {
  id: string;
  name: string;
  size: string;
  price: number;
  category: Exclude<Category, "All">;
  image: string;
  bestseller?: boolean;
};

type AddOn = { id: string; name: string; price: number };
type Customization = {
  temperature: "Iced" | "Hot";
  sugar: "0%" | "25%" | "50%" | "75%" | "100%";
  ice: "No Ice" | "Less Ice" | "Normal Ice" | "Extra Ice";
  espressoShots: number;
  flavor?: string;
  addons: AddOn[];
  notes: string;
};
type CartItem = Product & {
  lineId: string;
  qty: number;
  unitPrice: number;
  customization: Customization;
};

const products: Product[] = [
  { id: "americano-16", name: "Americano", size: "16oz", price: 69, category: "Coffee", image: "/products/iced-americano-official.webp" },
  { id: "americano-22", name: "Americano", size: "22oz", price: 79, category: "Coffee", image: "/products/iced-americano-official.webp" },
  { id: "spanish-16", name: "Spanish Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/spanish-latte.webp", bestseller: true },
  { id: "spanish-22", name: "Spanish Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/spanish-latte.webp", bestseller: true },
  { id: "oreo-16", name: "Oreo Latte", size: "16oz", price: 79, category: "Coffee", image: "/products/oreo-latte-corrected.webp" },
  { id: "oreo-22", name: "Oreo Latte", size: "22oz", price: 99, category: "Coffee", image: "/products/oreo-latte-corrected.webp" },
  { id: "milo-latte-16", name: "Iced Milo Latte", size: "16oz", price: 79, category: "Coffee", image: "/products/iced-milo-latte.webp" },
  { id: "milo-latte-22", name: "Iced Milo Latte", size: "22oz", price: 99, category: "Coffee", image: "/products/iced-milo-latte.webp" },
  { id: "vanilla-16", name: "Vanilla Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "vanilla-22", name: "Vanilla Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "french-vanilla-16", name: "French Vanilla Latte", size: "16oz", price: 89, category: "Coffee", image: "/products/french-vanilla-latte.webp" },
  { id: "french-vanilla-22", name: "French Vanilla Latte", size: "22oz", price: 109, category: "Coffee", image: "/products/french-vanilla-latte.webp" },
  { id: "almond-16", name: "Roasted Almond Latte", size: "16oz", price: 99, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "almond-22", name: "Roasted Almond Latte", size: "22oz", price: 119, category: "Coffee", image: "/products/roasted-almond-latte-corrected.webp" },
  { id: "biscoff-16", name: "Biscoff Latte", size: "16oz", price: 99, category: "Coffee", image: "/products/biscoff-latte.webp" },
  { id: "biscoff-22", name: "Biscoff Latte", size: "22oz", price: 119, category: "Coffee", image: "/products/biscoff-latte.webp" },

  // Hot Coffee Collection — unified official black SYP cup
  { id: "hot-americano-8", name: "Hot Americano", size: "8oz", price: 49, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-americano-12", name: "Hot Americano", size: "12oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-spanish-8", name: "Hot Spanish Latte", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-spanish-12", name: "Hot Spanish Latte", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-oreo-8", name: "Hot Oreo Latte", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-oreo-12", name: "Hot Oreo Latte", size: "12oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-milo-8", name: "Hot Milo Latte", size: "8oz", price: 69, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-milo-12", name: "Hot Milo Latte", size: "12oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-mocha-8", name: "Hot Mocha", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-mocha-12", name: "Hot Mocha", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-white-mocha-8", name: "Hot White Mocha", size: "8oz", price: 79, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-white-mocha-12", name: "Hot White Mocha", size: "12oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-almond-8", name: "Hot Roasted Almond Latte", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-almond-12", name: "Hot Roasted Almond Latte", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-biscoff-8", name: "Hot Biscoff Latte", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-biscoff-12", name: "Hot Biscoff Latte", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-salted-caramel-8", name: "Hot Salted Caramel", size: "8oz", price: 89, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },
  { id: "hot-salted-caramel-12", name: "Hot Salted Caramel", size: "12oz", price: 99, category: "Coffee", image: "/products/hot-coffee-black-cup.webp" },

  { id: "milo-dino-16", name: "Milo Dino", size: "16oz", price: 79, category: "Milky", image: "/products/milo-dino.webp" },
  { id: "milo-dino-22", name: "Milo Dino", size: "22oz", price: 99, category: "Milky", image: "/products/milo-dino.webp" },
  { id: "oreo-milky-16", name: "Oreo Milky", size: "16oz", price: 79, category: "Milky", image: "/products/oreo-milky.webp" },
  { id: "oreo-milky-22", name: "Oreo Milky", size: "22oz", price: 99, category: "Milky", image: "/products/oreo-milky.webp" },
  { id: "caramel-macchiato-16", name: "Caramel Macchiato", size: "16oz", price: 99, category: "Milky", image: "/products/caramel-macchiato.webp", bestseller: true },
  { id: "caramel-macchiato-22", name: "Caramel Macchiato", size: "22oz", price: 119, category: "Milky", image: "/products/caramel-macchiato.webp", bestseller: true },
  { id: "white-choco-16", name: "Milky White Choco", size: "16oz", price: 99, category: "Milky", image: "/products/milky-white-choco.webp" },
  { id: "white-choco-22", name: "Milky White Choco", size: "22oz", price: 119, category: "Milky", image: "/products/milky-white-choco.webp" },
  { id: "milky-choco-16", name: "Milky Choco", size: "16oz", price: 99, category: "Milky", image: "/products/milky-choco.webp" },
  { id: "milky-choco-22", name: "Milky Choco", size: "22oz", price: 119, category: "Milky", image: "/products/milky-choco.webp" },
  { id: "matcha-16", name: "Matcha Latte", size: "16oz", price: 109, category: "Matcha", image: "/products/matcha-latte.webp", bestseller: true },
  { id: "matcha-22", name: "Matcha Latte", size: "22oz", price: 129, category: "Matcha", image: "/products/matcha-latte.webp", bestseller: true },
  { id: "strawberry-matcha-16", name: "Strawberry Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/strawberry-matcha.webp" },
  { id: "strawberry-matcha-22", name: "Strawberry Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/strawberry-matcha.webp" },
  { id: "mango-matcha-16", name: "Mango Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/mango-matcha.webp" },
  { id: "mango-matcha-22", name: "Mango Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/mango-matcha.webp" },
  { id: "blueberry-matcha-16", name: "Blueberry Matcha", size: "16oz", price: 109, category: "Matcha", image: "/products/blueberry-matcha.webp" },
  { id: "blueberry-matcha-22", name: "Blueberry Matcha", size: "22oz", price: 129, category: "Matcha", image: "/products/blueberry-matcha.webp" },
  { id: "biscoff-matcha-16", name: "Biscoff Matcha", size: "16oz", price: 119, category: "Matcha", image: "/products/biscoff-matcha.webp" },
  { id: "biscoff-matcha-22", name: "Biscoff Matcha", size: "22oz", price: 139, category: "Matcha", image: "/products/biscoff-matcha.webp" },
  { id: "oreo-matcha-16", name: "Oreo Matcha", size: "16oz", price: 119, category: "Matcha", image: "/products/oreo-matcha.webp" },
  { id: "oreo-matcha-22", name: "Oreo Matcha", size: "22oz", price: 139, category: "Matcha", image: "/products/oreo-matcha.webp" },

  { id: "green-apple-16", name: "Green Apple", size: "16oz", price: 39, category: "Soda", image: "/products/green-apple.webp" },
  { id: "green-apple-22", name: "Green Apple", size: "22oz", price: 49, category: "Soda", image: "/products/green-apple.webp" },
  { id: "mango-soda-16", name: "Mango", size: "16oz", price: 39, category: "Soda", image: "/products/mango.webp" },
  { id: "mango-soda-22", name: "Mango", size: "22oz", price: 49, category: "Soda", image: "/products/mango.webp" },
  { id: "orange-16", name: "Orange", size: "16oz", price: 39, category: "Soda", image: "/products/orange.webp" },
  { id: "orange-22", name: "Orange", size: "22oz", price: 49, category: "Soda", image: "/products/orange.webp" },
  { id: "strawberry-soda-16", name: "Strawberry", size: "16oz", price: 39, category: "Soda", image: "/products/strawberry.webp" },
  { id: "strawberry-soda-22", name: "Strawberry", size: "22oz", price: 49, category: "Soda", image: "/products/strawberry.webp" },
  { id: "watermelon-16", name: "Watermelon", size: "16oz", price: 39, category: "Soda", image: "/products/watermelon.webp" },
  { id: "watermelon-22", name: "Watermelon", size: "22oz", price: 49, category: "Soda", image: "/products/watermelon.webp" },
  { id: "blueberry-soda-16", name: "Blueberry", size: "16oz", price: 39, category: "Soda", image: "/products/blueberry.webp" },
  { id: "blueberry-soda-22", name: "Blueberry", size: "22oz", price: 49, category: "Soda", image: "/products/blueberry.webp" },
  { id: "peach-16", name: "Peach", size: "16oz", price: 39, category: "Soda", image: "/products/peach.webp" },
  { id: "peach-22", name: "Peach", size: "22oz", price: 49, category: "Soda", image: "/products/peach.webp" },

  { id: "choco-boom-16", name: "SYP Choco Boom", size: "16oz", price: 99, category: "Signature", image: "/products/syp-choco-boom.webp", bestseller: true },
  { id: "choco-boom-22", name: "SYP Choco Boom", size: "22oz", price: 119, category: "Signature", image: "/products/syp-choco-boom.webp", bestseller: true },
  { id: "white-rush-16", name: "SYP White Rush", size: "16oz", price: 99, category: "Signature", image: "/products/syp-white-rush.webp" },
  { id: "white-rush-22", name: "SYP White Rush", size: "22oz", price: 119, category: "Signature", image: "/products/syp-white-rush.webp" },

  { id: "fries-small", name: "SYP Bites", size: "Small", price: 49, category: "Fries", image: "/products/syp-fries.webp" },
  { id: "fries-medium", name: "SYP Cravings", size: "Medium", price: 79, category: "Fries", image: "/products/syp-fries.webp" },
  { id: "fries-barkada", name: "SYP Overload", size: "Barkada", price: 119, category: "Fries", image: "/products/syp-fries.webp" },
];

const categories: Category[] = ["All", "Coffee", "Matcha", "Soda", "Milky", "Fries", "Signature", "ADDS"];
const money = (value: number) => `₱${Math.max(0, value).toLocaleString("en-PH")}`;

export default function PosPage() {
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<Payment>("Cash");
  const [cash, setCash] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState<DiscountReason>("None");
  const [customDiscount, setCustomDiscount] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [memberResults, setMemberResults] = useState<CloudMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<CloudMember | null>(null);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberSearchError, setMemberSearchError] = useState("");
  const [addStamp, setAddStamp] = useState(true);
  const [redeemFreeDrink, setRedeemFreeDrink] = useState(false);
  const [autoPrint, setAutoPrint] = useState(true);
  const [lastReceiptHtml, setLastReceiptHtml] = useState("");
  const [savingSale, setSavingSale] = useState(false);
  const [displayRevision, setDisplayRevision] = useState(0);
  const [receiptStyle, setReceiptStyle] = useState<ReceiptStyle>("eco");
  const [orderNote, setOrderNote] = useState("");
  const [now, setNow] = useState(new Date());
  const [notice, setNotice] = useState("");
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [temperature, setTemperature] = useState<"Iced" | "Hot">("Iced");
  const [sugar, setSugar] = useState<Customization["sugar"]>("100%");
  const [ice, setIce] = useState<Customization["ice"]>("Normal Ice");
  const [espressoShots, setEspressoShots] = useState(2);
  const [flavor, setFlavor] = useState("Cheese");
  const [selectedAddons, setSelectedAddons] = useState<AddOn[]>([]);
  const [customNotes, setCustomNotes] = useState("");
  const [shiftStats, setShiftStats] = useState<ShiftStats>({ sales: 0, orders: 0, members: 0, freeDrinks: 0, loading: true, error: "" });
  const [cashierName, setCashierName] = useState("Alex");
  const [pendingOnlineOrders, setPendingOnlineOrders] = useState(0);
  const [onlineOrderAlert, setOnlineOrderAlert] = useState<string | null>(null);
  const [onlineSoundEnabled, setOnlineSoundEnabled] = useState(false);
  const [liveOrdersOpen, setLiveOrdersOpen] = useState(false);
  const onlineAlertIntervalRef = useRef<number | null>(null);
  const printedOnlineOrdersRef = useRef<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const holdThankYouRef = useRef(false);
  const thankYouTimerRef = useRef<number | null>(null);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const searchMatch = !q || `${product.name} ${product.size} ${product.category}`.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();

    for (const product of filteredProducts) {
      const key = `${product.category}::${product.name}`;
      const variants = groups.get(key) ?? [];
      variants.push(product);
      groups.set(key, variants);
    }

    return Array.from(groups.values()).map((variants) =>
      variants.sort((a, b) => Number.parseInt(a.size, 10) - Number.parseInt(b.size, 10)),
    );
  }, [filteredProducts]);

  const selectedVariants = useMemo(
    () =>
      selectedProduct
        ? products.filter(
            (product) =>
              product.name === selectedProduct.name &&
              product.category === selectedProduct.category,
          )
        : [],
    [selectedProduct],
  );

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const eligibleRewardLine = cart.find((item) => item.size === "16oz" && !["Soda", "Fries", "ADDS"].includes(item.category));
  const loyaltyRewardDiscount = redeemFreeDrink && selectedMember && selectedMember.stamps >= 10 && eligibleRewardLine ? eligibleRewardLine.unitPrice : 0;
  const total = Math.max(0, subtotal - discount - loyaltyRewardDiscount);
  const change = payment === "Cash" ? Math.max(0, cash - total) : 0;
  const checkoutReady = cart.length > 0 && (payment !== "Cash" || cash >= total);

  function appendCashDigit(digit: number) {
    if (payment !== "Cash") return;
    setCash((value) => {
      const current = Math.max(0, Math.floor(value));
      const next = Number(`${current}${digit}`);
      return Number.isFinite(next) ? Math.min(next, 999999) : current;
    });
  }

  function appendCashDoubleZero() {
    if (payment !== "Cash") return;
    setCash((value) => {
      const current = Math.max(0, Math.floor(value));
      return current === 0 ? 0 : Math.min(current * 100, 999999);
    });
  }

  function removeCashDigit() {
    if (payment !== "Cash") return;
    setCash((value) => Math.floor(Math.max(0, value) / 10));
  }

  useEffect(() => {
    const savedCashier = window.localStorage.getItem("sypCashierName");
    if (savedCashier?.trim()) setCashierName(savedCashier.trim());
    setLastReceiptHtml(window.localStorage.getItem(LAST_POS_RECEIPT_KEY) || "");
  }, []);

  const updateCashierName = (value: string) => {
    setCashierName(value);
    window.localStorage.setItem("sypCashierName", value.trim() || "Alex");
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("sypOnlineSoundEnabled");
    setOnlineSoundEnabled(saved === "1");
    try {
      const printed = JSON.parse(window.localStorage.getItem("sypPrintedOnlineOrders") || "[]") as string[];
      printedOnlineOrdersRef.current = new Set(printed.slice(-100));
    } catch {
      printedOnlineOrdersRef.current = new Set();
    }
  }, []);

  useEffect(() => {
    let active = true;

    const refreshPendingCount = async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (!error && active) setPendingOnlineOrders(count ?? 0);
    };

    const fetchAndPrintOrder = async (order: OnlineOrderRow) => {
      if (printedOnlineOrdersRef.current.has(order.order_number)) return;
      const { data: items, error } = await supabase
        .from("order_items")
        .select("product_name,size,price,quantity,line_total,temperature")
        .eq("order_id", order.id)
        .order("id", { ascending: true });
      if (error) {
        console.error("Unable to load online order items:", error);
        return;
      }
      const printed = printOnlineOrderReceipt(order, (items ?? []) as OnlineOrderItemRow[], cashierName);
      if (printed) {
        printedOnlineOrdersRef.current.add(order.order_number);
        window.localStorage.setItem("sypPrintedOnlineOrders", JSON.stringify(Array.from(printedOnlineOrdersRef.current).slice(-100)));
      }
    };

    void refreshPendingCount();
    const poll = window.setInterval(refreshPendingCount, 20000);
    const channel = supabase
      .channel("syp-pos-live-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const order = payload.new as OnlineOrderRow;
        setPendingOnlineOrders((value) => value + 1);
        setOnlineOrderAlert(order.order_number || "NEW ONLINE ORDER");
        if (onlineSoundEnabled) playOnlineOrderTone();
        if (onlineAlertIntervalRef.current) window.clearInterval(onlineAlertIntervalRef.current);
        onlineAlertIntervalRef.current = window.setInterval(() => {
          if (onlineSoundEnabled) playOnlineOrderTone();
        }, 6500);
        window.setTimeout(() => void fetchAndPrintOrder(order), 900);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => void refreshPendingCount())
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(poll);
      if (onlineAlertIntervalRef.current) window.clearInterval(onlineAlertIntervalRef.current);
      void supabase.removeChannel(channel);
    };
  }, [cashierName, onlineSoundEnabled]);

  const acknowledgeOnlineOrder = () => {
    setOnlineOrderAlert(null);
    if (onlineAlertIntervalRef.current) {
      window.clearInterval(onlineAlertIntervalRef.current);
      onlineAlertIntervalRef.current = null;
    }
  };

  const toggleOnlineSound = () => {
    const next = !onlineSoundEnabled;
    setOnlineSoundEnabled(next);
    window.localStorage.setItem("sypOnlineSoundEnabled", next ? "1" : "0");
    if (next) playOnlineOrderTone();
  };

  useEffect(() => {
    // Keep the completed-sale screen on the customer monitor for a full
    // 10 seconds, regardless of whether printing is enabled, cancelled,
    // blocked, or already finished.
    if (holdThankYouRef.current) return;

    const snapshot: LiveOrderSnapshot = {
      mode: "cart",
      items: cart.map((item) => ({
        name: item.name,
        size: item.size,
        qty: item.qty,
        unitPrice: item.unitPrice,
        image: item.image,
        details: item.category === "Fries"
          ? String(item.customization.flavor || "")
          : [item.customization.temperature, `${item.customization.sugar} sugar`, item.customization.ice].filter(Boolean).join(" · "),
      })),
      subtotal,
      discount: discount + loyaltyRewardDiscount,
      total,
      customerName: selectedMember?.name || customerQuery.trim() || undefined,
      memberCode: selectedMember?.member_code || undefined,
      memberStamps: selectedMember?.stamps ?? undefined,
      paymentMethod: payment,
      cashReceived: payment === "Cash" ? cash : undefined,
      changeDue: payment === "Cash" ? change : undefined,
      amountDue: payment === "Cash" ? Math.max(0, total - cash) : 0,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(LIVE_ORDER_KEY, JSON.stringify(snapshot));
    publishCafeEvent("live-order", snapshot);
  }, [cart, subtotal, discount, loyaltyRewardDiscount, total, selectedMember, customerQuery, payment, cash, change, displayRevision]);

  const applyManualDiscount = (amount: number, reason: DiscountReason = discountReason) => {
    const safeAmount = Math.max(0, Math.min(subtotal, Math.round(amount)));
    setDiscount(safeAmount);
    setDiscountReason(safeAmount > 0 ? (reason === "None" ? "Manager Adjustment" : reason) : "None");
  };

  const applyPercentDiscount = (percent: number) => {
    applyManualDiscount(subtotal * (percent / 100));
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);


  const showMemberDirectory = async () => {
    if (selectedMember) return;
    setMemberSearching(true);
    setMemberSearchError("");
    try {
      setMemberResults(await listCloudMembers(20));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown member loading error";
      setMemberResults([]);
      setMemberSearchError(message);
      setNotice("Hindi ma-load ang members. Patakbuhin ang Build 21.1 SQL sa Supabase, then refresh.");
    } finally {
      setMemberSearching(false);
    }
  };

  useEffect(() => {
    const query = customerQuery.trim();
    if (selectedMember && (query === selectedMember.name || query === selectedMember.member_code || query === selectedMember.mobile)) {
      setMemberResults([]);
      return;
    }
    if (!query) return;

    const timer = window.setTimeout(async () => {
      setMemberSearching(true);
      setMemberSearchError("");
      try {
        setMemberResults(await searchCloudMembers(query));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown member search error";
        setMemberResults([]);
        setMemberSearchError(message);
      } finally {
        setMemberSearching(false);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [customerQuery, selectedMember]);

  const loadShiftStats = async () => {
    const { start, end } = getBusinessShiftRange(new Date());
    setShiftStats((current) => ({ ...current, loading: true, error: "" }));

    const { data, error } = await supabase
      .from("orders")
      .select("id,total,customer_id,status,created_at")
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .eq("status", "completed");

    if (error) {
      setShiftStats((current) => ({ ...current, loading: false, error: error.message }));
      return;
    }

    const rows = data ?? [];
    const identifiedMembers = new Set(rows.map((row) => row.customer_id).filter(Boolean));
    setShiftStats({
      sales: rows.reduce((sum, row) => sum + Number(row.total || 0), 0),
      orders: rows.length,
      members: identifiedMembers.size,
      freeDrinks: 0,
      loading: false,
      error: "",
    });
  };

  useEffect(() => {
    void loadShiftStats();
    const refresh = window.setInterval(() => void loadShiftStats(), 30000);
    return () => window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (typing) return;

      const map: Record<string, Category> = { F1: "Coffee", F2: "Matcha", F3: "Milky", F4: "Soda" };
      if (map[event.key]) {
        event.preventDefault();
        setCategory(map[event.key]);
      }
      if (event.key === "Escape") {
        setCart([]);
        setCash(0);
        setDiscount(0);
        setDiscountReason("None");
        setCustomDiscount("");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const openCustomizer = (product: Product) => {
    setSelectedProduct(product);
    setTemperature(product.name.startsWith("Hot ") ? "Hot" : "Iced");
    setSugar("100%");
    setIce("Normal Ice");
    setEspressoShots(product.category === "Coffee" || product.category === "Signature" ? 2 : 0);
    setFlavor("Cheese");
    setSelectedAddons([]);
    setCustomNotes("");
  };

  const closeCustomizer = () => setSelectedProduct(null);

  const toggleAddon = (addon: AddOn) => {
    setSelectedAddons((current) => current.some((item) => item.id === addon.id)
      ? current.filter((item) => item.id !== addon.id)
      : [...current, addon]);
  };

  const customizationPrice = selectedProduct
    ? selectedProduct.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    : 0;

  const addCustomizedProduct = () => {
    if (!selectedProduct) return;
    const customization: Customization = {
      temperature,
      sugar,
      ice,
      espressoShots,
      flavor: selectedProduct.category === "Fries" ? flavor : undefined,
      addons: selectedAddons,
      notes: customNotes.trim(),
    };
    const signature = JSON.stringify(customization);
    const existing = cart.find((item) => item.id === selectedProduct.id && JSON.stringify(item.customization) === signature);

    setLastAdded(selectedProduct.id);
    setNotice(`${selectedProduct.name} ${selectedProduct.size} added to cart`);
    window.setTimeout(() => setLastAdded(null), 260);
    window.setTimeout(() => setNotice(""), 1500);

    if (existing) {
      setCart((current) => current.map((item) => item.lineId === existing.lineId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart((current) => [...current, {
        ...selectedProduct,
        lineId: `${selectedProduct.id}-${Date.now()}`,
        qty: 1,
        unitPrice: customizationPrice,
        customization,
      }]);
    }
    closeCustomizer();
  };

  const updateQty = (lineId: string, delta: number) => {
    setCart((current) => current
      .map((item) => item.lineId === lineId ? { ...item, qty: item.qty + delta } : item)
      .filter((item) => item.qty > 0));
  };

  const resetSale = () => {
    setCart([]);
    setCash(0);
    setDiscount(0);
    setDiscountReason("None");
    setCustomDiscount("");
    setOrderNote("");
    setNotice("Cart cleared");
    window.setTimeout(() => setNotice(""), 1200);
  };

  const completeSale = async () => {
    if (!checkoutReady || savingSale) return;

    setSavingSale(true);
    setNotice("Saving sale to Supabase...");

    const reservedPrintWindow = autoPrint
      ? window.open("", "_blank", "width=420,height=780")
      : null;

    if (reservedPrintWindow) {
      reservedPrintWindow.document.write(
        "<!doctype html><title>Preparing receipt...</title><body style='font-family:Arial;padding:24px'>Saving sale and preparing receipt...</body>",
      );
      reservedPrintWindow.document.close();
    }

    const completedAt = new Date();
    const receiptNo = createReceiptNumber(completedAt);
    const queueNo = makeQueueNumber(completedAt);
    let memberForReceipt = selectedMember;
    let rewardWasClaimed = false;

    const saleItems = cart.map((item) => ({
      productId: null,
      name: item.name,
      size: item.size,
      price: Number(item.unitPrice),
      quantity: Number(item.qty),
      temperature: item.customization.temperature.toLowerCase(),
      basePrice: Number(item.price),
      addOns: item.customization.addons.map((addon) => ({
        id: null,
        name: addon.name,
        price: Number(addon.price),
        group: "POS",
      })),
      details:
        item.category === "Fries"
          ? String(item.customization.flavor || "")
          : [
              item.customization.temperature,
              `${item.customization.sugar} sugar`,
              item.customization.ice,
              item.customization.notes,
            ]
              .filter(Boolean)
              .join(" · "),
    }));

    try {
      const memberMobile =
        selectedMember?.mobile?.replace(/\s+/g, "").trim() || "";
      const validMemberMobile = /^09\d{9}$/.test(memberMobile)
        ? memberMobile
        : "09999999999";
      const memberName =
        selectedMember?.name?.trim() ||
        customerQuery.trim() ||
        "WALK-IN CUSTOMER";

      const { data: savedRows, error: saveError } = await supabase.rpc(
        "create_pos_sale",
        {
          p_receipt_no: receiptNo,
          p_queue_no: queueNo,
          p_customer_name: memberName,
          p_mobile: validMemberMobile,
          p_member_code: selectedMember?.member_code || null,
          p_payment_method: payment.toLowerCase(),
          p_subtotal: subtotal,
          p_discount: discount + loyaltyRewardDiscount,
          p_discount_reason: redeemFreeDrink
            ? discount > 0
              ? `${discountReason} + Free Drink Reward`
              : "Free Drink Reward"
            : discountReason,
          p_total: total,
          p_cash_received: payment === "Cash" ? cash : total,
          p_change_due: payment === "Cash" ? change : 0,
          p_cashier: cashierName.trim() || "Alex",
          p_notes: orderNote.trim(),
          p_items: saleItems,
        },
      );

      if (saveError) {
        throw new Error(
          [
            saveError.message,
            saveError.details,
            saveError.hint,
            saveError.code,
          ]
            .filter(Boolean)
            .join(" | ") || "Unable to save POS sale.",
        );
      }

      const savedSale = Array.isArray(savedRows) ? savedRows[0] : savedRows;
      if (!savedSale?.order_id) {
        throw new Error("Supabase did not return a saved POS order ID.");
      }

      // Send the same admin push + Telegram alert used by online orders.
      // Notification failure never cancels an already-saved POS sale.
      

      // Loyalty changes only after the sale itself is safely recorded.
      if (redeemFreeDrink && selectedMember) {
        if (!eligibleRewardLine || selectedMember.stamps < 10) {
          throw new Error(
            "Free drink claim requires 10 stamps and one eligible 16oz drink in the cart.",
          );
        }

        memberForReceipt = await claimCloudFreeDrink(
          selectedMember.member_code,
          receiptNo,
          cashierName.trim() || "Alex",
        );
        rewardWasClaimed = true;
        setSelectedMember(memberForReceipt);
      } else if (
        addStamp &&
        selectedMember &&
        cart.some(
          (item) => item.category !== "Soda" && item.category !== "ADDS",
        )
      ) {
        try {
          memberForReceipt = await addCloudStamp(
            selectedMember.member_code,
            1,
          );
          setSelectedMember(memberForReceipt);
        } catch (loyaltyError) {
          console.error("Sale saved but loyalty update failed:", loyaltyError);
          setNotice(
            "Sale saved. Loyalty stamp failed; you may add it manually.",
          );
        }
      }

      const quote = chooseReceiptQuote(completedAt);
      const seasonalTheme = getSeasonalReceiptTheme(completedAt);
      const stampWasAdded = Boolean(
        !rewardWasClaimed &&
          addStamp &&
          selectedMember &&
          cart.some(
            (item) =>
              item.category !== "Soda" && item.category !== "ADDS",
          ),
      );
      const qrTarget = memberForReceipt
        ? `${window.location.origin}/member-login?identity=${encodeURIComponent(
            memberForReceipt.member_code,
          )}&source=receipt&receipt=${encodeURIComponent(receiptNo)}`
        : `${window.location.origin}/member-register?source=receipt&receipt=${encodeURIComponent(
            receiptNo,
          )}`;

      const receiptHtml = buildReceiptHtml({
        receiptNo,
        completedAt,
        cart,
        subtotal,
        discount: discount + loyaltyRewardDiscount,
        discountReason: rewardWasClaimed
          ? discount > 0
            ? `${discountReason} + Free Drink Reward`
            : "Free Drink Reward"
          : discountReason,
        total,
        payment,
        cash,
        change,
        customerQuery: memberForReceipt
          ? `${memberForReceipt.name} (${memberForReceipt.member_code})`
          : customerQuery,
        addStamp,
        orderNote,
        receiptStyle,
        quote,
        seasonalTheme,
        qrTarget,
        member: memberForReceipt,
        stampWasAdded,
        rewardWasClaimed,
        rewardDiscount: loyaltyRewardDiscount,
      });

      setLastReceiptHtml(receiptHtml);
      window.localStorage.setItem(LAST_POS_RECEIPT_KEY, receiptHtml);

      const orderItems: LiveOrderItem[] = cart.map((item) => ({
        name: item.name,
        size: item.size,
        qty: item.qty,
        unitPrice: item.unitPrice,
        image: item.image,
        details:
          item.category === "Fries"
            ? String(item.customization.flavor || "")
            : [
                item.customization.temperature,
                `${item.customization.sugar} sugar`,
                item.customization.ice,
                item.customization.notes,
              ]
                .filter(Boolean)
                .join(" · "),
      }));

      const finishedSnapshot: LiveOrderSnapshot = {
        mode: "thank-you",
        queueNo,
        receiptNo,
        items: orderItems,
        subtotal,
        discount: discount + loyaltyRewardDiscount,
        total,
        customerName:
          memberForReceipt?.name || customerQuery.trim() || undefined,
        memberCode: memberForReceipt?.member_code || undefined,
        memberStamps: memberForReceipt?.stamps ?? undefined,
        paymentMethod: payment,
        cashReceived: payment === "Cash" ? cash : undefined,
        changeDue: payment === "Cash" ? change : undefined,
        amountDue: 0,
        stampAdded: stampWasAdded,
        rewardClaimed: rewardWasClaimed,
        updatedAt: completedAt.toISOString(),
      };

      const kitchenOrder: KitchenOrder = {
        ...finishedSnapshot,
        id: receiptNo,
        queueNo,
        receiptNo,
        status: "new",
        createdAt: completedAt.toISOString(),
        note: orderNote.trim() || undefined,
      };

      const existingOrders: KitchenOrder[] = JSON.parse(
        window.localStorage.getItem(KITCHEN_ORDERS_KEY) || "[]",
      );
      window.localStorage.setItem(
        KITCHEN_ORDERS_KEY,
        JSON.stringify([kitchenOrder, ...existingOrders].slice(0, 100)),
      );
      // Lock the customer display before opening the print dialog so the
      // THANK YOU screen appears immediately after a successful checkout.
      holdThankYouRef.current = true;
      if (thankYouTimerRef.current) {
        window.clearTimeout(thankYouTimerRef.current);
      }

      window.localStorage.setItem(
        LIVE_ORDER_KEY,
        JSON.stringify(finishedSnapshot),
      );
      publishCafeEvent("kitchen-order", kitchenOrder);
      publishCafeEvent("live-order", finishedSnapshot);

      // Printing happens only after the customer display has already updated.
      // Cancelling or disabling print does not shorten the 10-second screen.
      if (autoPrint) {
        const printed = openReceiptWindow(receiptHtml, reservedPrintWindow);
        if (!printed) {
          setNotice(
            "Sale saved, but receipt popup was blocked. Use Reprint Last Receipt.",
          );
        }
      } else if (reservedPrintWindow && !reservedPrintWindow.closed) {
        reservedPrintWindow.close();
      }

      thankYouTimerRef.current = window.setTimeout(() => {
        holdThankYouRef.current = false;
        thankYouTimerRef.current = null;
        // Publish the latest cart state after the fixed standby period.
        setDisplayRevision((value) => value + 1);
      }, 10_000);

      setNotice(
        `SAVED • Queue ${queueNo} • ${money(total)} • ${receiptNo}${
          rewardWasClaimed
            ? " • FREE DRINK CLAIMED"
            : memberForReceipt && stampWasAdded
              ? ` • ${memberForReceipt.stamps}/10 stamps`
              : ""
        }`,
      );

      window.setTimeout(() => void loadShiftStats(), 500);
      window.setTimeout(() => {
        setCart([]);
        setCash(0);
        setDiscount(0);
        setDiscountReason("None");
        setCustomDiscount("");
        setOrderNote("");
        setCustomerQuery("");
        setSelectedMember(null);
        setRedeemFreeDrink(false);
        setMemberResults([]);
        setNotice("");
      }, 1800);
    } catch (cause) {
      if (reservedPrintWindow && !reservedPrintWindow.closed) {
        reservedPrintWindow.close();
      }

      const message =
        cause instanceof Error ? cause.message : "Unable to save POS sale.";
      console.error("POS sale failed:", cause);
      setNotice(`SALE NOT SAVED: ${message}`);
    } finally {
      setSavingSale(false);
    }
  };

  return (
    <main className="pos-shell">
      {notice && <div className="pos-toast" role="status">✓ {notice}</div>}
      {liveOrdersOpen && (
        <div className="live-orders-overlay" role="dialog" aria-modal="true" aria-label="Live online orders">
          <section className="live-orders-window">
            <header>
              <div><span>ONLINE ORDER CENTER</span><strong>Live Orders</strong><small>Manage orders without leaving the POS.</small></div>
              <div className="live-orders-window-actions">
                <button onClick={() => { const frame = document.getElementById("live-orders-frame") as HTMLIFrameElement | null; if (frame) frame.src = frame.src; }}>↻ Refresh</button>
                <a href="/admin" target="_blank" rel="noreferrer">Open full screen</a>
                <button className="close-live-orders" onClick={() => setLiveOrdersOpen(false)} aria-label="Close live orders">×</button>
              </div>
            </header>
            <iframe id="live-orders-frame" src="/admin" title="SYP ON CAFÉ Live Orders" />
          </section>
        </div>
      )}
      {onlineOrderAlert && (
        <div className="online-order-alert" role="alert">
          <div><span>NEW ONLINE ORDER</span><strong>{onlineOrderAlert}</strong><small>Receipt sent to printer. Open Live Orders to accept.</small></div>
          <button onClick={acknowledgeOnlineOrder}>ACKNOWLEDGE</button>
        </div>
      )}
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div className="brand-copy">
            <h1>SYP ON CAFÉ POS</h1>
            <p>Street · Iced · Brewed</p>
          </div>
        </div>

        <label className="global-search">
          <span className="search-icon">⌕</span>
          <input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products... e.g. Spanish Latte, Matcha, Soda" />
          <kbd>⌘K</kbd>
        </label>

        <div className="display-tools">
          <a href="/customer-display" target="_blank" rel="noreferrer">Customer Display</a>
          <a href="/kitchen" target="_blank" rel="noreferrer">Kitchen</a>
          <a href="/online-order" target="_blank" rel="noreferrer">Online Orders</a>
          <a href="/rider" target="_blank" rel="noreferrer">Rider</a>
        </div>
        <label className="cashier-card" title="Edit cashier name">
          <div className="avatar">{(cashierName.trim()[0] || "A").toUpperCase()}</div>
          <div className="cashier-copy">
            <span>Cashier</span>
            <input
              value={cashierName}
              onChange={(event) => updateCashierName(event.target.value)}
              onBlur={() => { if (!cashierName.trim()) updateCashierName("Alex"); }}
              aria-label="Cashier name"
            />
          </div>
        </label>
        <div className="clock">
          <strong>{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</strong>
          <span>{now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </header>

      <section className="workspace">
        <aside className="categories-panel">
          <div className="section-label">CATEGORIES</div>
          <div className="category-list">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`category-button ${category === item ? "active" : ""}`}>
                <span className="category-icon">{categoryIcon(item)}</span>
                <span><strong>{item === "All" ? "All Products" : item}</strong><small>{countCategory(item)} items</small></span>
              </button>
            ))}
          </div>
          <div className="top-seller-card">
            <div className="top-seller-title">♛ TOP SELLERS</div>
            <strong>Spanish Latte</strong>
            <span>48 cups today</span>
            <div className="mini-chart"><i /><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
        </aside>

        <section className="products-panel">
          <div className="panel-heading">
            <div><h2>{category === "All" ? "ALL PRODUCTS" : category.toUpperCase()}</h2><p>{groupedProducts.length} products</p></div>
            <div className="view-toggle"><button className="active">▦ Grid</button><button>☷ List</button></div>
          </div>
          <div className="product-grid">
            {groupedProducts.map((variants) => {
              const product = variants[0];
              const sizeText = variants.map((variant) => variant.size).join(" / ");
              const priceText =
                variants.length > 1
                  ? `${money(Math.min(...variants.map((variant) => variant.price)))}–${money(Math.max(...variants.map((variant) => variant.price)))}`
                  : money(product.price);

              return (
                <article
                  className={`product-card ${variants.some((variant) => lastAdded === variant.id) ? "just-added" : ""}`}
                  key={`${product.category}-${product.name}`}
                  onClick={() => openCustomizer(product)}
                >
                  {variants.some((variant) => variant.bestseller) && <span className="product-badge">BEST SELLER</span>}
                  <div className="product-image"><img src={product.image} alt={product.name} /></div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{sizeText}</p>
                    <div>
                      <strong>{priceText}</strong>
                      <button
                        aria-label={`Choose size for ${product.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openCustomizer(product);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="cart-panel">
          <div className="panel-heading cart-heading">
            <div><h2>CART <span>({itemCount} items)</span></h2></div>
            <button className="clear-cart" onClick={resetSale}>Clear Cart</button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart"><div className="bag-icon">☕</div><h3>Ready for your next order</h3><p>Tap any product to begin.</p><div className="empty-hint"><span>F1 Coffee</span><span>F2 Matcha</span><span>⌘K Search</span></div></div>
            ) : cart.map((item) => (
              <div className="cart-item smart-cart-item" key={item.lineId}>
                <img src={item.image} alt="" />
                <div className="cart-main">
                  <strong>{item.name}</strong>
                  <span>{item.size} · {item.customization.temperature}</span>
                  {item.category === "Fries" ? (
                    <small>{item.customization.flavor}</small>
                  ) : (
                    <small>{item.customization.sugar} sugar · {item.customization.ice}{item.customization.espressoShots > 0 ? ` · ${item.customization.espressoShots} shots` : ""}</small>
                  )}
                  {item.customization.addons.length > 0 && <small className="cart-addons">+ {item.customization.addons.map((addon) => addon.name).join(" · ")}</small>}
                  {item.customization.notes && <small className="cart-note">“{item.customization.notes}”</small>}
                  <b className="unit-price">{money(item.unitPrice)} each</b>
                </div>
                <div className="qty-control"><button onClick={() => updateQty(item.lineId, -1)}>−</button><b>{item.qty}</b><button onClick={() => updateQty(item.lineId, 1)}>+</button></div>
                <strong className="line-total">{money(item.unitPrice * item.qty)}</strong>
                <button className="remove" onClick={() => updateQty(item.lineId, -item.qty)}>×</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <input value={orderNote} onChange={(event) => setOrderNote(event.target.value)} placeholder="Add order note (optional)..." />
            <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="manual-discount-panel">
              <div className="manual-discount-heading"><span>MANUAL DISCOUNT</span><strong>- {money(discount)}</strong></div>
              <div className="discount-quick-buttons">
                {[5, 10, 20, 50].map((amount) => <button type="button" key={amount} onClick={() => applyManualDiscount(amount)}>₱{amount}</button>)}
                {[5, 10, 15, 20].map((percent) => <button type="button" key={`${percent}%`} onClick={() => applyPercentDiscount(percent)}>{percent}%</button>)}
              </div>
              <div className="discount-custom-row">
                <input inputMode="decimal" value={customDiscount} onChange={(event) => setCustomDiscount(event.target.value.replace(/[^0-9.]/g, ""))} placeholder="Custom ₱" />
                <button type="button" onClick={() => applyManualDiscount(Number(customDiscount || 0))}>Apply</button>
                <button type="button" onClick={() => { setDiscount(0); setDiscountReason("None"); setCustomDiscount(""); }}>Clear</button>
              </div>
              <select value={discountReason} onChange={(event) => setDiscountReason(event.target.value as DiscountReason)}>
                <option value="None">Select reason</option>
                <option value="Loyalty Reward">Loyalty Reward</option>
                <option value="Promo">Promo</option>
                <option value="Senior/PWD">Senior/PWD</option>
                <option value="Manager Adjustment">Manager Adjustment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grand-total"><span>TOTAL</span><strong>{money(total)}</strong></div>
          </div>
        </section>

        <aside className="checkout-panel">
          <div className="checkout-card customer-box safe421-loyalty-card">
            <h3>CUSTOMER</h3>
            <input
              value={customerQuery}
              onFocus={() => { if (!customerQuery.trim() && !selectedMember) void showMemberDirectory(); }}
              onClick={() => { if (!customerQuery.trim() && !selectedMember && memberResults.length === 0) void showMemberDirectory(); }}
              onChange={(event) => {
                const value = event.target.value;
                setCustomerQuery(value);
                setSelectedMember(null);
                if (!value.trim()) void showMemberDirectory();
              }}
              placeholder="⌕ Click to view clients or type name/mobile/SYP ID..."
            />
            {memberSearching && <small className="member-search-status">Loading members…</small>}
            {!memberSearching && memberSearchError && <div className="member-search-error"><b>Member loading failed</b><span>{memberSearchError}</span><button type="button" onClick={() => void showMemberDirectory()}>Retry</button></div>}
            {!selectedMember && memberResults.length > 0 && <div className="member-directory-label"><span>{customerQuery.trim() ? "SEARCH RESULTS" : "MEMBER DIRECTORY"}</span><b>{memberResults.length} shown</b></div>}
            {!selectedMember && memberResults.length > 0 && <div className="member-search-results">{memberResults.map((member) => <button type="button" key={member.id} onClick={() => { setSelectedMember(member); setRedeemFreeDrink(false); setCustomerQuery(member.name); setMemberResults([]); }}><span><strong>{member.name}</strong><small>{member.member_code} · {member.mobile}</small></span><b>{member.stamps}/10</b></button>)}</div>}
            {selectedMember ? <>
              <div className="customer-preview"><div className="avatar small">{selectedMember.name.split(" ").filter(Boolean).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</div><div><strong>{selectedMember.name}</strong><span>{selectedMember.member_code}</span></div><b>{selectedMember.stamps} / 10</b></div>
              <div className="stamps">{Array.from({ length: 10 }).map((_, index) => <i key={index} className={index < selectedMember.stamps ? "filled" : ""}>★</i>)}</div>
              <div className="customer-meta"><span><b>{selectedMember.total_visits}</b> Visits</span><span><b>{selectedMember.favorite_drink || "Not set"}</b> Favorite</span><span><b>{selectedMember.birthday ? new Date(`${selectedMember.birthday}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "—"}</b> Birthday</span></div>
              <button type="button" className="clear-member" onClick={() => { setSelectedMember(null); setRedeemFreeDrink(false); setCustomerQuery(""); }}>Remove member</button>
            </> : <div className="customer-empty">Search and select a member to add loyalty automatically.</div>}
          </div>

          <div className="checkout-card safe421-payment-card">
            <h3>PAYMENT METHOD</h3>
            <div className="payment-tabs">{(["Cash", "GCash", "Maya"] as const).map((method) => <button key={method} className={payment === method ? "active" : ""} onClick={() => { setPayment(method); if (method !== "Cash") setCash(total); }}>{method}</button>)}</div>
          </div>

          <div className="checkout-card calculator-card safe421-calculator-card">
            <div className="calculator-title">
              <h3>CASH CALCULATOR</h3>
              <span>Touchscreen keypad</span>
            </div>

            <label>Cash Received</label>
            <div className="cash-display safe421-cash-display">{money(cash)}</div>

            <div className="safe421-keypad">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((digit) => (
                <button
                  type="button"
                  key={digit}
                  onClick={() => appendCashDigit(digit)}
                  disabled={payment !== "Cash"}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className="safe421-backspace"
                onClick={removeCashDigit}
                disabled={payment !== "Cash"}
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => appendCashDigit(0)}
                disabled={payment !== "Cash"}
              >
                0
              </button>
              <button
                type="button"
                onClick={appendCashDoubleZero}
                disabled={payment !== "Cash"}
              >
                00
              </button>
            </div>

            <div className="cash-buttons cash-buttons-large safe421-quick-cash">
              {[20, 50, 100, 200, 500, 1000].map((amount) => (
                <button
                  type="button"
                  key={amount}
                  onClick={() => setCash((value) => value + amount)}
                  disabled={payment !== "Cash"}
                >
                  ₱{amount}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCash((value) => value + 10)}
                disabled={payment !== "Cash"}
              >
                +₱10
              </button>
              <button
                type="button"
                onClick={() => setCash((value) => value + 5)}
                disabled={payment !== "Cash"}
              >
                +₱5
              </button>
            </div>

            <div className="safe421-actions">
              <button
                type="button"
                onClick={() => setCash(total)}
                className="exact"
                disabled={payment !== "Cash"}
              >
                EXACT
              </button>
              <button
                type="button"
                onClick={() => setCash(0)}
                className="danger"
                disabled={payment !== "Cash"}
              >
                CLEAR
              </button>
            </div>

            <div className="change-row safe421-change-row">
              <span>Change</span>
              <strong>{money(change)}</strong>
            </div>

            <h3 className="suggested-title">SUGGESTED AMOUNTS</h3>
            <div className="suggested-grid safe421-suggested-grid">
              {suggestedAmounts(total).map((amount, index) => (
                <button
                  type="button"
                  key={`${amount}-${index}`}
                  onClick={() => setCash(amount)}
                  disabled={payment !== "Cash"}
                >
                  <strong>{money(amount)}</strong>
                  <span>
                    {amount === total
                      ? "No change"
                      : `Change: ${money(amount - total)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="checkout-card switches">
            <label><input type="checkbox" checked={addStamp} disabled={redeemFreeDrink} onChange={(event) => setAddStamp(event.target.checked)} /> Add loyalty stamp</label>
            <small>No stamp for Soda or ADDS-only orders.</small>
            {selectedMember && selectedMember.stamps >= 10 && (
              <label className="free-drink-switch"><input type="checkbox" checked={redeemFreeDrink} disabled={!eligibleRewardLine} onChange={(event) => { setRedeemFreeDrink(event.target.checked); if (event.target.checked) setAddStamp(false); }} /> Redeem FREE 16oz DRINK (10 stamps)</label>
            )}
            {selectedMember && selectedMember.stamps >= 10 && !eligibleRewardLine && <small className="reward-discount-note">Add an eligible 16oz Coffee, Matcha, Milky, or Signature drink to redeem.</small>}
            {redeemFreeDrink && <small className="reward-discount-note">Free 16oz drink discount: {money(loyaltyRewardDiscount)}</small>}
            <label><input type="checkbox" checked={autoPrint} onChange={(event) => setAutoPrint(event.target.checked)} /> Auto-print receipt</label>
            <label className="receipt-style-field">
              <span>Receipt style</span>
              <select value={receiptStyle} onChange={(event) => setReceiptStyle(event.target.value as ReceiptStyle)}>
                <option value="eco">Eco · compact + QR</option>
                <option value="classic">Classic · loyalty details</option>
                <option value="premium">Premium · seasonal + full details</option>
              </select>
            </label>
            <small>QR to KaSYP registration is always printed in every style.</small>
          </div>

          <button
            className="reprint-button"
            disabled={!lastReceiptHtml || savingSale}
            onClick={() => {
              const printed = openReceiptWindow(lastReceiptHtml);
              if (!printed) setNotice("Receipt popup was blocked by the browser");
            }}
          >
            ↻ REPRINT LAST RECEIPT
          </button>
          <button
            className="checkout-button"
            disabled={!checkoutReady || savingSale}
            onClick={completeSale}
          >
            <span className="lock">▣</span>
            <span>
              {savingSale ? "SAVING..." : "CHECKOUT"}
              <small>{savingSale ? "Supabase" : "F5 / ENTER"}</small>
            </span>
          </button>
        </aside>
      </section>

      {selectedProduct && (
        <div className="customizer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCustomizer(); }}>
          <section className="customizer-modal" role="dialog" aria-modal="true" aria-label={`Customize ${selectedProduct.name}`}>
            <header className="customizer-header">
              <div className="customizer-product">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
                <div><span>CUSTOMIZE ORDER</span><h2>{selectedProduct.name}</h2><p>{selectedProduct.size} · Base {money(selectedProduct.price)}</p></div>
              </div>
              <button className="modal-close" onClick={closeCustomizer} aria-label="Close">×</button>
            </header>

            <div className="customizer-body">
              {selectedVariants.length > 1 && (
                <OptionSection title="Size" subtitle="Choose one size">
                  <div className="choice-grid two">
                    {selectedVariants.map((variant) => (
                      <ChoiceButton
                        key={variant.id}
                        active={selectedProduct.id === variant.id}
                        onClick={() => setSelectedProduct(variant)}
                        label={`${variant.size} · ${money(variant.price)}`}
                      />
                    ))}
                  </div>
                </OptionSection>
              )}

              {selectedProduct.category !== "Fries" && selectedProduct.category !== "Soda" && (
                <OptionSection title="Temperature" subtitle="Serving style">
                  <div className="choice-grid two">
                    {(selectedProduct.name.startsWith("Hot ") ? (["Hot"] as const) : (["Iced"] as const)).map((value) => (
                      <ChoiceButton
                        key={value}
                        active
                        onClick={() => setTemperature(value)}
                        icon={value === "Iced" ? "❄" : "♨"}
                        label={value}
                      />
                    ))}
                  </div>
                </OptionSection>
              )}

              {selectedProduct.category === "Fries" ? (
                <OptionSection title="Flavor" subtitle="Choose one flavor">
                  <div className="choice-grid four">{["Cheese", "BBQ", "Chili BBQ", "Sour Cream"].map((value) => <ChoiceButton key={value} active={flavor === value} onClick={() => setFlavor(value)} label={value} />)}</div>
                </OptionSection>
              ) : selectedProduct.category !== "Soda" && (
                <>
                  <OptionSection title="Sugar Level" subtitle="Adjust sweetness">
                    <div className="choice-grid five">{(["0%", "25%", "50%", "75%", "100%"] as const).map((value) => <ChoiceButton key={value} active={sugar === value} onClick={() => setSugar(value)} label={value} />)}</div>
                  </OptionSection>
                  {temperature === "Iced" && <OptionSection title="Ice Level" subtitle="Select preferred ice">
                    <div className="choice-grid four">{(["No Ice", "Less Ice", "Normal Ice", "Extra Ice"] as const).map((value) => <ChoiceButton key={value} active={ice === value} onClick={() => setIce(value)} label={value} />)}</div>
                  </OptionSection>}
                </>
              )}

              {(selectedProduct.category === "Coffee" || selectedProduct.category === "Signature") && (
                <OptionSection title="Espresso Shots" subtitle="Included in the drink">
                  <div className="shot-stepper"><button onClick={() => setEspressoShots((value) => Math.max(0, value - 1))}>−</button><div><strong>{espressoShots}</strong><span>shots</span></div><button onClick={() => setEspressoShots((value) => Math.min(6, value + 1))}>+</button></div>
                </OptionSection>
              )}

              <OptionSection title="Add-ons" subtitle="Optional upgrades">
                <div className="addon-grid">{addonsFor(selectedProduct.category).map((addon) => {
                  const active = selectedAddons.some((item) => item.id === addon.id);
                  return <button key={addon.id} className={active ? "active" : ""} onClick={() => toggleAddon(addon)}><span className="addon-check">{active ? "✓" : "+"}</span><div><strong>{addon.name}</strong><small>{money(addon.price)}</small></div></button>;
                })}</div>
              </OptionSection>

              <OptionSection title="Special Notes" subtitle="Optional instructions for the barista">
                <textarea value={customNotes} onChange={(event) => setCustomNotes(event.target.value)} maxLength={100} placeholder="Example: separate syrup, no toppings..." />
                <div className="note-count">{customNotes.length}/100</div>
              </OptionSection>
            </div>

            <footer className="customizer-footer">
              <div><span>Item total</span><strong>{money(customizationPrice)}</strong></div>
              <button onClick={addCustomizedProduct}><span>ADD TO CART</span><small>Enter</small></button>
            </footer>
          </section>
        </div>
      )}

      <footer className="footer-bar">
        <div className="version-card"><strong>SYP ON CAFÉ POS</strong><span>v3.0 Smart Customization</span></div>
        <div className="system-status"><span className="online-dot" /> Online <i /> Kitchen Connected <i /> Printer Ready <i /> Database Connected</div><div className="shortcuts"><kbd>F1</kbd> Coffee <kbd>F2</kbd> Matcha <kbd>F3</kbd> Milky <kbd>F4</kbd> Soda <kbd>ESC</kbd> Clear</div>
        <div className="live-orders-actions">
          <button className={`sound-toggle ${onlineSoundEnabled ? "active" : ""}`} onClick={toggleOnlineSound} title="Repeat notification sound until acknowledged">{onlineSoundEnabled ? "🔔 Sound On" : "🔕 Sound Off"}</button>
          <button className="online-orders" type="button" onClick={() => { acknowledgeOnlineOrder(); setLiveOrdersOpen(true); }}>▣ Live Orders <b>{pendingOnlineOrders}</b></button>
        </div>
      </footer>
    </main>
  );
}

function OptionSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="option-section"><div className="option-title"><h3>{title}</h3><span>{subtitle}</span></div>{children}</section>;
}

function ChoiceButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: string }) {
  return <button type="button" className={`choice-button ${active ? "active" : ""}`} onClick={onClick}>{icon && <span>{icon}</span>}<strong>{label}</strong>{active && <i>✓</i>}</button>;
}

function addonsFor(category: Product["category"]): AddOn[] {
  const shared: AddOn[] = [
    { id: "extra-shot", name: "Extra Shot", price: 20 },
    { id: "caramel", name: "Caramel Sauce", price: 15 },
    { id: "white-choco", name: "White Choco", price: 15 },
  ];
  if (category === "Coffee" || category === "Signature") return [...shared, { id: "oat-milk", name: "Oat Milk", price: 25 }];
  if (category === "Matcha") return [{ id: "matcha-shot", name: "Extra Matcha", price: 25 }, { id: "biscoff", name: "Biscoff Sauce", price: 20 }, { id: "oat-milk", name: "Oat Milk", price: 25 }];
  if (category === "Milky") return [{ id: "oreo", name: "Oreo Toppings", price: 15 }, { id: "milo", name: "Milo Toppings", price: 15 }, { id: "caramel", name: "Caramel Sauce", price: 15 }];
  if (category === "Soda") return [{ id: "nata", name: "Nata", price: 15 }, { id: "pearls", name: "Pearls", price: 15 }];
  if (category === "Fries") return [{ id: "extra-flavor", name: "Extra Flavor", price: 10 }, { id: "dip", name: "Cheese Dip", price: 15 }];
  return [];
}

function Stat({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return <div className="stat"><span>{label}</span><div><strong>{value}</strong>{trend && <em>{trend}</em>}</div></div>;
}

function categoryIcon(name: Category) {
  return ({ All: "▦", Coffee: "☕", Matcha: "🍃", Soda: "🥤", Milky: "🥛", Fries: "🍟", Signature: "★", ADDS: "+" } as Record<Category, string>)[name];
}

function countCategory(name: Category) {
  const matching = name === "All"
    ? products
    : products.filter((product) => product.category === name);

  return new Set(
    matching.map((product) => `${product.category}::${product.name}`),
  ).size;
}

function getBusinessShiftRange(date: Date) {
  const start = new Date(date);
  const hour = date.getHours();

  if (hour < 4) {
    start.setDate(start.getDate() - 1);
  }
  start.setHours(17, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(4, 0, 0, 0);

  return { start, end };
}

function suggestedAmounts(total: number) {
  if (!total) return [0, 0, 0];
  const choices = [total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, 500, 1000].filter((value) => value >= total);
  return Array.from(new Set(choices)).slice(0, 3);
}


type ReceiptPayload = {
  receiptNo: string;
  completedAt: Date;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  discountReason: string;
  total: number;
  payment: Payment;
  cash: number;
  change: number;
  customerQuery: string;
  addStamp: boolean;
  orderNote: string;
  receiptStyle: ReceiptStyle;
  quote: { id: number; text: string; category: string };
  seasonalTheme: { key: string; title: string; message: string } | null;
  qrTarget: string;
  member: CloudMember | null;
  stampWasAdded: boolean;
  rewardWasClaimed: boolean;
  rewardDiscount: number;
};

function createReceiptNumber(date: Date) {
  const stamp = [
    String(date.getFullYear()).slice(-2),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const sequence = String((date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) % 10000).padStart(4, "0");
  return `SYP-${stamp}-${sequence}`;
}

function escapeReceiptText(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] || char));
}

function buildReceiptHtml(payload: ReceiptPayload) {
  const {
    receiptNo, completedAt, cart, subtotal, discount, discountReason, total, payment, cash, change,
    customerQuery, addStamp, orderNote, receiptStyle, quote, seasonalTheme, qrTarget, member, stampWasAdded, rewardWasClaimed, rewardDiscount,
  } = payload;
  const isEco = receiptStyle === "eco";
  const isPremium = receiptStyle === "premium";
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=6&format=png&data=${encodeURIComponent(qrTarget)}`;
  const dateText = completedAt.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemRows = cart.map((item) => {
    const customization = item.category === "Fries"
      ? item.customization.flavor
      : [item.size, item.customization.temperature, item.customization.sugar !== "100%" ? `${item.customization.sugar} sugar` : "", item.customization.ice !== "Normal Ice" ? item.customization.ice : ""].filter(Boolean).join(" · ");
    const addons = item.customization.addons.length ? `+ ${item.customization.addons.map((addon) => addon.name).join(", ")}` : "";
    const note = item.customization.notes ? `Note: ${item.customization.notes}` : "";
    return `<div class="item-row"><div class="item-copy"><strong>${item.qty}x ${escapeReceiptText(item.name)}</strong>${!isEco && customization ? `<small>${escapeReceiptText(customization)}</small>` : ""}${!isEco && addons ? `<small>${escapeReceiptText(addons)}</small>` : ""}${!isEco && note ? `<small>${escapeReceiptText(note)}</small>` : ""}</div><strong>${money(item.unitPrice * item.qty)}</strong></div>`;
  }).join("");

  const customerSection = member
    ? `<div class="compact-line"><span>Member</span><strong>${escapeReceiptText(member.name)} · ${escapeReceiptText(member.member_code)}</strong></div>`
    : customerQuery.trim() && !isEco
      ? `<div class="compact-line"><span>Customer</span><strong>${escapeReceiptText(customerQuery.trim())}</strong></div>`
      : "";
  const loyaltySection = member
    ? `<section class="loyalty"><strong>KaSYP Loyalty</strong><span>${rewardWasClaimed ? `✓ FREE DRINK CLAIMED · -${money(rewardDiscount)}` : stampWasAdded ? "✓ +1 STAMP ADDED" : "Member purchase recorded"}</span><b>${Number(member.stamps || 0)} / 10 STAMPS</b><small>${Number(member.stamps || 0) >= 10 ? "FREE DRINK READY — show this receipt at the counter." : `${Math.max(0, 10 - Number(member.stamps || 0))} stamp(s) before your free drink.`}</small></section>`
    : `<section class="loyalty"><strong>Join KaSYP Rewards</strong><span>No member account selected</span><small>Scan below to create your free account and start collecting stamps.</small></section>`;
  const seasonalSection = seasonalTheme && isPremium ? `<section class="seasonal"><strong>${escapeReceiptText(seasonalTheme.title)}</strong><span>${escapeReceiptText(seasonalTheme.message)}</span></section>` : "";
  const orderNoteSection = orderNote.trim() && !isEco ? `<section class="order-note"><strong>Order note:</strong> ${escapeReceiptText(orderNote.trim())}</section>` : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${receiptNo}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { width: 80mm; font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; line-height: 1.25; }
  .receipt { width: 72mm; margin: 0 auto; padding: 3mm 1mm 4mm; }
  .center { text-align: center; }
  .brand { font-size: 20px; font-weight: 900; letter-spacing: .7px; margin: 0; }
  .tagline { font-size: 10px; letter-spacing: 1.1px; margin-top: 1px; }
  .address { font-size: 9.5px; margin-top: 3px; }
  .rule { border-top: 1px dashed #000; margin: 6px 0; }
  .meta { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; font-size: 10px; }
  .meta strong { text-align: right; }
  .compact-line, .item-row, .total-row { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
  .compact-line { margin-top: 2px; }
  .item-row { margin: 4px 0; }
  .item-copy { min-width: 0; flex: 1; }
  .item-copy strong, .item-copy small { display: block; }
  .item-copy small { font-size: 9px; margin-top: 1px; }
  .summary { margin-top: 4px; }
  .total-row { margin: 2px 0; }
  .total-row.grand { font-size: 17px; font-weight: 900; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 4px 0; margin: 4px 0; }
  .seasonal { border: 1px solid #000; text-align: center; padding: 5px; margin: 6px 0; }
  .seasonal strong, .seasonal span { display: block; }
  .seasonal strong { letter-spacing: .7px; }
  .loyalty { text-align: center; margin: 6px 0; }
  .loyalty strong, .loyalty span, .loyalty b, .loyalty small { display: block; }
  .loyalty b { font-size: 16px; margin: 3px 0; }
  .order-note { font-size: 9.5px; margin: 5px 0; }
  .qr-wrap { text-align: center; margin-top: 5px; page-break-inside: avoid; }
  .qr-wrap img { width: 38mm; height: 38mm; display: block; margin: 2px auto; image-rendering: pixelated; }
  .qr-title { font-size: 13px; font-weight: 900; letter-spacing: .5px; }
  .qr-copy { font-size: 9.5px; }
  .site { font-size: 12px; font-weight: 900; margin-top: 2px; }
  .quote { text-align: center; font-size: 10.5px; font-style: italic; margin: 6px 2px 3px; }
  .quote-id { text-align: center; font-size: 8.5px; }
  .disclaimer { text-align: center; font-size: 8.5px; font-weight: 900; letter-spacing: .45px; margin-top: 5px; }
  .thanks { text-align: center; font-size: 10px; margin-top: 3px; }
  @media print { body { width: 80mm; } .receipt { break-after: auto; } }
</style></head>
<body><main class="receipt">
  <header class="center">
    <h1 class="brand">SYP ON CAFÉ</h1>
    <div class="tagline">STREET · ICED · BREWED</div>
    <div class="address">Apollo, Orani, Bataan · Open Daily 5PM–4AM</div>
  </header>
  ${seasonalSection}
  <div class="rule"></div>
  <section class="meta">
    <span>Order</span><strong>${receiptNo}</strong>
    <span>Date</span><strong>${escapeReceiptText(dateText)}</strong>
    <span>Cashier</span><strong>Alex</strong>
    <span>Payment</span><strong>${payment}</strong>
  </section>
  ${customerSection}
  <div class="rule"></div>
  <section>${itemRows}</section>
  ${orderNoteSection}
  <div class="rule"></div>
  <section class="summary">
    ${discount > 0 || !isEco ? `<div class="total-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>` : ""}
    ${discount > 0 ? `<div class="total-row"><span>Discount${discountReason && discountReason !== "None" ? ` · ${escapeReceiptText(discountReason)}` : ""}</span><strong>-${money(discount)}</strong></div>` : ""}
    <div class="total-row grand"><span>TOTAL</span><strong>${money(total)}</strong></div>
    ${payment === "Cash" ? `<div class="total-row"><span>Cash</span><strong>${money(cash)}</strong></div><div class="total-row"><span>Change</span><strong>${money(change)}</strong></div>` : ""}
  </section>
  ${loyaltySection}
  <div class="rule"></div>
  <section class="qr-wrap">
    <div class="qr-title">${member ? "SCAN YOUR KASYP ACCOUNT" : "SCAN TO CREATE KASYP ACCOUNT"}</div>
    <img src="${qrImage}" alt="${member ? "QR code for member account" : "QR code to create KaSYP account"}" />
    <div class="qr-copy">${member ? `${escapeReceiptText(member.member_code)} · View updated stamps and rewards` : "New customer · Register and start earning stamps"}</div>
    <div class="site">syponcafe.shop</div>
  </section>
  <div class="rule"></div>
  <blockquote class="quote">“${escapeReceiptText(quote.text)}”</blockquote>
  <div class="quote-id">Quote #${String(quote.id).padStart(4, "0")} · ${escapeReceiptText(quote.category)}</div>
  <div class="disclaimer">THIS IS NOT AN OFFICIAL RECEIPT</div>
  <div class="thanks">Order confirmation only · Thank you, KaSYP!</div>
</main>
<script>
  const qr = document.querySelector('.qr-wrap img');
  let printed = false;
  const printNow = () => {
    if (printed) return;
    printed = true;
    setTimeout(() => { window.print(); }, 300);
  };
  if (qr && !qr.complete) {
    qr.addEventListener('load', printNow, { once: true });
    qr.addEventListener('error', printNow, { once: true });
    setTimeout(printNow, 2500);
  } else {
    printNow();
  }
</script></body></html>`;
}