SYP ON CAFÉ — PHASE 1.1

FIXED
- /loyalty?id=SYPxxxx loads the member card inside syponcafe.shop
- /track?t=... loads guest tracking
- /track?id=...&order=... loads member order tracking
- Legacy links such as syponcafe.shop?page=menu and syponcafe.shop?id=SYP0001 automatically route to clean URLs
- Track Order and Digital Card links stop exposing script.google.com after the Apps Script patch is deployed
- Added stronger Cloudflare Pages rewrites to prevent white screens on direct route entry

IMPORTANT: TWO DEPLOYMENTS ARE REQUIRED

A) CLOUDFLARE
Upload everything in this folder EXCEPT APPS_SCRIPT_PATCH to the existing Cloudflare Pages project.
Do not upload the outer folder itself if your uploader asks for files; index.html must be at the deployment root.

B) GOOGLE APPS SCRIPT
The APPS_SCRIPT_PATCH folder contains patched copies of your current Apps Script files.
At minimum replace these files in their matching Apps Script projects:
- SYPLOYALTY-CODE.gs.txt
- ONLINEORDERS.GS.txt
- CHECKOUT.GS.txt
- SCRIPT.HTML.txt

Remove the .txt suffix when copying into Apps Script and paste each file into its matching .gs or .html file.
Then Deploy > Manage deployments > Edit > New version > Deploy.

Why the Apps Script update is required:
Cloudflare cannot intercept a cross-origin iframe link that uses target=_top. The source link must be changed from script.google.com to syponcafe.shop.

TEST
1. https://syponcafe.shop/loyalty/?id=SYP0001
2. https://syponcafe.shop/track/
3. Place a test order and tap OPEN MY DIGITAL CARD
4. Tap TRACK THIS ORDER
5. Confirm the browser address remains syponcafe.shop
