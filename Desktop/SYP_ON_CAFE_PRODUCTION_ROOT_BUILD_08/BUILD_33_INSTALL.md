# Build 33 — Stable Navigation & Member Access

Copy the folders from this patch into the current project root and choose **Replace All**.

Included fixes:
- Restored spaced header links: Menu, Reviews, Coffee Moments, About, Visit
- Login, Create Account, and Order Now remain clearly visible
- Responsive header on desktop, tablet, and mobile
- Official transparent Iced Americano image shared by customer menu and POS mapping
- No SQL required

Test locally:

```powershell
Ctrl + C
npm run dev
```

GitHub update:

```powershell
git add -- app/page.tsx app/site.css lib/product-images.ts public/products/iced-americano-official.webp
git commit -m "Build 33 - Stable navigation member access and Americano"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
