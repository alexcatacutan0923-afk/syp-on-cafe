# SYP ON CAFÉ — Build 37.1 Header + Cashier Fix

Copy the included files into the project root and choose Replace All.

Changed:
- Removed the shift sales/stat cards from the top header to create more room.
- Made cashier name editable in the POS header.
- Cashier name is saved in localStorage and stays after refresh.
- Printed receipts now use the edited cashier name.
- Header buttons are more compact; Kitchen and Rider shortcuts hide only on narrower screens.

Files:
- app/pos/page.tsx
- app/pos/pos.css
