"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatUZS, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const partners = useAppStore((s) => s.partners);
  const partner = partners.find((p) => p.id === params.id);

  if (!partner) {
    return (
      <div className="space-y-4">
        <Link href="/hamkorlar" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
          <ArrowLeft size={16} /> Hamkorlar
        </Link>
        <p className="text-sm text-gray-500">Hamkor topilmadi</p>
      </div>
    );
  }

  let runningBalance = 0;

  return (
    <div className="space-y-4">
      <Link href="/hamkorlar" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <ArrowLeft size={16} /> Hamkorlar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{partner.companyName}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-gray-500">Telefon:</span> {partner.phone}
          </p>
          <p>
            <span className="text-gray-500">Manzil:</span> {partner.address}
          </p>
          <p>
            <span className="text-gray-500">STIR:</span> {partner.taxId}
          </p>
          <p>
            <span className="text-gray-500">Bank:</span> {partner.bankDetails}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yetkazmalar tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Sana</Th>
                <Th>Mahsulotlar</Th>
                <Th>Soni</Th>
                <Th>Summa</Th>
                <Th>To&apos;langan</Th>
                <Th>Qoldiq qarz</Th>
              </tr>
            </Thead>
            <Tbody>
              {partner.transactions.map((tx, index) => {
                runningBalance += tx.total - tx.paid;
                return (
                  <tr key={index}>
                    <Td>{formatDate(tx.date)}</Td>
                    <Td>{tx.productsDelivered}</Td>
                    <Td>{tx.qty}</Td>
                    <Td>{formatUZS(tx.total)}</Td>
                    <Td>{formatUZS(tx.paid)}</Td>
                    <Td className={runningBalance > 0 ? "font-semibold text-red-600" : ""}>{formatUZS(runningBalance)}</Td>
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
