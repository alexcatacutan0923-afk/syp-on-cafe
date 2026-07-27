# SYP ON CAFÉ Build 34

## Included
- Official glowing SYP logo on About and Visit/Contact pages
- New Iced Milo Latte poster on homepage and shared product image
- Larger homepage featured-drink card
- Member dashboard refresh no longer crashes when the visits RPC is temporarily unavailable
- Member data and visit refresh run independently, so stamps can still update

## Install
Copy all folders into the current project root and choose Replace All.

No new SQL is required if Build 24 SQL was already run.

## GitHub
```powershell
git add -- app/page.tsx app/site.css app/about/page.tsx app/contact/page.tsx app/member/page.tsx lib/member-cloud.ts public/featured/iced-milo-latte.webp public/products/iced-milo-latte.webp
git commit -m "Build 34 - Brand pages Milo feature and member refresh"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
