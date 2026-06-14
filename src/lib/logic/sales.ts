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
