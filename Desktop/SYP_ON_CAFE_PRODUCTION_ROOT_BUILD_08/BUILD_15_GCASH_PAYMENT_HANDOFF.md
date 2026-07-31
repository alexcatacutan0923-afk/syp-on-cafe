# Build 15 — GCash Payment Handoff

## Added

- Mobile-friendly **Open GCash** payment button after checkout.
- Supports an approved merchant checkout URL template with dynamic placeholders:
  - `{amount}`
  - `{orderNumber}`
  - `{mobile}`
- **Show QR for another phone** modal.
- Displays the configured GCash/QRPH image, account name, number, exact order amount, and order number.
- Copy buttons for the exact payment amount and GCash number.
- Preserves manual payment verification in Admin to prevent false paid status.

## Cloudflare variables

```env
NEXT_PUBLIC_GCASH_ACCOUNT_NAME="SYP ON CAFÉ"
NEXT_PUBLIC_GCASH_ACCOUNT_NUMBER="09XXXXXXXXX"
NEXT_PUBLIC_GCASH_QR_IMAGE_URL="https://your-public-image-url/gcash-qr.png"
NEXT_PUBLIC_GCASH_PAYMENT_URL="https://gcash.com/"
NEXT_PUBLIC_GCASH_PAYMENT_URL_TEMPLATE=""
```

For true amount-prefilled online payment, set `NEXT_PUBLIC_GCASH_PAYMENT_URL_TEMPLATE` to the checkout/deep-link URL issued by the approved GCash for Business or payment-gateway provider. Example placeholder structure only:

```env
NEXT_PUBLIC_GCASH_PAYMENT_URL_TEMPLATE="YOUR_APPROVED_URL?amount={amount}&reference={orderNumber}"
```

Do not invent or use an unofficial `gcash://` scheme. If no approved template is supplied, the button opens the configured normal GCash URL and the customer uses the QR or copies the exact amount.
