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

  const total = (items || []).reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  const count = (items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);

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
            className="group relative w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-primary/40 ring-4 ring-background"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M7 4H5a1 1 0 0 0 0 2h1.3l1.4 8.4A2 2 0 0 0 9.67 16h7.66a2 2 0 0 0 1.97-1.6L21 8H7.52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-red-600 border-2 border-background text-[11px] font-black flex items-center justify-center animate-in zoom-in-50 duration-300">
              {count}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setExpanded(false)} />
      <div className="container mx-auto px-6 max-w-lg mb-4 pointer-events-auto">
        <Card className="p-0 overflow-hidden shadow-2xl border border-border/70 bg-card rounded-3xl animate-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/60 bg-muted/20 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-foreground">Your Cart</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{count} {count === 1 ? 'item' : 'items'} selected</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearCart}
                className="text-destructive hover:bg-destructive/10 rounded-full"
                title="Clear Cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="rounded-full hover:bg-muted"
                title="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-[45vh] overflow-y-auto px-1">
            <div className="p-4 space-y-4">
              {(items || []).map((it, idx) => (
                <div key={(it.id || it.name) + String(idx)} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0 shadow-sm">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Item</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate leading-tight mb-1">{it.name}</div>
                    <div className="text-xs text-muted-foreground">Ksh {Number(it.price).toFixed(2)} each</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="bg-primary/10 px-2.5 py-1 rounded-md">
                      <span className="text-primary font-black text-xs">x{it.quantity}</span>
                    </div>
                    <div className="text-sm font-black text-foreground">Ksh {(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}

              {/* Add more items button */}
              <button
                onClick={() => setExpanded(false)}
                className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-primary font-bold hover:bg-primary/5 hover:border-primary/40 transition-all text-sm group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><path d="M12 5v14M5 12h14" /></svg>
                Add more items
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/60 bg-muted/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-muted-foreground">Total (Incl. VAT)</div>
              <div className="text-2xl font-black text-primary">Ksh {total.toFixed(2)}</div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl text-sm font-bold border-border bg-background hover:bg-muted"
                onClick={() => setExpanded(false)}
              >
                Continue Browsing
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl text-sm font-black shadow-lg shadow-primary/20"
                onClick={() => {
                  if (!isAuthed) { setAuthOpen(true); return; }
                  const route = initiator === 'reserve' ? 'reservations' : 'orders';
                  navigate(`/${route}/new?restaurantId=${encodeURIComponent(restaurantId)}`);
                }}
              >
                {initiator === 'reserve' ? 'Add to Reservation' : 'Go to Checkout'}
              </Button>
            </div>
          </div>
        </Card>
        <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => setAuthOpen(false)} />
      </div>
    </div>
  );
}
