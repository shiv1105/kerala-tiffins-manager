# Kerala Tiffins Manager

GitHub-only internal operations app for Kerala Tiffins. The public app repository contains only the frontend shell, sample data, docs, and templates. Real customer data belongs in a separate private GitHub repository.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- GitHub REST API Contents endpoints for private JSON files
- SheetJS Excel backup export
- jsPDF invoice download
- GitHub Pages deployment workflow

## Local Development

```bash
pnpm install
pnpm dev
```

Open the local URL shown by Vite. Use **Demo Data** for the first run, or connect a private data repository using a fine-grained GitHub token with Contents read/write access.

## Data Safety Rules

- Do not commit real customer data, invoices, addresses, phone numbers, tokens, or tax registration details to this app repository.
- Use `data-template/` to initialize the private data repository.
- Every GitHub write should check the latest file SHA before saving.
- Use Excel export as an owner backup, not as the live multi-user database.

## Private Data Repository

Create a private repository, copy the contents of `data-template/`, then update:

- `data/settings.json`
- `data/users.json`
- `data/customers.json`
- monthly files under `data/deliveries/`, `data/pause_requests/`, and `data/schedules/`

## Verification

```bash
pnpm test
pnpm build
```
