# Xorazm ERP — Frontend Demo Design

## 1. Purpose

A frontend demo of a unified business-management system ("Xorazm ERP") that can present itself
as a Supermarket, Pharmacy, or Restaurant management system depending on a "business type"
setting. The goal is to show a prospective client a polished, click-through demo covering all
the major modules from their spec, deployed live on Vercel. No real backend/database account
(e.g. Supabase) is used — all data is seeded mock data persisted to the browser via localStorage.

This is phase 1 (demo). If the client approves, a follow-up phase would add a real backend,
database, and production-grade auth.

## 2. Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts
- **State/persistence:** Zustand store, persisted to `localStorage` (per-browser demo persistence)
- **Auth:** Seeded demo accounts, signed session cookie, simple login/logout — for demo
  illustration of the "security" requirement only (see §7)
- **Language/locale:** Uzbek (uz) UI text, currency formatted as UZS so'm
- **Hosting:** Existing Vercel project `xorazm-alpha`, deployed from
  `github.com/davronbek-malikov/xorazm`

## 3. Project Setup & Repo

- Scaffold a fresh Next.js project directly in `C:\Users\davro\OneDrive\Desktop\Xorazm`.
- This folder gets its **own new git repository**, independent of the large pre-existing git
  repo rooted at `C:\Users\davro\OneDrive` (which tracks unrelated projects). Remote points to
  `github.com/davronbek-malikov/xorazm`.
- `.env` stays empty/unused for this phase (no external services); kept gitignored.

## 4. Authentication & Navigation Model

- `/login` — login form. Seeded demo users, one per role:
  - `admin` / `admin123` — Administrator
  - `direktor` / `direktor123` — Direktor
  - `kassir` / `kassir123` — Kassir
  - `omborchi` / `omborchi123` — Omborchi
  - `buxgalter` / `buxgalter123` — Buxgalter
- After login, **every account sees the full sidebar with all modules** — this is a pure
  frontend showcase, so there is no route-blocking by role. The logged-in user's name/role is
  shown in the header for flavor (and to demonstrate the "user roles" concept from the spec),
  but navigation is unrestricted.
- Session stored in a cookie set on login; logout clears it and returns to `/login`.

## 5. Business-Type Switching

A setting in `/sozlamalar` (Settings) lets the user pick:
- `supermarket` (default)
- `pharmacy`
- `restaurant`

Switching this setting:
- Reseeds the demo dataset from the corresponding seed module (`seed/supermarket.ts`,
  `seed/pharmacy.ts`, `seed/restaurant.ts`)
- Relabels UI terms via a small dictionary, e.g.:
  - "Mahsulotlar" → "Dorilar" → "Taomlar"
  - "Ombor" → "Dorixona ombori" → "Oshxona ombori / Xomashyo"
- Toggles extra fields/tabs:
  - Pharmacy: products gain `batchNumber`, `expiryDate`, `prescriptionRequired`
  - Restaurant: adds **Xomashyo** (raw materials) inventory and **Retseptura** (recipe/BOM) tab

The current business type and seed data live in the Zustand store / localStorage, so switching
is instant and persists across page reloads in the same browser.

## 6. Modules

### 6.1 Dashboard (`/`)
Cards/widgets: today's sales total, today's profit, cash on hand, bank balance, total stock
count, low-stock alert count, expiring-soon count (pharmacy/restaurant), top products today,
receivables total, payables total, tax/utility payment status, recent sales table, alerts panel
(low stock, expiring items, debts due).

### 6.2 Ishchilar / HR (`/hr`)
- **Employees tab:** table of employees (F.I.Sh, phone, address, position, hire date, salary,
  login, active/inactive) with add/edit/delete (localStorage CRUD).
- **Davomat (attendance) tab:** today's check-in/check-out times, lateness flags, list of
  upcoming/used vacation days.
- **Oylik (payroll) tab:** per-employee breakdown — base salary + bonus − jarima (penalty) −
  avans (advance) = yakuniy to'lov (final payout), for the current month.

### 6.3 Ombor / Inventory (`/ombor`)
- Product table: barcode, name, category, brand, unit, cost price, sell price, stock, min
  stock. Add/edit products; "kirim" (stock-in) and "chiqim" (stock-out) actions that adjust
  stock and write to an in-memory movement log.
- "Tugab borayotgan mahsulotlar" (low-stock) list, auto-derived from `stock <= minStock`.
- Pharmacy mode: additional "Yaroqlilik muddati tugayotgan dorilar" (expiring soon) list.
- Restaurant mode: extra sub-tabs —
  - **Xomashyo:** raw materials table (name, unit, cost price, stock, min stock)
  - **Retseptura:** per finished product, list of ingredients + quantities consumed per unit
    sold (the recipe/BOM)

### 6.4 Savdo / POS (`/pos`)
- Search by barcode or name, add to cart, adjust quantity, apply discount.
- Payment method selection: Naqd, Karta, Click, Payme, Uzum Bank, Aralash (mixed).
- Checkout produces a printable receipt view: items, quantities, prices, discount, total,
  cashier name, date/time.
- On checkout, `recordSale()`:
  - Decrements `Product.stock` for sold items
  - **Restaurant mode:** for each sold product with a recipe, decrements each ingredient's
    `RawMaterial.stock` by `recipeQty * soldQty` (clamped at 0; flagged as shortage if it would
    go negative) — this implements the spec's "most important requirement"
  - Pharmacy mode: if a product has `prescriptionRequired = true`, prompts for prescription
    info (doctor name, patient name, prescription number) before allowing checkout, and shows
    a warning banner if skipped
  - Restaurant mode also offers an order-type selector: Stolda / Olib ketish / Yetkazib berish
    and an optional table number

### 6.5 Moliya / Finance (`/moliya`)
- Balance cards: Kassadagi pul, Bankdagi pul, Umumiy aktivlar.
- Expense log with categories (Soliq, Elektr, Gaz, Suv, Internet, Ijara, Ishchilar oyligi,
  Boshqa) and an add-expense form.
- Debts table: Olinadigan qarzlar (receivable) and Beriladigan qarzlar (payable), with add form.

### 6.6 Hamkorlar / Partners (`/hamkorlar`)
- Partner list: company name, phone, address, STIR, bank details.
- Drill into a partner to see delivery/payment history (delivered goods, quantity, total,
  paid amount, remaining debt) with a running balance.

### 6.7 Mijozlar / Customers (`/mijozlar`)
- Customer list: F.I.Sh, phone, bonus card %, discount, debt, purchase history.

### 6.8 Hisobotlar / Reports (`/hisobotlar`)
- Tabs: Kunlik / Haftalik / Oylik / Yillik.
- Each tab shows: sales total, expenses, profit, net profit (chart via Recharts) and a
  Top-10 best-selling products table (name, quantity sold, total revenue) computed from seeded
  sales data for that period.

### 6.9 Sozlamalar / Settings (`/sozlamalar`)
- Business-type switcher (Supermarket / Pharmacy / Restaurant) — reseeds demo data.
- Demo users/roles list (read-only display of the 5 seeded accounts and their roles).
- Activity log: a table of mock audit-trail entries (e.g. "kassir tomonidan savdo amalga
  oshirildi", "omborchi mahsulot kirimini kiritdi") to illustrate the security/logging
  requirement.
- "Backup yaratish" button — shows a success toast (simulated, no real backup).

## 7. Data Model (TypeScript types, seeded per business type)

```
User           { id, username, password, fullName, role, active }
Employee       { id, fullName, birthDate, phone, address, position, hireDate, salary, status }
AttendanceRecord { id, employeeId, date, checkIn, checkOut, late, status }
Product        { id, barcode, name, category, brand, unit, costPrice, sellPrice, stock,
                 minStock, expiryDate?, batchNumber?, prescriptionRequired? }
Recipe         { id, productId, ingredients: [{ rawMaterialId, qty, unit }] }
RawMaterial    { id, name, unit, costPrice, stock, minStock }
Sale           { id, date, cashierName, items: [{ productId, qty, price, discount }], total,
                 paymentMethod, orderType?, tableNumber?, customerId? }
Partner        { id, companyName, phone, address, taxId, bankDetails,
                 transactions: [{ date, productsDelivered, qty, total, paid, debt }] }
Customer       { id, fullName, phone, bonusCardPercent, discount, debt, purchaseHistory: [...] }
Expense        { id, date, category, amount, note }
Debt           { id, partyName, type: 'receivable' | 'payable', amount, dueDate }
ActivityLogEntry { id, timestamp, user, action }
```

All mutations go through the Zustand store, persisted to localStorage so the demo "remembers"
changes within the same browser.

## 8. Visual Style

- Modern admin/ERP layout: collapsible dark sidebar with module icons, light content area,
  card-based dashboard widgets, shadcn/ui components throughout.
- Uzbek labels everywhere; currency formatted as `1 250 000 so'm`.
- Neutral blue/green accent color, placeholder branding "Xorazm ERP" — easy to re-brand later.

## 9. Security Notes (demo scope)

This demo includes a login page, session cookie, logout, and a mock activity log/backup button
to visually represent the spec's security requirements (§10 in the original brief). These are
**illustrative only** — production would require real backend authentication, hashed
passwords, server-side audit logging, and real automated backups. This limitation will be
documented in the project README.

## 10. Testing & Deployment Plan

1. Build all modules locally with `npm run dev`, click through every page/role/business-type
   to confirm no runtime errors and that the recipe auto-deduction works for restaurant mode.
2. Run `npm run build` to confirm a clean production build.
3. Initialize git in this folder, push to `github.com/davronbek-malikov/xorazm` (main branch).
4. Confirm/connect Vercel project `xorazm-alpha` to deploy from this repo; verify the live URL
   loads and the login flow works end-to-end.
5. Hand off: live URL + the 5 demo credentials.

## 11. Out of Scope (Phase 1)

- Real database/backend (Supabase or otherwise)
- Real authentication/security (hashing, server-side sessions, audit persistence)
- Multi-tenant support for running all 3 business types simultaneously
- Printing integration (receipt is an on-screen printable view only)
- Payment gateway integrations (Click/Payme/Uzum are UI-only selections)
