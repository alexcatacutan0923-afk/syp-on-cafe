# SYP ON CAFÉ — Production Root Setup

This package is already arranged as the repository root. After extraction, `app`, `lib`, `public`, and `package.json` must appear immediately inside the opened folder.

## Keep these local files

Copy your existing `.env.local` into this folder. Do not commit `.env.local`, `.next`, or `node_modules`.

## Required Cloudflare build variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GCASH_ACCOUNT_NAME`
- `NEXT_PUBLIC_GCASH_ACCOUNT_NUMBER`
- `NEXT_PUBLIC_GCASH_PAYMENT_URL`

## Cloudflare root directory

After this clean root version is pushed to GitHub, change Cloudflare **Root directory** from the old nested path to `/` or leave it blank.

## Local test

```powershell
npm.cmd install
npm.cmd run dev
```

## Important Build 08 checks

- `/checkout` shows **Tip Your Rider**
- GCash orders show the payment handoff after order submission
- `/menu`, `/admin`, `/pos`, `/kitchen`, `/rider`, and `/track` remain available
