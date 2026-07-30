# Build 13 — Smart Business Assistant & CRM

Added:
- `/admin/business` rule-based business insights using live orders, products and inventory.
- Daily and weekly sales comparisons, top-product insight, low-stock watch and recommended actions.
- `/admin/crm` customer profiles generated from completed orders.
- Automatic New, Returning, Regular, VIP and Inactive segmentation.
- Favorite product, total spent, order count and last visit.
- Persistent staff notes and customer tags.
- `/admin/promotions` campaign manager with percent, fixed and BOGO campaigns, promo codes, schedules and active/pause controls.
- Admin navigation links for all Build 13 modules.
- One-time Supabase migration in `supabase/BUILD_13_SMART_CRM_PROMOTIONS_SQL.sql`.

Notes:
- "Smart Assistant" is deterministic and uses existing business data; it does not require an external AI API.
- Promotion records are management-ready. Automatic checkout discount application is intentionally not enabled until promo stacking and eligibility rules are finalized.
