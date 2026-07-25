export const PRODUCT_IMAGE_BY_NAME: Record<string, string> = {
  "americano": "/products/iced-americano.webp",
  "spanish latte": "/products/spanish-latte.webp",
  "oreo latte": "/products/oreo-latte.webp",
  "iced milo latte": "/products/iced-milo-latte.webp",
  "milo latte": "/products/iced-milo-latte.webp",
  "vanilla latte": "/products/roasted-almond-latte.webp",
  "french vanilla latte": "/products/french-vanilla-latte.webp",
  "roasted almond latte": "/products/roasted-almond-latte.webp",
  "biscoff latte": "/products/biscoff-latte.webp",
  "salted caramel": "/products/caramel-macchiato-alt.webp",
  "salted caramel latte": "/products/caramel-macchiato-alt.webp",
  "mocha": "/products/syp-choco-boom.webp",
  "white mocha": "/products/syp-white-rush.webp",
  "milo dino": "/products/milo-dino.webp",
  "oreo milky": "/products/oreo-milky.webp",
  "caramel macchiato": "/products/caramel-macchiato.webp",
  "milky white choco": "/products/milky-white-choco.webp",
  "milky choco": "/products/milky-choco.webp",
  "matcha latte": "/products/matcha-latte.webp",
  "strawberry matcha": "/products/strawberry-matcha.webp",
  "mango matcha": "/products/mango-matcha.webp",
  "blueberry matcha": "/products/blueberry-matcha.webp",
  "biscoff matcha": "/products/biscoff-matcha.webp",
  "oreo matcha": "/products/oreo-matcha.webp",
  "green apple": "/products/green-apple.webp",
  "mango": "/products/mango.webp",
  "orange": "/products/orange.webp",
  "strawberry": "/products/strawberry.webp",
  "watermelon": "/products/watermelon.webp",
  "blueberry": "/products/blueberry.webp",
  "peach": "/products/peach.webp",
  "syp choco boom": "/products/syp-choco-boom.webp",
  "choco boom": "/products/syp-choco-boom.webp",
  "syp white rush": "/products/syp-white-rush.webp",
  "white rush": "/products/syp-white-rush.webp",
  "syp bites": "/products/syp-fries.webp",
  "syp cravings": "/products/syp-fries.webp",
  "syp overload": "/products/syp-fries.webp",
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  Coffee: "/products/spanish-latte.webp",
  Milky: "/products/milo-dino.webp",
  Matcha: "/products/matcha-latte.webp",
  Signature: "/products/syp-choco-boom.webp",
  Soda: "/products/green-apple.webp",
  Fries: "/products/syp-fries.webp",
};

export function normalizeProductName(name: string) {
  return name.trim().toLowerCase().replace(/^hot\s+/, "");
}

export function getProductImage(name: string, category?: string, databaseImage?: string | null) {
  const raw = name.trim().toLowerCase();
  const isHot = /^hot\s+/.test(raw);
  if (isHot) return "/products/hot-coffee-black-cup.webp";
  const normalized = normalizeProductName(name);
  return (
    PRODUCT_IMAGE_BY_NAME[normalized] ||
    (databaseImage?.startsWith("/products/") ? databaseImage : "") ||
    (category ? CATEGORY_FALLBACKS[category] : "") ||
    "/products/spanish-latte.webp"
  );
}
