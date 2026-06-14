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
