# Build 08.1 Checkout Fix

- Fixed delivery orders with rider tips failing RPC total validation.
- Preserves the submitted total before clearing the cart, so GCash no longer shows ₱0.
- Preserves submitted payment method for the confirmation screen.
- Improved Supabase error logging with message, details, hint, and code.
- No new npm package is required.

Compatibility note: the existing `create_customer_order` RPC validates `subtotal + delivery fee = total`. For immediate compatibility, rider tip is included in the RPC fulfillment charge while its exact amount remains separately recorded in the order notes and local order record.
