import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart/CartContext";
import { useNavigate } from "react-router-dom";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import AuthModalWeb from "@/components/auth/AuthModalWeb";

export default function FloatingCartWeb({ restaurantId }: { restaurantId: string }) {
  const { items, initiator, preOrderEnabled, clearCart } = useCart();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(!!authLocal.getAccessToken());

  useEffect(() => {
    const unsubLogin = authBus.subscribe('login', () => setIsAuthed(true));
    const unsubLogout = authBus.subscribe('logout', () => setIsAuthed(false));
    return () => { unsubLogin(); unsubLogout(); };
  }, []);
  const visible = useMemo(() => {
    if (!items || items.length === 0) return false;
    if (initiator === 'order') return true;
    if (initiator === 'reserve' && preOrderEnabled) return true;
    return false;
  }, [items, initiator, preOrderEnabled]);

  const total = (items || []).reduce((s, it) => s + (Number(it.price)||0) * (Number(it.quantity)||0), 0);
  const count = (items || []).reduce((s, it) => s + (Number(it.quantity)||0), 0);

  if (!visible) return null;

  // Height of the sticky OrderReserveBarWeb so we can float just above it
  // Sourced from CSS var that the bar sets on mount; fallback provided.
  const bottomOffsetCollapsed = 'calc(var(--order-bar-h, 88px) + 16px)';
  const bottomOffsetExpanded = 'calc(var(--order-bar-h, 88px) + 12px)';

  if (!expanded) {
    return (
      <div className="fixed left-0 right-0 z-40" style={{ bottom: bottomOffsetCollapsed }}>
        <div className="container mx-auto px-6 flex justify-end">
          <button
            onClick={() => setExpanded(true)}
            aria-label="Open cart"
            className="relative w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 4H5a1 1 0 0 0 0 2h1.3l1.4 8.4A2 2 0 0 0 9.67 16h7.66a2 2 0 0 0 1.97-1.6L21 8H7.52" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="20" r="1.6" fill="currentColor"/>
              <circle cx="18" cy="20" r="1.6" fill="currentColor"/>
            </svg>
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-[11px] font-bold flex items-center justify-center">
              {count}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 z-40 pointer-events-none" style={{ bottom: bottomOffsetExpanded }}>
      <div className="container mx-auto px-6 pointer-events-auto">
        <Card className="p-3 shadow-xl border border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 rounded-2xl">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="text-sm font-semibold">Your Cart</div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={clearCart} aria-label="Clear cart">Clear</Button>
              <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} aria-label="Collapse cart">Hide</Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">{count} {count === 1 ? 'item' : 'items'} • Total Ksh{total.toFixed(2)}</div>
              <ul className="mt-2 max-h-28 overflow-auto pr-1 text-xs text-foreground/90 list-disc list-inside">
                {(items || []).map((it, idx) => (
                  <li key={(it.id || it.name) + String(idx)} className="truncate" aria-label={`${it.name} quantity ${it.quantity}`}>{it.name} x {it.quantity}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {initiator === 'order' && (
                <Button onClick={() => { if (!isAuthed) { setAuthOpen(true); return; } navigate(`/orders/new?restaurantId=${encodeURIComponent(restaurantId)}`); }}>
                  {isAuthed ? 'Checkout' : 'Signup to checkout'}
                </Button>
              )}
              {initiator === 'reserve' && preOrderEnabled && (
                <Button onClick={() => { if (!isAuthed) { setAuthOpen(true); return; } navigate(`/reservations/new?restaurantId=${encodeURIComponent(restaurantId)}`); }}>
                  {isAuthed ? 'Add to Reservation' : 'Signup to reserve'}
                </Button>
              )}
            </div>
          </div>
        </Card>
        <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => setAuthOpen(false)} />
      </div>
    </div>
  );
}
