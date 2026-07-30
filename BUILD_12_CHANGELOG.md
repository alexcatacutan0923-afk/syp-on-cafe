# Build 12 — Inventory & Analytics

Added:
- `/admin/inventory` stock dashboard
- Manual restock and waste adjustments
- Low-stock alerts and inventory valuation
- Stock movement history
- Recipe-based automatic deduction when an order becomes completed
- Duplicate deduction protection through `orders.inventory_processed_at`
- `/admin/analytics` sales, AOV, peak hour, returning customers, payment mix, order mix and top products
- Admin navigation buttons for Inventory and Analytics
- Supabase migration: `supabase/BUILD_12_INVENTORY_ANALYTICS_SQL.sql`

Recipe rows are intentionally not guessed. Add them after checking exact order item names, sizes and temperatures in production.
