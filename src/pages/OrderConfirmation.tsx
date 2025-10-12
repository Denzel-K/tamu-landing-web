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
        const socket = await connectSocket('/ws');
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

  const total = (order.items || []).reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div className="container mx-auto px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Order Placed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${connState === 'connected' ? 'bg-emerald-500/20 text-emerald-700' : connState === 'connecting' ? 'bg-blue-500/20 text-blue-700' : 'bg-gray-500/20 text-gray-700'}`}>{connState.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Restaurant</div>
              <div className="font-semibold">{order.restaurant?.name || "Restaurant"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Order ID</div>
              <div className="font-mono">#{String(id).slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-[11px] ${order.status === 'pending' ? 'bg-blue-500/20 text-blue-700' : order.status === 'preparing' ? 'bg-orange-500/20 text-orange-700' : order.status === 'completed' ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700'}`}>{String(order.status || 'pending').toUpperCase()}</span>
          </div>

          <div>
            <div className="text-sm font-semibold mb-1">Items</div>
            <ul className="rounded-xl border border-border overflow-hidden">
              {(order.items || []).map((it, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 bg-card border-b last:border-b-0">
                  <div className="text-sm">{it.quantity} x {it.name}</div>
                  <div className="text-sm">{(it.price * it.quantity).toFixed(2)}</div>
                </li>
              ))}
              <li className="flex items-center justify-between p-3 bg-card">
                <div className="font-semibold">Total</div>
                <div className="font-semibold">{total.toFixed(2)}</div>
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            {order.status === 'pending' && (
              <Button className="flex-1" onClick={() => setShowPay(true)}>Pay Now</Button>
            )}
            <Button variant="outline" className="flex-1" onClick={() => navigate('/discover')}>Discover</Button>
            <Button variant="secondary" className="flex-1" onClick={async () => { try { if (id) await cancelOrder(id); navigate('/discover'); } catch (err) { console.error('Failed to cancel order', err); } }}>Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <PaymentMethodSheetWeb
        open={showPay}
        onOpenChange={setShowPay}
        context={{ serviceType: 'order', referenceId: String(id || ''), amount: total, businessId: String(order?.restaurant?.id || ''), allowPayLater: true }}
        paymentMethods={paymentMethods}
        paymentConfig={paymentConfig}
        onSuccessPaid={() => { setShowPay(false); load(); }}
        onDeferCash={() => { setShowPay(false); load(); }}
        onSubmittedManual={() => { setShowPay(false); load(); }}
      />
    </div>
  );
}
