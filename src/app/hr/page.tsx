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
