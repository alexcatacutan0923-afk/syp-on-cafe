# SYP ON CAFÉ · Build 38

Copy and replace:
- app/pos/page.tsx
- app/pos/pos.css
- app/checkout/page.tsx

Cloudflare environment variables (do not include quotation marks):

NEXT_PUBLIC_SUPABASE_URL=https://xthxmziwkjiomfgfvbhm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_HTw8PVqCuUhFXZowa3ENUw_nhA7pNnX
NEXT_PUBLIC_GCASH_ACCOUNT_NAME=A**** C***
NEXT_PUBLIC_GCASH_ACCOUNT_NUMBER=09954312807
NEXT_PUBLIC_GCASH_QR_IMAGE_URL=https://i.ibb.co/XfvgSJPb/IMG-3363.png
NEXT_PUBLIC_GCASH_PAYMENT_URL=https://gcash.com/
NEXT_PUBLIC_GCASH_PAYMENT_URL_TEMPLATE=

After changing Cloudflare variables, redeploy the project.

Notes:
- Browser sound and automatic printing require one user click first. Turn Sound On in the POS footer.
- Keep the POS tab open for recurring alerts and automatic online-order receipts.
