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
                  <Tooltip formatter={(value) => formatUZS(Number(value))} />
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
