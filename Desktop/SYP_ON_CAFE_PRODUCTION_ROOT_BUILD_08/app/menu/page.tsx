"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getProductImage } from "@/lib/product-images";

type Temperature = "iced" | "hot" | "regular";

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
type TemperatureFilter = "all" | "iced" | "hot";

type Product = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  price16: number;
  price22: number | null;
  available: boolean;
  temperature: Temperature | null;
  size_small_label: string | null;
  size_large_label: string | null;
};

type AddonGroup = {
  id: number;
  name: string;
  sort_order: number;
};

type Addon = {
  id: number;
  group_id: number;
  name: string;
  price: number;
  active: boolean;
  sort_order: number;
  addon_groups: AddonGroup | AddonGroup[] | null;
};

type SelectedAddon = {
  id: number;
  group: string;
  name: string;
  price: number;
};

type CartItem = {
  cartId: string;
  productId: number;
  name: string;
  category: string;
  temperature: Temperature;
  size: string;
  basePrice: number;
  price: number;
  quantity: number;
  addOns: SelectedAddon[];
};

const categories = [
  { id: "All", label: "All", icon: "✨" },
  { id: "Coffee", label: "Coffee", icon: "☕" },
  { id: "Milky", label: "Milky", icon: "🥛" },
  { id: "Matcha", label: "Matcha", icon: "🍵" },
  { id: "Signature", label: "Signature", icon: "⭐" },
  { id: "Soda", label: "Soda", icon: "🥤" },
  { id: "Fries", label: "Fries", icon: "🍟" },
] as const;


function productImage(product: Product) {
  return getProductImage(product.name, product.category, product.image);
}

const customizableCategories = new Set([
  "Coffee",
  "Milky",
  "Matcha",
  "Signature",
]);

function normalizeTemperature(product: Product): Temperature {
  if (product.temperature === "hot") return "hot";
  if (product.temperature === "regular") return "regular";
  if (["Soda", "Fries"].includes(product.category)) return "regular";
  return "iced";
}

function temperatureLabel(value: Temperature) {
  if (value === "hot") return "Hot";
  if (value === "iced") return "Iced";
  return "";
}

function getGroup(addon: Addon): AddonGroup | null {
  if (Array.isArray(addon.addon_groups)) {
    return addon.addon_groups[0] ?? null;
  }

  return addon.addon_groups;
}

function money(value: number) {
  return `₱${Number(value).toFixed(0)}`;
}

function categoryIcon(category: string) {
  return categories.find((item) => item.id === category)?.icon ?? "✨";
}

export default function MenuPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [temperatureFilter, setTemperatureFilter] =
    useState<TemperatureFilter>("all");
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<"small" | "large">("small");
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("sypMenuFavorites");
    if (savedFavorites) {
      try { setFavoriteIds(JSON.parse(savedFavorites) as number[]); } catch { localStorage.removeItem("sypMenuFavorites"); }
    }

    const saved = localStorage.getItem("sypCart");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as CartItem[];
      setCart(parsed);
    } catch {
      localStorage.removeItem("sypCart");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sypCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    async function loadMenu() {
      setIsLoading(true);
      setLoadError("");

      const [productsResult, addonsResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id,name,category,description,image,price16,price22,available,temperature,size_small_label,size_large_label",
          )
          .eq("available", true)
          .order("id", { ascending: true }),

        supabase
          .from("addons")
          .select(
            "id,group_id,name,price,active,sort_order,addon_groups(id,name,sort_order)",
          )
          .eq("active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (productsResult.error) {
        setLoadError(productsResult.error.message);
        setProducts([]);
      } else {
        setProducts((productsResult.data ?? []) as Product[]);
      }

      if (addonsResult.error) {
        console.error("Add-ons error:", addonsResult.error);
        setAddons([]);
      } else {
        setAddons((addonsResult.data ?? []) as unknown as Addon[]);
      }

      setIsLoading(false);
    }

    void loadMenu();
  }, []);

  useEffect(() => {
    async function loadStoreSettings() {
      const { data, error } = await supabase
        .from("store_settings")
        .select("id,store_status,announcement,closing_time,ordering_enabled,free_delivery,delivery_fee,updated_at")
        .eq("id", 1)
        .single();
      if (!error && data) setStoreSettings({ ...(data as StoreSettings), delivery_fee: Number(data.delivery_fee ?? 30) });
    }

    void loadStoreSettings();
    const channel = supabase.channel("menu-store-settings").on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "store_settings", filter: "id=eq.1" },
      (payload) => { const row = payload.new as StoreSettings; setStoreSettings({ ...row, delivery_fee: Number(row.delivery_fee ?? 0) }); },
    ).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const orderingAvailable = storeSettings.ordering_enabled && !["closed", "temporarily_closed"].includes(storeSettings.store_status);

  const selectedCategorySupportsTemperature =
    activeCategory === "All" ||
    ["Coffee", "Milky", "Matcha", "Signature"].includes(activeCategory);

  useEffect(() => {
    if (!selectedCategorySupportsTemperature) {
      setTemperatureFilter("all");
    }
  }, [selectedCategorySupportsTemperature]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const temp = normalizeTemperature(product);

      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      const matchesTemperature =
        temperatureFilter === "all" ||
        temp === "regular" ||
        temp === temperatureFilter;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        temperatureLabel(temp).toLowerCase().includes(query);

      return matchesCategory && matchesTemperature && matchesSearch;
    });
  }, [products, activeCategory, temperatureFilter, search]);

  const groupedProducts = useMemo(() => {
    const order = [
      "Coffee",
      "Milky",
      "Matcha",
      "Signature",
      "Soda",
      "Fries",
    ];

    return order
      .map((category) => ({
        category,
        items: filteredProducts.filter(
          (product) => product.category === category,
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredProducts]);

  const addonGroups = useMemo(() => {
    const map = new Map<
      number,
      { id: number; name: string; sortOrder: number; addons: Addon[] }
    >();

    for (const addon of addons) {
      const group = getGroup(addon);
      if (!group) continue;

      if (!map.has(group.id)) {
        map.set(group.id, {
          id: group.id,
          name: group.name,
          sortOrder: group.sort_order ?? 0,
          addons: [],
        });
      }

      map.get(group.id)?.addons.push(addon);
    }

    return [...map.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((group) => ({
        ...group,
        addons: group.addons.sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        ),
      }));
  }, [addons]);

  const selectedTemperature = selectedProduct
    ? normalizeTemperature(selectedProduct)
    : "regular";

  const smallLabel =
    selectedProduct?.size_small_label ||
    (selectedTemperature === "hot" ? "8oz" : "16oz");

  const largeLabel =
    selectedProduct?.size_large_label ||
    (selectedTemperature === "hot" ? "12oz" : "22oz");

  const basePrice = selectedProduct
    ? selectedSize === "large" && selectedProduct.price22 !== null
      ? Number(selectedProduct.price22)
      : Number(selectedProduct.price16)
    : 0;

  const chosenAddons = useMemo<SelectedAddon[]>(() => {
    return addons
      .filter((addon) => selectedAddonIds.includes(addon.id))
      .map((addon) => ({
        id: addon.id,
        group: getGroup(addon)?.name ?? "Add-on",
        name: addon.name,
        price: Number(addon.price),
      }));
  }, [addons, selectedAddonIds]);

  const addonsTotal = chosenAddons.reduce(
    (total, addon) => total + addon.price,
    0,
  );

  const itemTotal = basePrice + addonsTotal;

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  function toggleFavorite(productId: number) {
    setFavoriteIds((current) => {
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      localStorage.setItem("sypMenuFavorites", JSON.stringify(next));
      return next;
    });
  }

  function productBadge(name: string) {
    const value = name.toLowerCase();
    if (value.includes("salted caramel")) return "NEW";
    if (["spanish latte", "biscoff matcha", "syp choco boom"].some((item) => value.includes(item))) return "BEST SELLER";
    return "";
  }

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setSelectedSize("small");
    setSelectedAddonIds([]);
  }

  function closeProduct() {
    setSelectedProduct(null);
    setSelectedSize("small");
    setSelectedAddonIds([]);
  }

  function toggleAddon(addon: Addon) {
    const groupName = getGroup(addon)?.name ?? "";

    setSelectedAddonIds((current) => {
      const alreadySelected = current.includes(addon.id);

      if (alreadySelected) {
        return current.filter((id) => id !== addon.id);
      }

      // Espresso is exclusive: +1 Shot or +2 Shots, never both.
      if (groupName === "Espresso") {
        const espressoIds = addons
          .filter((item) => getGroup(item)?.name === "Espresso")
          .map((item) => item.id);

        return [
          ...current.filter((id) => !espressoIds.includes(id)),
          addon.id,
        ];
      }

      return [...current, addon.id];
    });
  }

  function addToCart() {
    if (!selectedProduct) return;
    if (!orderingAvailable) { alert("Online ordering is currently unavailable."); return; }

    const hasLarge =
      selectedSize === "large" && selectedProduct.price22 !== null;

    const size = hasLarge ? largeLabel : smallLabel;
    const temp = normalizeTemperature(selectedProduct);
    const addonKey = chosenAddons
      .map((addon) => addon.id)
      .sort((a, b) => a - b)
      .join("-");
    const cartId = `${selectedProduct.id}-${temp}-${size}-${addonKey}`;

    setCart((current) => {
      const existing = current.find((item) => item.cartId === cartId);

      if (existing) {
        return current.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          cartId,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          category: selectedProduct.category,
          temperature: temp,
          size,
          basePrice,
          price: itemTotal,
          quantity: 1,
          addOns: chosenAddons,
        },
      ];
    });

    closeProduct();
  }

  function changeQuantity(cartId: string, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function proceedToCheckout() {
    if (cart.length === 0) return;
    if (!orderingAvailable) { alert("Online ordering is currently unavailable."); return; }

    localStorage.setItem("sypCart", JSON.stringify(cart));
    router.push("/checkout");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
          <Link href="/">
            <p className="text-lg font-black">SYP ON CAFÉ</p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Street • Iced • Brewed
            </p>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-neutral-400 md:flex"><Link href="/">Home</Link><Link href="/reviews">Reviews</Link><Link href="/moments">Moments</Link><Link href="/member-login">Rewards</Link></nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="rounded-full bg-amber-400 px-5 py-2.5 font-bold text-black"
          >
            Cart
            <span className="ml-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      <section className={orderingAvailable ? "border-b border-emerald-500/20 bg-emerald-500/10" : "border-b border-red-500/20 bg-red-500/10"}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className={orderingAvailable ? "text-sm font-black uppercase tracking-[0.18em] text-emerald-300" : "text-sm font-black uppercase tracking-[0.18em] text-red-300"}>
              {storeSettings.store_status === "closing_early" ? "🟠 Early Closing Today" : storeSettings.store_status === "busy" ? "🟡 Busy — Longer Wait Time" : orderingAvailable ? "🟢 Now Open" : "🔴 Online Ordering Closed"}
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              {storeSettings.announcement || (orderingAvailable ? "We are accepting online orders." : "Online ordering is temporarily unavailable.")}
            </p>
          </div>
          <div className="text-right text-sm">
            {storeSettings.closing_time && <p className="font-bold">Last order: {storeSettings.closing_time}</p>}
            {storeSettings.free_delivery && orderingAvailable && <p className="mt-1 font-black text-amber-300">FREE DELIVERY ACTIVE</p>}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_35%)]">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-400">
            Complete Menu
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            Customize your perfect drink.
          </h1>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Spanish Latte, hot, Biscoff..."
            className="mt-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-950 px-5 py-4 outline-none focus:border-amber-400"
          />
        </div>
      </section>

      <section className="sticky top-[73px] z-30 border-b border-white/10 bg-[#080808]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={
                  activeCategory === category.id
                    ? "shrink-0 rounded-full bg-amber-400 px-5 py-2.5 font-bold text-black"
                    : "shrink-0 rounded-full border border-white/10 bg-neutral-950 px-5 py-2.5 font-semibold text-neutral-300"
                }
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>

          {selectedCategorySupportsTemperature && (
            <div className="mt-4 inline-grid grid-cols-3 rounded-2xl border border-white/10 bg-neutral-950 p-1">
              {(["all", "iced", "hot"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTemperatureFilter(filter)}
                  className={
                    temperatureFilter === filter
                      ? "rounded-xl bg-white px-5 py-2 text-sm font-bold text-black"
                      : "rounded-xl px-5 py-2 text-sm font-semibold text-neutral-500"
                  }
                >
                  {filter === "all"
                    ? "All"
                    : filter === "iced"
                      ? "❄ Iced"
                      : "♨ Hot"}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {isLoading && (
          <div className="rounded-3xl border border-white/10 p-10 text-center text-neutral-400">
            Loading products and add-ons...
          </div>
        )}

        {loadError && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {loadError}
          </div>
        )}

        {!isLoading &&
          groupedProducts.map((group) => (
            <section key={group.category} className="mb-14">
              <h2 className="mb-6 text-3xl font-black">
                {categoryIcon(group.category)} {group.category}
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((product) => {
                  const temp = normalizeTemperature(product);
                  const productSmall =
                    product.size_small_label ||
                    (temp === "hot" ? "8oz" : "16oz");
                  const productLarge =
                    product.size_large_label ||
                    (temp === "hot" ? "12oz" : "22oz");

                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950"
                    >
                      <div className="relative flex h-52 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_60%)]">
                        {productBadge(product.name) && (
                          <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black tracking-[0.14em] text-black">
                            {productBadge(product.name)}
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label={favoriteIds.includes(product.id) ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/70 text-lg"
                        >
                          {favoriteIds.includes(product.id) ? "♥" : "♡"}
                        </button>
                        {temp !== "regular" && (
                          <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-bold">
                            {temp === "hot" ? "♨ HOT" : "❄ ICED"}
                          </span>
                        )}

                        {productImage(product) ? (
                          <img
                            src={productImage(product)}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain p-5"
                          />
                        ) : (
                          <span className="text-7xl">
                            {categoryIcon(product.category)}
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                          {product.category}
                        </p>
                        <h3 className="mt-2 text-2xl font-black">
                          {product.name}
                        </h3>
                        <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-500">
                          {product.description ||
                            "A delicious SYP ON CAFÉ favorite."}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm">
                            {productSmall}{" "}
                            <strong className="text-amber-400">
                              {money(product.price16)}
                            </strong>
                          </span>

                          {product.price22 !== null && (
                            <span className="rounded-full border border-white/10 px-3 py-1.5 text-sm">
                              {productLarge}{" "}
                              <strong className="text-amber-400">
                                {money(product.price22)}
                              </strong>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => openProduct(product)}
                          className="mt-6 w-full rounded-full bg-white px-5 py-3 font-bold text-black hover:bg-amber-400"
                        >
                          {customizableCategories.has(product.category)
                            ? "Customize"
                            : "Select"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-0 sm:p-5">
          <div className="mx-auto min-h-full w-full max-w-2xl bg-neutral-950 p-6 sm:min-h-0 sm:rounded-[32px] sm:border sm:border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  {selectedProduct.category}
                  {selectedTemperature !== "regular" &&
                    ` • ${temperatureLabel(selectedTemperature)}`}
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeProduct}
                className="h-10 w-10 rounded-full border border-white/10"
              >
                ✕
              </button>
            </div>

            {productImage(selectedProduct) && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white">
                <img src={productImage(selectedProduct)} alt={selectedProduct.name} loading="lazy" decoding="async" className="h-72 w-full object-contain" />
              </div>
            )}

            <section className="mt-7">
              <h3 className="font-bold">Choose size</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSize("small")}
                  className={
                    selectedSize === "small"
                      ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left"
                      : "rounded-2xl border border-white/10 bg-black p-4 text-left"
                  }
                >
                  <strong className="block">{smallLabel}</strong>
                  <span className="text-amber-400">
                    {money(selectedProduct.price16)}
                  </span>
                </button>

                {selectedProduct.price22 !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedSize("large")}
                    className={
                      selectedSize === "large"
                        ? "rounded-2xl border border-amber-400 bg-amber-400/10 p-4 text-left"
                        : "rounded-2xl border border-white/10 bg-black p-4 text-left"
                    }
                  >
                    <strong className="block">{largeLabel}</strong>
                    <span className="text-amber-400">
                      {money(selectedProduct.price22)}
                    </span>
                  </button>
                )}
              </div>
            </section>

            {customizableCategories.has(selectedProduct.category) &&
              addonGroups.map((group) => (
                <section
                  key={group.id}
                  className="mt-7 border-t border-white/10 pt-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{group.name}</h3>
                    {group.name === "Espresso" && (
                      <span className="text-xs text-neutral-500">
                        Choose one
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-3">
                    {group.addons.map((addon) => {
                      const checked = selectedAddonIds.includes(addon.id);

                      return (
                        <label
                          key={addon.id}
                          className={
                            checked
                              ? "flex cursor-pointer items-center justify-between rounded-2xl border border-amber-400 bg-amber-400/10 p-4"
                              : "flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-black p-4"
                          }
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type={
                                group.name === "Espresso"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={
                                group.name === "Espresso"
                                  ? "espresso-addon"
                                  : undefined
                              }
                              checked={checked}
                              onChange={() => toggleAddon(addon)}
                            />
                            <span className="font-semibold">{addon.name}</span>
                          </span>
                          <span className="font-bold text-amber-400">
                            +{money(Number(addon.price))}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}

            <section className="mt-7 rounded-2xl border border-white/10 bg-black p-5">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Base drink</span>
                <span>{money(basePrice)}</span>
              </div>

              {chosenAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="mt-2 flex justify-between text-sm text-neutral-400"
                >
                  <span>+ {addon.name}</span>
                  <span>{money(addon.price)}</span>
                </div>
              ))}

              <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                <strong>Total</strong>
                <strong className="text-2xl text-amber-400">
                  {money(itemTotal)}
                </strong>
              </div>
            </section>

            <button
              type="button"
              onClick={addToCart}
              disabled={!orderingAvailable}
              className="mt-6 w-full rounded-full bg-amber-400 px-6 py-4 font-black text-black disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {orderingAvailable ? `Add to Cart • ${money(itemTotal)}` : "Ordering Currently Closed"}
            </button>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80">
          <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-neutral-950">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-sm text-neutral-500">Your order</p>
                <h2 className="text-2xl font-black">Cart ({cartCount})</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-neutral-500">
                  Your cart is empty.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <article
                      key={item.cartId}
                      className="rounded-2xl border border-white/10 bg-black p-4"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {temperatureLabel(item.temperature)}
                            {item.temperature !== "regular" && " • "}
                            {item.size}
                          </p>
                        </div>
                        <strong className="text-amber-400">
                          {money(item.price * item.quantity)}
                        </strong>
                      </div>

                      {item.addOns?.length > 0 && (
                        <ul className="mt-3 space-y-1 border-l border-amber-400/40 pl-3 text-sm text-neutral-400">
                          {item.addOns.map((addon) => (
                            <li key={addon.id}>
                              + {addon.name} ({money(addon.price)})
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.cartId, -1)}
                          className="h-9 w-9 rounded-full border border-white/10"
                        >
                          −
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.cartId, 1)}
                          className="h-9 w-9 rounded-full border border-white/10"
                        >
                          +
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-5">
              <div className="flex justify-between">
                <span className="text-neutral-400">Total</span>
                <strong className="text-2xl text-amber-400">
                  {money(cartTotal)}
                </strong>
              </div>

              <button
                type="button"
                onClick={proceedToCheckout}
                disabled={cart.length === 0 || !orderingAvailable}
                className="mt-5 w-full rounded-full bg-amber-400 px-6 py-4 font-black text-black disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
              >
                {orderingAvailable ? "Proceed to Checkout" : "Online Ordering Closed"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}