# Build 35 — Rewards & Manual Discount

Copy all folders into the project root and choose **Replace All**.

## Included
- Spin the Wheel preview always returns: “Sorry! Please try again next time.”
- No wheel reward or bonus stamp is saved.
- POS quick manual discounts: ₱5, ₱10, ₱20, ₱50.
- Percentage discounts: 5%, 10%, 15%, 20%.
- Custom peso discount and required reason selector.
- Discount reason prints on the receipt.
- Loyalty free drink only applies to one eligible 16oz drink.
- 22oz-only carts cannot redeem the free drink.
- Existing claim function still deducts 10 stamps and records the claim.

No new SQL is required.

## GitHub
```powershell
git add -- app/pos/page.tsx app/pos/pos.css app/member/page.tsx
git commit -m "Build 35 - Manual discounts and wheel preview"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
