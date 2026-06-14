"use client";

import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LABELS } from "@/lib/labels";
import { formatUZS, formatDateTime } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { OrderType, PaymentMethod, PrescriptionInfo, Sale, SaleItem } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const PAYMENT_METHODS: PaymentMethod[] = ["Naqd", "Karta", "Click", "Payme", "Uzum", "Aralash"];
const ORDER_TYPES: OrderType[] = ["Stolda", "Olib ketish", "Yetkazib berish"];

export default function PosPage() {
  const businessType = useAppStore((s) => s.businessType);
  const products = useAppStore((s) => s.products);
  const recordSale = useAppStore((s) => s.recordSale);
  const labels = LABELS[businessType];

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Naqd");
  const [orderType, setOrderType] = useState<OrderType>("Stolda");
  const [tableNumber, setTableNumber] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionInfo>({
    doctorName: "",
    patientName: "",
    prescriptionNumber: "",
  });
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [shortages, setShortages] = useState<string[]>([]);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  const needsPrescription =
    labels.hasPrescription &&
    cart.some((item) => products.find((p) => p.id === item.productId)?.prescriptionRequired);

  const total = cart.reduce((sum, item) => sum + item.qty * item.price - item.discount, 0);

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) => (item.productId === productId ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { productId: product.id, name: product.name, qty: 1, price: product.sellPrice, discount: 0 }];
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, qty } : item)));
  }

  function updateDiscount(productId: string, discount: number) {
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, discount } : item)));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function handleCheckout() {
    if (cart.length === 0) return;

    if (needsPrescription && !showPrescriptionForm) {
      setShowPrescriptionForm(true);
      return;
    }

    const session = getSession();
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      cashierName: session?.fullName ?? "Kassir",
      items: cart,
      total,
      paymentMethod,
      ...(businessType === "restaurant" ? { orderType, tableNumber: tableNumber || undefined } : {}),
      ...(needsPrescription && prescription.prescriptionNumber ? { prescription } : {}),
    };

    const newShortages = recordSale(sale);
    setShortages(newShortages);
    setReceipt(sale);
    setCart([]);
    setShowPrescriptionForm(false);
    setPrescription({ doctorName: "", patientName: "", prescriptionNumber: "" });
    setTableNumber("");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">{labels.posTitle}</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{labels.productNounPlural}ni qidirish</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-9"
                placeholder="Nomi yoki shtrix-kod bo'yicha qidirish"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product.id)}
                  className="flex flex-col items-start rounded-lg border border-gray-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="text-sm font-medium text-gray-800">{product.name}</span>
                  <span className="text-xs text-gray-500">{product.barcode}</span>
                  <span className="mt-1 text-sm font-semibold text-brand-700">{formatUZS(product.sellPrice)}</span>
                  <span className="text-xs text-gray-400">
                    Qoldiq: {product.stock} {product.unit}
                  </span>
                  {product.prescriptionRequired && (
                    <Badge tone="amber" className="mt-1">
                      Retsept kerak
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={16} /> Savatcha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">Savatcha bo&apos;sh</p>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="space-y-1 border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <button onClick={() => removeFromCart(item.productId)} className="text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="rounded p-1 hover:bg-gray-100">
                      <Minus size={14} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="rounded p-1 hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                    <span className="ml-auto">{formatUZS(item.price * item.qty - item.discount)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Chegirma:</span>
                    <input
                      type="number"
                      min={0}
                      value={item.discount}
                      onChange={(e) => updateDiscount(item.productId, Number(e.target.value))}
                      className="h-7 w-24 rounded border border-gray-300 px-2"
                    />
                  </div>
                </div>
              ))
            )}

            <div>
              <label className="mb-1 block text-sm text-gray-600">To&apos;lov usuli</label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </div>

            {businessType === "restaurant" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Buyurtma turi</label>
                  <Select value={orderType} onChange={(e) => setOrderType(e.target.value as OrderType)}>
                    {ORDER_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                {orderType === "Stolda" && (
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Stol raqami</label>
                    <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="masalan: 5" />
                  </div>
                )}
              </div>
            )}

            {needsPrescription && (
              <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                Diqqat: savatchada retsept asosida sotiladigan dori bor.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-base font-semibold">
              <span>Jami</span>
              <span>{formatUZS(total)}</span>
            </div>

            <Button className="w-full" onClick={handleCheckout} disabled={cart.length === 0}>
              To&apos;lash
            </Button>
          </CardContent>
        </Card>
      </div>

      <Modal open={showPrescriptionForm} onClose={() => setShowPrescriptionForm(false)} title="Retsept ma'lumotlari">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Shifokor F.I.Sh</label>
            <Input
              value={prescription.doctorName}
              onChange={(e) => setPrescription({ ...prescription, doctorName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Bemor F.I.Sh</label>
            <Input
              value={prescription.patientName}
              onChange={(e) => setPrescription({ ...prescription, patientName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Retsept raqami</label>
            <Input
              value={prescription.prescriptionNumber}
              onChange={(e) => setPrescription({ ...prescription, prescriptionNumber: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleCheckout}>
            Tasdiqlash va to&apos;lash
          </Button>
        </div>
      </Modal>

      <Modal open={receipt !== null} onClose={() => setReceipt(null)} title="Chek">
        {receipt && (
          <div className="space-y-3 text-sm">
            <div className="text-center">
              <p className="text-base font-semibold">Xorazm ERP</p>
              <p className="text-gray-500">{formatDateTime(receipt.date)}</p>
              <p className="text-gray-500">Kassir: {receipt.cashierName}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {receipt.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-1">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>{formatUZS(item.price * item.qty - item.discount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
              <span>Jami</span>
              <span>{formatUZS(receipt.total)}</span>
            </div>
            <p className="text-gray-500">To&apos;lov: {receipt.paymentMethod}</p>
            {shortages.length > 0 && (
              <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                Diqqat: yetarli xomashyo topilmadi — {shortages.join(", ")}
              </div>
            )}
            <Button className="w-full" onClick={() => setReceipt(null)}>
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
