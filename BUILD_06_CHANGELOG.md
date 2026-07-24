# SYP ON CAFÉ — Build 06

## Production deployment additions

- Added Google-compatible CafeOrCoffeeShop structured data.
- Added official Google Maps location link.
- Added address, daily opening schedule, cuisine categories, and price range to structured data.
- Added `/api/health` deployment-check endpoint.
- Disabled the `X-Powered-By` response header.
- Enabled React strict mode.
- Added a Cloudflare + Vercel deployment checklist.

## Deployment check

After deployment, open:

- `https://<your-vercel-project>.vercel.app/api/health`
- `https://syponcafe.shop/api/health`

A working deployment returns JSON with `"ok": true`.
