# SYP ON CAFÉ — Build 36
## Customer Display + Kitchen Display System

Copy the included files into the project root and replace matching files.

### Added
- `/customer-display` live second-screen order display
- `/kitchen` barista order board
- Automatic queue numbers (`A-001`, `A-002`, ... per business shift)
- New → Preparing → Ready → Served workflow
- Browser voice announcement when an order is marked Ready
- POS shortcuts that open both screens in new tabs
- No SQL required; same-device tabs sync via BroadcastChannel + localStorage

### Important
For live sync, POS, Customer Display, and Kitchen must be opened in tabs/windows from the same browser profile and same website origin.

### Test
```powershell
npm run dev
```
Open:
- `http://localhost:3000/pos`
- `http://localhost:3000/customer-display`
- `http://localhost:3000/kitchen`

### Git
```powershell
git add -- app/pos/page.tsx app/pos/pos.css app/customer-display/page.tsx app/customer-display/customer-display.css app/kitchen/page.tsx app/kitchen/kitchen.css
git commit -m "Build 36 - Customer display and kitchen workflow"
git pull origin build-07-preview --rebase
git push origin build-07-preview
```
