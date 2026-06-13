# Xorazm ERP Frontend Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a Next.js frontend demo ("Xorazm ERP") that simulates a Supermarket/Pharmacy/Restaurant management system with mock data, covering Dashboard, HR, Inventory, POS, Finance, Partners, Customers, Reports and Settings, switchable between three business profiles.

**Architecture:** Next.js 14 App Router + TypeScript + Tailwind, with a small hand-rolled UI kit (no external component registry). All business data lives in a Zustand store seeded per business type and persisted to `localStorage`. Pure logic modules (sales/recipe deduction, payroll, reports) are unit-tested with Vitest. Auth is a cookie-based demo login that does not restrict navigation.

**Tech Stack:** Next.js 14 (App Router, TS), Tailwind CSS, Zustand, Recharts, lucide-react, Vitest.

**Reference spec:** `docs/superpowers/specs/2026-06-13-business-erp-demo-design.md`

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: project scaffold via `create-next-app` in `C:\Users\davro\OneDrive\Desktop\Xorazm`

- [ ] **Step 1: Run create-next-app**

Run (answer prompts if any, or use flags to avoid prompts):
```bash
cd "C:\Users\davro\OneDrive\Desktop\Xorazm"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```
If it complains the directory is not empty (because of `.gitignore`, `docs/`, `.git/`), confirm to proceed / allow it to continue in the existing directory.

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev -- -p 3000` then check `http://localhost:3000` loads the default Next.js page. Stop the server (Ctrl+C) after confirming.

- [ ] **Step 3: Commit scaffold**

```bash
git add -A
git commit -m "Scaffold Next.js app with TypeScript and Tailwind"
```

---

## Task 2: Install dependencies and base Tailwind theme

**Note:** Task 1's scaffold installed **Tailwind CSS v4**, which configures design tokens via an `@theme` block in CSS rather than `tailwind.config.ts` (no `tailwind.config.ts` file exists in this project). The steps below target this v4 CSS-first setup.

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Install dependencies**

```bash
npm install zustand recharts lucide-react clsx date-fns
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
```

- [ ] **Step 2: Extend Tailwind theme colors**

`src/app/globals.css` currently looks like this (from the Task 1 scaffold):

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

Add a new `@theme { ... }` block (separate from the existing `@theme inline { ... }` block — do not merge them) immediately after the existing `@theme inline { ... }` block, defining the brand palette and surface color as CSS custom properties. Tailwind v4 auto-generates utility classes (`bg-brand-600`, `text-brand-700`, `border-brand-500`, `bg-surface`, etc.) from any `--color-*` variable declared in `@theme`:

```css
@theme {
  --color-brand-50: #eef6ff;
  --color-brand-100: #d9ecff;
  --color-brand-500: #2563eb;
  --color-brand-600: #1d4ed8;
  --color-brand-700: #1e40af;
  --color-brand-900: #1e3a8a;
  --color-surface: #f5f7fb;
}
```

- [ ] **Step 3: Set base body styles**

In the same file, replace the existing `body { ... }` rule (which uses `var(--background)` / `var(--foreground)` and `font-family: Arial...`) with:

```css
body {
  background-color: #f5f7fb;
  color: #1f2937;
}
```

This fixes the demo to a light theme regardless of the user's OS color scheme (the `@media (prefers-color-scheme: dark)` block and `:root`/`--background`/`--foreground` variables can stay as-is — they're just no longer referenced by `body`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add core dependencies and brand theme colors"
```

---

## Task 3: UI kit — Button, Card, Badge, Input, Select

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/select.tsx`

- [ ] **Step 1: Create Button**

`src/components/ui/button.tsx`:
```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  ghost: "text-gray-700 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

- [ ] **Step 2: Create Card**

`src/components/ui/card.tsx`:
```tsx
import { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-xl border border-gray-200 bg-white shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("border-b border-gray-100 px-4 py-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx("text-sm font-semibold text-gray-700", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-4 py-3", className)} {...props} />;
}
```

- [ ] **Step 3: Create Badge**

`src/components/ui/badge.tsx`:
```tsx
import { HTMLAttributes } from "react";
import { clsx } from "clsx";

type Tone = "gray" | "green" | "red" | "amber" | "blue";

const toneClasses: Record<Tone, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-brand-50 text-brand-700",
};

export function Badge({
  className,
  tone = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Create Input and Select**

`src/components/ui/input.tsx`:
```tsx
import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
```

`src/components/ui/select.tsx`:
```tsx
import { SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(
        "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add base UI kit: button, card, badge, input, select"
```

---

## Task 4: UI kit — Table, Tabs, Modal

**Files:**
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/modal.tsx`

- [ ] **Step 1: Create Table primitives**

`src/components/ui/table.tsx`:
```tsx
import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function Thead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx("border-b border-gray-200 text-gray-500", className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={clsx("px-3 py-2 font-medium", className)} {...props} />;
}

export function Tbody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx("divide-y divide-gray-100", className)} {...props} />;
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx("px-3 py-2", className)} {...props} />;
}
```

- [ ] **Step 2: Create Tabs (client component, local state)**

`src/components/ui/tabs.tsx`:
```tsx
"use client";

import { ReactNode, useState } from "react";
import { clsx } from "clsx";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}
```

- [ ] **Step 3: Create Modal**

`src/components/ui/modal.tsx`:
```tsx
"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add table, tabs, modal UI primitives"
```

---

## Task 5: Vitest setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script)

- [ ] **Step 1: Create Vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 2: Add test script**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

- [ ] **Step 3: Verify it runs with no tests yet**

Run: `npm run test`
Expected: Vitest runs and reports "No test files found" (exit code may be non-zero — that's fine, we'll add tests in later tasks).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add Vitest configuration"
```

---

## Task 6: Core TypeScript types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write the types file**

`src/lib/types.ts`:
```ts
export type BusinessType = "supermarket" | "pharmacy" | "restaurant";
export type Role = "admin" | "direktor" | "kassir" | "omborchi" | "buxgalter";

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: Role;
  active: boolean;
}

export interface Employee {
  id: string;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  position: string;
  hireDate: string;
  salary: number;
  status: "active" | "inactive";
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  late: boolean;
  status: "ishda" | "dam olish" | "tatil";
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
  batchNumber?: string;
  prescriptionRequired?: boolean;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  costPrice: number;
  stock: number;
  minStock: number;
}

export interface RecipeIngredient {
  rawMaterialId: string;
  qty: number;
}

export interface Recipe {
  id: string;
  productId: string;
  ingredients: RecipeIngredient[];
}

export type PaymentMethod = "Naqd" | "Karta" | "Click" | "Payme" | "Uzum" | "Aralash";
export type OrderType = "Stolda" | "Olib ketish" | "Yetkazib berish";

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
}

export interface PrescriptionInfo {
  doctorName: string;
  patientName: string;
  prescriptionNumber: string;
}

export interface Sale {
  id: string;
  date: string;
  cashierName: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  orderType?: OrderType;
  tableNumber?: string;
  customerId?: string;
  prescription?: PrescriptionInfo;
}

export interface PartnerTransaction {
  date: string;
  productsDelivered: string;
  qty: number;
  total: number;
  paid: number;
}

export interface Partner {
  id: string;
  companyName: string;
  phone: string;
  address: string;
  taxId: string;
  bankDetails: string;
  transactions: PartnerTransaction[];
}

export interface CustomerPurchase {
  date: string;
  total: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  bonusCardPercent: number;
  discount: number;
  debt: number;
  purchaseHistory: CustomerPurchase[];
}

export type ExpenseCategory =
  | "Soliq"
  | "Elektr"
  | "Gaz"
  | "Suv"
  | "Internet"
  | "Ijara"
  | "Ishchilar oyligi"
  | "Boshqa";

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
}

export interface Debt {
  id: string;
  partyName: string;
  type: "receivable" | "payable";
  amount: number;
  dueDate: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface FinanceBalance {
  cash: number;
  bank: number;
}

export interface AppData {
  businessType: BusinessType;
  products: Product[];
  rawMaterials: RawMaterial[];
  recipes: Recipe[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  sales: Sale[];
  partners: Partner[];
  customers: Customer[];
  expenses: Expense[];
  debts: Debt[];
  activityLog: ActivityLogEntry[];
  balance: FinanceBalance;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `src/lib/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add core data model types"
```

---

## Task 7: Formatting and business-type label utilities (TDD)

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/format.test.ts`
- Create: `src/lib/labels.ts`

- [ ] **Step 1: Write failing tests for formatting**

`src/lib/format.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatUZS, formatDate, formatDateTime } from "./format";

describe("formatUZS", () => {
  it("formats whole numbers with space separators and so'm suffix", () => {
    expect(formatUZS(1250000)).toBe("1 250 000 so'm");
  });

  it("formats small numbers without separators", () => {
    expect(formatUZS(500)).toBe("500 so'm");
  });

  it("rounds decimals to the nearest whole number", () => {
    expect(formatUZS(1999.6)).toBe("2 000 so'm");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as dd.mm.yyyy", () => {
    expect(formatDate("2026-06-10T00:00:00")).toBe("10.06.2026");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO date-time as dd.mm.yyyy HH:mm", () => {
    expect(formatDateTime("2026-06-10T09:05:00")).toBe("10.06.2026 09:05");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/format.ts` does not exist yet.

- [ ] **Step 3: Implement formatting utilities**

`src/lib/format.ts`:
```ts
export function formatUZS(amount: number): string {
  const rounded = Math.round(amount);
  const withSeparators = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSeparators} so'm`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(iso)} ${hours}:${minutes}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all `format.test.ts` tests green).

- [ ] **Step 5: Add business-type label dictionary (no test — static data)**

`src/lib/labels.ts`:
```ts
import { BusinessType } from "./types";

export interface Labels {
  productNoun: string;
  productNounPlural: string;
  warehouseName: string;
  posTitle: string;
  hasRawMaterials: boolean;
  hasRecipes: boolean;
  hasExpiry: boolean;
  hasPrescription: boolean;
}

export const LABELS: Record<BusinessType, Labels> = {
  supermarket: {
    productNoun: "Mahsulot",
    productNounPlural: "Mahsulotlar",
    warehouseName: "Ombor",
    posTitle: "Savdo",
    hasRawMaterials: false,
    hasRecipes: false,
    hasExpiry: false,
    hasPrescription: false,
  },
  pharmacy: {
    productNoun: "Dori",
    productNounPlural: "Dorilar",
    warehouseName: "Dorixona ombori",
    posTitle: "Savdo",
    hasRawMaterials: false,
    hasRecipes: false,
    hasExpiry: true,
    hasPrescription: true,
  },
  restaurant: {
    productNoun: "Taom",
    productNounPlural: "Taomlar",
    warehouseName: "Oshxona ombori",
    posTitle: "Buyurtma",
    hasRawMaterials: true,
    hasRecipes: true,
    hasExpiry: false,
    hasPrescription: false,
  },
};

export const BUSINESS_TYPE_NAMES: Record<BusinessType, string> = {
  supermarket: "Supermarket",
  pharmacy: "Apteka",
  restaurant: "Milliy taomlar",
};
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add formatting utilities and business-type labels"
```

---

## Task 8: Seed demo users

**Files:**
- Create: `src/lib/seed/users.ts`

- [ ] **Step 1: Write the seeded demo users**

`src/lib/seed/users.ts`:
```ts
import { User } from "../types";

export const USERS: User[] = [
  { id: "u1", username: "admin", password: "admin123", fullName: "Administrator", role: "admin", active: true },
  { id: "u2", username: "direktor", password: "direktor123", fullName: "Olim Karimov", role: "direktor", active: true },
  { id: "u3", username: "kassir", password: "kassir123", fullName: "Madina Yusupova", role: "kassir", active: true },
  { id: "u4", username: "omborchi", password: "omborchi123", fullName: "Sardor Tojiyev", role: "omborchi", active: true },
  { id: "u5", username: "buxgalter", password: "buxgalter123", fullName: "Nilufar Rashidova", role: "buxgalter", active: true },
];
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "Add seeded demo users"
```

---

## Task 9: Sales history generator + Supermarket seed data

**Files:**
- Create: `src/lib/seed/generate-sales.ts`
- Create: `src/lib/seed/supermarket.ts`

- [ ] **Step 1: Write a deterministic sales-history generator**

This is shared by all three business seeds so reports/top-products have realistic data without
hand-writing hundreds of records.

`src/lib/seed/generate-sales.ts`:
```ts
import { PaymentMethod, Product, Sale, SaleItem } from "../types";

const PAYMENT_METHODS: PaymentMethod[] = ["Naqd", "Karta", "Click", "Payme", "Uzum", "Aralash"];

// Deterministic pseudo-random generator so the seed data is stable across runs.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSalesHistory(
  products: Product[],
  cashierNames: string[],
  days = 90,
  seed = 42
): Sale[] {
  const rand = mulberry32(seed);
  const sales: Sale[] = [];
  const now = new Date();

  for (let dayOffset = days; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);

    const salesPerDay = 3 + Math.floor(rand() * 5);
    for (let i = 0; i < salesPerDay; i++) {
      const itemCount = 1 + Math.floor(rand() * 3);
      const items: SaleItem[] = [];
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(rand() * products.length)];
        const qty = 1 + Math.floor(rand() * 3);
        items.push({
          productId: product.id,
          name: product.name,
          qty,
          price: product.sellPrice,
          discount: 0,
        });
      }
      const total = items.reduce((sum, item) => sum + item.qty * item.price - item.discount, 0);
      const saleDate = new Date(date);
      saleDate.setHours(9 + Math.floor(rand() * 11), Math.floor(rand() * 60), 0, 0);

      sales.push({
        id: `sale-${dayOffset}-${i}`,
        date: saleDate.toISOString(),
        cashierName: cashierNames[Math.floor(rand() * cashierNames.length)],
        items,
        total,
        paymentMethod: PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)],
      });
    }
  }

  return sales;
}
```

- [ ] **Step 2: Write the Supermarket seed data**

`src/lib/seed/supermarket.ts`:
```ts
import {
  ActivityLogEntry,
  AppData,
  AttendanceRecord,
  Customer,
  Debt,
  Employee,
  Expense,
  Partner,
  Product,
} from "../types";
import { generateSalesHistory } from "./generate-sales";

const products: Product[] = [
  { id: "p1", barcode: "4780001000011", name: "Non (oddiy)", category: "Non mahsulotlari", brand: "Mahalliy", unit: "dona", costPrice: 2000, sellPrice: 3000, stock: 120, minStock: 20 },
  { id: "p2", barcode: "4780001000028", name: "Sut 1L", category: "Sut mahsulotlari", brand: "Tetra", unit: "dona", costPrice: 9000, sellPrice: 12000, stock: 60, minStock: 15 },
  { id: "p3", barcode: "4780001000035", name: "Tuxum (10 dona)", category: "Tuxum", brand: "Fermer", unit: "quti", costPrice: 18000, sellPrice: 24000, stock: 40, minStock: 10 },
  { id: "p4", barcode: "4780001000042", name: "Makaron 500g", category: "Bakaleya", brand: "Makfa", unit: "dona", costPrice: 8000, sellPrice: 11000, stock: 80, minStock: 20 },
  { id: "p5", barcode: "4780001000059", name: "O'simlik yog'i 1L", category: "Yog'lar", brand: "Oltin Don", unit: "dona", costPrice: 17000, sellPrice: 22000, stock: 50, minStock: 10 },
  { id: "p6", barcode: "4780001000066", name: "Coca-Cola 1.5L", category: "Ichimliklar", brand: "Coca-Cola", unit: "dona", costPrice: 9000, sellPrice: 13000, stock: 90, minStock: 24 },
  { id: "p7", barcode: "4780001000073", name: "Choy (qora) 100g", category: "Bakaleya", brand: "Tess", unit: "dona", costPrice: 12000, sellPrice: 17000, stock: 35, minStock: 10 },
  { id: "p8", barcode: "4780001000080", name: "Shakar 1kg", category: "Bakaleya", brand: "Mahalliy", unit: "kg", costPrice: 9000, sellPrice: 12000, stock: 100, minStock: 25 },
  { id: "p9", barcode: "4780001000097", name: "Tovuq go'shti 1kg", category: "Go'sht mahsulotlari", brand: "Fermer", unit: "kg", costPrice: 28000, sellPrice: 36000, stock: 8, minStock: 10 },
  { id: "p10", barcode: "4780001000103", name: "Yogurt 500g", category: "Sut mahsulotlari", brand: "Efe", unit: "dona", costPrice: 8000, sellPrice: 11000, stock: 5, minStock: 12 },
];

const employees: Employee[] = [
  { id: "e1", fullName: "Olim Karimov", birthDate: "1985-03-12", phone: "+998901112233", address: "Toshkent, Chilonzor", position: "Direktor", hireDate: "2021-01-10", salary: 12000000, status: "active" },
  { id: "e2", fullName: "Madina Yusupova", birthDate: "1996-07-22", phone: "+998901112244", address: "Toshkent, Yunusobod", position: "Kassir", hireDate: "2022-04-01", salary: 4500000, status: "active" },
  { id: "e3", fullName: "Sardor Tojiyev", birthDate: "1992-11-05", phone: "+998901112255", address: "Toshkent, Sergeli", position: "Omborchi", hireDate: "2021-09-15", salary: 5000000, status: "active" },
  { id: "e4", fullName: "Nilufar Rashidova", birthDate: "1990-02-18", phone: "+998901112266", address: "Toshkent, Mirzo Ulug'bek", position: "Buxgalter", hireDate: "2020-06-01", salary: 6000000, status: "active" },
  { id: "e5", fullName: "Jasur Ergashev", birthDate: "1998-05-30", phone: "+998901112277", address: "Toshkent, Olmazor", position: "Kassir", hireDate: "2023-02-20", salary: 4200000, status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

const attendance: AttendanceRecord[] = [
  { id: "a1", employeeId: "e1", date: today, checkIn: "09:00", checkOut: "18:00", late: false, status: "ishda" },
  { id: "a2", employeeId: "e2", date: today, checkIn: "08:55", checkOut: null, late: false, status: "ishda" },
  { id: "a3", employeeId: "e3", date: today, checkIn: "09:20", checkOut: null, late: true, status: "ishda" },
  { id: "a4", employeeId: "e4", date: today, checkIn: "09:05", checkOut: "17:30", late: false, status: "ishda" },
  { id: "a5", employeeId: "e5", date: today, checkIn: null, checkOut: null, late: false, status: "dam olish" },
];

const partners: Partner[] = [
  {
    id: "pt1",
    companyName: "Aroma Foods MChJ",
    phone: "+998712001122",
    address: "Toshkent sh., Sergeli tumani",
    taxId: "302456789",
    bankDetails: "Hamkorbank, 2020 8000 XXXX 1234",
    transactions: [
      { date: "2026-05-02", productsDelivered: "Non, Sut, Yogurt", qty: 200, total: 4200000, paid: 4200000 },
      { date: "2026-06-01", productsDelivered: "Sut, Yogurt", qty: 150, total: 1950000, paid: 1500000 },
    ],
  },
  {
    id: "pt2",
    companyName: "Makfa Distribution",
    phone: "+998712003344",
    address: "Toshkent sh., Mirzo Ulug'bek tumani",
    taxId: "301122334",
    bankDetails: "Ipoteka bank, 2020 8000 XXXX 5678",
    transactions: [
      { date: "2026-05-10", productsDelivered: "Makaron, Shakar", qty: 300, total: 5100000, paid: 5100000 },
    ],
  },
  {
    id: "pt3",
    companyName: "Fermer Agro",
    phone: "+998712005566",
    address: "Toshkent viloyati, Qibray",
    taxId: "304556677",
    bankDetails: "Xalq banki, 2020 8000 XXXX 9012",
    transactions: [
      { date: "2026-06-05", productsDelivered: "Tuxum, Tovuq go'shti", qty: 80, total: 2880000, paid: 2000000 },
    ],
  },
];

const customers: Customer[] = [
  { id: "c1", fullName: "Shahnoza Aliyeva", phone: "+998909991122", bonusCardPercent: 5, discount: 5, debt: 0, purchaseHistory: [{ date: "2026-06-01", total: 150000 }, { date: "2026-06-08", total: 95000 }] },
  { id: "c2", fullName: "Bekzod Niyozov", phone: "+998909992233", bonusCardPercent: 3, discount: 3, debt: 120000, purchaseHistory: [{ date: "2026-05-28", total: 320000 }] },
  { id: "c3", fullName: "Gulnoza Sodiqova", phone: "+998909993344", bonusCardPercent: 0, discount: 0, debt: 0, purchaseHistory: [{ date: "2026-06-10", total: 60000 }] },
];

const expenses: Expense[] = [
  { id: "ex1", date: "2026-06-01", category: "Ijara", amount: 8000000, note: "Iyun oyi ijara to'lovi" },
  { id: "ex2", date: "2026-06-02", category: "Elektr", amount: 1200000, note: "Elektr energiyasi" },
  { id: "ex3", date: "2026-06-02", category: "Suv", amount: 250000, note: "Suv ta'minoti" },
  { id: "ex4", date: "2026-06-03", category: "Internet", amount: 400000, note: "Ofis internet" },
  { id: "ex5", date: "2026-06-05", category: "Soliq", amount: 3500000, note: "Oylik soliq to'lovi" },
  { id: "ex6", date: "2026-06-10", category: "Ishchilar oyligi", amount: 31700000, note: "May oyi ish haqi" },
];

const debts: Debt[] = [
  { id: "d1", partyName: "Bekzod Niyozov", type: "receivable", amount: 120000, dueDate: "2026-06-20" },
  { id: "d2", partyName: "Fermer Agro", type: "payable", amount: 880000, dueDate: "2026-06-25" },
];

const activityLog: ActivityLogEntry[] = [
  { id: "log1", timestamp: new Date().toISOString(), user: "admin", action: "Tizimga kirdi" },
  { id: "log2", timestamp: new Date().toISOString(), user: "kassir", action: "Savdo amalga oshirdi" },
  { id: "log3", timestamp: new Date().toISOString(), user: "omborchi", action: "Mahsulot kirimini kiritdi" },
];

export const SUPERMARKET_DATA: AppData = {
  businessType: "supermarket",
  products,
  rawMaterials: [],
  recipes: [],
  employees,
  attendance,
  sales: generateSalesHistory(products, ["Madina Yusupova", "Jasur Ergashev"], 90, 1),
  partners,
  customers,
  expenses,
  debts,
  activityLog,
  balance: { cash: 18500000, bank: 64200000 },
};
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `src/lib/seed/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add sales history generator and supermarket seed data"
```

---

## Task 10: Pharmacy seed data

**Files:**
- Create: `src/lib/seed/pharmacy.ts`

- [ ] **Step 1: Write the Pharmacy seed data**

`src/lib/seed/pharmacy.ts`:
```ts
import {
  ActivityLogEntry,
  AppData,
  AttendanceRecord,
  Customer,
  Debt,
  Employee,
  Expense,
  Partner,
  Product,
} from "../types";
import { generateSalesHistory } from "./generate-sales";

const products: Product[] = [
  { id: "p1", barcode: "4870002000011", name: "Paracetamol 500mg (10 tab)", category: "Og'riq qoldiruvchi", brand: "Pharmstandard", unit: "quti", costPrice: 6000, sellPrice: 9000, stock: 150, minStock: 30, expiryDate: "2027-03-01", batchNumber: "B-2301", prescriptionRequired: false },
  { id: "p2", barcode: "4870002000028", name: "Amoxicillin 500mg (20 tab)", category: "Antibiotik", brand: "Hemofarm", unit: "quti", costPrice: 18000, sellPrice: 26000, stock: 60, minStock: 15, expiryDate: "2026-09-15", batchNumber: "B-2218", prescriptionRequired: true },
  { id: "p3", barcode: "4870002000035", name: "No-shpa 40mg (24 tab)", category: "Spazmolitik", brand: "Sanofi", unit: "quti", costPrice: 22000, sellPrice: 31000, stock: 45, minStock: 10, expiryDate: "2027-01-10", batchNumber: "B-2305", prescriptionRequired: false },
  { id: "p4", barcode: "4870002000042", name: "Vitamin C 1000mg (20 tab)", category: "Vitaminlar", brand: "Solgar", unit: "quti", costPrice: 25000, sellPrice: 35000, stock: 70, minStock: 15, expiryDate: "2027-06-01", batchNumber: "B-2402", prescriptionRequired: false },
  { id: "p5", barcode: "4870002000059", name: "Insulin (flakon)", category: "Endokrinologiya", brand: "Novo Nordisk", unit: "flakon", costPrice: 85000, sellPrice: 110000, stock: 12, minStock: 10, expiryDate: "2026-07-20", batchNumber: "B-2150", prescriptionRequired: true },
  { id: "p6", barcode: "4870002000066", name: "Tibbiy maska (50 dona)", category: "Tibbiy buyumlar", brand: "MedLine", unit: "quti", costPrice: 25000, sellPrice: 35000, stock: 100, minStock: 20, expiryDate: "2028-01-01", batchNumber: "B-2410", prescriptionRequired: false },
  { id: "p7", barcode: "4870002000073", name: "Antiseptik (spirtli) 100ml", category: "Antiseptiklar", brand: "Mahalliy", unit: "dona", costPrice: 8000, sellPrice: 13000, stock: 80, minStock: 20, expiryDate: "2027-12-01", batchNumber: "B-2399", prescriptionRequired: false },
  { id: "p8", barcode: "4870002000080", name: "Ibuprofen 400mg (20 tab)", category: "Og'riq qoldiruvchi", brand: "Pharmstandard", unit: "quti", costPrice: 9000, sellPrice: 14000, stock: 9, minStock: 20, expiryDate: "2026-06-30", batchNumber: "B-2199", prescriptionRequired: false },
  { id: "p9", barcode: "4870002000097", name: "Sterilь bint", category: "Tibbiy buyumlar", brand: "MedLine", unit: "dona", costPrice: 4000, sellPrice: 7000, stock: 120, minStock: 30, expiryDate: "2028-05-01", batchNumber: "B-2420", prescriptionRequired: false },
  { id: "p10", barcode: "4870002000103", name: "Tinchlantiruvchi tabletka (20 tab)", category: "Nevrologiya", brand: "KRKA", unit: "quti", costPrice: 30000, sellPrice: 42000, stock: 25, minStock: 10, expiryDate: "2026-07-05", batchNumber: "B-2160", prescriptionRequired: true },
];

const employees: Employee[] = [
  { id: "e1", fullName: "Dilshod Rahimov", birthDate: "1982-01-15", phone: "+998901114455", address: "Toshkent, Shayxontohur", position: "Direktor", hireDate: "2019-03-01", salary: 13000000, status: "active" },
  { id: "e2", fullName: "Madina Yusupova", birthDate: "1995-09-10", phone: "+998901114466", address: "Toshkent, Yakkasaroy", position: "Farmatsevt", hireDate: "2022-01-10", salary: 5500000, status: "active" },
  { id: "e3", fullName: "Aziz Karimov", birthDate: "1993-04-25", phone: "+998901114477", address: "Toshkent, Mirobod", position: "Omborchi", hireDate: "2021-07-01", salary: 5000000, status: "active" },
  { id: "e4", fullName: "Nilufar Rashidova", birthDate: "1990-02-18", phone: "+998901114488", address: "Toshkent, Mirzo Ulug'bek", position: "Buxgalter", hireDate: "2020-06-01", salary: 6200000, status: "active" },
  { id: "e5", fullName: "Sevara Tosheva", birthDate: "1997-12-02", phone: "+998901114499", address: "Toshkent, Chilonzor", position: "Farmatsevt", hireDate: "2023-05-15", salary: 5000000, status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

const attendance: AttendanceRecord[] = [
  { id: "a1", employeeId: "e1", date: today, checkIn: "09:00", checkOut: "18:00", late: false, status: "ishda" },
  { id: "a2", employeeId: "e2", date: today, checkIn: "08:50", checkOut: null, late: false, status: "ishda" },
  { id: "a3", employeeId: "e3", date: today, checkIn: "09:15", checkOut: null, late: true, status: "ishda" },
  { id: "a4", employeeId: "e4", date: today, checkIn: "09:00", checkOut: "17:30", late: false, status: "ishda" },
  { id: "a5", employeeId: "e5", date: today, checkIn: null, checkOut: null, late: false, status: "dam olish" },
];

const partners: Partner[] = [
  {
    id: "pt1",
    companyName: "Pharmstandard Distribution",
    phone: "+998712007788",
    address: "Toshkent sh., Yunusobod tumani",
    taxId: "306112233",
    bankDetails: "Hamkorbank, 2020 8000 XXXX 1357",
    transactions: [{ date: "2026-05-15", productsDelivered: "Paracetamol, Ibuprofen", qty: 500, total: 7500000, paid: 7500000 }],
  },
  {
    id: "pt2",
    companyName: "Hemofarm Uzbekistan",
    phone: "+998712008899",
    address: "Toshkent sh., Mirzo Ulug'bek tumani",
    taxId: "306223344",
    bankDetails: "Ipoteka bank, 2020 8000 XXXX 2468",
    transactions: [{ date: "2026-06-01", productsDelivered: "Amoxicillin", qty: 100, total: 1800000, paid: 1200000 }],
  },
  {
    id: "pt3",
    companyName: "MedLine Supply",
    phone: "+998712009900",
    address: "Toshkent sh., Sergeli tumani",
    taxId: "306334455",
    bankDetails: "Xalq banki, 2020 8000 XXXX 3579",
    transactions: [{ date: "2026-06-05", productsDelivered: "Tibbiy maska, Sterilь bint", qty: 220, total: 4400000, paid: 4400000 }],
  },
];

const customers: Customer[] = [
  { id: "c1", fullName: "Shahnoza Aliyeva", phone: "+998909991122", bonusCardPercent: 5, discount: 5, debt: 0, purchaseHistory: [{ date: "2026-06-08", total: 45000 }] },
  { id: "c2", fullName: "Bekzod Niyozov", phone: "+998909992233", bonusCardPercent: 0, discount: 0, debt: 60000, purchaseHistory: [{ date: "2026-05-28", total: 60000 }] },
  { id: "c3", fullName: "Gulnoza Sodiqova", phone: "+998909993344", bonusCardPercent: 3, discount: 3, debt: 0, purchaseHistory: [{ date: "2026-06-10", total: 35000 }] },
];

const expenses: Expense[] = [
  { id: "ex1", date: "2026-06-01", category: "Ijara", amount: 7000000, note: "Iyun oyi ijara to'lovi" },
  { id: "ex2", date: "2026-06-02", category: "Elektr", amount: 900000, note: "Elektr energiyasi" },
  { id: "ex3", date: "2026-06-03", category: "Internet", amount: 350000, note: "Ofis internet" },
  { id: "ex4", date: "2026-06-05", category: "Soliq", amount: 4200000, note: "Oylik soliq to'lovi" },
  { id: "ex5", date: "2026-06-10", category: "Ishchilar oyligi", amount: 34700000, note: "May oyi ish haqi" },
];

const debts: Debt[] = [
  { id: "d1", partyName: "Bekzod Niyozov", type: "receivable", amount: 60000, dueDate: "2026-06-18" },
  { id: "d2", partyName: "Hemofarm Uzbekistan", type: "payable", amount: 600000, dueDate: "2026-06-22" },
];

const activityLog: ActivityLogEntry[] = [
  { id: "log1", timestamp: new Date().toISOString(), user: "admin", action: "Tizimga kirdi" },
  { id: "log2", timestamp: new Date().toISOString(), user: "kassir", action: "Retsept asosida dori sotildi" },
  { id: "log3", timestamp: new Date().toISOString(), user: "omborchi", action: "Yangi partiya dori kirim qilindi" },
];

export const PHARMACY_DATA: AppData = {
  businessType: "pharmacy",
  products,
  rawMaterials: [],
  recipes: [],
  employees,
  attendance,
  sales: generateSalesHistory(products, ["Madina Yusupova", "Sevara Tosheva"], 90, 2),
  partners,
  customers,
  expenses,
  debts,
  activityLog,
  balance: { cash: 22000000, bank: 51000000 },
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `src/lib/seed/pharmacy.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add pharmacy seed data"
```

---

## Task 11: Restaurant seed data (raw materials + recipes)

**Files:**
- Create: `src/lib/seed/restaurant.ts`

- [ ] **Step 1: Write the Restaurant seed data**

This dataset is the one exercised by the recipe/raw-material auto-deduction logic (Task 12), so
ingredient quantities here must match the units used in `RawMaterial.unit`.

`src/lib/seed/restaurant.ts`:
```ts
import {
  ActivityLogEntry,
  AppData,
  AttendanceRecord,
  Customer,
  Debt,
  Employee,
  Expense,
  Partner,
  Product,
  RawMaterial,
  Recipe,
} from "../types";
import { generateSalesHistory } from "./generate-sales";

const rawMaterials: RawMaterial[] = [
  { id: "rm1", name: "Go'sht (mol/qo'y)", unit: "kg", costPrice: 85000, stock: 40, minStock: 10 },
  { id: "rm2", name: "Tovuq go'shti", unit: "kg", costPrice: 35000, stock: 30, minStock: 10 },
  { id: "rm3", name: "Piyoz", unit: "kg", costPrice: 6000, stock: 25, minStock: 5 },
  { id: "rm4", name: "Kartoshka", unit: "kg", costPrice: 4000, stock: 35, minStock: 10 },
  { id: "rm5", name: "Un", unit: "kg", costPrice: 7000, stock: 50, minStock: 15 },
  { id: "rm6", name: "Yog'", unit: "litr", costPrice: 18000, stock: 20, minStock: 5 },
  { id: "rm7", name: "Guruch", unit: "kg", costPrice: 13000, stock: 15, minStock: 10 },
  { id: "rm8", name: "Ko'mir", unit: "kg", costPrice: 3000, stock: 60, minStock: 20 },
  { id: "rm9", name: "Ziravorlar", unit: "kg", costPrice: 40000, stock: 8, minStock: 3 },
];

const products: Product[] = [
  { id: "p1", barcode: "5000001000011", name: "Go'shtli somsa", category: "Somsa", brand: "Oshxona", unit: "dona", costPrice: 6000, sellPrice: 9000, stock: 80, minStock: 20 },
  { id: "p2", barcode: "5000001000028", name: "Kartoshkali somsa", category: "Somsa", brand: "Oshxona", unit: "dona", costPrice: 4000, sellPrice: 7000, stock: 50, minStock: 15 },
  { id: "p3", barcode: "5000001000035", name: "Tandir tovuq", category: "Tandir", brand: "Oshxona", unit: "dona", costPrice: 25000, sellPrice: 45000, stock: 8, minStock: 10 },
  { id: "p4", barcode: "5000001000042", name: "Tovuq qanoti (porsiya)", category: "Tandir", brand: "Oshxona", unit: "porsiya", costPrice: 18000, sellPrice: 32000, stock: 20, minStock: 10 },
  { id: "p5", barcode: "5000001000059", name: "Mol go'shti shashlik", category: "Shashlik", brand: "Oshxona", unit: "sich", costPrice: 16000, sellPrice: 28000, stock: 40, minStock: 15 },
  { id: "p6", barcode: "5000001000066", name: "Qo'y go'shti shashlik", category: "Shashlik", brand: "Oshxona", unit: "sich", costPrice: 18000, sellPrice: 30000, stock: 30, minStock: 15 },
  { id: "p7", barcode: "5000001000073", name: "Jigar shashlik", category: "Shashlik", brand: "Oshxona", unit: "sich", costPrice: 10000, sellPrice: 18000, stock: 25, minStock: 10 },
  { id: "p8", barcode: "5000001000080", name: "Achchiq-chuchuk salat", category: "Salatlar", brand: "Oshxona", unit: "porsiya", costPrice: 5000, sellPrice: 12000, stock: 15, minStock: 10 },
  { id: "p9", barcode: "5000001000097", name: "Non", category: "Non", brand: "Oshxona", unit: "dona", costPrice: 2000, sellPrice: 3000, stock: 60, minStock: 20 },
  { id: "p10", barcode: "5000001000103", name: "Choy (choynak)", category: "Ichimliklar", brand: "Oshxona", unit: "choynak", costPrice: 1000, sellPrice: 5000, stock: 200, minStock: 30 },
];

// Recipe quantities are expressed in the RawMaterial's unit (kg, litr) per ONE sold unit of the product.
const recipes: Recipe[] = [
  { id: "r1", productId: "p1", ingredients: [{ rawMaterialId: "rm5", qty: 0.1 }, { rawMaterialId: "rm1", qty: 0.08 }, { rawMaterialId: "rm3", qty: 0.04 }, { rawMaterialId: "rm6", qty: 0.01 }] },
  { id: "r2", productId: "p2", ingredients: [{ rawMaterialId: "rm5", qty: 0.1 }, { rawMaterialId: "rm4", qty: 0.09 }, { rawMaterialId: "rm3", qty: 0.03 }, { rawMaterialId: "rm6", qty: 0.01 }] },
  { id: "r3", productId: "p3", ingredients: [{ rawMaterialId: "rm2", qty: 1 }, { rawMaterialId: "rm9", qty: 0.02 }, { rawMaterialId: "rm8", qty: 0.5 }] },
  { id: "r4", productId: "p4", ingredients: [{ rawMaterialId: "rm2", qty: 0.3 }, { rawMaterialId: "rm9", qty: 0.01 }, { rawMaterialId: "rm8", qty: 0.2 }] },
  { id: "r5", productId: "p5", ingredients: [{ rawMaterialId: "rm1", qty: 0.12 }, { rawMaterialId: "rm3", qty: 0.02 }, { rawMaterialId: "rm9", qty: 0.01 }] },
  { id: "r6", productId: "p6", ingredients: [{ rawMaterialId: "rm1", qty: 0.13 }, { rawMaterialId: "rm3", qty: 0.02 }, { rawMaterialId: "rm9", qty: 0.01 }] },
  { id: "r7", productId: "p7", ingredients: [{ rawMaterialId: "rm1", qty: 0.1 }, { rawMaterialId: "rm9", qty: 0.01 }] },
  { id: "r8", productId: "p8", ingredients: [{ rawMaterialId: "rm3", qty: 0.08 }, { rawMaterialId: "rm4", qty: 0.05 }] },
  { id: "r9", productId: "p9", ingredients: [{ rawMaterialId: "rm5", qty: 0.15 }] },
];

const employees: Employee[] = [
  { id: "e1", fullName: "Bahodir Yusupov", birthDate: "1980-08-01", phone: "+998901115566", address: "Xorazm, Urganch", position: "Administrator", hireDate: "2020-01-15", salary: 11000000, status: "active" },
  { id: "e2", fullName: "Madina Yusupova", birthDate: "1996-07-22", phone: "+998901115577", address: "Xorazm, Urganch", position: "Kassir", hireDate: "2022-04-01", salary: 4500000, status: "active" },
  { id: "e3", fullName: "Olimjon Sattorov", birthDate: "1988-03-14", phone: "+998901115588", address: "Xorazm, Urganch", position: "Oshpaz", hireDate: "2021-02-01", salary: 7000000, status: "active" },
  { id: "e4", fullName: "Sardor Tojiyev", birthDate: "1992-11-05", phone: "+998901115599", address: "Xorazm, Urganch", position: "Tandirchi", hireDate: "2021-09-15", salary: 6000000, status: "active" },
  { id: "e5", fullName: "Jasur Ergashev", birthDate: "1998-05-30", phone: "+998901115600", address: "Xorazm, Urganch", position: "Shashlikchi", hireDate: "2023-02-20", salary: 6000000, status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

const attendance: AttendanceRecord[] = [
  { id: "a1", employeeId: "e1", date: today, checkIn: "08:30", checkOut: "20:00", late: false, status: "ishda" },
  { id: "a2", employeeId: "e2", date: today, checkIn: "08:55", checkOut: null, late: false, status: "ishda" },
  { id: "a3", employeeId: "e3", date: today, checkIn: "07:50", checkOut: null, late: false, status: "ishda" },
  { id: "a4", employeeId: "e4", date: today, checkIn: "08:10", checkOut: null, late: false, status: "ishda" },
  { id: "a5", employeeId: "e5", date: today, checkIn: "09:30", checkOut: null, late: true, status: "ishda" },
];

const partners: Partner[] = [
  {
    id: "pt1",
    companyName: "Go'sht Bazasi Xorazm",
    phone: "+998622001122",
    address: "Xorazm viloyati, Urganch",
    taxId: "305112233",
    bankDetails: "Hamkorbank, 2020 8000 XXXX 4321",
    transactions: [{ date: "2026-06-01", productsDelivered: "Go'sht, Tovuq go'shti", qty: 60, total: 4500000, paid: 4500000 }],
  },
  {
    id: "pt2",
    companyName: "Don Mahsulotlari",
    phone: "+998622003344",
    address: "Xorazm viloyati, Urganch",
    taxId: "305223344",
    bankDetails: "Ipoteka bank, 2020 8000 XXXX 8765",
    transactions: [{ date: "2026-06-03", productsDelivered: "Un, Guruch", qty: 100, total: 1300000, paid: 900000 }],
  },
  {
    id: "pt3",
    companyName: "Sabzavot Bozori",
    phone: "+998622005566",
    address: "Xorazm viloyati, Urganch",
    taxId: "305334455",
    bankDetails: "Xalq banki, 2020 8000 XXXX 2468",
    transactions: [{ date: "2026-06-05", productsDelivered: "Piyoz, Kartoshka", qty: 50, total: 300000, paid: 300000 }],
  },
];

const customers: Customer[] = [
  { id: "c1", fullName: "Shahnoza Aliyeva", phone: "+998909991122", bonusCardPercent: 5, discount: 5, debt: 0, purchaseHistory: [{ date: "2026-06-08", total: 95000 }] },
  { id: "c2", fullName: "Bekzod Niyozov", phone: "+998909992233", bonusCardPercent: 0, discount: 0, debt: 0, purchaseHistory: [{ date: "2026-05-28", total: 145000 }] },
];

const expenses: Expense[] = [
  { id: "ex1", date: "2026-06-01", category: "Ijara", amount: 9000000, note: "Iyun oyi ijara" },
  { id: "ex2", date: "2026-06-02", category: "Gaz", amount: 2200000, note: "Tandir uchun gaz" },
  { id: "ex3", date: "2026-06-02", category: "Elektr", amount: 1100000, note: "Elektr energiyasi" },
  { id: "ex4", date: "2026-06-05", category: "Soliq", amount: 2800000, note: "Oylik soliq" },
  { id: "ex5", date: "2026-06-10", category: "Ishchilar oyligi", amount: 34500000, note: "May oyi ish haqi" },
];

const debts: Debt[] = [{ id: "d1", partyName: "Don Mahsulotlari", type: "payable", amount: 400000, dueDate: "2026-06-20" }];

const activityLog: ActivityLogEntry[] = [
  { id: "log1", timestamp: new Date().toISOString(), user: "admin", action: "Tizimga kirdi" },
  { id: "log2", timestamp: new Date().toISOString(), user: "kassir", action: "Buyurtma qabul qilindi" },
  { id: "log3", timestamp: new Date().toISOString(), user: "omborchi", action: "Xomashyo kirimi kiritildi" },
];

export const RESTAURANT_DATA: AppData = {
  businessType: "restaurant",
  products,
  rawMaterials,
  recipes,
  employees,
  attendance,
  sales: generateSalesHistory(products, ["Madina Yusupova", "Jasur Ergashev"], 90, 3),
  partners,
  customers,
  expenses,
  debts,
  activityLog,
  balance: { cash: 12500000, bank: 28000000 },
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `src/lib/seed/restaurant.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add restaurant seed data with raw materials and recipes"
```

---

## Task 12: Sale recording & recipe auto-deduction logic (TDD)

This implements the spec's "most important requirement": selling a restaurant product
automatically deducts its recipe's raw materials from inventory.

**Files:**
- Create: `src/lib/logic/sales.ts`
- Create: `src/lib/logic/sales.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/logic/sales.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { recordSale } from "./sales";
import { AppData, Sale } from "../types";

function baseData(overrides: Partial<AppData> = {}): AppData {
  return {
    businessType: "supermarket",
    products: [
      { id: "p1", barcode: "123", name: "Non", category: "Non", brand: "Mahalliy", unit: "dona", costPrice: 1000, sellPrice: 2000, stock: 10, minStock: 2 },
    ],
    rawMaterials: [],
    recipes: [],
    employees: [],
    attendance: [],
    sales: [],
    partners: [],
    customers: [],
    expenses: [],
    debts: [],
    activityLog: [],
    balance: { cash: 1000000, bank: 5000000 },
    ...overrides,
  };
}

function makeSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: "s1",
    date: new Date().toISOString(),
    cashierName: "Kassir",
    items: [{ productId: "p1", name: "Non", qty: 2, price: 2000, discount: 0 }],
    total: 4000,
    paymentMethod: "Naqd",
    ...overrides,
  };
}

describe("recordSale", () => {
  it("decrements product stock by sold quantity", () => {
    const { data } = recordSale(baseData(), makeSale());
    expect(data.products[0].stock).toBe(8);
  });

  it("adds the sale total to cash for Naqd payments", () => {
    const { data } = recordSale(baseData(), makeSale({ paymentMethod: "Naqd" }));
    expect(data.balance.cash).toBe(1004000);
    expect(data.balance.bank).toBe(5000000);
  });

  it("adds the sale total to bank for non-cash payments", () => {
    const { data } = recordSale(baseData(), makeSale({ paymentMethod: "Click" }));
    expect(data.balance.bank).toBe(5004000);
    expect(data.balance.cash).toBe(1000000);
  });

  it("prepends the sale to the sales list", () => {
    const sale = makeSale();
    const { data } = recordSale(baseData(), sale);
    expect(data.sales[0]).toBe(sale);
  });

  it("does not touch raw materials for non-restaurant business types", () => {
    const data0 = baseData({
      rawMaterials: [{ id: "rm1", name: "Un", unit: "kg", costPrice: 1000, stock: 10, minStock: 2 }],
    });
    const { data } = recordSale(data0, makeSale());
    expect(data.rawMaterials[0].stock).toBe(10);
  });

  describe("restaurant recipe deduction", () => {
    function restaurantData(): AppData {
      return baseData({
        businessType: "restaurant",
        products: [
          { id: "p1", barcode: "5001", name: "Go'shtli somsa", category: "Somsa", brand: "Oshxona", unit: "dona", costPrice: 6000, sellPrice: 9000, stock: 80, minStock: 20 },
        ],
        rawMaterials: [
          { id: "rm1", name: "Go'sht", unit: "kg", costPrice: 85000, stock: 1, minStock: 0.5 },
          { id: "rm2", name: "Un", unit: "kg", costPrice: 7000, stock: 1, minStock: 0.5 },
        ],
        recipes: [
          { id: "r1", productId: "p1", ingredients: [{ rawMaterialId: "rm1", qty: 0.08 }, { rawMaterialId: "rm2", qty: 0.1 }] },
        ],
      });
    }

    it("deducts recipe ingredients proportionally to quantity sold", () => {
      const sale = makeSale({
        items: [{ productId: "p1", name: "Go'shtli somsa", qty: 5, price: 9000, discount: 0 }],
        total: 45000,
      });
      const { data } = recordSale(restaurantData(), sale);
      const meat = data.rawMaterials.find((r) => r.id === "rm1")!;
      const flour = data.rawMaterials.find((r) => r.id === "rm2")!;
      expect(meat.stock).toBeCloseTo(1 - 0.08 * 5, 5);
      expect(flour.stock).toBeCloseTo(1 - 0.1 * 5, 5);
    });

    it("clamps raw material stock at zero and reports a shortage when insufficient", () => {
      const sale = makeSale({
        items: [{ productId: "p1", name: "Go'shtli somsa", qty: 20, price: 9000, discount: 0 }],
        total: 180000,
      });
      const { data, shortages } = recordSale(restaurantData(), sale);
      const meat = data.rawMaterials.find((r) => r.id === "rm1")!;
      expect(meat.stock).toBe(0);
      expect(shortages).toContain("Go'sht");
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/logic/sales.ts` does not exist yet.

- [ ] **Step 3: Implement `recordSale`**

`src/lib/logic/sales.ts`:
```ts
import { AppData, Sale } from "../types";

export interface RecordSaleResult {
  data: AppData;
  shortages: string[];
}

function summarizeItems(sale: Sale): string {
  return sale.items.map((item) => `${item.name} x${item.qty}`).join(", ");
}

export function recordSale(data: AppData, sale: Sale): RecordSaleResult {
  const shortages: string[] = [];

  const products = data.products.map((product) => {
    const soldQty = sale.items
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.qty, 0);
    return soldQty > 0 ? { ...product, stock: Math.max(0, product.stock - soldQty) } : product;
  });

  let rawMaterials = data.rawMaterials;
  if (data.businessType === "restaurant" && data.recipes.length > 0) {
    rawMaterials = data.rawMaterials.map((rawMaterial) => {
      let totalNeeded = 0;
      for (const item of sale.items) {
        const recipe = data.recipes.find((r) => r.productId === item.productId);
        const ingredient = recipe?.ingredients.find((ing) => ing.rawMaterialId === rawMaterial.id);
        if (ingredient) {
          totalNeeded += ingredient.qty * item.qty;
        }
      }
      if (totalNeeded === 0) return rawMaterial;
      const remaining = rawMaterial.stock - totalNeeded;
      if (remaining < 0) {
        shortages.push(rawMaterial.name);
      }
      return { ...rawMaterial, stock: Math.max(0, remaining) };
    });
  }

  // Naqd (cash) payments go to the till; every other method goes to the bank account.
  const balance = { ...data.balance };
  if (sale.paymentMethod === "Naqd") {
    balance.cash += sale.total;
  } else {
    balance.bank += sale.total;
  }

  const activityLog = [
    {
      id: `log-${sale.id}`,
      timestamp: sale.date,
      user: sale.cashierName,
      action: `Savdo amalga oshirdi: ${summarizeItems(sale)}`,
    },
    ...data.activityLog,
  ];

  return {
    data: { ...data, products, rawMaterials, balance, sales: [sale, ...data.sales], activityLog },
    shortages,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all `sales.test.ts` tests green).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add recordSale logic with restaurant recipe auto-deduction"
```

---

## Task 13: Payroll calculation logic (TDD)

**Files:**
- Create: `src/lib/logic/payroll.ts`
- Create: `src/lib/logic/payroll.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/logic/payroll.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { calculatePayroll } from "./payroll";
import { Employee } from "../types";

function makeEmployee(salary: number): Employee {
  return {
    id: "e1",
    fullName: "Test Employee",
    birthDate: "1990-01-01",
    phone: "+998900000000",
    address: "Toshkent",
    position: "Sotuvchi",
    hireDate: "2020-01-01",
    salary,
    status: "active",
  };
}

describe("calculatePayroll", () => {
  it("computes final payout as base + bonus - penalty - advance", () => {
    const result = calculatePayroll(makeEmployee(5000000), { bonus: 500000, penalty: 100000, advance: 1000000 });
    expect(result.final).toBe(4400000);
    expect(result.base).toBe(5000000);
  });

  it("never returns a negative final payout", () => {
    const result = calculatePayroll(makeEmployee(1000000), { bonus: 0, penalty: 0, advance: 2000000 });
    expect(result.final).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/logic/payroll.ts` does not exist yet.

- [ ] **Step 3: Implement `calculatePayroll`**

`src/lib/logic/payroll.ts`:
```ts
import { Employee } from "../types";

export interface PayrollAdjustments {
  bonus: number;
  penalty: number;
  advance: number;
}

export interface PayrollResult extends PayrollAdjustments {
  base: number;
  final: number;
}

export function calculatePayroll(employee: Employee, adjustments: PayrollAdjustments): PayrollResult {
  const { bonus, penalty, advance } = adjustments;
  const final = employee.salary + bonus - penalty - advance;
  return { base: employee.salary, bonus, penalty, advance, final: Math.max(0, final) };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all `payroll.test.ts` tests green).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add payroll calculation logic"
```

---

## Task 14: Reports aggregation logic (TDD)

**Files:**
- Create: `src/lib/logic/reports.ts`
- Create: `src/lib/logic/reports.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/logic/reports.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { filterSalesByPeriod, totalSales, topProducts } from "./reports";
import { Sale } from "../types";

function makeSale(date: string, items: Sale["items"], total: number): Sale {
  return { id: `s-${date}`, date, cashierName: "Kassir", items, total, paymentMethod: "Naqd" };
}

describe("filterSalesByPeriod", () => {
  const reference = new Date("2026-06-13T12:00:00");

  const sales: Sale[] = [
    makeSale("2026-06-13T09:00:00", [{ productId: "p1", name: "A", qty: 1, price: 1000, discount: 0 }], 1000),
    makeSale("2026-06-10T09:00:00", [{ productId: "p1", name: "A", qty: 1, price: 1000, discount: 0 }], 1000),
    makeSale("2026-05-01T09:00:00", [{ productId: "p1", name: "A", qty: 1, price: 1000, discount: 0 }], 1000),
    makeSale("2025-06-01T09:00:00", [{ productId: "p1", name: "A", qty: 1, price: 1000, discount: 0 }], 1000),
  ];

  it("daily includes only sales from the reference day", () => {
    expect(filterSalesByPeriod(sales, "daily", reference)).toHaveLength(1);
  });

  it("weekly includes sales from the last 7 days", () => {
    expect(filterSalesByPeriod(sales, "weekly", reference)).toHaveLength(2);
  });

  it("monthly includes sales from the reference month", () => {
    expect(filterSalesByPeriod(sales, "monthly", reference)).toHaveLength(2);
  });

  it("yearly includes sales from the reference year", () => {
    expect(filterSalesByPeriod(sales, "yearly", reference)).toHaveLength(3);
  });
});

describe("totalSales", () => {
  it("sums the total field across sales", () => {
    const sales = [makeSale("2026-06-01", [], 1000), makeSale("2026-06-02", [], 2000)];
    expect(totalSales(sales)).toBe(3000);
  });
});

describe("topProducts", () => {
  it("aggregates quantity and revenue per product, sorted by quantity sold", () => {
    const sales: Sale[] = [
      makeSale("2026-06-01", [{ productId: "p1", name: "Non", qty: 3, price: 2000, discount: 0 }], 6000),
      makeSale("2026-06-02", [
        { productId: "p1", name: "Non", qty: 1, price: 2000, discount: 0 },
        { productId: "p2", name: "Sut", qty: 5, price: 10000, discount: 0 },
      ], 52000),
    ];
    const result = topProducts(sales, 10);
    expect(result[0]).toEqual({ productId: "p2", name: "Sut", qtySold: 5, revenue: 50000 });
    expect(result[1]).toEqual({ productId: "p1", name: "Non", qtySold: 4, revenue: 8000 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/logic/reports.ts` does not exist yet.

- [ ] **Step 3: Implement reports logic**

`src/lib/logic/reports.ts`:
```ts
import { Sale } from "../types";

export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function filterSalesByPeriod(sales: Sale[], period: ReportPeriod, referenceDate: Date = new Date()): Sale[] {
  return sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    if (period === "daily") return isSameDay(saleDate, referenceDate);
    if (period === "weekly") {
      const diffDays = (referenceDate.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    }
    if (period === "monthly") {
      return saleDate.getFullYear() === referenceDate.getFullYear() && saleDate.getMonth() === referenceDate.getMonth();
    }
    return saleDate.getFullYear() === referenceDate.getFullYear();
  });
}

export function totalSales(sales: Sale[]): number {
  return sales.reduce((sum, sale) => sum + sale.total, 0);
}

export interface TopProduct {
  productId: string;
  name: string;
  qtySold: number;
  revenue: number;
}

export function topProducts(sales: Sale[], limit = 10): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const revenue = item.qty * item.price - item.discount;
      const existing = map.get(item.productId);
      if (existing) {
        existing.qtySold += item.qty;
        existing.revenue += revenue;
      } else {
        map.set(item.productId, { productId: item.productId, name: item.name, qtySold: item.qty, revenue });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, limit);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all `reports.test.ts` tests green).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add reports aggregation logic"
```

---

## Task 15: Zustand store with localStorage persistence

**Files:**
- Create: `src/lib/store.ts`
- Create: `src/lib/use-hydrated-store.ts`

The store holds all `AppData`, seeded per business type, and exposes the actions every page
needs. It is persisted to `localStorage` so demo edits (sales, new employees, stock changes)
survive page reloads in the same browser. `skipHydration: true` + a `useHydratedStore` hook
avoid SSR/hydration mismatches in the Next.js App Router.

- [ ] **Step 1: Create the store**

`src/lib/store.ts`:
```ts
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppData, BusinessType, Debt, Employee, Expense, Sale } from "./types";
import { SUPERMARKET_DATA } from "./seed/supermarket";
import { PHARMACY_DATA } from "./seed/pharmacy";
import { RESTAURANT_DATA } from "./seed/restaurant";
import { recordSale as applySale } from "./logic/sales";

const SEED_BY_TYPE: Record<BusinessType, AppData> = {
  supermarket: SUPERMARKET_DATA,
  pharmacy: PHARMACY_DATA,
  restaurant: RESTAURANT_DATA,
};

function logEntry(user: string, action: string) {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
  };
}

export interface AppStore extends AppData {
  setBusinessType: (type: BusinessType) => void;
  recordSale: (sale: Sale) => string[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  adjustStock: (productId: string, delta: number, reason: string, user: string) => void;
  addExpense: (expense: Expense) => void;
  addDebt: (debt: Debt) => void;
  logActivity: (user: string, action: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...SUPERMARKET_DATA,

      setBusinessType: (type) => set(SEED_BY_TYPE[type]),

      recordSale: (sale) => {
        const { data, shortages } = applySale(get(), sale);
        set(data);
        return shortages;
      },

      addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),

      updateEmployee: (employee) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === employee.id ? employee : e)),
        })),

      removeEmployee: (id) =>
        set((state) => ({ employees: state.employees.filter((e) => e.id !== id) })),

      adjustStock: (productId, delta, reason, user) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
          ),
          activityLog: [logEntry(user, reason), ...state.activityLog],
        })),

      addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),

      addDebt: (debt) => set((state) => ({ debts: [debt, ...state.debts] })),

      logActivity: (user, action) =>
        set((state) => ({ activityLog: [logEntry(user, action), ...state.activityLog] })),
    }),
    {
      name: "xorazm-erp-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
```

- [ ] **Step 2: Create the hydration hook**

`src/lib/use-hydrated-store.ts`:
```ts
"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "./store";

export function useHydratedStore(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAppStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `src/lib/store.ts` or `src/lib/use-hydrated-store.ts`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add persisted app store and hydration hook"
```

---

## Task 16: Demo authentication (login page + middleware)

A real login screen backed by the seeded demo users from Task 8. After login, a session cookie
is set; Next.js middleware requires this cookie for every route except `/login`. Per the design
(§4), there is **no per-role route restriction** — any logged-in account can see every module.

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create auth helpers**

`src/lib/auth.ts`:
```ts
"use client";

import { USERS } from "./seed/users";
import { User } from "./types";

const COOKIE_NAME = "xorazm_session";

export interface Session {
  username: string;
  fullName: string;
  role: User["role"];
}

export function login(username: string, password: string): Session | null {
  const user = USERS.find((u) => u.username === username && u.password === password && u.active);
  if (!user) return null;
  const session: Session = { username: user.username, fullName: user.fullName, role: user.role };
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`;
  return session;
}

export function logout() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getSession(): Session | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as Session;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create middleware that requires a session cookie**

`src/middleware.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get("xorazm_session");
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 3: Create the login page**

`src/app/login/page.tsx`:
```tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", role: "Administrator" },
  { username: "direktor", password: "direktor123", role: "Direktor" },
  { username: "kassir", password: "kassir123", role: "Kassir" },
  { username: "omborchi", password: "omborchi123", role: "Omborchi" },
  { username: "buxgalter", password: "buxgalter123", role: "Buxgalter" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const session = login(username, password);
    if (!session) {
      setError("Login yoki parol noto'g'ri");
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xorazm ERP — Tizimga kirish</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Login</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Parol</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full">
                Kirish
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo hisoblar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-gray-600">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.username}>
                  <span className="font-medium text-gray-800">{acc.username}</span> / {acc.password} — {acc.role}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add demo login page, auth helpers, and session middleware"
```

---

## Task 17: App shell — sidebar, header, root layout

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create the sidebar**

`src/components/layout/sidebar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Warehouse,
  ShoppingCart,
  Wallet,
  Handshake,
  UserCircle,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LABELS } from "@/lib/labels";

export function Sidebar() {
  const pathname = usePathname();
  const businessType = useAppStore((state) => state.businessType);
  const labels = LABELS[businessType];

  const items = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/hr", label: "Ishchilar", icon: Users },
    { href: "/ombor", label: labels.warehouseName, icon: Warehouse },
    { href: "/pos", label: labels.posTitle, icon: ShoppingCart },
    { href: "/moliya", label: "Moliya", icon: Wallet },
    { href: "/hamkorlar", label: "Hamkorlar", icon: Handshake },
    { href: "/mijozlar", label: "Mijozlar", icon: UserCircle },
    { href: "/hisobotlar", label: "Hisobotlar", icon: BarChart3 },
    { href: "/sozlamalar", label: "Sozlamalar", icon: Settings },
  ];

  return (
    <aside className="hidden w-60 flex-col bg-gray-900 text-gray-100 md:flex">
      <div className="px-4 py-5 text-lg font-bold tracking-wide">Xorazm ERP</div>
      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Create the header**

`src/components/layout/header.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSession, logout, Session } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import { BUSINESS_TYPE_NAMES } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const businessType = useAppStore((state) => state.businessType);

  useEffect(() => {
    setSession(getSession());
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-6">
      <Badge tone="blue">{BUSINESS_TYPE_NAMES[businessType]}</Badge>
      <div className="flex items-center gap-3">
        {session && (
          <span className="text-sm text-gray-600">
            {session.fullName} <span className="text-gray-400">({session.role})</span>
          </span>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={16} />
          Chiqish
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create the app shell**

`src/components/layout/app-shell.tsx`:
```tsx
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useHydratedStore } from "@/lib/use-hydrated-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydratedStore();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!hydrated) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Yuklanmoqda...</div>;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire the app shell into the root layout**

Replace the contents of `src/app/layout.tsx` (generated by `create-next-app`) with:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Xorazm ERP",
  description: "Supermarket, apteka va restoran boshqaruv tizimi demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify the dev server runs without errors**

Run: `npm run dev`
Visit `http://localhost:3000` — expect a redirect to `/login` (no session cookie yet). Confirm
the login page renders. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add app shell with sidebar, header, and auth-aware layout"
```

---

## Task 18: Dashboard page (`/`)

**Files:**
- Modify: `src/app/page.tsx` (replace the generated default content)

- [ ] **Step 1: Implement the dashboard**

Replace the contents of `src/app/page.tsx` with:

```tsx
"use client";

import { useAppStore } from "@/lib/store";
import { LABELS, BUSINESS_TYPE_NAMES } from "@/lib/labels";
import { formatUZS, formatDateTime } from "@/lib/format";
import { filterSalesByPeriod, totalSales, topProducts } from "@/lib/logic/reports";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";

const TAX_UTILITY_CATEGORIES = ["Soliq", "Elektr", "Gaz", "Suv", "Internet"];

export default function DashboardPage() {
  const businessType = useAppStore((s) => s.businessType);
  const products = useAppStore((s) => s.products);
  const sales = useAppStore((s) => s.sales);
  const balance = useAppStore((s) => s.balance);
  const debts = useAppStore((s) => s.debts);
  const expenses = useAppStore((s) => s.expenses);

  const labels = LABELS[businessType];
  const todaySales = filterSalesByPeriod(sales, "daily");
  const todayTotal = totalSales(todaySales);

  const productCost = new Map(products.map((p) => [p.id, p.costPrice]));
  const todayProfit = todaySales.reduce((sum, sale) => {
    return (
      sum +
      sale.items.reduce((itemSum, item) => {
        const cost = productCost.get(item.productId) ?? 0;
        return itemSum + (item.price - cost) * item.qty - item.discount;
      }, 0)
    );
  }, 0);

  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const expiringSoon = labels.hasExpiry
    ? products.filter((p) => {
        if (!p.expiryDate) return false;
        const days = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
      })
    : [];

  const top5Today = topProducts(todaySales, 5);
  const receivables = debts.filter((d) => d.type === "receivable").reduce((sum, d) => sum + d.amount, 0);
  const payables = debts.filter((d) => d.type === "payable").reduce((sum, d) => sum + d.amount, 0);
  const recentSales = sales.slice(0, 5);

  const now = new Date();
  const taxUtilityThisMonth = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        TAX_UTILITY_CATEGORIES.includes(e.category) &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Bosh sahifa</h1>
        <p className="text-sm text-gray-500">{BUSINESS_TYPE_NAMES[businessType]} — bugungi holat</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Bugungi savdo</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(todayTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Bugungi foyda</p>
            <p className="mt-1 text-lg font-semibold text-green-600">{formatUZS(todayProfit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Kassadagi pul</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(balance.cash)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Bankdagi pul</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(balance.bank)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Jami {labels.productNounPlural.toLowerCase()}</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Kam qolgan {labels.productNounPlural.toLowerCase()}</p>
            <p className="mt-1 text-lg font-semibold text-amber-600">{lowStock.length}</p>
          </CardContent>
        </Card>
        {labels.hasExpiry && (
          <Card>
            <CardContent>
              <p className="text-xs text-gray-500">Muddati tugayotgan</p>
              <p className="mt-1 text-lg font-semibold text-red-600">{expiringSoon.length}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Olinadigan / Beriladigan qarz</p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatUZS(receivables)} / {formatUZS(payables)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Soliq / komunal (shu oy)</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(taxUtilityThisMonth)}</p>
            <Badge tone={taxUtilityThisMonth > 0 ? "green" : "amber"} className="mt-1">
              {taxUtilityThisMonth > 0 ? "To'langan" : "Kutilmoqda"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So'nggi savdolar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <tr>
                  <Th>Vaqt</Th>
                  <Th>Kassir</Th>
                  <Th>To'lov</Th>
                  <Th>Summa</Th>
                </tr>
              </Thead>
              <Tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <Td>{formatDateTime(sale.date)}</Td>
                    <Td>{sale.cashierName}</Td>
                    <Td>{sale.paymentMethod}</Td>
                    <Td>{formatUZS(sale.total)}</Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bugungi top mahsulotlar</CardTitle>
          </CardHeader>
          <CardContent>
            {top5Today.length === 0 ? (
              <p className="text-sm text-gray-500">Bugun hali savdo bo&apos;lmagan</p>
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Nomi</Th>
                    <Th>Soni</Th>
                    <Th>Tushum</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {top5Today.map((item) => (
                    <tr key={item.productId}>
                      <Td>{item.name}</Td>
                      <Td>{item.qtySold}</Td>
                      <Td>{formatUZS(item.revenue)}</Td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {(lowStock.length > 0 || expiringSoon.length > 0 || debts.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Ogohlantirishlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.map((p) => (
              <div key={`low-${p.id}`} className="flex items-center justify-between text-sm">
                <span>{p.name} — qoldiq {p.stock} {p.unit}</span>
                <Badge tone="amber">Kam qoldi</Badge>
              </div>
            ))}
            {expiringSoon.map((p) => (
              <div key={`exp-${p.id}`} className="flex items-center justify-between text-sm">
                <span>{p.name} — muddati: {p.expiryDate}</span>
                <Badge tone="red">Muddati tugayapti</Badge>
              </div>
            ))}
            {debts.map((d) => (
              <div key={`debt-${d.id}`} className="flex items-center justify-between text-sm">
                <span>
                  {d.partyName} — {formatUZS(d.amount)} ({d.type === "receivable" ? "olinadigan" : "beriladigan"})
                </span>
                <Badge tone="blue">Muddat: {d.dueDate}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add dashboard page with KPIs, recent sales, and alerts"
```

---

## Task 19: HR page (`/hr`)

**Files:**
- Create: `src/app/hr/page.tsx`

- [ ] **Step 1: Implement the HR page with Employees, Davomat, and Oylik tabs**

`src/app/hr/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AttendanceRecord, Employee } from "@/lib/types";
import { calculatePayroll } from "@/lib/logic/payroll";
import { formatUZS, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const POSITIONS = ["Direktor", "Kassir", "Omborchi", "Buxgalter", "Sotuvchi", "Oshpaz", "Farmasevt"];

const EMPTY_FORM = {
  fullName: "",
  birthDate: "",
  phone: "",
  address: "",
  position: POSITIONS[0],
  hireDate: "",
  salary: 0,
  status: "active" as Employee["status"],
};

export default function HrPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Ishchilar</h1>
      <Tabs
        tabs={[
          { id: "employees", label: "Ishchilar", content: <EmployeesTab /> },
          { id: "attendance", label: "Davomat", content: <AttendanceTab /> },
          { id: "payroll", label: "Oylik", content: <PayrollTab /> },
        ]}
      />
    </div>
  );
}

function EmployeesTab() {
  const employees = useAppStore((s) => s.employees);
  const addEmployee = useAppStore((s) => s.addEmployee);
  const updateEmployee = useAppStore((s) => s.updateEmployee);
  const removeEmployee = useAppStore((s) => s.removeEmployee);
  const logActivity = useAppStore((s) => s.logActivity);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditingId(employee.id);
    setForm({
      fullName: employee.fullName,
      birthDate: employee.birthDate,
      phone: employee.phone,
      address: employee.address,
      position: employee.position,
      hireDate: employee.hireDate,
      salary: employee.salary,
      status: employee.status,
    });
    setOpen(true);
  }

  function handleSave() {
    if (editingId) {
      updateEmployee({ id: editingId, ...form });
      logActivity("admin", `${form.fullName} ma'lumotlari tahrirlandi`);
    } else {
      const id = `e${Date.now()}`;
      addEmployee({ id, ...form });
      logActivity("admin", `${form.fullName} ishga qabul qilindi`);
    }
    setOpen(false);
  }

  function handleDelete(employee: Employee) {
    removeEmployee(employee.id);
    logActivity("admin", `${employee.fullName} ishdan bo'shatildi`);
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Ishchilar ro&apos;yxati</CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> Yangi ishchi
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <Thead>
            <tr>
              <Th>F.I.Sh</Th>
              <Th>Lavozim</Th>
              <Th>Telefon</Th>
              <Th>Ishga kirgan</Th>
              <Th>Oylik</Th>
              <Th>Holat</Th>
              <Th>Amallar</Th>
            </tr>
          </Thead>
          <Tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <Td>{employee.fullName}</Td>
                <Td>{employee.position}</Td>
                <Td>{employee.phone}</Td>
                <Td>{formatDate(employee.hireDate)}</Td>
                <Td>{formatUZS(employee.salary)}</Td>
                <Td>
                  <Badge tone={employee.status === "active" ? "green" : "gray"}>
                    {employee.status === "active" ? "Faol" : "Faol emas"}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(employee)} className="rounded p-1 hover:bg-gray-100">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(employee)} className="rounded p-1 text-red-600 hover:bg-gray-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </CardContent>

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Ishchini tahrirlash" : "Yangi ishchi qo'shish"}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">F.I.Sh</label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Tug&apos;ilgan sana</label>
              <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Telefon</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Manzil</label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Lavozim</label>
              <Select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Ishga kirgan sana</label>
              <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Oylik (so&apos;m)</label>
              <Input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Holat</label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Employee["status"] })}
              >
                <option value="active">Faol</option>
                <option value="inactive">Faol emas</option>
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={handleSave}>
            Saqlash
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

function AttendanceTab() {
  const attendance = useAppStore((s) => s.attendance);
  const employees = useAppStore((s) => s.employees);
  const nameById = new Map(employees.map((e) => [e.id, e.fullName]));

  const STATUS_LABEL: Record<AttendanceRecord["status"], string> = {
    ishda: "Ishda",
    "dam olish": "Dam olish",
    tatil: "Ta'til",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bugungi davomat</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <Thead>
            <tr>
              <Th>Ishchi</Th>
              <Th>Sana</Th>
              <Th>Keldi</Th>
              <Th>Ketdi</Th>
              <Th>Kechikish</Th>
              <Th>Holat</Th>
            </tr>
          </Thead>
          <Tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <Td>{nameById.get(record.employeeId) ?? record.employeeId}</Td>
                <Td>{formatDate(record.date)}</Td>
                <Td>{record.checkIn ?? "—"}</Td>
                <Td>{record.checkOut ?? "—"}</Td>
                <Td>
                  {record.late ? <Badge tone="red">Kechikkan</Badge> : <Badge tone="green">O&apos;z vaqtida</Badge>}
                </Td>
                <Td>{STATUS_LABEL[record.status]}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PayrollTab() {
  const employees = useAppStore((s) => s.employees);
  const [adjustments, setAdjustments] = useState<Record<string, { bonus: number; penalty: number; advance: number }>>({});

  function getAdjustment(id: string) {
    return adjustments[id] ?? { bonus: 0, penalty: 0, advance: 0 };
  }

  function setAdjustment(id: string, field: "bonus" | "penalty" | "advance", value: number) {
    setAdjustments((prev) => ({ ...prev, [id]: { ...getAdjustment(id), [field]: value } }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Joriy oy uchun oylik hisob-kitobi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <Thead>
            <tr>
              <Th>Ishchi</Th>
              <Th>Oklad</Th>
              <Th>Bonus</Th>
              <Th>Jarima</Th>
              <Th>Avans</Th>
              <Th>Yakuniy</Th>
            </tr>
          </Thead>
          <Tbody>
            {employees.map((employee) => {
              const adj = getAdjustment(employee.id);
              const result = calculatePayroll(employee, adj);
              return (
                <tr key={employee.id}>
                  <Td>{employee.fullName}</Td>
                  <Td>{formatUZS(result.base)}</Td>
                  <Td>
                    <input
                      type="number"
                      className="h-8 w-24 rounded border border-gray-300 px-2 text-sm"
                      value={adj.bonus}
                      onChange={(e) => setAdjustment(employee.id, "bonus", Number(e.target.value))}
                    />
                  </Td>
                  <Td>
                    <input
                      type="number"
                      className="h-8 w-24 rounded border border-gray-300 px-2 text-sm"
                      value={adj.penalty}
                      onChange={(e) => setAdjustment(employee.id, "penalty", Number(e.target.value))}
                    />
                  </Td>
                  <Td>
                    <input
                      type="number"
                      className="h-8 w-24 rounded border border-gray-300 px-2 text-sm"
                      value={adj.advance}
                      onChange={(e) => setAdjustment(employee.id, "advance", Number(e.target.value))}
                    />
                  </Td>
                  <Td className="font-semibold">{formatUZS(result.final)}</Td>
                </tr>
              );
            })}
          </Tbody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add HR page with employees, attendance, and payroll tabs"
```

---

## Task 20: Ombor / Inventory page (`/ombor`)

Business-type aware: every type shows the products table, low-stock list, and (for pharmacy) an
expiring-soon list. Restaurant mode adds **Xomashyo** (raw materials) and **Retseptura** (recipe)
tabs.

**Files:**
- Create: `src/app/ombor/page.tsx`

- [ ] **Step 1: Implement the inventory page**

`src/app/ombor/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LABELS } from "@/lib/labels";
import { formatUZS, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function OmborPage() {
  const businessType = useAppStore((s) => s.businessType);
  const labels = LABELS[businessType];

  const tabs = [{ id: "products", label: labels.productNounPlural, content: <ProductsTab /> }];
  if (labels.hasRawMaterials) {
    tabs.push({ id: "raw", label: "Xomashyo", content: <RawMaterialsTab /> });
  }
  if (labels.hasRecipes) {
    tabs.push({ id: "recipes", label: "Retseptura", content: <RecipesTab /> });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">{labels.warehouseName}</h1>
      <Tabs tabs={tabs} />
    </div>
  );
}

function ProductsTab() {
  const businessType = useAppStore((s) => s.businessType);
  const products = useAppStore((s) => s.products);
  const adjustStock = useAppStore((s) => s.adjustStock);
  const labels = LABELS[businessType];
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  function getQty(id: string) {
    return qtyById[id] ?? 1;
  }

  function handleAdjust(productId: string, productName: string, direction: 1 | -1) {
    const qty = getQty(productId);
    adjustStock(
      productId,
      direction * qty,
      `${productName}: ${direction > 0 ? "kirim" : "chiqim"} ${qty} dona`,
      "omborchi"
    );
  }

  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const expiringSoon = labels.hasExpiry
    ? products.filter((p) => {
        if (!p.expiryDate) return false;
        const days = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
      })
    : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{labels.productNounPlural}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Shtrix-kod</Th>
                <Th>Nomi</Th>
                <Th>Kategoriya</Th>
                <Th>Birlik</Th>
                <Th>Tannarx</Th>
                <Th>Sotish narxi</Th>
                <Th>Qoldiq</Th>
                {labels.hasExpiry && <Th>Yaroqlilik</Th>}
                <Th>Kirim/Chiqim</Th>
              </tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <Td>{product.barcode}</Td>
                  <Td>{product.name}</Td>
                  <Td>{product.category}</Td>
                  <Td>{product.unit}</Td>
                  <Td>{formatUZS(product.costPrice)}</Td>
                  <Td>{formatUZS(product.sellPrice)}</Td>
                  <Td>
                    <span className={product.stock <= product.minStock ? "font-semibold text-amber-600" : ""}>
                      {product.stock}
                    </span>
                  </Td>
                  {labels.hasExpiry && <Td>{product.expiryDate ? formatDate(product.expiryDate) : "—"}</Td>}
                  <Td>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={getQty(product.id)}
                        onChange={(e) => setQtyById({ ...qtyById, [product.id]: Number(e.target.value) })}
                        className="h-8 w-16 rounded border border-gray-300 px-2 text-sm"
                      />
                      <button
                        onClick={() => handleAdjust(product.id, product.name, 1)}
                        className="rounded p-1 text-green-600 hover:bg-green-50"
                        title="Kirim"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleAdjust(product.id, product.name, -1)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Chiqim"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tugab borayotgan {labels.productNounPlural.toLowerCase()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">Hammasi yetarli</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <Badge tone="amber">
                    {p.stock} {p.unit}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {labels.hasExpiry && (
          <Card>
            <CardHeader>
              <CardTitle>Yaroqlilik muddati tugayotgan {labels.productNounPlural.toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiringSoon.length === 0 ? (
                <p className="text-sm text-gray-500">Yo&apos;q</p>
              ) : (
                expiringSoon.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>
                      {p.name} (parti: {p.batchNumber ?? "—"})
                    </span>
                    <Badge tone="red">{formatDate(p.expiryDate!)}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RawMaterialsTab() {
  const rawMaterials = useAppStore((s) => s.rawMaterials);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xomashyo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <Thead>
            <tr>
              <Th>Nomi</Th>
              <Th>Birlik</Th>
              <Th>Tannarx</Th>
              <Th>Qoldiq</Th>
              <Th>Min. qoldiq</Th>
            </tr>
          </Thead>
          <Tbody>
            {rawMaterials.map((rm) => (
              <tr key={rm.id}>
                <Td>{rm.name}</Td>
                <Td>{rm.unit}</Td>
                <Td>{formatUZS(rm.costPrice)}</Td>
                <Td>
                  <span className={rm.stock <= rm.minStock ? "font-semibold text-amber-600" : ""}>
                    {rm.stock.toFixed(2)}
                  </span>
                </Td>
                <Td>{rm.minStock}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RecipesTab() {
  const products = useAppStore((s) => s.products);
  const recipes = useAppStore((s) => s.recipes);
  const rawMaterials = useAppStore((s) => s.rawMaterials);
  const rawById = new Map(rawMaterials.map((rm) => [rm.id, rm]));
  const productById = new Map(products.map((p) => [p.id, p]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retseptura (1 dona uchun xomashyo sarfi)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipes.map((recipe) => {
          const product = productById.get(recipe.productId);
          return (
            <div key={recipe.id}>
              <p className="mb-2 text-sm font-semibold text-gray-800">{product?.name ?? recipe.productId}</p>
              <Table>
                <Thead>
                  <tr>
                    <Th>Xomashyo</Th>
                    <Th>Birlik</Th>
                    <Th>Sarfi</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recipe.ingredients.map((ingredient) => {
                    const rm = rawById.get(ingredient.rawMaterialId);
                    return (
                      <tr key={ingredient.rawMaterialId}>
                        <Td>{rm?.name ?? ingredient.rawMaterialId}</Td>
                        <Td>{rm?.unit}</Td>
                        <Td>{ingredient.qty}</Td>
                      </tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add inventory page with stock adjustments, raw materials, and recipes"
```

---

## Task 21: POS / Savdo page (`/pos`)

Implements the spec's checkout flow: barcode/name search, cart with discounts, payment method
selection, restaurant order-type + table number, pharmacy prescription capture, printable
receipt, and `recordSale` (with recipe auto-deduction and shortage warnings).

**Files:**
- Create: `src/app/pos/page.tsx`

- [ ] **Step 1: Implement the POS page**

`src/app/pos/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LABELS } from "@/lib/labels";
import { formatUZS, formatDateTime } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { OrderType, PaymentMethod, PrescriptionInfo, Sale, SaleItem } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const PAYMENT_METHODS: PaymentMethod[] = ["Naqd", "Karta", "Click", "Payme", "Uzum", "Aralash"];
const ORDER_TYPES: OrderType[] = ["Stolda", "Olib ketish", "Yetkazib berish"];

export default function PosPage() {
  const businessType = useAppStore((s) => s.businessType);
  const products = useAppStore((s) => s.products);
  const recordSale = useAppStore((s) => s.recordSale);
  const labels = LABELS[businessType];

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Naqd");
  const [orderType, setOrderType] = useState<OrderType>("Stolda");
  const [tableNumber, setTableNumber] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionInfo>({
    doctorName: "",
    patientName: "",
    prescriptionNumber: "",
  });
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [shortages, setShortages] = useState<string[]>([]);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  const needsPrescription =
    labels.hasPrescription &&
    cart.some((item) => products.find((p) => p.id === item.productId)?.prescriptionRequired);

  const total = cart.reduce((sum, item) => sum + item.qty * item.price - item.discount, 0);

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { productId: product.id, name: product.name, qty: 1, price: product.sellPrice, discount: 0 }];
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty } : item)));
  }

  function updateDiscount(productId: string, discount: number) {
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, discount } : item)));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleCheckout() {
    if (cart.length === 0) return;

    if (needsPrescription && !showPrescriptionForm) {
      setShowPrescriptionForm(true);
      return;
    }

    const session = getSession();
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      cashierName: session?.fullName ?? "Kassir",
      items: cart,
      total,
      paymentMethod,
      ...(businessType === "restaurant" ? { orderType, tableNumber: tableNumber || undefined } : {}),
      ...(needsPrescription && prescription.prescriptionNumber ? { prescription } : {}),
    };

    const newShortages = recordSale(sale);
    setShortages(newShortages);
    setReceipt(sale);
    setCart([]);
    setShowPrescriptionForm(false);
    setPrescription({ doctorName: "", patientName: "", prescriptionNumber: "" });
    setTableNumber("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">{labels.posTitle}</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{labels.productNounPlural}ni qidirish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-9"
                placeholder="Nomi yoki shtrix-kod bo'yicha qidirish"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product.id)}
                  className="flex flex-col items-start rounded-lg border border-gray-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="text-sm font-medium text-gray-800">{product.name}</span>
                  <span className="text-xs text-gray-500">{product.barcode}</span>
                  <span className="mt-1 text-sm font-semibold text-brand-700">{formatUZS(product.sellPrice)}</span>
                  <span className="text-xs text-gray-400">
                    Qoldiq: {product.stock} {product.unit}
                  </span>
                  {product.prescriptionRequired && (
                    <Badge tone="amber" className="mt-1">
                      Retsept kerak
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={16} /> Savatcha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">Savatcha bo&apos;sh</p>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="space-y-1 border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <button onClick={() => removeFromCart(item.productId)} className="text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="rounded p-1 hover:bg-gray-100">
                      <Minus size={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="rounded p-1 hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                    <span className="ml-auto">{formatUZS(item.price * item.qty - item.discount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Chegirma:</span>
                    <input
                      type="number"
                      min={0}
                      value={item.discount}
                      onChange={(e) => updateDiscount(item.productId, Number(e.target.value))}
                      className="h-7 w-24 rounded border border-gray-300 px-2"
                    />
                  </div>
                </div>
              ))
            )}

            <div>
              <label className="mb-1 block text-sm text-gray-600">To&apos;lov usuli</label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </div>

            {businessType === "restaurant" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Buyurtma turi</label>
                  <Select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}>
                    {ORDER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                {orderType === "Stolda" && (
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Stol raqami</label>
                    <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="masalan: 5" />
                  </div>
                )}
              </div>
            )}

            {needsPrescription && (
              <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                Diqqat: savatchada retsept asosida sotiladigan dori bor.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-base font-semibold">
              <span>Jami</span>
              <span>{formatUZS(total)}</span>
            </div>

            <Button className="w-full" onClick={handleCheckout} disabled={cart.length === 0}>
              To&apos;lash
            </Button>
          </CardContent>
        </Card>
      </div>

      <Modal open={showPrescriptionForm} onClose={() => setShowPrescriptionForm(false)} title="Retsept ma'lumotlari">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Shifokor F.I.Sh</label>
            <Input
              value={prescription.doctorName}
              onChange={(e) => setPrescription({ ...prescription, doctorName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Bemor F.I.Sh</label>
            <Input
              value={prescription.patientName}
              onChange={(e) => setPrescription({ ...prescription, patientName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Retsept raqami</label>
            <Input
              value={prescription.prescriptionNumber}
              onChange={(e) => setPrescription({ ...prescription, prescriptionNumber: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleCheckout}>
            Tasdiqlash va to&apos;lash
          </Button>
        </div>
      </Modal>

      <Modal open={receipt !== null} onClose={() => setReceipt(null)} title="Chek">
        {receipt && (
          <div className="space-y-3 text-sm">
            <div className="text-center">
              <p className="text-base font-semibold">Xorazm ERP</p>
              <p className="text-gray-500">{formatDateTime(receipt.date)}</p>
              <p className="text-gray-500">Kassir: {receipt.cashierName}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {receipt.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-1">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>{formatUZS(item.price * item.qty - item.discount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
              <span>Jami</span>
              <span>{formatUZS(receipt.total)}</span>
            </div>
            <p className="text-gray-500">To&apos;lov: {receipt.paymentMethod}</p>
            {shortages.length > 0 && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                Diqqat: yetarli xomashyo topilmadi — {shortages.join(", ")}
              </div>
            )}
            <Button className="w-full" onClick={() => setReceipt(null)}>
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add POS page with cart, payment methods, and receipt"
```

---

## Task 22: Moliya / Finance page (`/moliya`)

**Files:**
- Create: `src/app/moliya/page.tsx`

- [ ] **Step 1: Implement the finance page**

`src/app/moliya/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatUZS, formatDate } from "@/lib/format";
import { Debt, Expense, ExpenseCategory } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Soliq",
  "Elektr",
  "Gaz",
  "Suv",
  "Internet",
  "Ijara",
  "Ishchilar oyligi",
  "Boshqa",
];

export default function MoliyaPage() {
  const balance = useAppStore((s) => s.balance);
  const expenses = useAppStore((s) => s.expenses);
  const debts = useAppStore((s) => s.debts);
  const addExpense = useAppStore((s) => s.addExpense);
  const addDebt = useAppStore((s) => s.addDebt);
  const logActivity = useAppStore((s) => s.logActivity);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [debtOpen, setDebtOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: 0,
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [debtForm, setDebtForm] = useState({
    partyName: "",
    type: "receivable" as Debt["type"],
    amount: 0,
    dueDate: new Date().toISOString().slice(0, 10),
  });

  function handleAddExpense() {
    const expense: Expense = { id: `ex-${Date.now()}`, ...expenseForm };
    addExpense(expense);
    logActivity("buxgalter", `Yangi xarajat qo'shildi: ${expense.category} — ${formatUZS(expense.amount)}`);
    setExpenseOpen(false);
    setExpenseForm({ category: EXPENSE_CATEGORIES[0], amount: 0, note: "", date: new Date().toISOString().slice(0, 10) });
  }

  function handleAddDebt() {
    const debt: Debt = { id: `debt-${Date.now()}`, ...debtForm };
    addDebt(debt);
    logActivity("buxgalter", `Yangi qarz qo'shildi: ${debt.partyName} — ${formatUZS(debt.amount)}`);
    setDebtOpen(false);
    setDebtForm({ partyName: "", type: "receivable", amount: 0, dueDate: new Date().toISOString().slice(0, 10) });
  }

  const receivables = debts.filter((d) => d.type === "receivable");
  const payables = debts.filter((d) => d.type === "payable");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Moliya</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Kassadagi pul</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(balance.cash)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Bankdagi pul</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(balance.bank)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Umumiy aktivlar</p>
            <p className="mt-1 text-lg font-semibold text-green-600">{formatUZS(balance.cash + balance.bank)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Xarajatlar</CardTitle>
          <Button size="sm" onClick={() => setExpenseOpen(true)}>
            <Plus size={16} /> Xarajat qo&apos;shish
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Sana</Th>
                <Th>Turkum</Th>
                <Th>Summa</Th>
                <Th>Izoh</Th>
              </tr>
            </Thead>
            <Tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <Td>{formatDate(expense.date)}</Td>
                  <Td>{expense.category}</Td>
                  <Td>{formatUZS(expense.amount)}</Td>
                  <Td>{expense.note}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Olinadigan qarzlar</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setDebtOpen(true)}>
              <Plus size={16} /> Qarz qo&apos;shish
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <tr>
                  <Th>Tomon</Th>
                  <Th>Summa</Th>
                  <Th>Muddat</Th>
                </tr>
              </Thead>
              <Tbody>
                {receivables.map((debt) => (
                  <tr key={debt.id}>
                    <Td>{debt.partyName}</Td>
                    <Td>{formatUZS(debt.amount)}</Td>
                    <Td>{formatDate(debt.dueDate)}</Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beriladigan qarzlar</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <tr>
                  <Th>Tomon</Th>
                  <Th>Summa</Th>
                  <Th>Muddat</Th>
                </tr>
              </Thead>
              <Tbody>
                {payables.map((debt) => (
                  <tr key={debt.id}>
                    <Td>{debt.partyName}</Td>
                    <Td>{formatUZS(debt.amount)}</Td>
                    <Td>{formatDate(debt.dueDate)}</Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Yangi xarajat">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Turkum</label>
            <Select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Summa (so&apos;m)</label>
            <Input
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Sana</label>
            <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Izoh</label>
            <Input value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
          </div>
          <Button className="w-full" onClick={handleAddExpense}>
            Saqlash
          </Button>
        </div>
      </Modal>

      <Modal open={debtOpen} onClose={() => setDebtOpen(false)} title="Yangi qarz">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Tomon nomi</label>
            <Input value={debtForm.partyName} onChange={(e) => setDebtForm({ ...debtForm, partyName: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Turi</label>
            <Select value={debtForm.type} onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value as Debt["type"] })}>
              <option value="receivable">Olinadigan</option>
              <option value="payable">Beriladigan</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Summa (so&apos;m)</label>
            <Input
              type="number"
              value={debtForm.amount}
              onChange={(e) => setDebtForm({ ...debtForm, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Muddat</label>
            <Input type="date" value={debtForm.dueDate} onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })} />
          </div>
          <Button className="w-full" onClick={handleAddDebt}>
            Saqlash
          </Button>
        </div>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add finance page with balances, expenses, and debts"
```

---

## Task 23: Hamkorlar / Partners pages (`/hamkorlar`, `/hamkorlar/[id]`)

**Files:**
- Create: `src/app/hamkorlar/page.tsx`
- Create: `src/app/hamkorlar/[id]/page.tsx`

- [ ] **Step 1: Implement the partners list page**

`src/app/hamkorlar/page.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";

export default function HamkorlarPage() {
  const partners = useAppStore((s) => s.partners);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Hamkorlar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Yetkazib beruvchilar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Kompaniya</Th>
                <Th>Telefon</Th>
                <Th>Manzil</Th>
                <Th>STIR</Th>
              </tr>
            </Thead>
            <Tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <Td>
                    <Link href={`/hamkorlar/${partner.id}`} className="font-medium text-brand-700 hover:underline">
                      {partner.companyName}
                    </Link>
                  </Td>
                  <Td>{partner.phone}</Td>
                  <Td>{partner.address}</Td>
                  <Td>{partner.taxId}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Implement the partner detail page**

`src/app/hamkorlar/[id]/page.tsx`:
```tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatUZS, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const partners = useAppStore((s) => s.partners);
  const partner = partners.find((p) => p.id === params.id);

  if (!partner) {
    return (
      <div className="space-y-4">
        <Link href="/hamkorlar" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
          <ArrowLeft size={16} /> Hamkorlar
        </Link>
        <p className="text-sm text-gray-500">Hamkor topilmadi</p>
      </div>
    );
  }

  let runningBalance = 0;

  return (
    <div className="space-y-4">
      <Link href="/hamkorlar" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <ArrowLeft size={16} /> Hamkorlar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{partner.companyName}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-gray-500">Telefon:</span> {partner.phone}
          </p>
          <p>
            <span className="text-gray-500">Manzil:</span> {partner.address}
          </p>
          <p>
            <span className="text-gray-500">STIR:</span> {partner.taxId}
          </p>
          <p>
            <span className="text-gray-500">Bank:</span> {partner.bankDetails}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yetkazmalar tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Sana</Th>
                <Th>Mahsulotlar</Th>
                <Th>Soni</Th>
                <Th>Summa</Th>
                <Th>To&apos;langan</Th>
                <Th>Qoldiq qarz</Th>
              </tr>
            </Thead>
            <Tbody>
              {partner.transactions.map((tx, index) => {
                runningBalance += tx.total - tx.paid;
                return (
                  <tr key={index}>
                    <Td>{formatDate(tx.date)}</Td>
                    <Td>{tx.productsDelivered}</Td>
                    <Td>{tx.qty}</Td>
                    <Td>{formatUZS(tx.total)}</Td>
                    <Td>{formatUZS(tx.paid)}</Td>
                    <Td className={runningBalance > 0 ? "font-semibold text-red-600" : ""}>{formatUZS(runningBalance)}</Td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add partners list and partner detail pages"
```

---

## Task 24: Mijozlar / Customers page (`/mijozlar`)

**Files:**
- Create: `src/app/mijozlar/page.tsx`

- [ ] **Step 1: Implement the customers page**

`src/app/mijozlar/page.tsx`:
```tsx
"use client";

import { useAppStore } from "@/lib/store";
import { formatUZS } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function MijozlarPage() {
  const customers = useAppStore((s) => s.customers);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Mijozlar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mijozlar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>F.I.Sh</Th>
                <Th>Telefon</Th>
                <Th>Bonus karta</Th>
                <Th>Chegirma</Th>
                <Th>Qarzdorlik</Th>
                <Th>Xaridlar soni</Th>
                <Th>Jami xarid</Th>
              </tr>
            </Thead>
            <Tbody>
              {customers.map((customer) => {
                const totalPurchases = customer.purchaseHistory.reduce((sum, p) => sum + p.total, 0);
                return (
                  <tr key={customer.id}>
                    <Td>{customer.fullName}</Td>
                    <Td>{customer.phone}</Td>
                    <Td>{customer.bonusCardPercent}%</Td>
                    <Td>{customer.discount}%</Td>
                    <Td>
                      {customer.debt > 0 ? (
                        <Badge tone="red">{formatUZS(customer.debt)}</Badge>
                      ) : (
                        <Badge tone="green">Yo&apos;q</Badge>
                      )}
                    </Td>
                    <Td>{customer.purchaseHistory.length}</Td>
                    <Td>{formatUZS(totalPurchases)}</Td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add customers page with bonus cards and debt status"
```

---

## Task 25: Hisobotlar / Reports page (`/hisobotlar`)

**Files:**
- Create: `src/app/hisobotlar/page.tsx`

- [ ] **Step 1: Implement the reports page with Kunlik/Haftalik/Oylik/Yillik tabs, a Recharts bar chart, and a Top-10 products table**

`src/app/hisobotlar/page.tsx`:
```tsx
"use client";

import { useAppStore } from "@/lib/store";
import { formatUZS } from "@/lib/format";
import { filterSalesByPeriod, totalSales, topProducts, ReportPeriod } from "@/lib/logic/reports";
import { Sale } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  daily: "Kunlik",
  weekly: "Haftalik",
  monthly: "Oylik",
  yearly: "Yillik",
};

function isInPeriod(iso: string, period: ReportPeriod, reference: Date): boolean {
  const date = new Date(iso);
  if (period === "daily") {
    return (
      date.getFullYear() === reference.getFullYear() &&
      date.getMonth() === reference.getMonth() &&
      date.getDate() === reference.getDate()
    );
  }
  if (period === "weekly") {
    const diffDays = (reference.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 7;
  }
  if (period === "monthly") {
    return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
  }
  return date.getFullYear() === reference.getFullYear();
}

export default function HisobotlarPage() {
  const sales = useAppStore((s) => s.sales);
  const expenses = useAppStore((s) => s.expenses);
  const periods: ReportPeriod[] = ["daily", "weekly", "monthly", "yearly"];
  const expenseDates = expenses.map((e) => ({ date: e.date, amount: e.amount }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Hisobotlar</h1>
      <Tabs
        tabs={periods.map((period) => ({
          id: period,
          label: PERIOD_LABELS[period],
          content: <ReportTab period={period} sales={sales} expenses={expenseDates} />,
        }))}
      />
    </div>
  );
}

function ReportTab({
  period,
  sales,
  expenses,
}: {
  period: ReportPeriod;
  sales: Sale[];
  expenses: { date: string; amount: number }[];
}) {
  const reference = new Date();
  const periodSales = filterSalesByPeriod(sales, period, reference);
  const revenue = totalSales(periodSales);
  const periodExpenses = expenses
    .filter((e) => isInPeriod(e.date, period, reference))
    .reduce((sum, e) => sum + e.amount, 0);
  const profit = revenue - periodExpenses;
  const top = topProducts(periodSales, 10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Savdo</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{formatUZS(revenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Xarajatlar</p>
            <p className="mt-1 text-lg font-semibold text-red-600">{formatUZS(periodExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500">Sof foyda</p>
            <p className="mt-1 text-lg font-semibold text-green-600">{formatUZS(profit)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top mahsulotlar (tushum bo&apos;yicha)</CardTitle>
        </CardHeader>
        <CardContent>
          {top.length === 0 ? (
            <p className="text-sm text-gray-500">Bu davrda savdo yo&apos;q</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatUZS(value)} />
                  <Bar dataKey="revenue" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top-10 mahsulotlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Nomi</Th>
                <Th>Sotilgan soni</Th>
                <Th>Tushum</Th>
              </tr>
            </Thead>
            <Tbody>
              {top.map((item) => (
                <tr key={item.productId}>
                  <Td>{item.name}</Td>
                  <Td>{item.qtySold}</Td>
                  <Td>{formatUZS(item.revenue)}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add reports page with period tabs, chart, and top products"
```

---

## Task 26: Sozlamalar / Settings page (`/sozlamalar`)

**Files:**
- Create: `src/app/sozlamalar/page.tsx`

- [ ] **Step 1: Implement the settings page**

`src/app/sozlamalar/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Database, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { USERS } from "@/lib/seed/users";
import { BUSINESS_TYPE_NAMES } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { BusinessType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BUSINESS_TYPES: BusinessType[] = ["supermarket", "pharmacy", "restaurant"];

export default function SozlamalarPage() {
  const businessType = useAppStore((s) => s.businessType);
  const setBusinessType = useAppStore((s) => s.setBusinessType);
  const activityLog = useAppStore((s) => s.activityLog);
  const logActivity = useAppStore((s) => s.logActivity);
  const [backupMessage, setBackupMessage] = useState("");

  function handleBackup() {
    logActivity("admin", "Zaxira nusxa yaratildi");
    setBackupMessage(`Zaxira nusxa muvaffaqiyatli yaratildi (${formatDateTime(new Date().toISOString())})`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Sozlamalar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Biznes turi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500">
            Biznes turini o&apos;zgartirish demo ma&apos;lumotlarni qayta yuklaydi (mahsulotlar, xodimlar, savdo
            tarixi va boshqalar).
          </p>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type) => (
              <Button
                key={type}
                variant={businessType === type ? "primary" : "outline"}
                onClick={() => setBusinessType(type)}
              >
                {BUSINESS_TYPE_NAMES[type]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foydalanuvchilar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Login</Th>
                <Th>F.I.Sh</Th>
                <Th>Rol</Th>
                <Th>Holat</Th>
              </tr>
            </Thead>
            <Tbody>
              {USERS.map((user) => (
                <tr key={user.id}>
                  <Td>{user.username}</Td>
                  <Td>{user.fullName}</Td>
                  <Td>{user.role}</Td>
                  <Td>
                    <Badge tone={user.active ? "green" : "gray"}>{user.active ? "Faol" : "Faol emas"}</Badge>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faoliyat jurnali</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Vaqt</Th>
                <Th>Foydalanuvchi</Th>
                <Th>Amal</Th>
              </tr>
            </Thead>
            <Tbody>
              {activityLog.slice(0, 20).map((entry) => (
                <tr key={entry.id}>
                  <Td>{formatDateTime(entry.timestamp)}</Td>
                  <Td>{entry.user}</Td>
                  <Td>{entry.action}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zaxira nusxa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={handleBackup}>
            <Database size={16} /> Zaxira nusxa yaratish
          </Button>
          {backupMessage && (
            <p className="flex items-center gap-1 text-sm text-green-600">
              <Check size={14} /> {backupMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add settings page with business-type switcher, users, and activity log"
```

---

## Task 27: Final build verification, full click-through, and README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: PASS — all `format.test.ts`, `sales.test.ts`, `payroll.test.ts`, `reports.test.ts` tests green.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: build completes with no type errors. If any page errors on static generation because it
reads `localStorage`/`document` at build time, confirm the offending component has `"use client"`
at the top (all pages and the store already do) — Next.js still prerenders client components on
the server for the initial HTML, but `useHydratedStore`/`getSession` guard `document`/`localStorage`
access with `typeof document === "undefined"` checks or `useEffect`, so this should pass cleanly.

- [ ] **Step 3: Manual click-through (start the dev server)**

Run: `npm run dev`, then in a browser:
1. Visit `http://localhost:3000` → should redirect to `/login`.
2. Log in as `admin` / `admin123` → should land on the Dashboard with KPI cards, recent sales, and a top-products table.
3. Visit each sidebar link (Ishchilar, Ombor, Savdo, Moliya, Hamkorlar, Mijozlar, Hisobotlar, Sozlamalar) and confirm each renders without errors.
4. On `/pos`, add a couple of products to the cart, choose a payment method, and complete a sale — confirm the receipt modal appears and the Dashboard's "Bugungi savdo" updates after navigating back.
5. On `/sozlamalar`, switch business type to "Apteka" — confirm the sidebar/labels relabel (Ombor → "Dorixona ombori", Savdo title unchanged, products become dorilar with expiry dates) and `/ombor` shows the "Yaroqlilik muddati tugayotgan dorilar" list.
6. Switch business type to "Milliy taomlar" — confirm `/ombor` now shows "Xomashyo" and "Retseptura" tabs, and that completing a sale on `/pos` for a recipe-linked product (e.g. a somsa) decrements the corresponding raw material stock (check the Xomashyo tab before and after).
7. Switch business type back to "Supermarket" to leave the demo in its default state, then log out via the header button and confirm it redirects back to `/login`.

Stop the dev server once verified.

- [ ] **Step 4: Write the README**

`README.md`:
```markdown
# Xorazm ERP — Frontend Demo

A clickable frontend demo of "Xorazm ERP", a unified business-management system that can present
itself as a **Supermarket**, **Pharmacy (Apteka)**, or **Restaurant (Milliy taomlar)** depending on
a business-type setting. Built to show a prospective client the full set of modules from the
original specification before committing to a real backend.

## Tech stack

- Next.js 14 (App Router) + TypeScript
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
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add README with setup, demo accounts, and security notes"
```

---

## Task 28: Push to GitHub and deploy to Vercel

**Files:** none (git/deploy operations only)

- [ ] **Step 1: Check for an existing remote**

Run: `git remote -v`

If no `origin` remote is configured, add it:
```bash
git remote add origin https://github.com/davronbek-malikov/xorazm.git
```

- [ ] **Step 2: Push the main branch**

```bash
git push -u origin main
```

If the remote repository already has commits (e.g. an initial README created on GitHub) and the
push is rejected as non-fast-forward, do not force-push — instead pull and rebase first:
```bash
git pull --rebase origin main
git push -u origin main
```
Resolve any conflicts before continuing (there should be none for a fresh demo repo).

- [ ] **Step 3: Check Vercel CLI auth and project link**

```bash
npx vercel whoami
```

- If this prints a username, the CLI is authenticated. Run `npx vercel link` and choose the
  existing `xorazm-alpha` project when prompted (links this folder to that Vercel project via
  `.vercel/project.json`, which is gitignored).
- If this prints an error asking to log in, **stop and tell the user**: run `npx vercel login`
  interactively in their own terminal (this opens a browser for authentication and cannot be
  done non-interactively), then re-run this task from Step 3.

- [ ] **Step 4: Deploy to production**

```bash
npx vercel --prod
```

This builds and deploys the project, printing a production URL
(e.g. `https://xorazm-alpha.vercel.app` or a generated alias).

- [ ] **Step 5: Verify the live deployment**

Fetch the printed production URL and confirm it redirects to `/login` and the login page renders
(same checks as Task 27 Step 3, but against the live URL). Log in with `admin` / `admin123` and
confirm the Dashboard loads with seeded data.

- [ ] **Step 6: Report back to the user**

Reply with:
- The live URL from Step 4.
- The demo credentials table from the README.
- A one-line reminder that this is a frontend-only demo (no backend/database) per the security
  notes, and that switching business type in Sozlamalar reseeds the data.

---
