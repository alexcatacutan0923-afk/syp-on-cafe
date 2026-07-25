# SYP ON CAFÉ — Build 27 Copy-Only Patch

## Included
- Full-screen cinematic homepage video hero
- Sound and full-size controls
- Floating mini-player while scrolling
- Return-to-hero control
- Biscoff Matcha featured chip
- Compact customer community promo card
- Mobile quick bar: Order, Menu, Rewards
- Existing horizontal carousels preserved

## Install
Copy and replace:
- `app/page.tsx`
- `app/site.css`

No SQL migration is required.

## Git
```bash
git add app/page.tsx app/site.css BUILD_27_INSTALL.md
git commit -m "Build 27 - Cinematic hero and floating mini player"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
