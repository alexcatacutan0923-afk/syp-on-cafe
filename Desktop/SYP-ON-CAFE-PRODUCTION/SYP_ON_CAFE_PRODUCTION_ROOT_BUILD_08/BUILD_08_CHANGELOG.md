# Build 08 — GCash Handoff & Rider Tips

- Added rider-tip selector for delivery orders: ₱5, ₱10, ₱15, ₱20, ₱30, no tip, or customized amount.
- Rider tip is included in the order total and recorded in the order notes for current database compatibility.
- Added GCash payment handoff after order submission with the exact total, account name/number, and configurable payment URL.
- Added a clear payment-verification notice: GCash orders remain pending until staff verification.
- Added optional GCash environment variables to `.env.local.example`.
- Preserved the existing order RPC and database schema; no migration is required for this build.

## Cloudflare build variables

Add these only when you want them displayed on the GCash handoff screen:

- `NEXT_PUBLIC_GCASH_ACCOUNT_NAME`
- `NEXT_PUBLIC_GCASH_ACCOUNT_NUMBER`
- `NEXT_PUBLIC_GCASH_PAYMENT_URL`

A regular personal GCash transfer cannot be safely auto-filled and verified by a public URL. Full automatic checkout requires approved GCash for Business/payment-gateway integration.
