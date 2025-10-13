import React from "react";
import { Card } from "@/components/ui/card";

export interface CartItemLike { id?: string; name: string; price: number; quantity: number }

export default function CartSummaryWeb({ items }: { items: CartItemLike[] }) {
  const safe = Array.isArray(items) ? items : [];
  const total = safe.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.quantity)||0), 0);
  if (safe.length === 0) {
    return (
      <Card className="p-3 text-sm text-muted-foreground">Your cart is empty. Add items from the menu.</Card>
    );
  }
  return (
    <div>
      <div className="text-sm font-semibold mb-1">Your Items</div>
      <ul className="rounded-xl border border-border overflow-hidden">
        {safe.map((it, idx) => (
          <li key={(it.id || it.name) + String(idx)} className="flex items-center justify-between p-3 bg-card border-b last:border-b-0">
            <div className="text-sm">{it.quantity} x {it.name}</div>
            <div className="text-sm">{((Number(it.price)||0) * (Number(it.quantity)||0)).toFixed(2)}</div>
          </li>
        ))}
        <li className="flex items-center justify-between p-3 bg-card">
          <div className="font-semibold">Total</div>
          <div className="font-semibold">{total.toFixed(2)}</div>
        </li>
      </ul>
    </div>
  );
}
