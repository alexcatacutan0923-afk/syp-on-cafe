# Build 16 — Smart Receipt + Seasonal Themes

## Added
- 80mm black-and-white thermal receipt layout.
- Eco, Classic, and Premium receipt styles.
- Permanent large QR on every style, linking to KaSYP registration by default.
- Configurable QR destination through `NEXT_PUBLIC_RECEIPT_QR_URL`.
- More than 1,600 Tagalog/Taglish receipt quote combinations.
- Recent-quote memory prevents the last 180 quotes from repeating.
- Automatic seasonal receipt themes for New Year, Valentine’s, summer, rainy season, SYP anniversary week, Halloween, gratitude month, and Christmas.
- Compact conditional sections: blank discount, note, customer, and loyalty details do not consume paper.
- “THIS IS NOT AN OFFICIAL RECEIPT” disclosure.
- Automatic receipt number and print window.

## Receipt modes
- Eco: shortest daily receipt; required transaction details, total, cash/change when applicable, QR, quote, and disclaimer.
- Classic: adds customer, customization, notes, subtotal, and loyalty eligibility.
- Premium: Classic plus automatic seasonal banner.

## Environment
Optional:

```env
NEXT_PUBLIC_RECEIPT_QR_URL=https://syponcafe.shop/member-register
```

When omitted, the POS automatically uses the current website origin and `/member-register` with receipt tracking parameters.
