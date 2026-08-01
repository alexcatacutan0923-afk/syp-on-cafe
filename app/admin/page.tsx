"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "../components/ProtectedRoute";

type Temperature = "iced" | "hot" | "regular";

type SpinAccessMode = "off" | "all" | "selected";

type SpinSettings = {
  id: number;
  enabled: boolean;
  access_mode: SpinAccessMode;
  force_try_again: boolean;
  max_spins_per_member: number;
  minimum_stamps: number;
};

type SpinPrize = {
  id: string;
  title: string;
  description: string;
  icon: string;
  weight: number;
  active: boolean;
  sort_order: number;
  is_try_again: boolean;
};

type SpinMember = {
  member_code: string;
  name: string;
  mobile: string;
  stamps: number;
  enabled: boolean;
};

const defaultSpinSettings: SpinSettings = {
  id: 1,
  enabled: true,
  access_mode: "selected",
  force_try_again: true,
  max_spins_per_member: 1,
  minimum_stamps: 0,
};


type StoreStatus = "open" | "busy" | "closing_early" | "temporarily_closed" | "closed";

type StoreSettings = {
  id: number;
  store_status: StoreStatus;
  announcement: string;
  closing_time: string;
  ordering_enabled: boolean;
  free_delivery: boolean;
  delivery_fee: number;
  updated_at?: string;
};

const defaultStoreSettings: StoreSettings = {
  id: 1,
  store_status: "open",
  announcement: "",
  closing_time: "",
  ordering_enabled: true,
  free_delivery: false,
  delivery_fee: 30,
};

type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";

type OrderItemAddon = {
  id: number;
  order_item_id: number;
  addon_id: number | null;
  addon_name: string;
  addon_price: number;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_name: string;
  size: string | null;
  price: number;
  quantity: number;
  line_total: number;
  temperature: Temperature;
  base_price: number;
  addons: OrderItemAddon[];
};

type Customer = {
  id: number;
  customer_code: string | null;
  name: string;
  mobile: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  trust_score: number;
  customer_status: string;
  is_blacklisted: boolean;
};

type Order = {
  id: number;
  order_number: string;
  customer_id: number | null;
  customer_name: string;
  mobile: string;
  order_type: "pickup" | "delivery";
  payment_method: "cash" | "gcash";
  payment_status: string;
  address: string | null;
  landmark: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  rider_name: string | null;
  rider_mobile: string | null;
  rider_vehicle: string | null;
  rider_eta: string | null;
  accepted_by_rider_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  items: OrderItem[];
  customer: Customer | null;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  delivering: "Delivering",
  completed: "Completed",
  cancelled: "Cancelled",
};

const filterStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "delivering",
  "completed",
  "cancelled",
];

function formatMoney(value: number | null | undefined) {
  return `₱${Number(value ?? 0).toLocaleString("en-PH")}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}


function escapeReceiptText(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildOnlineOrderReceiptHtml(
  order: Order,
  copyType: "customer" | "rider",
) {
  const itemRows = order.items
    .map((item) => {
      const temperature =
        item.temperature === "hot"
          ? "Hot"
          : item.temperature === "iced"
            ? "Iced"
            : "";

      const details = [temperature, item.size || "Regular"]
        .filter(Boolean)
        .join(" · ");

      const addons = item.addons
        .map(
          (addon) =>
            `<small>+ ${escapeReceiptText(addon.addon_name)} (${formatMoney(
              addon.addon_price,
            )})</small>`,
        )
        .join("");

      return `
        <tr>
          <td>
            <b>${item.quantity}× ${escapeReceiptText(item.product_name)}</b>
            <small>${escapeReceiptText(details)}</small>
            ${addons}
          </td>
          <td>${formatMoney(item.line_total)}</td>
        </tr>
      `;
    })
    .join("");

  const paymentLabel =
    order.payment_method === "cash"
      ? order.order_type === "delivery"
        ? "COD"
        : "CASH"
      : "GCASH";

  const paymentStatus = String(order.payment_status || "pending").toUpperCase();

  const qrTarget =
    typeof window !== "undefined"
      ? `${window.location.origin}/member-register?source=online-receipt&order=${encodeURIComponent(
          order.order_number,
        )}`
      : "";

  const qrImageUrl = qrTarget
    ? `https://api.qrserver.com/v1/create-qr-code/?size=170x170&margin=0&data=${encodeURIComponent(
        qrTarget,
      )}`
    : "";

  const isCustomer = copyType === "customer";
  const copyLabel = isCustomer ? "CUSTOMER COPY" : "RIDER COPY";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeReceiptText(order.order_number)} ${copyLabel}</title>
    <style>
      @page { size: 80mm auto; margin: 3mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #111;
        background: #fff;
        font-family: Arial, Helvetica, sans-serif;
      }
      .receipt {
        width: 72mm;
        margin: 0 auto;
        padding: 1mm 0 3mm;
      }
      .center { text-align: center; }
      .brand { font-size: 21px; font-weight: 900; letter-spacing: .03em; }
      .tag {
        display: inline-block;
        margin: 5px 0 2px;
        padding: 4px 10px;
        border: 2px solid #111;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: .08em;
      }
      .muted { color: #555; font-size: 10px; }
      .order-number {
        margin: 8px 0;
        padding: 7px;
        border: 2px solid #111;
        text-align: center;
      }
      .order-number span {
        display: block;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .12em;
      }
      .order-number strong {
        display: block;
        margin-top: 2px;
        font-size: 23px;
        font-weight: 900;
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        margin: 4px 0;
        font-size: 12px;
      }
      .row b { max-width: 65%; text-align: right; overflow-wrap: anywhere; }
      .payment {
        margin: 8px 0;
        padding: 6px;
        border: 1.5px solid #111;
        text-align: center;
        font-size: 12px;
        font-weight: 900;
      }
      .divider { margin: 8px 0; border-top: 1px dashed #333; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      td { padding: 4px 0; vertical-align: top; }
      td:first-child { padding-right: 8px; }
      td:last-child { text-align: right; font-weight: 800; white-space: nowrap; }
      small { display: block; margin-top: 2px; color: #555; font-size: 10px; }
      .total {
        margin-top: 7px;
        padding-top: 7px;
        border-top: 2px dashed #111;
        font-size: 19px;
        font-weight: 900;
      }
      .total b { font-size: 22px; }
      .delivery, .notes { font-size: 11px; line-height: 1.45; }
      .delivery p, .notes p { margin: 4px 0; overflow-wrap: anywhere; }
      .qr {
        margin-top: 10px;
        text-align: center;
      }
      .qr img {
        width: 34mm;
        height: 34mm;
        image-rendering: pixelated;
      }
      .qr b { display: block; margin-top: 4px; font-size: 11px; }
      .qr small { margin-top: 3px; }
      footer { font-size: 11px; line-height: 1.45; }
    </style>
  </head>
  <body>
    <main class="receipt">
      <header class="center">
        <div class="brand">SYP ON CAFÉ</div>
        <div class="tag">${copyLabel}</div>
        <div class="muted">ONLINE ORDER RECEIPT</div>
      </header>

      <div class="order-number">
        <span>ORDER NO.</span>
        <strong>${escapeReceiptText(order.order_number)}</strong>
      </div>

      <div class="row"><span>Date</span><b>${escapeReceiptText(
        formatDate(order.created_at),
      )}</b></div>
      <div class="row"><span>Customer</span><b>${escapeReceiptText(
        order.customer_name,
      )}</b></div>
      <div class="row"><span>Mobile</span><b>${escapeReceiptText(
        order.mobile,
      )}</b></div>

      <div class="payment">
        ${escapeReceiptText(order.order_type.toUpperCase())}
        · ${escapeReceiptText(paymentLabel)}
        · ${escapeReceiptText(paymentStatus)}
      </div>

      ${
        !isCustomer && order.order_type === "delivery"
          ? `
            <div class="divider"></div>
            <section class="delivery">
              <b>DELIVERY DETAILS</b>
              <p>${escapeReceiptText(order.address || "No address provided")}</p>
              ${
                order.landmark
                  ? `<p><b>Landmark:</b> ${escapeReceiptText(
                      order.landmark,
                    )}</p>`
                  : ""
              }
            </section>
          `
          : ""
      }

      <div class="divider"></div>
      <table>${itemRows}</table>
      <div class="divider"></div>

      <div class="row"><span>Subtotal</span><b>${formatMoney(
        order.subtotal,
      )}</b></div>
      <div class="row"><span>Delivery fee</span><b>${formatMoney(
        order.delivery_fee,
      )}</b></div>
      <div class="row total"><span>TOTAL</span><b>${formatMoney(
        order.total,
      )}</b></div>

      ${
        order.notes
          ? `
            <div class="divider"></div>
            <section class="notes">
              <b>CUSTOMER NOTES</b>
              <p>${escapeReceiptText(order.notes).replaceAll("\n", "<br>")}</p>
            </section>
          `
          : ""
      }

      ${
        isCustomer
          ? `
            <div class="divider"></div>
            <section class="qr">
              <img src="${qrImageUrl}" alt="Register as SYP member QR code" />
              <b>SCAN TO REGISTER AS A KaSYP MEMBER</b>
              <small>Earn stamps and unlock your free drink.</small>
            </section>
          `
          : ""
      }

      <div class="divider"></div>
      <footer class="center">
        ${
          isCustomer
            ? "<b>Thank you, KaSYP!</b><br>Keep this receipt for claiming or delivery verification.<br>syponcafe.shop"
            : "<b>RIDER DELIVERY COPY</b><br>Verify customer, address, items, and payment before leaving."
        }
      </footer>
    </main>

    <script>
      window.addEventListener("load", function () {
        const images = Array.from(document.images);
        if (images.length === 0) {
          window.print();
          window.setTimeout(function () { window.close(); }, 900);
          return;
        }

        Promise.all(
          images.map(function (image) {
            if (image.complete) return Promise.resolve();
            return new Promise(function (resolve) {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            });
          }),
        ).then(function () {
          window.print();
          window.setTimeout(function () { window.close(); }, 900);
        });
      });
    <\/script>
  </body>
</html>`;
}

function openReceiptPreparationWindow(orderNumber: string) {
  const printWindow = window.open(
    "",
    "_blank",
    "width=430,height=900,noopener=false",
  );

  if (!printWindow) return null;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html>
      <head><meta charset="utf-8"><title>${escapeReceiptText(
        orderNumber,
      )}</title></head>
      <body style="font-family:Arial,sans-serif;text-align:center;padding:40px">
        <h3>Preparing receipt...</h3>
        <p>Please wait while the receipt is being prepared.</p>
      </body>
    </html>`);
  printWindow.document.close();

  return printWindow;
}

function renderStars(score: number | null | undefined) {
  const safeScore = Math.max(1, Math.min(5, Number(score ?? 3)));
  return "★".repeat(safeScore) + "☆".repeat(5 - safeScore);
}

function getOrderAge(createdAt: string, now: number) {
  const createdTime = new Date(createdAt).getTime();
  const difference = Math.max(0, now - createdTime);
  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getOrderAgeStyle(createdAt: string, now: number) {
  const ageMinutes =
    (now - new Date(createdAt).getTime()) / 60000;

  if (ageMinutes >= 20) {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  if (ageMinutes >= 10) {
    return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  }

  if (ageMinutes >= 5) {
    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] =
    useState<OrderStatus | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [savingStoreSettings, setSavingStoreSettings] = useState(false);
  const [storeSettingsNotice, setStoreSettingsNotice] = useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [spinSettings, setSpinSettings] = useState<SpinSettings>(defaultSpinSettings);
  const [spinPrizes, setSpinPrizes] = useState<SpinPrize[]>([]);
  const [spinMembers, setSpinMembers] = useState<SpinMember[]>([]);
  const [spinMemberSearch, setSpinMemberSearch] = useState("");
  const [spinLoading, setSpinLoading] = useState(true);
  const [spinSaving, setSpinSaving] = useState(false);
  const [spinNotice, setSpinNotice] = useState("");
  const [newPrize, setNewPrize] = useState({
    title: "",
    description: "",
    icon: "🎁",
    weight: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [newOrderAlert, setNewOrderAlert] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [paymentUpdatingOrderId, setPaymentUpdatingOrderId] = useState<number | null>(null);
  const [riderDrafts, setRiderDrafts] = useState<
    Record<
      number,
      {
        name: string;
        mobile: string;
        vehicle: string;
        eta: string;
      }
    >
  >({});

  const soundEnabledRef = useRef(soundEnabled);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const loadStoreSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("store_settings")
      .select("id,store_status,announcement,closing_time,ordering_enabled,free_delivery,delivery_fee,updated_at")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Failed to load store settings:", error);
      setErrorMessage(error.message);
      return;
    }

    setStoreSettings({
      ...(data as StoreSettings),
      delivery_fee: Number(data.delivery_fee ?? 30),
    });
  }, []);

  async function saveStoreSettings() {
    setSavingStoreSettings(true);
    setStoreSettingsNotice("");
    setErrorMessage("");

    try {
      const payload = {
        store_status: storeSettings.store_status,
        announcement: storeSettings.announcement.trim(),
        closing_time: storeSettings.closing_time.trim(),
        ordering_enabled: storeSettings.ordering_enabled,
        free_delivery: storeSettings.free_delivery,
        delivery_fee: Math.max(0, Number(storeSettings.delivery_fee || 0)),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("store_settings")
        .update(payload)
        .eq("id", 1)
        .select()
        .single();

      if (error) throw error;
      setStoreSettings({ ...(data as StoreSettings), delivery_fee: Number(data.delivery_fee ?? 0) });
      setStoreSettingsNotice("Store status saved. Customer pages update automatically.");
      window.setTimeout(() => setStoreSettingsNotice(""), 3500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save store status.");
    } finally {
      setSavingStoreSettings(false);
    }
  }

  useEffect(() => {
    void loadStoreSettings();

    const channel = supabase
      .channel("admin-store-settings")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "store_settings", filter: "id=eq.1" },
        (payload) => {
          const row = payload.new as StoreSettings;
          setStoreSettings({ ...row, delivery_fee: Number(row.delivery_fee ?? 0) });
        },
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [loadStoreSettings]);

  const loadSpinAdmin = useCallback(async () => {
    setSpinLoading(true);
    try {
      const [settingsResult, prizesResult, membersResult, accessResult] = await Promise.all([
        supabase.from("spin_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("spin_prizes").select("*").order("sort_order", { ascending: true }),
        supabase.from("loyalty_members").select("member_code,name,mobile,stamps").order("name", { ascending: true }),
        supabase.from("spin_member_access").select("member_code,enabled"),
      ]);

      if (settingsResult.error) throw settingsResult.error;
      if (prizesResult.error) throw prizesResult.error;
      if (membersResult.error) throw membersResult.error;
      if (accessResult.error) throw accessResult.error;

      if (settingsResult.data) {
        setSpinSettings({
          ...(settingsResult.data as SpinSettings),
          max_spins_per_member: Number(settingsResult.data.max_spins_per_member ?? 1),
          minimum_stamps: Number(settingsResult.data.minimum_stamps ?? 0),
        });
      }

      setSpinPrizes(
        ((prizesResult.data ?? []) as SpinPrize[]).map((prize) => ({
          ...prize,
          weight: Number(prize.weight ?? 1),
          sort_order: Number(prize.sort_order ?? 0),
        })),
      );

      const accessMap = new Map(
        (accessResult.data ?? []).map((row) => [String(row.member_code), Boolean(row.enabled)]),
      );

      setSpinMembers(
        (membersResult.data ?? []).map((row) => ({
          member_code: String(row.member_code),
          name: String(row.name || "Unnamed member"),
          mobile: String(row.mobile || ""),
          stamps: Number(row.stamps ?? 0),
          enabled: accessMap.get(String(row.member_code)) ?? false,
        })),
      );
    } catch (error) {
  console.error(
    "Unable to load spin controls:",
    JSON.stringify(error, null, 2),
  );

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error
      ? String(error.message)
      : "Unable to load spin controls.";

  setErrorMessage(message);
      setErrorMessage(error instanceof Error ? error.message : "Unable to load spin controls.");
    } finally {
      setSpinLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSpinAdmin();
  }, [loadSpinAdmin]);

  async function saveSpinSettings() {
    setSpinSaving(true);
    setSpinNotice("");
    try {
      const { data, error } = await supabase
        .from("spin_settings")
        .upsert({
          ...spinSettings,
          id: 1,
          max_spins_per_member: Math.max(1, Number(spinSettings.max_spins_per_member || 1)),
          minimum_stamps: Math.max(0, Number(spinSettings.minimum_stamps || 0)),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      setSpinSettings(data as SpinSettings);
      setSpinNotice("Lucky Spin settings saved.");
      window.setTimeout(() => setSpinNotice(""), 3500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save spin settings.");
    } finally {
      setSpinSaving(false);
    }
  }

  async function toggleSpinMember(memberCode: string, enabled: boolean) {
    setSpinMembers((current) => current.map((member) => member.member_code === memberCode ? { ...member, enabled } : member));
    const { error } = await supabase.from("spin_member_access").upsert({
      member_code: memberCode,
      enabled,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setErrorMessage(error.message);
      void loadSpinAdmin();
    }
  }

  async function updateSpinPrize(prize: SpinPrize, patch: Partial<SpinPrize>) {
    const next = { ...prize, ...patch };
    setSpinPrizes((current) => current.map((item) => item.id === prize.id ? next : item));
    const { error } = await supabase.from("spin_prizes").update({
      title: next.title,
      description: next.description,
      icon: next.icon,
      weight: Math.max(0, Number(next.weight || 0)),
      active: next.active,
      sort_order: next.sort_order,
      is_try_again: next.is_try_again,
      updated_at: new Date().toISOString(),
    }).eq("id", prize.id);
    if (error) {
      setErrorMessage(error.message);
      void loadSpinAdmin();
    }
  }

  async function addSpinPrize() {
    if (!newPrize.title.trim()) {
      setErrorMessage("Enter a prize title first.");
      return;
    }
    const { error } = await supabase.from("spin_prizes").insert({
      title: newPrize.title.trim(),
      description: newPrize.description.trim(),
      icon: newPrize.icon.trim() || "🎁",
      weight: Math.max(0, Number(newPrize.weight || 1)),
      active: true,
      sort_order: spinPrizes.length + 1,
      is_try_again: false,
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setNewPrize({ title: "", description: "", icon: "🎁", weight: 1 });
    await loadSpinAdmin();
  }

  async function deleteSpinPrize(prize: SpinPrize) {
    if (prize.is_try_again) {
      setErrorMessage("The Try Again segment cannot be deleted. You may disable it only after another Try Again segment exists.");
      return;
    }
    if (!window.confirm(`Delete prize “${prize.title}”?`)) return;
    const { error } = await supabase.from("spin_prizes").delete().eq("id", prize.id);
    if (error) setErrorMessage(error.message);
    else setSpinPrizes((current) => current.filter((item) => item.id !== prize.id));
  }

  const loadOrders = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    try {
      const { data: orderRows, error: ordersError } =
        await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const { data: itemRows, error: itemsError } =
        await supabase
          .from("order_items")
          .select("*")
          .order("id", { ascending: true });

      if (itemsError) throw itemsError;

      const rawItems = (itemRows ?? []) as Omit<
        OrderItem,
        "addons"
      >[];
      const itemIds = rawItems.map((item) => item.id);

      let addonRows: OrderItemAddon[] = [];

      if (itemIds.length > 0) {
        const { data: addonData, error: addonsError } =
          await supabase
            .from("order_item_addons")
            .select(
              "id, order_item_id, addon_id, addon_name, addon_price",
            )
            .in("order_item_id", itemIds)
            .order("id", { ascending: true });

        if (addonsError) throw addonsError;

        addonRows = (addonData ?? []).map((addon) => ({
          ...addon,
          addon_price: Number(addon.addon_price ?? 0),
        })) as OrderItemAddon[];
      }

      const { data: customerRows, error: customersError } =
        await supabase.from("customers").select("*");

      if (customersError) throw customersError;

      const items: OrderItem[] = rawItems.map((item) => ({
        ...item,
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 0),
        line_total: Number(item.line_total ?? 0),
        base_price: Number(item.base_price ?? item.price ?? 0),
        temperature:
          (item.temperature as Temperature) ?? "regular",
        addons: addonRows.filter(
          (addon) => addon.order_item_id === item.id,
        ),
      }));
      const customers = (customerRows ?? []) as Customer[];

      const combinedOrders: Order[] = (orderRows ?? []).map(
        (order) => ({
          ...order,
          subtotal: Number(order.subtotal ?? 0),
          delivery_fee: Number(order.delivery_fee ?? 0),
          total: Number(order.total ?? 0),
          items: items
            .filter((item) => item.order_id === order.id)
            .map((item) => ({ ...item })),
          customer:
            customers.find(
              (customer) => customer.id === order.customer_id,
            ) ?? null,
        }),
      );

      setOrders(combinedOrders);
    } catch (error) {
      console.error("Failed to load admin orders:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load orders.",
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  function playNewOrderSound() {
    if (!soundEnabledRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(
        880,
        audioContext.currentTime,
      );
      oscillator.frequency.setValueAtTime(
        1100,
        audioContext.currentTime + 0.18,
      );

      gain.gain.setValueAtTime(
        0.15,
        audioContext.currentTime,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.45,
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.45);

      oscillator.addEventListener("ended", () => {
        void audioContext.close();
      });
    } catch (error) {
      console.error("Unable to play order sound:", error);
    }
  }

  useEffect(() => {
    void loadOrders();

    const refreshInterval = window.setInterval(() => {
      void loadOrders(true);
    }, 30000);

    const ordersChannel = supabase
      .channel("syp-live-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder = payload.new as {
            order_number?: string;
          };

          setNewOrderAlert(
            newOrder.order_number
              ? `New order: ${newOrder.order_number}`
              : "A new order has arrived.",
          );

          playNewOrderSound();
          setActiveFilter("pending");
          void loadOrders(true);

          window.setTimeout(() => {
            setNewOrderAlert("");
          }, 10000);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadOrders(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        () => {
          void loadOrders(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_item_addons",
        },
        () => {
          void loadOrders(true);
        },
      )
      .subscribe();

    return () => {
      window.clearInterval(refreshInterval);
      void supabase.removeChannel(ordersChannel);
    };
  }, [loadOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === "all" ||
        order.status === activeFilter;

      const matchesSearch =
        query.length === 0 ||
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.mobile.toLowerCase().includes(query) ||
        order.customer?.customer_code
          ?.toLowerCase()
          .includes(query) ||
        order.items.some((item) =>
          item.product_name.toLowerCase().includes(query),
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const acceptedCount = orders.filter(
    (order) => order.status === "accepted",
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "preparing",
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "ready",
  ).length;

  const deliveringCount = orders.filter(
    (order) => order.status === "delivering",
  ).length;

  const todayKey = new Date().toDateString();

  const ordersToday = orders.filter(
    (order) =>
      new Date(order.created_at).toDateString() === todayKey,
  );

  const completedToday = ordersToday.filter(
    (order) => order.status === "completed",
  );

  const salesToday = completedToday.reduce(
    (total, order) => total + Number(order.total),
    0,
  );

  const gcashPendingCount = orders.filter(
    (order) =>
      order.payment_method === "gcash" &&
      String(order.payment_status || "pending").toLowerCase() !== "paid",
  ).length;

  function getRiderDraft(order: Order) {
    return (
      riderDrafts[order.id] ?? {
        name: order.rider_name ?? "",
        mobile: order.rider_mobile ?? "",
        vehicle: order.rider_vehicle ?? "",
        eta: order.rider_eta ?? "",
      }
    );
  }

  function updateRiderDraft(
    orderId: number,
    field: "name" | "mobile" | "vehicle" | "eta",
    value: string,
  ) {
    setRiderDrafts((current) => ({
      ...current,
      [orderId]: {
        name: current[orderId]?.name ?? "",
        mobile: current[orderId]?.mobile ?? "",
        vehicle: current[orderId]?.vehicle ?? "",
        eta: current[orderId]?.eta ?? "",
        [field]: value,
      },
    }));
  }

  async function sendCustomerPush(
  order: Order,
  status:
    | "accepted"
    | "preparing"
    | "ready"
    | "rider_assigned"
    | "delivering"
    | "completed"
    | "cancelled",
  extras?: {
    rider_name?: string | null;
    rider_eta?: string | null;
  },
) {
  try {
    const { error } = await supabase.functions.invoke(
      "send-customer-push",
      {
        body: {
          order_id: order.id,
          order_number: order.order_number,
          status,
          order_type: order.order_type,
          rider_name: extras?.rider_name ?? order.rider_name,
          rider_eta: extras?.rider_eta ?? order.rider_eta,
        },
      },
    );

    if (error) {
      console.error("Customer push error:", error);
    }
  } catch (err) {
    console.error("Customer push failed:", err);
  }
}

  async function assignRider(order: Order) {
    const draft = getRiderDraft(order);
    const cleanName = draft.name.trim();
    const cleanMobile = draft.mobile.replace(/\s+/g, "").trim();

    if (!cleanName) {
      setErrorMessage("Enter the rider name before assigning.");
      return;
    }

    if (cleanMobile && !/^09\d{9}$/.test(cleanMobile)) {
      setErrorMessage(
        "Enter a valid Philippine rider mobile number, for example 09171234567.",
      );
      return;
    }

    const printWindow = openReceiptPreparationWindow(order.order_number);

    if (!printWindow) {
      setErrorMessage(
        "Receipt popup was blocked. Allow popups for this site, then press Assign Rider again.",
      );
      return;
    }

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          rider_name: cleanName,
          rider_mobile: cleanMobile || null,
          rider_vehicle: draft.vehicle.trim() || null,
          rider_eta: draft.eta.trim() || null,
          accepted_by_rider_at: now,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                rider_name: cleanName,
                rider_mobile: cleanMobile || null,
                rider_vehicle: draft.vehicle.trim() || null,
                rider_eta: draft.eta.trim() || null,
                accepted_by_rider_at: now,
              }
            : currentOrder,
        ),
      );

      if (printWindow && !printWindow.closed) {
        printWindow.document.open();
        printWindow.document.write(
          buildOnlineOrderReceiptHtml(
            {
              ...order,
              rider_name: cleanName,
              rider_mobile: cleanMobile || null,
              rider_vehicle: draft.vehicle.trim() || null,
              rider_eta: draft.eta.trim() || null,
              accepted_by_rider_at: now,
            },
            "customer",
          ),
        );
        printWindow.document.close();
      }
    } catch (error) {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }

      console.error("Failed to assign rider:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to assign the rider.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function markOutForDelivery(order: Order) {
    if (!order.rider_name) {
      setErrorMessage("Assign a rider before marking the order out for delivery.");
      return;
    }

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          status: "delivering",
          out_for_delivery_at: now,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "delivering",
                out_for_delivery_at: now,
              }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to start delivery:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to mark the order out for delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function markDelivered(order: Order) {
    const confirmed = window.confirm(
      `Mark order ${order.order_number} as delivered?`,
    );

    if (!confirmed) return;

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          status: "completed",
          delivered_at: now,
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "completed",
                delivered_at: now,
              }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to complete delivery:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete the delivery.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }


  async function updatePaymentStatus(order: Order, paymentStatus: "paid" | "pending") {
    setPaymentUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? { ...currentOrder, payment_status: paymentStatus }
            : currentOrder,
        ),
      );
    } catch (error) {
      console.error("Failed to update payment status:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the payment status.",
      );
    } finally {
      setPaymentUpdatingOrderId(null);
    }
  }
  
  
  

  async function updateOrderStatus(
    order: Order,
    status: OrderStatus,
  ) {
    const shouldPrintAtReady = status === "ready";
    const copyType: "customer" | "rider" =
      order.order_type === "delivery" ? "rider" : "customer";

    const printWindow = shouldPrintAtReady
      ? openReceiptPreparationWindow(order.order_number)
      : null;

    if (shouldPrintAtReady && !printWindow) {
      setErrorMessage(
        "Receipt popup was blocked. Allow popups for this site, then press Mark Ready again.",
      );
      return;
    }

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order.id);

      if (error) throw error;

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status,
              }
            : currentOrder,
        ),
      );

      if (shouldPrintAtReady && printWindow && !printWindow.closed) {
        printWindow.document.open();
        printWindow.document.write(
          buildOnlineOrderReceiptHtml(order, copyType),
        );
        printWindow.document.close();
      }
    } catch (error) {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }

      console.error("Failed to update order:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the order.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function getNextAction(order: Order) {
    switch (order.status) {
      case "pending":
        return {
          label: "Accept Order",
          nextStatus: "accepted" as OrderStatus,
        };
      case "accepted":
        return {
          label: "Start Preparing",
          nextStatus: "preparing" as OrderStatus,
        };
      case "preparing":
        return {
          label: "Mark Ready",
          nextStatus: "ready" as OrderStatus,
        };
      case "ready":
        return order.order_type === "delivery"
          ? null
          : {
              label: "Complete Pickup",
              nextStatus: "completed" as OrderStatus,
            };
      case "delivering":
        return order.order_type === "delivery"
          ? null
          : {
              label: "Complete Order",
              nextStatus: "completed" as OrderStatus,
            };
      default:
        return null;
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#080808] text-white">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed left-4 top-4 z-[70] grid h-11 w-11 place-items-center rounded-xl border border-amber-400/30 bg-black/90 text-xl text-amber-300 shadow-xl md:hidden"
          aria-label="Open admin menu"
        >
          ☰
        </button>

        {mobileSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-[55] bg-black/75 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close admin menu overlay"
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-[60] w-72 border-r border-amber-400/15 bg-[#090b09] p-5 transition-transform duration-300 md:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileSidebarOpen(false)}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-700 font-black text-black">S</span>
              <span><b className="block">SYP ON CAFÉ</b><small className="text-[10px] tracking-[0.2em] text-amber-400">ADMIN PANEL</small></span>
            </Link>
            <button type="button" className="text-neutral-400 md:hidden" onClick={() => setMobileSidebarOpen(false)}>✕</button>
          </div>

          <nav className="mt-6 grid gap-2 text-sm">
            <a href="#dashboard" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl bg-amber-400 px-4 py-3 font-black text-black">▦ Dashboard</a>
            <a href="#orders" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">🧾 Live Orders</a>
            <a href="#store-control" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">🏪 Store Settings</a>
            <a href="#spin-wheel" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">🎡 Spin the Wheel</a>
            <Link href="/admin/home-media" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">▣ Home Media</Link>
            <Link href="/admin/reviews" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">★ Reviews</Link>
            <Link href="/admin/community" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">☕ Community</Link>
            <Link href="/admin/inventory" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">▤ Inventory</Link>
            <Link href="/admin/analytics" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">▥ Analytics</Link>
            <Link href="/admin/crm" onClick={() => setMobileSidebarOpen(false)} className="rounded-xl px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-amber-300">◎ Customer CRM</Link>
          </nav>

          <div className="absolute bottom-5 left-5 right-5 grid gap-2">
            <Link href="/menu" className="rounded-xl border border-amber-400/30 px-4 py-3 text-center text-sm font-bold text-amber-300">Open Customer Menu</Link>
            <button type="button" onClick={() => void handleLogout()} className="rounded-xl border border-red-500/25 px-4 py-3 text-sm font-bold text-red-300">Logout</button>
          </div>
        </aside>

        <div className="min-w-0 md:pl-72">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 pl-16 backdrop-blur md:pl-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-bold">SYP ON CAFÉ ADMIN</p>
            <p className="text-xs text-neutral-500">
              Live Order Management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/reviews"
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-300"
            >
              ⭐ Reviews
            </Link>

            <button
              type="button"
              onClick={() =>
                setSoundEnabled((current) => !current)
              }
              className={
                soundEnabled
                  ? "rounded-full border border-amber-400 bg-amber-400/10 px-4 py-2 text-sm text-amber-400"
                  : "rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-400"
              }
            >
              {soundEnabled
                ? "🔔 Sound On"
                : "🔕 Enable Sound"}
            </button>

            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              ● Live
            </span>

            <button
              type="button"
              onClick={() => void loadOrders(true)}
              disabled={refreshing}
              className="rounded-full border border-white/15 px-5 py-2 text-sm transition hover:border-amber-400 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-red-500/30 px-5 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              Logout
            </button>

            <Link
              href="/admin/community"
              className="rounded-full border border-amber-400/40 px-5 py-2 text-sm font-semibold text-amber-300"
            >
              Reviews & Moments
            </Link>

            <Link
              href="/admin/inventory"
              className="rounded-full border border-emerald-400/40 px-5 py-2 text-sm font-semibold text-emerald-300"
            >
              Inventory
            </Link>

            <Link
              href="/admin/analytics"
              className="rounded-full border border-sky-400/40 px-5 py-2 text-sm font-semibold text-sky-300"
            >
              Analytics
            </Link>

            <Link
              href="/admin/business"
              className="rounded-full border border-violet-400/40 px-5 py-2 text-sm font-semibold text-violet-300"
            >
              Smart Assistant
            </Link>

            <Link
              href="/admin/crm"
              className="rounded-full border border-pink-400/40 px-5 py-2 text-sm font-semibold text-pink-300"
            >
              Customer CRM
            </Link>

            <Link
              href="/admin/promotions"
              className="rounded-full border border-orange-400/40 px-5 py-2 text-sm font-semibold text-orange-300"
            >
              Promotions
            </Link>

            <Link
              href="/menu"
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black"
            >
              Customer Menu
            </Link>
          </div>
        </div>
      </header>

      {newOrderAlert && (
        <div className="border-b border-amber-400/20 bg-amber-400/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="font-bold text-amber-400">
                🔔 New Order Received
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                {newOrderAlert}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewOrderAlert("");
                setActiveFilter("pending");
              }}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black"
            >
              View Order
            </button>
          </div>
        </div>
      )}

      <div id="dashboard" className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8">

        <section id="spin-wheel" className="mb-8 rounded-3xl border border-amber-400/20 bg-neutral-950 p-4 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">🎡 Lucky Spin Control</p>
              <h2 className="mt-2 text-2xl font-black">Choose who can spin</h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-500">Turn it on for everyone, selected members only, or disable it completely. Real prize labels are editable below.</p>
            </div>
            <span className={spinSettings.enabled && spinSettings.access_mode !== "off" ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300" : "rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300"}>
              {spinSettings.enabled && spinSettings.access_mode !== "off" ? "● Spin Active" : "● Spin Off"}
            </span>
          </div>

          {spinLoading ? (
            <div className="py-12 text-center text-neutral-500">Loading Lucky Spin controls…</div>
          ) : (
            <>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {([
                  ["off", "Off for Everyone", "Nobody can spin."],
                  ["all", "All Members", "Every logged-in member can spin."],
                  ["selected", "Selected Members", "Only members enabled below can spin."],
                ] as const).map(([mode, label, note]) => (
                  <button key={mode} type="button" onClick={() => setSpinSettings((current) => ({ ...current, enabled: mode !== "off", access_mode: mode }))} className={spinSettings.access_mode === mode ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left" : "rounded-2xl border border-white/10 bg-black p-4 text-left hover:border-amber-400/40"}>
                    <b className={spinSettings.access_mode === mode ? "text-amber-300" : "text-white"}>{label}</b>
                    <small className="mt-2 block text-neutral-500">{note}</small>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="rounded-2xl border border-white/10 bg-black p-4">
                  <span className="text-sm font-bold">Maximum spins per member</span>
                  <input type="number" min="1" value={spinSettings.max_spins_per_member} onChange={(event) => setSpinSettings((current) => ({ ...current, max_spins_per_member: Number(event.target.value) }))} className="mt-3 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <label className="rounded-2xl border border-white/10 bg-black p-4">
                  <span className="text-sm font-bold">Minimum stamps required</span>
                  <input type="number" min="0" value={spinSettings.minimum_stamps} onChange={(event) => setSpinSettings((current) => ({ ...current, minimum_stamps: Number(event.target.value) }))} className="mt-3 w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-400" />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4">
                  <span><b className="block">Force Try Again</b><small className="mt-1 block text-neutral-500">Keep this ON while testing. Prize names still appear, but every result is Try Again.</small></span>
                  <input type="checkbox" checked={spinSettings.force_try_again} onChange={(event) => setSpinSettings((current) => ({ ...current, force_try_again: event.target.checked }))} className="h-5 w-5" />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => void saveSpinSettings()} disabled={spinSaving} className="rounded-full bg-amber-400 px-6 py-3 font-black text-black disabled:opacity-50">{spinSaving ? "Saving…" : "Save Spin Settings"}</button>
                {spinNotice && <span className="text-sm font-bold text-emerald-300">✓ {spinNotice}</span>}
              </div>

              {spinSettings.access_mode === "selected" && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><h3 className="font-black">Selected member access</h3><p className="mt-1 text-sm text-neutral-500">Search by name, mobile, or SYP member ID.</p></div>
                    <input value={spinMemberSearch} onChange={(event) => setSpinMemberSearch(event.target.value)} placeholder="Search member…" className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-400 sm:max-w-sm" />
                  </div>
                  <div className="mt-4 grid max-h-[430px] gap-2 overflow-y-auto pr-1">
                    {spinMembers.filter((member) => {
                      const query = spinMemberSearch.trim().toLowerCase();
                      return !query || member.name.toLowerCase().includes(query) || member.mobile.includes(query) || member.member_code.toLowerCase().includes(query);
                    }).map((member) => (
                      <div key={member.member_code} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-neutral-950 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><b>{member.name}</b><small className="mt-1 block text-neutral-500">{member.member_code} · {member.mobile} · {member.stamps}/10 stamps</small></div>
                        <button type="button" onClick={() => void toggleSpinMember(member.member_code, !member.enabled)} className={member.enabled ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300" : "rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-neutral-400"}>{member.enabled ? "✓ Can Spin" : "Enable Spin"}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black">Wheel prize segments</h3><p className="mt-1 text-sm text-neutral-500">Edit labels, icons, chances, and active status. Keep Force Try Again ON until launch.</p></div><span className="rounded-full border border-amber-400/25 px-3 py-2 text-xs font-bold text-amber-300">{spinPrizes.filter((prize) => prize.active).length} active</span></div>
                <div className="mt-4 grid gap-3">
                  {spinPrizes.map((prize) => (
                    <div key={prize.id} className="grid gap-3 rounded-xl border border-white/10 bg-neutral-950 p-3 md:grid-cols-[70px_1fr_1fr_90px_auto] md:items-center">
                      <input value={prize.icon} onChange={(event) => void updateSpinPrize(prize, { icon: event.target.value })} className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-center" aria-label="Prize icon" />
                      <input value={prize.title} onChange={(event) => setSpinPrizes((current) => current.map((item) => item.id === prize.id ? { ...item, title: event.target.value } : item))} onBlur={() => void updateSpinPrize(prize, { title: spinPrizes.find((item) => item.id === prize.id)?.title || prize.title })} className="w-full rounded-lg border border-white/10 bg-black px-3 py-2" />
                      <input value={prize.description} onChange={(event) => setSpinPrizes((current) => current.map((item) => item.id === prize.id ? { ...item, description: event.target.value } : item))} onBlur={() => void updateSpinPrize(prize, { description: spinPrizes.find((item) => item.id === prize.id)?.description || "" })} placeholder="Description" className="w-full rounded-lg border border-white/10 bg-black px-3 py-2" />
                      <input type="number" min="0" value={prize.weight} onChange={(event) => void updateSpinPrize(prize, { weight: Number(event.target.value) })} className="w-full rounded-lg border border-white/10 bg-black px-3 py-2" aria-label="Prize weight" />
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button type="button" onClick={() => void updateSpinPrize(prize, { active: !prize.active })} className={prize.active ? "rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300" : "rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-neutral-500"}>{prize.active ? "Active" : "Inactive"}</button>
                        {!prize.is_try_again && <button type="button" onClick={() => void deleteSpinPrize(prize)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-amber-400/25 p-3 md:grid-cols-[70px_1fr_1fr_90px_auto]">
                  <input value={newPrize.icon} onChange={(event) => setNewPrize((current) => ({ ...current, icon: event.target.value }))} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-center" />
                  <input value={newPrize.title} onChange={(event) => setNewPrize((current) => ({ ...current, title: event.target.value }))} placeholder="New prize title" className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2" />
                  <input value={newPrize.description} onChange={(event) => setNewPrize((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2" />
                  <input type="number" min="0" value={newPrize.weight} onChange={(event) => setNewPrize((current) => ({ ...current, weight: Number(event.target.value) }))} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2" />
                  <button type="button" onClick={() => void addSpinPrize()} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-black text-black">+ Add Prize</button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-400/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><b>Home Media Manager</b><p className="mt-1 text-sm text-neutral-500">Manage homepage albums, banners, claimed rewards, and featured media.</p></div>
                <Link href="/admin/home-media" className="rounded-full bg-amber-400 px-5 py-3 text-center text-sm font-black text-black">Open Home Media</Link>
              </div>
            </>
          )}
        </section>

        <section id="store-control" className="mb-8 rounded-3xl border border-amber-400/20 bg-neutral-950 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">🏪 Store Control</p>
              <h2 className="mt-2 text-2xl font-black">Live Store Status</h2>
              <p className="mt-2 text-sm text-neutral-500">Changes appear on the menu and checkout in real time.</p>
            </div>
            <span className={storeSettings.ordering_enabled ? "rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300" : "rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300"}>
              {storeSettings.ordering_enabled ? "● Accepting Orders" : "● Ordering Off"}
            </span>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <label>
              <span className="text-sm font-semibold text-neutral-300">Status</span>
              <select value={storeSettings.store_status} onChange={(event) => setStoreSettings((current) => ({ ...current, store_status: event.target.value as StoreStatus }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-amber-400">
                <option value="open">🟢 Open</option>
                <option value="busy">🟡 Busy</option>
                <option value="closing_early">🟠 Closing Early</option>
                <option value="temporarily_closed">🔵 Temporarily Closed / Maintenance</option>
                <option value="closed">🔴 Closed</option>
              </select>
            </label>

            <label>
              <span className="text-sm font-semibold text-neutral-300">Closing / last-order time</span>
              <input type="text" value={storeSettings.closing_time} onChange={(event) => setStoreSettings((current) => ({ ...current, closing_time: event.target.value }))} placeholder="Example: 11:00 PM" className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-amber-400" />
            </label>

            <label className="lg:col-span-2">
              <span className="text-sm font-semibold text-neutral-300">Customer announcement</span>
              <textarea rows={2} value={storeSettings.announcement} onChange={(event) => setStoreSettings((current) => ({ ...current, announcement: event.target.value }))} placeholder="Example: Early closing tonight. Last order at 11:00 PM." className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-amber-400" />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black p-4">
              <span><strong className="block">Accept online orders</strong><small className="text-neutral-500">Turn this off to block checkout immediately.</small></span>
              <input type="checkbox" checked={storeSettings.ordering_enabled} onChange={(event) => setStoreSettings((current) => ({ ...current, ordering_enabled: event.target.checked }))} className="h-5 w-5" />
            </label>

            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <label className="flex items-center justify-between">
                <span><strong className="block">Free delivery</strong><small className="text-neutral-500">Sets delivery fee to ₱0 at checkout.</small></span>
                <input type="checkbox" checked={storeSettings.free_delivery} onChange={(event) => setStoreSettings((current) => ({ ...current, free_delivery: event.target.checked }))} className="h-5 w-5" />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">Regular delivery fee</span>
                <div className="mt-2 flex items-center rounded-xl border border-white/10 px-3">
                  <span className="text-neutral-500">₱</span>
                  <input type="number" min="0" value={storeSettings.delivery_fee} onChange={(event) => setStoreSettings((current) => ({ ...current, delivery_fee: Number(event.target.value) }))} disabled={storeSettings.free_delivery} className="w-full bg-transparent px-2 py-2 outline-none disabled:opacity-40" />
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void saveStoreSettings()} disabled={savingStoreSettings} className="rounded-full bg-amber-400 px-6 py-3 font-black text-black disabled:opacity-50">
              {savingStoreSettings ? "Saving..." : "Save Store Status"}
            </button>
            {storeSettingsNotice && <p className="text-sm font-semibold text-emerald-300">✓ {storeSettingsNotice}</p>}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-9">
          <DashboardCard
            label="Orders Today"
            value={ordersToday.length}
          />
          <DashboardCard
            label="Pending"
            value={pendingCount}
          />
          <DashboardCard
            label="Accepted"
            value={acceptedCount}
          />
          <DashboardCard
            label="Preparing"
            value={preparingCount}
          />
          <DashboardCard label="Ready" value={readyCount} />
          <DashboardCard
            label="Delivering"
            value={deliveringCount}
          />
          <DashboardCard
            label="Completed"
            value={completedToday.length}
          />
          <DashboardCard
            label="GCash Pending"
            value={gcashPendingCount}
          />
          <DashboardCard
            label="Sales Today"
            value={formatMoney(salesToday)}
          />
        </section>

        <section id="orders" className="mt-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Live Orders
                </h1>
                <p className="mt-2 text-neutral-500">
                  Realtime order management for SYP ON CAFÉ.
                </p>
              </div>

              <label className="w-full max-w-md">
                <span className="text-sm text-neutral-400">
                  Search orders
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Order no., name, phone or product..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-neutral-950 px-5 py-3 outline-none transition focus:border-amber-400"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                label={`All (${orders.length})`}
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              />

              {filterStatuses.map((status) => (
                <FilterButton
                  key={status}
                  label={`${statusLabels[status]} (${
                    orders.filter(
                      (order) => order.status === status,
                    ).length
                  })`}
                  active={activeFilter === status}
                  onClick={() => setActiveFilter(status)}
                />
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-950 p-12 text-center text-neutral-400">
              Loading live orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-12 text-center text-neutral-500">
              No orders found in this section.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {filteredOrders.map((order) => {
                const nextAction = getNextAction(order);
                const customer = order.customer;
                const isUpdating =
                  updatingOrderId === order.id;

                return (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-white/10 bg-neutral-950 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={order.status}
                          />

                          {![
                            "completed",
                            "cancelled",
                          ].includes(order.status) && (
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getOrderAgeStyle(
                                order.created_at,
                                currentTime,
                              )}`}
                            >
                              ⏱{" "}
                              {getOrderAge(
                                order.created_at,
                                currentTime,
                              )}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-xl font-bold text-amber-400">
                          {order.order_number}
                        </h2>

                        <p className="mt-1 text-sm text-neutral-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatMoney(order.total)}
                        </p>
                        <p className="mt-1 text-sm capitalize text-neutral-500">
                          {order.order_type} •{" "}
                          {order.payment_method}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 p-4">
                        <p className="text-sm text-neutral-500">
                          Customer
                        </p>
                        <p className="mt-1 font-semibold">
                          {order.customer_name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {order.mobile}
                        </p>
                        <p className="mt-3 text-amber-400">
                          {renderStars(customer?.trust_score)}
                        </p>
                        <p className="mt-1 text-xs capitalize text-neutral-500">
                          {customer?.customer_status ?? "new"} •{" "}
                          {customer?.total_orders ?? 0} total
                          orders
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-300">
                            Completed:{" "}
                            {customer?.completed_orders ?? 0}
                          </div>
                          <div className="rounded-xl bg-red-500/10 px-3 py-2 text-red-300">
                            Cancelled:{" "}
                            {customer?.cancelled_orders ?? 0}
                          </div>
                        </div>

                        {customer?.is_blacklisted && (
                          <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
                            Blacklisted customer
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 p-4">
                        <p className="text-sm text-neutral-500">
                          Order method
                        </p>
                        <p className="mt-1 font-semibold capitalize">
                          {order.order_type}
                        </p>

                        {order.order_type === "delivery" && (
                          <>
                            <p className="mt-3 text-sm leading-6 text-neutral-300">
                              {order.address || "No address"}
                            </p>
                            {order.landmark && (
                              <p className="mt-2 text-sm text-neutral-500">
                                Landmark: {order.landmark}
                              </p>
                            )}
                          </>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                            String(order.payment_status || "pending").toLowerCase() === "paid"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          }`}>
                            {order.payment_method} • {order.payment_status || "pending"}
                          </span>

                          {order.payment_method === "gcash" && (
                            <button
                              type="button"
                              disabled={paymentUpdatingOrderId === order.id}
                              onClick={() =>
                                void updatePaymentStatus(
                                  order,
                                  String(order.payment_status || "pending").toLowerCase() === "paid"
                                    ? "pending"
                                    : "paid",
                                )
                              }
                              className="rounded-full border border-sky-400/40 px-3 py-1 text-xs font-bold text-sky-300 disabled:opacity-50"
                            >
                              {paymentUpdatingOrderId === order.id
                                ? "Saving..."
                                : String(order.payment_status || "pending").toLowerCase() === "paid"
                                  ? "Mark Unpaid"
                                  : "Verify GCash"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 p-4">
                      <p className="font-semibold">
                        Order Items
                      </p>

                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-4"
                          >
                            <div>
                              <p>
                                {item.quantity}×{" "}
                                {item.temperature === "hot"
                                  ? "Hot "
                                  : item.temperature === "iced"
                                    ? "Iced "
                                    : ""}
                                {item.product_name}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {item.size || "Regular"} • Base{" "}
                                {formatMoney(item.base_price)}
                              </p>

                              {item.addons.length > 0 && (
                                <div className="mt-2 space-y-1 border-l border-amber-400/40 pl-3 text-sm text-amber-300">
                                  {item.addons.map((addon) => (
                                    <p key={addon.id}>
                                      + {addon.addon_name} (
                                      {formatMoney(addon.addon_price)})
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            <p className="font-semibold">
                              {formatMoney(item.line_total)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                        <div className="flex justify-between text-neutral-400">
                          <span>Subtotal</span>
                          <span>
                            {formatMoney(order.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Delivery fee</span>
                          <span>
                            {formatMoney(order.delivery_fee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold">
                          <span>Total</span>
                          <span className="text-amber-400">
                            {formatMoney(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <p className="text-sm font-semibold text-amber-400">
                          Customer notes
                        </p>
                        <p className="mt-2 text-sm leading-6 text-neutral-300">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {order.order_type === "delivery" &&
                      ["ready", "delivering", "completed"].includes(
                        order.status,
                      ) && (
                        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-amber-400">
                                🚚 Shop Rider Assignment
                              </p>
                              <p className="mt-1 text-sm text-neutral-500">
                                Cashier-managed delivery details shown to the customer.
                              </p>
                            </div>

                            {order.rider_name && (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                Rider Assigned
                              </span>
                            )}
                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Rider name
                              </span>
                              <input
                                type="text"
                                value={getRiderDraft(order).name}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="Example: Alex"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Rider mobile
                              </span>
                              <input
                                type="tel"
                                value={getRiderDraft(order).mobile}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "mobile",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="09XXXXXXXXX"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Vehicle / description
                              </span>
                              <input
                                type="text"
                                value={getRiderDraft(order).vehicle}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "vehicle",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="Example: Black Mio"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>

                            <label>
                              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Estimated arrival
                              </span>
                              <input
                                type="text"
                                value={getRiderDraft(order).eta}
                                onChange={(event) =>
                                  updateRiderDraft(
                                    order.id,
                                    "eta",
                                    event.target.value,
                                  )
                                }
                                disabled={order.status === "completed"}
                                placeholder="Example: 15–20 minutes"
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none transition focus:border-amber-400 disabled:opacity-60"
                              />
                            </label>
                          </div>

                          {order.status !== "completed" && (
                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => void assignRider(order)}
                                className="flex-1 rounded-full border border-amber-400 px-5 py-3 font-semibold text-amber-400 transition hover:bg-amber-400/10 disabled:opacity-50"
                              >
                                {isUpdating
                                  ? "Saving..."
                                  : order.rider_name
                                    ? "Update Rider Details"
                                    : "Assign Rider"}
                              </button>

                              {order.status === "ready" && (
                                <button
                                  type="button"
                                  disabled={isUpdating || !order.rider_name}
                                  onClick={() =>
                                    void markOutForDelivery(order)
                                  }
                                  className="flex-1 rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Out for Delivery
                                </button>
                              )}

                              {order.status === "delivering" && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void markDelivered(order)}
                                  className="flex-1 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          )}

                          {order.rider_name && (
                            <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-300">
                              <p>
                                Assigned rider:{" "}
                                <span className="font-bold text-white">
                                  {order.rider_name}
                                </span>
                              </p>
                              {order.rider_mobile && (
                                <p>Mobile: {order.rider_mobile}</p>
                              )}
                              {order.rider_vehicle && (
                                <p>Vehicle: {order.rider_vehicle}</p>
                              )}
                              {order.rider_eta && (
                                <p>ETA: {order.rider_eta}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      {nextAction && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void updateOrderStatus(
                              order,
                              nextAction.nextStatus,
                            )
                          }
                          className="flex-1 rounded-full bg-amber-400 px-5 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                        >
                          {isUpdating
                            ? "Updating..."
                            : nextAction.label}
                        </button>
                      )}

                      {![
                        "completed",
                        "cancelled",
                      ].includes(order.status) && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                `Cancel order ${order.order_number}?`,
                              );

                            if (confirmed) {
                              void updateOrderStatus(
                                order,
                                "cancelled",
                              );
                            }
                          }}
                          className="rounded-full border border-red-500/30 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-amber-400">
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black"
          : "rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-400 transition hover:border-amber-400 hover:text-amber-400"
      }
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<OrderStatus, string> = {
    pending:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    accepted:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",
    preparing:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    ready:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    delivering:
      "border-purple-500/30 bg-purple-500/10 text-purple-300",
    completed:
      "border-green-500/30 bg-green-500/10 text-green-300",
    cancelled:
      "border-red-500/30 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}