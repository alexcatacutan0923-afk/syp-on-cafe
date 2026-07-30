# Build 09 — Real Reviews & Coffee Moments

## Included
- Removed all hardcoded demo names, reviews, likes, and moments.
- Reviews now save to Supabase with pending admin approval.
- Optional order number for verified-review checks.
- Owner reply display on approved reviews.
- Real JPG/PNG/WEBP photo upload, max 5 MB.
- Supabase Storage bucket `coffee-moments`.
- Public gallery only shows approved moments.
- New `/admin/community` moderation page.
- Admin can approve, reject, reply, and permanently delete submissions.

## Required one-time setup
Run `supabase/BUILD_09_COMMUNITY_SQL.sql` in Supabase SQL Editor.
Then open `/admin/community` and approve test submissions.
