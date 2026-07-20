(() => {
  "use strict";

  const API_URL = "https://script.google.com/macros/s/AKfycbw8-313J5vT0eanrWTt52lGuzOO_AXs4jZxjuXz8Z5ic7gZS_vnZaUl7HxJQBYgpIs/exec";
  const state = { products: [], category: "All", search: "" };
  const el = {
    products: document.getElementById("products"),
    status: document.getElementById("status"),
    categories: document.getElementById("categories"),
    count: document.getElementById("productCount"),
    title: document.getElementById("sectionTitle"),
    search: document.getElementById("searchInput"),
    refresh: document.getElementById("refreshButton")
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  function money(value) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  function icon(category) {
    const text = String(category || "").toLowerCase();
    if (text.includes("matcha")) return "🍵";
    if (text.includes("soda")) return "🥤";
    if (text.includes("fries") || text.includes("bites")) return "🍟";
    if (text.includes("milky")) return "🥛";
    if (text.includes("signature")) return "✨";
    return "☕";
  }

  function setLoading() {
    el.products.hidden = true;
    el.status.hidden = false;
    el.status.className = "status";
    el.status.innerHTML = '<div class="spinner" aria-hidden="true"></div><strong>Loading fresh menu…</strong><span>Please wait a moment.</span>';
    el.count.textContent = "Connecting to SYP menu…";
  }

  function setError(message) {
    el.products.hidden = true;
    el.status.hidden = false;
    el.status.className = "status error";
    el.status.innerHTML = `<div class="product-emoji">☕</div><strong>Menu is temporarily unavailable</strong><span>${escapeHtml(message)}</span>`;
    el.count.textContent = "Could not load products";
  }

  function loadJsonp() {
    return new Promise((resolve, reject) => {
      const callbackName = `sypMenu_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => finish(new Error("The café server took too long to respond.")), 15000);
      let done = false;

      function finish(error, data) {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        script.remove();
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        error ? reject(error) : resolve(data);
      }

      window[callbackName] = data => finish(null, data);
      script.onerror = () => finish(new Error("Unable to connect to the café server."));
      script.src = `${API_URL}?action=menu&callback=${encodeURIComponent(callbackName)}&_=${Date.now()}`;
      document.head.appendChild(script);
    });
  }

  function renderCategories() {
    const categories = ["All", ...new Set(state.products.map(p => String(p.category || "").trim()).filter(Boolean))];
    el.categories.innerHTML = "";
    categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `category${category === state.category ? " active" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        state.category = category;
        renderCategories();
        renderProducts();
      });
      el.categories.appendChild(button);
    });
  }

  function renderProducts() {
    const q = state.search.toLowerCase();
    const filtered = state.products.filter(product => {
      const categoryMatch = state.category === "All" || String(product.category) === state.category;
      const haystack = `${product.product || ""} ${product.variant || ""} ${product.category || ""}`.toLowerCase();
      return categoryMatch && (!q || haystack.includes(q));
    });

    el.title.textContent = state.category === "All" ? "All Menu" : state.category;
    el.count.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
    el.products.innerHTML = "";

    if (!filtered.length) {
      el.products.hidden = true;
      el.status.hidden = false;
      el.status.className = "status";
      el.status.innerHTML = '<div class="product-emoji">🔎</div><strong>No matching drinks found</strong><span>Try another keyword or category.</span>';
      return;
    }

    filtered.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";
      const image = String(product.imageUrl || "").trim();
      card.innerHTML = `
        <div class="product-photo">
          ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.product)}" loading="lazy" referrerpolicy="no-referrer">` : `<span class="product-emoji" aria-hidden="true">${icon(product.category)}</span>`}
        </div>
        <div class="product-category">${escapeHtml(product.category)}</div>
        <h3>${escapeHtml(product.product)}</h3>
        <div class="product-bottom">
          <span class="variant">${escapeHtml(product.variant || "Regular")}</span>
          <strong class="price">${money(product.price)}</strong>
        </div>`;
      const img = card.querySelector("img");
      if (img) img.addEventListener("error", () => { img.parentElement.innerHTML = `<span class="product-emoji" aria-hidden="true">${icon(product.category)}</span>`; }, { once: true });
      el.products.appendChild(card);
    });

    el.status.hidden = true;
    el.products.hidden = false;
  }

  async function loadMenu() {
    setLoading();
    try {
      const response = await loadJsonp();
      if (!response || response.success !== true || !Array.isArray(response.products)) {
        throw new Error(response && response.message ? response.message : "Invalid menu response.");
      }
      state.products = response.products.filter(p => p && p.product && Number(p.price) >= 0);
      renderCategories();
      renderProducts();
    } catch (error) {
      console.error("SYP menu load failed", error);
      setError(error && error.message ? error.message : "Please tap Refresh and try again.");
    }
  }

  el.search.addEventListener("input", event => { state.search = event.target.value.trim(); renderProducts(); });
  el.refresh.addEventListener("click", loadMenu);
  loadMenu();
})();
