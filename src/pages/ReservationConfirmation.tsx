import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { connectSocket, type SocketConnectionState } from "@/lib/realtime/socketClient";

// Placeholder type; wire to real reservation fetch if available later
interface ReservationItem { name: string; quantity: number; price?: number }
interface Reservation { id: string; restaurant?: { id: string; name?: string }; type?: string; partySize?: number; date?: string; time?: string; status?: string; items?: ReservationItem[] }

async function fetchReservationByIdWeb(id: string): Promise<Reservation | null> {
  // If/when a public reservation fetch endpoint is available, wire it here.
  // Using order-like structure for now.
  try {
    const res = await fetch(`/api/reservations/${encodeURIComponent(id)}`, { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.reservation || null;
  } catch {
    return null;
  }
}

export default function ReservationConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connState, setConnState] = useState<SocketConnectionState>('idle');
  const socketRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const r = await fetchReservationByIdWeb(id);
        if (!mounted) return;
        setReservation(r);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load reservation';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // Realtime + polling fallback
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
        socket.emit('reservation:subscribe', { reservationId: id });
        socket.on('reservation:status', (payload: { reservationId: string; status: string }) => {
          if (payload?.reservationId === id) setReservation((prev) => prev ? { ...prev, status: payload.status } : prev);
        });
        socket.on('reservation:updated', (payload: { reservationId: string; reservation: Reservation }) => {
          if (payload?.reservationId === id) setReservation(payload.reservation);
        });
      } catch {
        setConnState('error');
      }
    })();
    const interval = setInterval(async () => {
      if (connState !== 'connected' && id) {
        try {
          const r = await fetchReservationByIdWeb(id);
          setReservation(r);
        } catch(e) {console.log(e.message)}
      }
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
      if (socketRef.current) {
        try { socketRef.current.emit('reservation:unsubscribe', { reservationId: id }); } catch(e) {console.log(e.message)}
        try { socketRef.current.disconnect(); } catch(e) {console.log(e.message)}
        socketRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="container mx-auto px-6 py-10">Loading…</div>;
  if (error || !reservation) return <div className="container mx-auto px-6 py-10 text-red-600">{error || 'Reservation not found'}</div>;

  const items = Array.isArray(reservation.items) ? reservation.items : [];
  const total = items.reduce((s, it) => s + (Number(it.price)||0) * (Number(it.quantity)||0), 0);

  return (
    <div className="container mx-auto px-6 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.52-1.66-1.66a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.156-.094l3.83-5.204Z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <CardTitle>Reservation Placed</CardTitle>
              <div className="text-xs text-muted-foreground">We’ve received your reservation</div>
            </div>
            <div className="ml-auto">
              <span className={`px-2 py-1 rounded-full text-[11px] ${reservation.status === 'pending' ? 'bg-blue-500/20 text-blue-700' : reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-700' : reservation.status === 'cancelled' ? 'bg-red-500/20 text-red-700' : 'bg-gray-500/20 text-gray-700'}`}>{String(reservation.status || 'pending').toUpperCase()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Restaurant</div>
              <div className="font-semibold">{reservation.restaurant?.name || 'Restaurant'}</div>
            </div>
            <div className="text-sm sm:text-right">
              <div className="text-muted-foreground">Reservation ID</div>
              <div className="font-mono">#{String(id).slice(-6).toUpperCase()}</div>
            </div>
          </div>

          {/* Quick facts */}
          <div className="flex gap-2 items-center text-sm text-muted-foreground">
            <span className="font-semibold">{String(reservation.type || '').toUpperCase()}</span>
            <span>• Party {reservation.partySize || '-'}</span>
            <span>• {reservation.date || ''} {reservation.time || ''}</span>
          </div>

          {/* Optional preordered items list */}
          {items.length > 0 && (
            <div>
              <div className="text-sm font-semibold mb-1">Pre‑ordered Items</div>
              <ul className="rounded-xl border border-border overflow-hidden">
                {items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-card border-b last:border-b-0">
                    <div className="text-sm">{it.quantity} x {it.name}</div>
                    <div className="text-sm">{((Number(it.price)||0) * (Number(it.quantity)||0)).toFixed(2)}</div>
                  </li>
                ))}
                <li className="flex items-center justify-between p-3 bg-card">
                  <div className="font-semibold">Subtotal</div>
                  <div className="font-semibold">{total.toFixed(2)}</div>
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="flex-1" onClick={() => navigate(`/restaurant/${encodeURIComponent(reservation.restaurant?.id || '')}`)}>Restaurant</Button>
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/discover')}>Discover</Button>
          </div>

          {/* Connection chip */}
          <div className="text-xs">
            <span className={`px-2 py-1 rounded-full ${connState === 'connected' ? 'bg-emerald-500/20 text-emerald-700' : connState === 'connecting' ? 'bg-blue-500/20 text-blue-700' : 'bg-gray-500/20 text-gray-700'}`}>{connState.toUpperCase()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
