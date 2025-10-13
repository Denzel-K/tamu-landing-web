import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById, cancelOrder, type WebOrder } from "@/lib/api/orders";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { connectSocket, type SocketConnectionState, type ClientSocket } from "@/lib/realtime/socketClient";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<WebOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse['config'] | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [connState, setConnState] = useState<SocketConnectionState>('idle');
  const socketRef = useRef<ClientSocket | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrderById(id);
      setOrder(data?.order || null);
      // Prefetch payment context for this restaurant
      const bizId = data?.order?.restaurant?.id || "";
      if (bizId) {
        try {
          const methods = await fetchPaymentMethodsForRestaurant(bizId);
          setPaymentMethods(methods);
        } catch (err) {
          // non-fatal for page; log for diagnostics
          console.error("Failed to fetch payment methods", err);
        }
        try {
          const pc = await fetchPaymentConfigForBusiness(bizId);
          setPaymentConfig(pc?.config || null);
        } catch (err) {
          console.error("Failed to fetch payment config", err);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load order";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime via Socket.IO with fallback polling
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setConnState('connecting');
        const socket = await connectSocket();
        if (!mounted) return;
        socketRef.current = socket;
        socket.on('connect', () => setConnState('connected'));
        socket.on('disconnect', () => setConnState('disconnected'));
        socket.on('connect_error', () => setConnState('error'));
        socket.emit('order:subscribe', { orderId: id });
        socket.on('order:status', (payload: { orderId: string; status: string }) => {
          if (payload?.orderId === id) setOrder((prev) => prev ? { ...prev, status: payload.status } : prev);
        });
        socket.on('order:updated', (payload: { orderId: string; order: WebOrder }) => {
          if (payload?.orderId === id) setOrder(payload.order);
        });
      } catch (err) {
        console.error("Socket connection error", err);
        setConnState('error');
      }
    })();
    const interval = setInterval(() => {
      if (connState !== 'connected') void load();
    }, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
      if (socketRef.current) {
        try { socketRef.current.emit('order:unsubscribe', { orderId: id }); } catch (err) { console.error("Failed to unsubscribe order", err); }
        try { socketRef.current.disconnect(); } catch (err) { console.error("Failed to disconnect socket", err); }
        socketRef.current = null;
      }
    };
  }, [id, connState, load]);

  if (loading) return <div className="container mx-auto px-6 py-10">Loading…</div>;
  if (error || !order) return <div className="container mx-auto px-6 py-10 text-red-600">{error || "Order not found"}</div>;

  const mapped = {
    id: String(id || order.id),
    items: (order.items || []).map(it => ({ name: it.name, price: Number(it.price)||0, quantity: Number(it.quantity)||0 })),
    restaurant: { name: order.restaurant?.name, id: order.restaurant?.id },
    restaurantId: order.restaurant?.id,
    status: order.status,
  } as const;

  const subtotal = mapped.items.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.quantity)||0), 0);
  const paymentsReady = !!paymentMethods && !!paymentConfig;

  return (
    <div className="container mx-auto px-6 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.52-1.66-1.66a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.156-.094l3.83-5.204Z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <CardTitle>Order Placed</CardTitle>
              <div className="text-xs text-muted-foreground">We’re processing your order</div>
            </div>
            <div className="ml-auto">
              <span className={`px-2 py-1 rounded-full text-[11px] ${mapped.status === 'pending' ? 'bg-blue-500/20 text-blue-700' : mapped.status === 'confirmed' ? 'bg-green-500/20 text-green-700' : mapped.status === 'cancelled' ? 'bg-red-500/20 text-red-700' : 'bg-gray-500/20 text-gray-700'}`}>{String(mapped.status || 'pending').toUpperCase()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Restaurant</div>
              <div className="font-semibold">{mapped.restaurant?.name || 'Restaurant'}</div>
            </div>
            <div className="text-sm sm:text-right">
              <div className="text-muted-foreground">Order ID</div>
              <div className="font-mono">#{String(mapped.id).slice(-6).toUpperCase()}</div>
            </div>
          </div>

          {/* Items list */}
          <div>
            <div className="text-sm font-semibold mb-1">Items</div>
            <ul className="rounded-xl border border-border overflow-hidden">
              {mapped.items.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 bg-card border-b last:border-b-0">
                  <div className="text-sm">{it.quantity} x {it.name}</div>
                  <div className="text-sm">{((Number(it.price)||0) * (Number(it.quantity)||0)).toFixed(2)}</div>
                </li>
              ))}
              <li className="flex items-center justify-between p-3 bg-card">
                <div className="font-semibold">Subtotal</div>
                <div className="font-semibold">{subtotal.toFixed(2)}</div>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1"
              onClick={async () => {
                try {
                  if (!paymentMethods && mapped.restaurantId) {
                    const m = await fetchPaymentMethodsForRestaurant(mapped.restaurantId);
                    setPaymentMethods(m);
                  }
                } catch (e) { console.debug('Failed to prefetch payment methods', e); }
                try {
                  if (!paymentConfig && mapped.restaurantId) {
                    const pc = await fetchPaymentConfigForBusiness(mapped.restaurantId);
                    setPaymentConfig(pc?.config || null);
                  }
                } catch (e) { console.debug('Failed to prefetch payment config', e); }
                setShowPay(true);
              }}
              title={!paymentsReady ? 'Loading payment methods…' : undefined}
            >
              Pay Now
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/restaurant/${encodeURIComponent(mapped.restaurantId || '')}`)}>Restaurant</Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/discover')}>Discover</Button>
            <Button variant="ghost" className="flex-1" onClick={async () => { try { if (id) await cancelOrder(id); navigate('/discover'); } catch (err) { console.error('Failed to cancel order', err); } }}>Cancel</Button>
          </div>

          {/* Connection status chip */}
          <div className="text-xs">
            <span className={`px-2 py-1 rounded-full ${connState === 'connected' ? 'bg-emerald-500/20 text-emerald-700' : connState === 'connecting' ? 'bg-blue-500/20 text-blue-700' : 'bg-gray-500/20 text-gray-700'}`}>{connState.toUpperCase()}</span>
          </div>
        </CardContent>
      </Card>

      <PaymentMethodSheetWeb
        open={showPay}
        onOpenChange={setShowPay}
        context={{ serviceType: 'order', referenceId: String(mapped.id || ''), amount: subtotal, businessId: String(mapped.restaurantId || ''), allowPayLater: true }}
        paymentMethods={paymentMethods}
        paymentConfig={paymentConfig}
        onSuccessPaid={() => { setShowPay(false); }}
        onDeferCash={() => { setShowPay(false); }}
        onSubmittedManual={() => { setShowPay(false); }}
      />
    </div>
  );
}
