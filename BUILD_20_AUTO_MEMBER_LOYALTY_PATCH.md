# Build 20 Patch — Auto Member + POS Loyalty

## Included
- New public registrations are saved to Supabase and receive an automatic `SYP0001`-style member ID.
- POS customer search works by name, mobile number, or member ID.
- Selecting a member shows live stamps, visits, favorite drink, and birthday.
- Eligible checkout automatically adds one loyalty stamp when **Add loyalty stamp** is enabled.
- Member login checks Supabase first, then keeps the existing local/demo fallback.
- Existing/old members can be added manually later through Supabase.

## Required first step
Run `supabase/BUILD_20_AUTO_MEMBER_LOYALTY_SQL.sql` in Supabase SQL Editor before deploying the code.

## Copy-only update
Copy these files into the same paths in your current project, replacing the old versions:
- `app/pos/page.tsx`
- `app/pos/pos.css`
- `app/member-register/page.tsx`
- `app/member-login/page.tsx`
- `lib/member-store.ts`
- `lib/member-cloud.ts`
- `supabase/BUILD_20_AUTO_MEMBER_LOYALTY_SQL.sql`

Do not copy `node_modules`, `.next`, `.git`, or `.env.local`.
