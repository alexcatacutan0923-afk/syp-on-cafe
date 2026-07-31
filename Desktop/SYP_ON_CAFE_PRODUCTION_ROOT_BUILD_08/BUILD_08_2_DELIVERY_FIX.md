# Build 08.2 Delivery Fix

- Restored the existing Supabase RPC contract for delivery orders.
- Rider tip is no longer folded into `p_delivery_fee`, preventing delivery RPC failures caused by delivery-fee validation/check constraints.
- Rider tip remains visible in order notes, the customer local order record, checkout summary, and GCash amount.
- Store sales total remains separate from rider tip.
- GCash confirmation keeps the final customer amount after cart reset.
