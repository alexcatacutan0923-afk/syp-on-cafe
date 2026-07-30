# SYP ON CAFÉ — Integrated Build 02

## Added
- Persistent browser-based member accounts
- Real member registration with duplicate mobile validation
- Real member login using Member ID/mobile + PIN
- Demo account: `SYP0021` / `2026`
- Dynamic member dashboard based on the signed-in profile
- Persistent loyalty stamps, reward wallet, referrals, visits, orders, and notifications
- Spin-the-wheel 24-hour cooldown
- Spin rewards automatically saved to the member wallet
- Bonus stamp rewards automatically update loyalty progress
- Claimable and claimed reward states
- Editable member name, birthday, and favorite drink
- Dynamic initials, member ID, progress, and dashboard statistics
- Safe migration support for the earlier demo session

## Data note
This build intentionally uses local browser storage so it does not alter the existing Supabase schema. Supabase/Apps Script migration can be added after table and endpoint mapping is confirmed.

## Verification
- TypeScript check passed: `npx tsc --noEmit`
- Full Next.js build could not run in the build environment because the Linux SWC package download returned a 503 error. This is an environment package-download limitation, not a TypeScript source error.
