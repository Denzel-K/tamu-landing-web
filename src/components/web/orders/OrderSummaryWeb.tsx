import React from "react";

export interface OrderSummaryItem { name: string; price: number; quantity: number }

export default function OrderSummaryWeb({ items }: { items: OrderSummaryItem[] }) {
  const total = (items || []).reduce((s, it) => s + (Number(it.price)||0) * (Number(it.quantity)||0), 0);
  return (
    <div className="mt-2">
      <div className="text-sm font-semibold mb-1">Items</div>
      <ul className="rounded-xl border border-border overflow-hidden">
        {(items || []).map((it, idx) => (
          <li key={idx} className="flex items-center justify-between p-3 bg-card border-b last:border-b-0">
            <div className="text-sm">{it.quantity} x {it.name}</div>
            <div className="text-sm">{(Number(it.price)*Number(it.quantity)).toFixed(2)}</div>
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
