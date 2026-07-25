# SYP ON CAFÉ — Build 21 Copy-Only Patch

## Kasama sa update

- Pag-click o focus sa CUSTOMER search, automatic lalabas ang hanggang 20 latest clients.
- Auto-search habang nagta-type, kahit unang character pa lang.
- Search by name, mobile number, o SYP member ID.
- Mas malinaw na MEMBER DIRECTORY / SEARCH RESULTS label.
- Pinapanatili ang automatic member creation at automatic loyalty stamp ng Build 20.

## Installation

1. Supabase → SQL Editor → patakbuhin ang `supabase/BUILD_21_MEMBER_DIRECTORY_SQL.sql`.
2. Copy ang `app` at `lib` folders sa project at piliin ang Replace All.
3. Huwag i-copy ang `node_modules`, `.next`, `.git`, o `.env.local`.
4. Commit at push:

```bash
git add app/pos lib/member-cloud.ts supabase/BUILD_21_MEMBER_DIRECTORY_SQL.sql BUILD_21_MEMBER_SEARCH_PATCH.md
git commit -m "Build 21 - Instant member directory search"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
