# Data Model

The MVP uses JSON files in a private GitHub repository.

Recommended paths:

- `data/settings.json`
- `data/users.json`
- `data/customers.json`
- `data/plans.json`
- `data/menu_items.json`
- `data/daily_menus/YYYY-MM.json`
- `data/schedules/YYYY-MM.json`
- `data/deliveries/YYYY-MM.json`
- `data/pause_requests/YYYY-MM.json`
- `data/invoices/YYYY/KT-YYYY-0001.json`
- `data/payments/YYYY-MM.json`
- `data/audit_logs/YYYY-MM.json`
- `locks/write-lock.json`

Operational records are split by month so a small edit does not rewrite one large file.
