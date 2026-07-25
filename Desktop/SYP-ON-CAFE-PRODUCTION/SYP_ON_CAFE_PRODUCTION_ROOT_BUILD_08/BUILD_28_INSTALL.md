# Build 28 — Real Community + Reviews Cleanup

## Included
- Barkada Moments and KaSYP Hall of Fame on the homepage
- New real customer gallery at `/moments`
- Removed all hardcoded/demo reviews
- New `/reviews` page that reads only approved database reviews
- Unified official logo on homepage, reviews, and moments
- Floating video raised above site content so cards cannot cover it
- New optimized WebP community photos
- Iced Americano and black hot-cup assets included for the next product mapping step

## Install
1. Run `supabase/BUILD_28_REAL_REVIEWS.sql` in Supabase SQL Editor.
2. Copy all patch folders into the project and choose Replace All.
3. Commit and push.

```bash
git add app public lib supabase BUILD_28_INSTALL.md
git commit -m "Build 28 - Real community gallery and verified reviews"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```

No `node_modules`, `.next`, `.git`, or `.env.local` are included.
