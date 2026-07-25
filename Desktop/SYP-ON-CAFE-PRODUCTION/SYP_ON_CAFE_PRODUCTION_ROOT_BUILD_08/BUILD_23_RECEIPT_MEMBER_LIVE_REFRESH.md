# Build 23 — Receipt Stamp Proof, Smart QR, Live Member Refresh

Copy-only patch. Replace the matching files in the current SYP ON CAFÉ project.

## Included fixes

1. Printed receipt now shows the selected member name and member ID.
2. When a loyalty stamp is successfully added, receipt prints `+1 STAMP ADDED` and the new balance, e.g. `7 / 10 STAMPS`.
3. When the member reaches 10 stamps, receipt prints `FREE DRINK READY`.
4. Receipt QR routing:
   - Existing selected member → `/member-login?identity=SYPxxxx`
   - No selected member/new customer → `/member-register`
5. Member dashboard refreshes stamps automatically:
   - immediately after opening
   - every 10 seconds
   - when returning to the browser tab
   - when Supabase sends a live update
6. No logout/login is required to see newly added stamps.

## Copy these files

- `app/pos/page.tsx`
- `app/pos/pos.css`
- `app/member/page.tsx`
- `app/member/member.css`
- `app/member-login/page.tsx`
- `app/member-register/page.tsx`
- `lib/member-cloud.ts`
- `lib/member-store.ts`

No new SQL is required if Build 21.1 and Build 22 SQL were already applied.

## Git commands

```bash
git add app/pos app/member app/member-login app/member-register lib/member-cloud.ts lib/member-store.ts BUILD_23_RECEIPT_MEMBER_LIVE_REFRESH.md
git commit -m "Build 23 - Receipt stamp QR and live member refresh"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```

After Cloudflare finishes deploying, hard refresh the POS and member dashboard with `Ctrl + Shift + R`.
