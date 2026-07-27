# Build 30 — Stable Update from Build 29

Base: `SYP_BUILD_29_COPY_ONLY_HOT_DRINKS_POS_FRIES_FIX`

Copy this patch directly into the project root and choose **Replace All**.

## Included fixes

- Official branded Iced Americano image is used by the POS and shared product-image mapping.
- POS now shows one card per product instead of separate cards for every size.
- Clicking a product opens the customizer, where the cashier chooses:
  - 16oz or 22oz for iced drinks
  - 8oz or 12oz for hot drinks
- Category counts now count unique products instead of size variants.
- Hot drinks stay Hot; iced drinks stay Iced.
- Existing hot-drink and SYP Fries fixes from Build 29 are preserved.

## Files

- `app/pos/page.tsx`
- `lib/product-images.ts`
- `public/products/iced-americano-official.webp`
- Existing Build 29 product assets are also included.

No SQL is required.

## Git

```powershell
git add -- app/pos/page.tsx lib/product-images.ts public/products
git commit -m "Build 30 - Compact POS sizes and official Americano"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```

Do not use `git add .` on the current computer because the Git root appears to include folders outside the project.
