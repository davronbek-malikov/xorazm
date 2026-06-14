"use client";

import { useState } from "react";
import { Database, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { USERS } from "@/lib/seed/users";
import { BUSINESS_TYPE_NAMES } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { BusinessType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BUSINESS_TYPES: BusinessType[] = ["supermarket", "pharmacy", "restaurant"];

export default function SozlamalarPage() {
  const businessType = useAppStore((s) => s.businessType);
  const setBusinessType = useAppStore((s) => s.setBusinessType);
  const activityLog = useAppStore((s) => s.activityLog);
  const logActivity = useAppStore((s) => s.logActivity);
  const [backupMessage, setBackupMessage] = useState("");

  function handleBackup() {
    logActivity("admin", "Zaxira nusxa yaratildi");
    setBackupMessage(`Zaxira nusxa muvaffaqiyatli yaratildi (${formatDateTime(new Date().toISOString())})`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Sozlamalar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Biznes turi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-gray-500">
            Biznes turini o&apos;zgartirish demo ma&apos;lumotlarni qayta yuklaydi (mahsulotlar, xodimlar, savdo
            tarixi va boshqalar).
          </p>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_TYPES.map((type) => (
              <Button
                key={type}
                variant={businessType === type ? "primary" : "outline"}
                onClick={() => setBusinessType(type)}
              >
                {BUSINESS_TYPE_NAMES[type]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Foydalanuvchilar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Login</Th>
                <Th>F.I.Sh</Th>
                <Th>Rol</Th>
                <Th>Holat</Th>
              </tr>
            </Thead>
            <Tbody>
              {USERS.map((user) => (
                <tr key={user.id}>
                  <Td>{user.username}</Td>
                  <Td>{user.fullName}</Td>
                  <Td>{user.role}</Td>
                  <Td>
                    <Badge tone={user.active ? "green" : "gray"}>{user.active ? "Faol" : "Faol emas"}</Badge>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faoliyat jurnali</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Vaqt</Th>
                <Th>Foydalanuvchi</Th>
                <Th>Amal</Th>
              </tr>
            </Thead>
            <Tbody>
              {activityLog.slice(0, 20).map((entry) => (
                <tr key={entry.id}>
                  <Td>{formatDateTime(entry.timestamp)}</Td>
                  <Td>{entry.user}</Td>
                  <Td>{entry.action}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zaxira nusxa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={handleBackup}>
            <Database size={16} /> Zaxira nusxa yaratish
          </Button>
          {backupMessage && (
            <p className="flex items-center gap-1 text-sm text-green-600">
              <Check size={14} /> {backupMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
