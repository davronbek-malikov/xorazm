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
