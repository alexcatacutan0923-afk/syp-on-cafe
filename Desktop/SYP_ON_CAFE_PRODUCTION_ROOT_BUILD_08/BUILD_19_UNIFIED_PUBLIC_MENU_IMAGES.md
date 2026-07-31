# Build 19 — Unified Public Menu Images

- Restored the clean POS product-image library from Build 17.
- Public menu now resolves every product through the same `/public/products` image paths used by the POS.
- Marketing posters remain isolated in `/public/featured` for homepage promotions only.
- Added complete name mapping for Coffee, Milky, Matcha, Signature, Soda, Fries, and hot-name variants.
- Added category-safe fallback images so every public product card always renders an image.
- Added lazy loading and async decoding on public menu product images.
