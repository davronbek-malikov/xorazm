# Xorazm ERP — Frontend Demo

A clickable frontend demo of "Xorazm ERP", a unified business-management system that can present
itself as a **Supermarket**, **Pharmacy (Apteka)**, or **Restaurant (Milliy taomlar)** depending on
a business-type setting. Built to show a prospective client the full set of modules from the
original specification before committing to a real backend.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS with a small hand-rolled UI kit
- Zustand, persisted to `localStorage` (no external database — this is a frontend-only demo)
- Recharts for report charts
- Vitest for unit-testing the pure business logic (sales/recipe deduction, payroll, reports)

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you will be redirected to `/login`.

## Demo accounts

| Login      | Password      | Role            |
|------------|---------------|-----------------|
| admin      | admin123      | Administrator   |
| direktor   | direktor123   | Direktor        |
| kassir     | kassir123     | Kassir          |
| omborchi   | omborchi123   | Omborchi        |
| buxgalter  | buxgalter123  | Buxgalter       |

Every account currently sees the full sidebar — this demo does not restrict navigation by role,
it only displays the logged-in user's name and role in the header for illustration.

## Switching business type

Go to **Sozlamalar** and pick Supermarket / Apteka / Milliy taomlar. This reseeds all demo data
(products, employees, sales history, etc.) for that business type and relabels the UI
accordingly (e.g. "Ombor" → "Dorixona ombori" → "Oshxona ombori", with extra **Xomashyo** and
**Retseptura** tabs for restaurants).

## Data persistence

All data lives in the browser's `localStorage` under the key `xorazm-erp-store`. There is no
backend — actions like recording a sale, adding an employee, or adjusting stock update this
local store only, and persist across reloads in the same browser. Clearing browser storage
resets the demo to its seed data.

## Security notes (demo scope)

This demo includes a login page, a session cookie, a logout action, and an activity log /
"Zaxira nusxa yaratish" (backup) button to illustrate the security requirements from the
original spec. **These are illustrative only**: passwords are stored in plaintext in the seed
data, the session cookie is not signed, and the "backup" button does not produce a real backup.
A production system would require a real backend with hashed credentials, server-side sessions,
audit logging, and automated backups.

## Out of scope (Phase 1)

- Real database/backend
- Real authentication and security hardening
- Running multiple business types simultaneously
- Printing integration and payment gateway integrations (UI-only selections)
