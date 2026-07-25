# BUILD 30 — Video Mini Player + Iced Milo + Iced Americano

Copy-only patch.

## Fixed
- Floating video is rendered outside the hero stacking context, so cards can no longer cover it.
- Mini player stays fixed at the lower-right and above the mobile quick bar.
- Iced Milo featured poster now uses the same warm premium background style as other featured drinks.
- Iced Americano now uses the uploaded black coffee reference with SYP ON CAFÉ branding.
- Customer menu and POS both use the corrected Iced Americano image.

## Copy and replace
- `app/page.tsx`
- `app/site.css`
- `app/menu/page.tsx`
- `app/pos/page.tsx`
- `lib/product-images.ts`
- `public/products/iced-americano-syp.webp`
- `public/products/iced-milo-latte.webp`
- `public/featured/iced-milo-latte.webp`

No SQL required.
