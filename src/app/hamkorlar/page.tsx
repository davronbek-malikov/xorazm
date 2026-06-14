"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";

export default function HamkorlarPage() {
  const partners = useAppStore((s) => s.partners);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">Hamkorlar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Yetkazib beruvchilar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Kompaniya</Th>
                <Th>Telefon</Th>
                <Th>Manzil</Th>
                <Th>STIR</Th>
              </tr>
            </Thead>
            <Tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <Td>
                    <Link href={`/hamkorlar/${partner.id}`} className="font-medium text-brand-700 hover:underline">
                      {partner.companyName}
                    </Link>
                  </Td>
                  <Td>{partner.phone}</Td>
                  <Td>{partner.address}</Td>
                  <Td>{partner.taxId}</Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
