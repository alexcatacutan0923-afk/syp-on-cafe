"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./pos.css";

type Category = "All" | "Coffee" | "Matcha" | "Soda" | "Milky" | "Fries" | "Signature" | "ADDS";
type Payment = "Cash" | "GCash" | "Maya";

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
  { id: "americano-16", name: "Americano", size: "16oz", price: 69, category: "Coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=90" },
  { id: "americano-22", name: "Americano", size: "22oz", price: 79, category: "Coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=90" },
  { id: "spanish-16", name: "Spanish Latte", size: "16oz", price: 89, category: "Coffee", image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=90", bestseller: true },
  { id: "spanish-22", name: "Spanish Latte", size: "22oz", price: 109, category: "Coffee", image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=90", bestseller: true },
  { id: "oreo-16", name: "Oreo Latte", size: "16oz", price: 79, category: "Coffee", image: "https://images.unsplash.com/photo-1594631661960-34762327295d?auto=format&fit=crop&w=700&q=90" },
  { id: "oreo-22", name: "Oreo Latte", size: "22oz", price: 99, category: "Coffee", image: "https://images.unsplash.com/photo-1594631661960-34762327295d?auto=format&fit=crop&w=700&q=90" },
  { id: "biscoff-16", name: "Biscoff Latte", size: "16oz", price: 99, category: "Coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=90" },
  { id: "biscoff-22", name: "Biscoff Latte", size: "22oz", price: 119, category: "Coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=90" },
  { id: "matcha-16", name: "Matcha Latte", size: "16oz", price: 109, category: "Matcha", image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=700&q=90" },
  { id: "biscoff-matcha-16", name: "Biscoff Matcha", size: "16oz", price: 119, category: "Matcha", image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=700&q=90" },
  { id: "milo-dino-16", name: "Milo Dino", size: "16oz", price: 79, category: "Milky", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=700&q=90" },
  { id: "fries-small", name: "SYP Bites", size: "Small", price: 49, category: "Fries", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=90" },
  { id: "choco-boom-16", name: "SYP Choco Boom", size: "16oz", price: 99, category: "Signature", image: "https://images.unsplash.com/photo-1578374173713-32f6ae6f3971?auto=format&fit=crop&w=700&q=90" },
  { id: "green-apple-16", name: "Green Apple", size: "16oz", price: 39, category: "Soda", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=90" },
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
  const [customerQuery, setCustomerQuery] = useState("");
  const [addStamp, setAddStamp] = useState(true);
  const [autoPrint, setAutoPrint] = useState(true);
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
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = category === "All" || product.category === category;
      const searchMatch = !q || `${product.name} ${product.size} ${product.category}`.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const change = payment === "Cash" ? Math.max(0, cash - total) : 0;
  const checkoutReady = cart.length > 0 && (payment !== "Cash" || cash >= total);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
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
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const openCustomizer = (product: Product) => {
    setSelectedProduct(product);
    setTemperature("Iced");
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
    setNotice("Cart cleared");
    window.setTimeout(() => setNotice(""), 1200);
  };

  const completeSale = () => {
    if (!checkoutReady) return;
    setNotice(`Sale completed • ${money(total)}`);
    window.setTimeout(() => {
      setCart([]);
      setCash(0);
      setDiscount(0);
      setNotice("");
    }, 1300);
  };

  return (
    <main className="pos-shell">
      {notice && <div className="pos-toast" role="status">✓ {notice}</div>}
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

        <div className="stats-row">
          <Stat label="TODAY'S SALES" value="₱12,450" trend="+18%" />
          <Stat label="ORDERS" value="18" />
          <Stat label="MEMBERS" value="128" />
          <Stat label="FREE DRINKS" value="5" />
        </div>

        <div className="cashier-card">
          <div className="avatar">A</div>
          <div><strong>Alex</strong><span>Cashier</span></div>
        </div>
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
            <div><h2>{category === "All" ? "ALL PRODUCTS" : category.toUpperCase()}</h2><p>{filteredProducts.length} products</p></div>
            <div className="view-toggle"><button className="active">▦ Grid</button><button>☷ List</button></div>
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className={`product-card ${lastAdded === product.id ? "just-added" : ""}`} key={product.id} onClick={() => openCustomizer(product)}>
                {product.bestseller && <span className="product-badge">BEST SELLER</span>}
                <div className="product-image"><img src={product.image} alt={product.name} /></div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.size}</p>
                  <div><strong>{money(product.price)}</strong><button aria-label={`Add ${product.name}`} onClick={(event) => { event.stopPropagation(); openCustomizer(product); }}>+</button></div>
                </div>
              </article>
            ))}
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
            <input placeholder="Add order note (optional)..." />
            <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="discount-row"><span>Discount</span><div><button onClick={() => setDiscount(Math.min(subtotal, discount + 10))}>+₱10</button><button onClick={() => setDiscount(0)}>Clear</button><strong>- {money(discount)}</strong></div></div>
            <div className="grand-total"><span>TOTAL</span><strong>{money(total)}</strong></div>
          </div>
        </section>

        <aside className="checkout-panel">
          <div className="checkout-card customer-box">
            <h3>CUSTOMER</h3>
            <input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="⌕ Search name or ID..." />
            <div className="customer-preview"><div className="avatar small">JD</div><div><strong>Juan Dela Cruz</strong><span>SYP0021</span></div><b>6 / 10</b></div>
            <div className="stamps">{Array.from({ length: 10 }).map((_, index) => <i key={index} className={index < 6 ? "filled" : ""}>★</i>)}</div><div className="customer-meta"><span><b>43</b> Visits</span><span><b>Spanish Latte</b> Favorite</span><span><b>Jul 28</b> Birthday</span></div>
          </div>

          <div className="checkout-card">
            <h3>PAYMENT METHOD</h3>
            <div className="payment-tabs">{(["Cash", "GCash", "Maya"] as const).map((method) => <button key={method} className={payment === method ? "active" : ""} onClick={() => { setPayment(method); if (method !== "Cash") setCash(total); }}>{method}</button>)}</div>
          </div>

          <div className="checkout-card calculator-card">
            <h3>CASH CALCULATOR</h3>
            <label>Cash Received</label>
            <div className="cash-display">{money(cash)}</div>
            <div className="cash-buttons">
              {[20, 50, 100, 200, 500, 1000].map((amount) => <button key={amount} onClick={() => setCash((value) => value + amount)}>₱{amount}</button>)}
              <button onClick={() => setCash((value) => value + 10)}>+₱10</button>
              <button onClick={() => setCash((value) => value + 5)}>+₱5</button>
              <button onClick={() => setCash(total)} className="exact">Exact</button>
              <button onClick={() => setCash(0)} className="danger">Clear</button>
            </div>
            <h3 className="suggested-title">SUGGESTED AMOUNTS</h3>
            <div className="suggested-grid">{suggestedAmounts(total).map((amount, index) => <button key={`${amount}-${index}`} onClick={() => setCash(amount)}><strong>{money(amount)}</strong><span>{amount === total ? "No change" : `Change: ${money(amount - total)}`}</span></button>)}</div>
            <div className="change-row"><span>Change</span><strong>{money(change)}</strong></div>
          </div>

          <div className="checkout-card switches">
            <label><input type="checkbox" checked={addStamp} onChange={(event) => setAddStamp(event.target.checked)} /> Add loyalty stamp</label>
            <small>No stamp for Soda or ADDS-only orders.</small>
            <label><input type="checkbox" checked={autoPrint} onChange={(event) => setAutoPrint(event.target.checked)} /> Auto-print receipt</label>
          </div>

          <button className="checkout-button" disabled={!checkoutReady} onClick={completeSale}><span className="lock">▣</span><span>CHECKOUT<small>F5 / ENTER</small></span></button>
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
              {selectedProduct.category !== "Fries" && selectedProduct.category !== "Soda" && (
                <OptionSection title="Temperature" subtitle="Choose how it will be served">
                  <div className="choice-grid two">{(["Iced", "Hot"] as const).map((value) => <ChoiceButton key={value} active={temperature === value} onClick={() => setTemperature(value)} icon={value === "Iced" ? "❄" : "♨"} label={value} />)}</div>
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
        <button className="online-orders">▣ Online Orders <b>2</b></button>
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
  if (name === "All") return products.length;
  return products.filter((product) => product.category === name).length;
}

function suggestedAmounts(total: number) {
  if (!total) return [0, 0, 0];
  const choices = [total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, 500, 1000].filter((value) => value >= total);
  return Array.from(new Set(choices)).slice(0, 3);
}
