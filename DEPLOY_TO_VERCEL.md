# Deploy SYP ON CAFÉ to Vercel + Cloudflare

Official domain: `syponcafe.shop`

## 1. Test locally

Restore `.env.local`, then run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/api/health`
- `http://localhost:3000/robots.txt`
- `http://localhost:3000/sitemap.xml`

## 2. Upload to GitHub

Create a private GitHub repository and upload the project files.

Do not upload `.env.local`. It is excluded by `.gitignore` and contains private keys.

## 3. Import into Vercel

1. Sign in to Vercel.
2. Select **Add New → Project**.
3. Import the GitHub repository.
4. Vercel should detect **Next.js** automatically.
5. Add every variable from `.env.local` under **Environment Variables**.
6. Apply the variables to Production, Preview, and Development as needed.
7. Select **Deploy**.

Test the temporary address first:

- `https://your-project.vercel.app`
- `https://your-project.vercel.app/api/health`

## 4. Add the official domain in Vercel

In Vercel:

1. Open the project.
2. Go to **Settings → Domains**.
3. Add `syponcafe.shop`.
4. Add `www.syponcafe.shop`.
5. Set `syponcafe.shop` as the primary domain.
6. Let Vercel show the exact DNS records required for the project.

## 5. Set DNS records in Cloudflare

In Cloudflare:

1. Open `syponcafe.shop`.
2. Go to **DNS → Records**.
3. Remove only old conflicting website records for `@` or `www`. Do not remove email-related MX/TXT records.
4. Add the exact A/CNAME records shown by Vercel.
5. During initial domain verification, set the Vercel website records to **DNS only** (gray cloud).
6. Keep TXT ownership-verification records as DNS only.
7. After Vercel shows **Valid Configuration** and HTTPS works, Cloudflare proxying can be reconsidered. DNS-only is the simplest setup for initial testing.

Common Vercel values may include an apex A record and a `www` CNAME, but always use the exact values displayed in the Vercel project because Vercel can provide project-specific records.

## 6. Final checks

Open:

- `https://syponcafe.shop`
- `https://www.syponcafe.shop`
- `https://syponcafe.shop/api/health`
- `https://syponcafe.shop/robots.txt`
- `https://syponcafe.shop/sitemap.xml`
- `https://syponcafe.shop/manifest.webmanifest`
- `https://syponcafe.shop/opengraph-image`

Confirm that:

- HTTPS has no warning.
- `www` redirects to the primary domain.
- Menu data loads from Supabase.
- Member login/register works.
- Admin, POS, kitchen, rider, checkout, and tracking pages still work.
- Google Maps buttons open the official SYP ON CAFÉ location.

## Important

The PC does not need to remain open after deployment. Vercel hosts the Next.js application, while Supabase remains the cloud database/backend.
