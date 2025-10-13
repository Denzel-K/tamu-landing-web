import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById, cancelOrder, type WebOrder } from "@/lib/api/orders";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProcessingOrderCardWeb from "@/components/web/ProcessingOrderCardWeb";
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

  const mapped = {
    id: String(id || order.id),
    items: (order.items || []).map(it => ({ name: it.name, price: Number(it.price)||0, quantity: Number(it.quantity)||0 })),
    type: String(order.type || ''),
    deliveryAddress: order.deliveryAddress,
    partySize: order.partySize ? Number(order.partySize) : undefined,
    tableNumber: order.tableNumber,
    restaurant: { name: order.restaurant?.name, id: order.restaurant?.id },
    restaurantId: order.restaurant?.id,
    status: order.status,
  } as const;

  return (
    <div className="container mx-auto px-6 py-10">
      <ProcessingOrderCardWeb
        order={mapped}
        onCancel={async () => { try { if (id) await cancelOrder(id); navigate('/discover'); } catch (err) { console.error('Failed to cancel order', err); } }}
        onRefresh={() => load()}
      />

      {/* Connection status chip for visibility */}
      <div className="mt-3 text-xs">
        <span className={`px-2 py-1 rounded-full ${connState === 'connected' ? 'bg-emerald-500/20 text-emerald-700' : connState === 'connecting' ? 'bg-blue-500/20 text-blue-700' : 'bg-gray-500/20 text-gray-700'}`}>{connState.toUpperCase()}</span>
      </div>
    </div>
  );
}
