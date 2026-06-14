"use client";

import { useAppStore } from "@/lib/store";
import { formatUZS } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function MijozlarPage() {
  const customers = useAppStore((s) => s.customers);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Mijozlar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mijozlar ro&apos;yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>F.I.Sh</Th>
                <Th>Telefon</Th>
                <Th>Bonus karta</Th>
                <Th>Chegirma</Th>
                <Th>Qarzdorlik</Th>
                <Th>Xaridlar soni</Th>
                <Th>Jami xarid</Th>
              </tr>
            </Thead>
            <Tbody>
              {customers.map((customer) => {
                const totalPurchases = customer.purchaseHistory.reduce((sum, p) => sum + p.total, 0);
                return (
                  <tr key={customer.id}>
                    <Td>{customer.fullName}</Td>
                    <Td>{customer.phone}</Td>
                    <Td>{customer.bonusCardPercent}%</Td>
                    <Td>{customer.discount}%</Td>
                    <Td>
                      {customer.debt > 0 ? (
                        <Badge tone="red">{formatUZS(customer.debt)}</Badge>
                      ) : (
                        <Badge tone="green">Yo&apos;q</Badge>
                      )}
                    </Td>
                    <Td>{customer.purchaseHistory.length}</Td>
                    <Td>{formatUZS(totalPurchases)}</Td>
                  </tr>
                );
              })}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
