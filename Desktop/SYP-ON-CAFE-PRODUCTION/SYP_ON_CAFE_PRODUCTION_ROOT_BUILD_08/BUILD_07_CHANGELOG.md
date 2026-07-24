# SYP ON CAFÉ — Build 07

## Cloudflare production compatibility

- Added support for the current Supabase variable:
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Retained fallback support for the legacy variable:
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Prevented `next build` / Cloudflare prerender from crashing when deployment
  variables are missing.
- Added a reusable Supabase configuration status and readable error helper.
- Corrected `.env.local.example` so it matches the actual Build 07 setup.
- Preserved all existing website, POS, admin, kitchen, rider, member, checkout,
  menu, tracking, SEO, sitemap, robots, and PWA functionality.

## Cloudflare variables

Add these separately in Cloudflare Build variables:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not paste `VARIABLE_NAME=` inside the value field.
