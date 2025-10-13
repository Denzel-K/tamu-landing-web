import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";

export interface ProcessingOrderLikeWeb {
  id: string;
  items: { name: string; price: number; quantity: number }[];
  type: string;
  deliveryAddress?: string;
  partySize?: number;
  tableNumber?: string;
  restaurant?: { name?: string; id?: string };
  restaurantId?: string;
  status?: string;
}

interface Props {
  order: ProcessingOrderLikeWeb;
  onCancel?: () => void;
  onRefresh?: () => void;
}

export default function ProcessingOrderCardWeb({ order, onCancel, onRefresh }: Props) {
  const total = (order.items || []).reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const displayCode = order.id ? `#${order.id.slice(-6).toUpperCase()}` : "—";
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse['config'] | null>(null);
  const [showPay, setShowPay] = useState(false);

  const restaurantId = useMemo(() => {
    const id = String(order.restaurantId || order.restaurant?.id || "").trim();
    return id || undefined;
  }, [order.restaurantId, order.restaurant?.id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!restaurantId) return;
      try {
        const m = await fetchPaymentMethodsForRestaurant(restaurantId);
        if (mounted) setPaymentMethods(m || null);
      } catch {
        if (mounted) setPaymentMethods(null);
      }
      try {
        const pc = await fetchPaymentConfigForBusiness(restaurantId);
        if (mounted) setPaymentConfig(pc?.config || null);
      } catch {
        if (mounted) setPaymentConfig(null);
      }
    })();
    return () => { mounted = false };
  }, [restaurantId]);

  const status = String(order.status || 'pending').toLowerCase();

  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold">{order.restaurant?.name ?? 'Restaurant'}</div>
        <div className="text-sm text-muted-foreground">Order {displayCode}</div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-[11px] ${status === 'pending' ? 'bg-blue-500/20 text-blue-700' : status === 'preparing' ? 'bg-violet-500/20 text-violet-700' : status === 'completed' ? 'bg-green-500/20 text-green-700' : status === 'cancelled' ? 'bg-red-500/20 text-red-700' : 'bg-gray-500/20 text-gray-700'}`}>{status.toUpperCase()}</span>
      </div>

      <div className="rounded-xl border border-border overflow-hidden mb-3">
        {(order.items || []).map((it, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-card border-b last:border-b-0">
            <div className="text-sm">{it.quantity} x {it.name}</div>
            <div className="text-sm">{(it.price * it.quantity).toFixed(2)}</div>
          </div>
        ))}
        <div className="flex items-center justify-between p-3 bg-card">
          <div className="font-semibold">Total</div>
          <div className="font-semibold">{total.toFixed(2)}</div>
        </div>
      </div>

      {order.type === 'delivery' && order.deliveryAddress && (
        <div className="text-sm text-muted-foreground mb-3">Delivery to: {order.deliveryAddress}</div>
      )}

      <div className="flex gap-2">
        {status === 'pending' && (
          <Button onClick={() => setShowPay(true)} className="flex-1">Pay Now</Button>
        )}
        <Button variant="outline" className="flex-1" onClick={onRefresh}>Refresh</Button>
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
      </div>

      <PaymentMethodSheetWeb
        open={showPay}
        onOpenChange={setShowPay}
        context={{ serviceType: 'order', referenceId: String(order.id || ''), amount: total, businessId: String(restaurantId || ''), allowPayLater: true }}
        paymentMethods={paymentMethods}
        paymentConfig={paymentConfig}
        onSuccessPaid={() => { setShowPay(false); onRefresh?.(); }}
        onDeferCash={() => { setShowPay(false); onRefresh?.(); }}
        onSubmittedManual={() => { setShowPay(false); onRefresh?.(); }}
      />
    </Card>
  );
}
