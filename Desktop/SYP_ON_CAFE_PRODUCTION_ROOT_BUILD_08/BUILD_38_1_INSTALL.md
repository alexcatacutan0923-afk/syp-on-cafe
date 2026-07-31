# SYP ON CAFÉ — Build 38.1

Copy and replace:

- `app/pos/page.tsx`
- `app/pos/pos.css`

## Changes

- Live Orders now opens as a large floating window inside POS.
- Cashier can accept/manage orders without leaving the POS screen.
- Full-screen Admin remains available from inside the floating window.
- New online orders automatically print two clearly labeled receipts:
  1. CUSTOMER COPY
  2. RIDER COPY for delivery, or STORE / PREPARATION COPY for pickup
- One automatic print dialog prints both copies.

No SQL or environment variable changes are required.
