# Build 22 — Old Member Migration + New QR Links

This copy-only patch imports **29 old members** from the supplied sheet.

## Changes
- Preserves old member IDs and current stamps.
- Preserves birthday, lifetime stamps, level, referrals, claim information, and dates where available.
- Removes all Google Apps Script QR URLs.
- New QR target: `https://syponcafe.shop/member-login?identity=SYPxxxx`.
- Includes one ready-made PNG QR code per old member in `public/member-qr/`.
- QR scanning now opens the new member login page with the Member ID already filled in.
- The automatic member sequence continues after the highest imported ID.

## Temporary PIN for old members
- Members with a mobile number: last 4 digits of their mobile number.
- Member without a mobile number: last 4 digits of their member ID.
- See `OLD_MEMBER_QR_AND_PIN_REFERENCE.csv`.

## Install
1. Run `supabase/BUILD_22_IMPORT_OLD_MEMBERS_AND_REPLACE_QR.sql` in Supabase SQL Editor.
2. Copy `app/member-login/page.tsx` and `public/member-qr/` into the project.
3. Commit and push.

## Git
```bash
git add app/member-login/page.tsx public/member-qr supabase/BUILD_22_IMPORT_OLD_MEMBERS_AND_REPLACE_QR.sql OLD_MEMBER_QR_AND_PIN_REFERENCE.csv BUILD_22_OLD_MEMBER_MIGRATION_QR.md
git commit -m "Build 22 - Import old members and replace QR links"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
