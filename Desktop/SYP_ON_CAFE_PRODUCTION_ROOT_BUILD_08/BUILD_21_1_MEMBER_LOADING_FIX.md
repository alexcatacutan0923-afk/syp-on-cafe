# Build 21.1 — Member Loading Fix

Fixes the POS member box being stuck on `Loading members...`.

Changes:
- 8-second request timeout instead of infinite loading.
- Visible Supabase error and Retry button.
- RPC first, direct-table fallback second.
- Clicking/focusing the customer input loads the newest 20 members.
- Typing searches by name, mobile, and SYP member ID.

Install:
1. Run `supabase/BUILD_21_1_MEMBER_LOADING_FIX_SQL.sql` in Supabase SQL Editor.
2. Copy `app/pos/` and `lib/member-cloud.ts` into the existing project and replace files.
3. Commit and push.
