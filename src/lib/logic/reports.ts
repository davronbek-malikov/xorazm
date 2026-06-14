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
