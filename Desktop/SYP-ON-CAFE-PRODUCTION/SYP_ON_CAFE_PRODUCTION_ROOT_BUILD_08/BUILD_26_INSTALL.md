# SYP ON CAFÉ Build 26 — Copy-Only Homepage Carousel + Video Branding

## Included
- Featured drinks are horizontal/swipeable instead of stacking downward.
- Customer moments and reviews are also horizontal rails.
- Desktop left/right arrow controls and mobile swipe support.
- Uploaded café video converted to web-friendly MP4 with audio.
- Video stays visible in a sticky side panel while scrolling.
- Sound toggle and full-size button.
- Official SYP ON CAFÉ logo replaces the text-only website logo.
- New app icon included.

## Install
Copy all folders from this patch into the current project and choose Replace All.

No SQL is required.

Then run:

git add app/page.tsx app/site.css app/icon.png public/brand public/videos/syp-cafe-background.mp4 BUILD_26_INSTALL.md
git commit -m "Build 26 - Horizontal featured drinks and branded sticky video"
git pull origin build-07-preview --rebase
git push origin build-07-preview

After Cloudflare deployment, press Ctrl + Shift + R.

## Browser note
Browsers do not allow autoplay with sound. The video starts muted, then the visitor can press Turn sound on.
