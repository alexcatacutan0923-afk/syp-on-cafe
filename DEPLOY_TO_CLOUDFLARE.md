# Deploy SYP ON CAFÉ Build 07 to Cloudflare Workers

## Required build variables

In Cloudflare Dashboard:

Workers & Pages → syp-on-cafe → Settings → Variables and secrets

Add these as separate entries:

- Name: `NEXT_PUBLIC_SUPABASE_URL`
  Value: your `https://...supabase.co` URL
- Name: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  Value: your complete `sb_publishable_...` key

The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported, but only one
public key is required.

## Preview branch workflow

The production branch remains `main`. Push Build 07 to a separate branch first:

```powershell
git checkout -b build-07-preview
git add .
git commit -m "SYP ON CAFE Build 07"
git push -u origin build-07-preview
```

Cloudflare will create a non-production preview deployment. Test the preview
before merging it into `main`.

## Test routes

- `/`
- `/menu`
- `/admin`
- `/login`
- `/api/health`
- `/robots.txt`
- `/sitemap.xml`
- `/manifest.webmanifest`

## Production release

After the preview passes, merge `build-07-preview` into `main`. Cloudflare will
then redeploy the official `syponcafe.shop` production branch automatically.
