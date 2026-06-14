"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LABELS } from "@/lib/labels";
import { formatUZS, formatDate } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Th, Tbody, Td } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function OmborPage() {
  const businessType = useAppStore((s) => s.businessType);
  const labels = LABELS[businessType];

  const tabs = [{ id: "products", label: labels.productNounPlural, content: <ProductsTab /> }];
  if (labels.hasRawMaterials) {
    tabs.push({ id: "raw", label: "Xomashyo", content: <RawMaterialsTab /> });
  }
  if (labels.hasRecipes) {
    tabs.push({ id: "recipes", label: "Retseptura", content: <RecipesTab /> });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">{labels.warehouseName}</h1>
      <Tabs tabs={tabs} />
    </div>
  );
}

function ProductsTab() {
  const businessType = useAppStore((s) => s.businessType);
  const products = useAppStore((s) => s.products);
  const adjustStock = useAppStore((s) => s.adjustStock);
  const labels = LABELS[businessType];
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  function getQty(id: string) {
    return qtyById[id] ?? 1;
  }

  function handleAdjust(productId: string, productName: string, direction: 1 | -1) {
    const qty = getQty(productId);
    adjustStock(
      productId,
      direction * qty,
      `${productName}: ${direction > 0 ? "kirim" : "chiqim"} ${qty} dona`,
      "omborchi"
    );
  }

  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const expiringSoon = labels.hasExpiry
    ? products.filter((p) => {
        if (!p.expiryDate) return false;
        const days = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
      })
    : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{labels.productNounPlural}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Shtrix-kod</Th>
                <Th>Nomi</Th>
                <Th>Kategoriya</Th>
                <Th>Birlik</Th>
                <Th>Tannarx</Th>
                <Th>Sotish narxi</Th>
                <Th>Qoldiq</Th>
                {labels.hasExpiry && <Th>Yaroqlilik</Th>}
                <Th>Kirim/Chiqim</Th>
              </tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <Td>{product.barcode}</Td>
                  <Td>{product.name}</Td>
                  <Td>{product.category}</Td>
                  <Td>{product.unit}</Td>
                  <Td>{formatUZS(product.costPrice)}</Td>
                  <Td>{formatUZS(product.sellPrice)}</Td>
                  <Td>
                    <span className={product.stock <= product.minStock ? "font-semibold text-amber-600" : ""}>
                      {product.stock}
                    </span>
                  </Td>
                  {labels.hasExpiry && <Td>{product.expiryDate ? formatDate(product.expiryDate) : "—"}</Td>}
                  <Td>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={getQty(product.id)}
                        onChange={(e) => setQtyById({ ...qtyById, [product.id]: Number(e.target.value) })}
                        className="h-8 w-16 rounded border border-gray-300 px-2 text-sm"
                      />
                      <button
                        onClick={() => handleAdjust(product.id, product.name, 1)}
                        className="rounded p-1 text-green-600 hover:bg-green-50"
                        title="Kirim"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleAdjust(product.id, product.name, -1)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        title="Chiqim"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tugab borayotgan {labels.productNounPlural.toLowerCase()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">Hammasi yetarli</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <Badge tone="amber">
                    {p.stock} {p.unit}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {labels.hasExpiry && (
          <Card>
            <CardHeader>
              <CardTitle>Yaroqlilik muddati tugayotgan {labels.productNounPlural.toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expiringSoon.length === 0 ? (
                <p className="text-sm text-gray-500">Yo&apos;q</p>
              ) : (
                expiringSoon.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>
                      {p.name} (parti: {p.batchNumber ?? "—"})
                    </span>
                    <Badge tone="red">{formatDate(p.expiryDate!)}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RawMaterialsTab() {
  const rawMaterials = useAppStore((s) => s.rawMaterials);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xomashyo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <Thead>
            <tr>
              <Th>Nomi</Th>
              <Th>Birlik</Th>
              <Th>Tannarx</Th>
              <Th>Qoldiq</Th>
              <Th>Min. qoldiq</Th>
            </tr>
          </Thead>
          <Tbody>
            {rawMaterials.map((rm) => (
              <tr key={rm.id}>
                <Td>{rm.name}</Td>
                <Td>{rm.unit}</Td>
                <Td>{formatUZS(rm.costPrice)}</Td>
                <Td>
                  <span className={rm.stock <= rm.minStock ? "font-semibold text-amber-600" : ""}>
                    {rm.stock.toFixed(2)}
                  </span>
                </Td>
                <Td>{rm.minStock}</Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RecipesTab() {
  const products = useAppStore((s) => s.products);
  const recipes = useAppStore((s) => s.recipes);
  const rawMaterials = useAppStore((s) => s.rawMaterials);
  const rawById = new Map(rawMaterials.map((rm) => [rm.id, rm]));
  const productById = new Map(products.map((p) => [p.id, p]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retseptura (1 dona uchun xomashyo sarfi)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipes.map((recipe) => {
          const product = productById.get(recipe.productId);
          return (
            <div key={recipe.id}>
              <p className="mb-2 text-sm font-semibold text-gray-800">{product?.name ?? recipe.productId}</p>
              <Table>
                <Thead>
                  <tr>
                    <Th>Xomashyo</Th>
                    <Th>Birlik</Th>
                    <Th>Sarfi</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {recipe.ingredients.map((ingredient) => {
                    const rm = rawById.get(ingredient.rawMaterialId);
                    return (
                      <tr key={ingredient.rawMaterialId}>
                        <Td>{rm?.name ?? ingredient.rawMaterialId}</Td>
                        <Td>{rm?.unit}</Td>
                        <Td>{ingredient.qty}</Td>
                      </tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
