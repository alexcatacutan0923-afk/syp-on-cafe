# SYP ON CAFÉ Build 31 — Official Iced Americano + Compact POS Size Selection

## Changes

- Replaced the Iced Americano image with the new official SYP ON CAFÉ cup image.
- The same Americano asset is used by the public customer menu and POS.
- Consolidated duplicate POS cards by product name.
- One POS card now contains all available sizes, such as 16oz and 22oz.
- Size and price are selected inside the customization popup before adding to cart.
- Hot products remain grouped into one card with 8oz and 12oz choices.
- Category product counts now count products, not duplicate size variants.

## Copy and replace

- `app/pos/page.tsx`
- `lib/product-images.ts`
- `public/products/iced-americano-official.webp`

No SQL is required.

## Git commands

```bash
git add app/pos/page.tsx lib/product-images.ts public/products/iced-americano-official.webp BUILD_31_INSTALL.md
git commit -m "Build 31 - Official Americano and compact POS sizes"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```

After deployment, hard refresh with `Ctrl + Shift + R`.
