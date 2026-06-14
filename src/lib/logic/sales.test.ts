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
