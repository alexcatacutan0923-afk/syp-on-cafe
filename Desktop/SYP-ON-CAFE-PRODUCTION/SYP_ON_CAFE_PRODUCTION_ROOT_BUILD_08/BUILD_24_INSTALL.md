# SYP ON CAFÉ Build 24 — Loyalty Claim + Visit Calendar

## Included
- POS free-drink claim when a selected member has at least 10 stamps.
- Atomic 10-stamp deduction with a Supabase claim audit log.
- Receipt proof: `FREE DRINK CLAIMED`, discount amount, and remaining stamp balance.
- Automatic one-visit-per-member-per-calendar-day recording whenever the POS adds a stamp or claims a reward.
- Live customer visit calendar loaded from Supabase; no logout/login required.
- Dynamic month navigation and correct weekday alignment.
- Migration of the legacy visit rows supplied by the owner.

## Install order
1. Run `supabase/BUILD_24_LOYALTY_CLAIM_VISITS_SQL.sql` in Supabase SQL Editor.
2. Copy `app/pos`, `app/member`, and `lib/member-cloud.ts` into the existing project and choose Replace.
3. Commit and push.

## Git
```bash
git add app/pos app/member lib/member-cloud.ts supabase/BUILD_24_LOYALTY_CLAIM_VISITS_SQL.sql BUILD_24_INSTALL.md
git commit -m "Build 24 - Loyalty claims and visit calendar"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```

## Notes
- One calendar day counts as one café visit even when several eligible orders are completed that day.
- The free-drink discount is applied to one eligible Coffee, Matcha, Milky, or Signature line in the cart.
- SYP0026 and SYP0028 visit records are preserved even though those member profiles were not in the supplied old-member list. They will appear after those profiles are added.
