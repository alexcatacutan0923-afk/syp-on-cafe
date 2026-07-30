# Build 25 — Visual Corrections, Customer Album, Sticky Video, Change PIN

## Included
- Homepage hero changed from Spanish Latte to Biscoff Matcha.
- Correct black Americano image (espresso + water + ice, no milk).
- Corrected Oreo Latte and Roasted Almond Latte image assignments.
- All products beginning with `Hot` use a black hot cup with SYP ON CAFÉ sleeve.
- Real customer photo album with captions matched to the uploaded photos.
- Sticky café video stays visible while the customer album scrolls.
- Loyalty free-drink redemption photo uses the customer holding her drink.
- Old imported members use temporary PIN `1234`.
- Member dashboard includes Change PIN with current-PIN verification.

## Install
1. Run `supabase/BUILD_25_VISUALS_PIN_SQL.sql` in Supabase SQL Editor.
2. Copy all patch folders into your existing project and choose Replace All.
3. Do not copy `node_modules`, `.next`, `.git`, or `.env.local`.
4. Commit and push.

```bash
git add app/page.tsx app/site.css app/member app/member-login app/pos/page.tsx lib public/products public/community public/videos supabase/BUILD_25_VISUALS_PIN_SQL.sql BUILD_25_INSTALL.md
git commit -m "Build 25 - Visual fixes customer album and change PIN"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```

After Cloudflare deploy, hard refresh with `Ctrl + Shift + R`.
