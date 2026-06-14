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
