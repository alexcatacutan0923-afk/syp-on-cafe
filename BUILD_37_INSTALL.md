# SYP ON CAFÉ — Build 37

Copy-only upgrade based on Build 36.

## Included
- `/online-order` — customer online ordering page
- `/track` — live customer order tracking
- `/rider` — rider delivery workflow
- Kitchen now syncs preparation status to tracking
- POS header includes Online Orders and Rider shortcuts

## Important
Build 37 uses browser `localStorage` + `BroadcastChannel`, matching Build 36. For live updates, open all pages on the same domain and browser profile/device.

No SQL is required for this local-live version.

## Test
```powershell
npm run dev
```

Open:
- http://localhost:3000/pos
- http://localhost:3000/online-order
- http://localhost:3000/kitchen
- http://localhost:3000/rider
- http://localhost:3000/track

## Git
```powershell
git add -- app/pos/page.tsx app/kitchen/page.tsx app/online-order app/rider app/track
git commit -m "Build 37 - online orders rider and tracking"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
