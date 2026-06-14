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
