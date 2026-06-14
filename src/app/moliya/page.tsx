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
