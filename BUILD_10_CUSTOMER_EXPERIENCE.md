# Build 10 — Customer Order Experience

## Added
- Member order history loaded from Supabase using the registered mobile number.
- Total spent and latest order status in the member dashboard.
- Direct tracking links from member order history.
- Admin GCash verification button using the existing `payment_status` column.
- GCash pending metric on the admin dashboard.
- Tracking receipt shows payment status, rider tip, and customer total.
- Print / Save Receipt and Share Order controls.
- No new npm dependency and no database migration required.
