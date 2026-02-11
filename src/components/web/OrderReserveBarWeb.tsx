import React, { useMemo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCart } from "@/lib/cart/CartContext";
import { useNavigate } from "react-router-dom";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import AuthModalWeb from "@/components/auth/AuthModalWeb";

export default function OrderReserveBarWeb({
  restaurantId,
  setActiveTab
}: {
  restaurantId: string;
  setActiveTab?: (tab: 'Menu' | 'Reviews' | 'Info') => void;
}) {
  const { items, initiator, preOrderEnabled, setInitiator, setPreOrderEnabled } = useCart();
  const navigate = useNavigate();
  const barRef = useRef<HTMLDivElement | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(!!authLocal.getAccessToken());

  useEffect(() => {
    const unsubLogin = authBus.subscribe('login', () => setIsAuthed(true));
    const unsubLogout = authBus.subscribe('logout', () => setIsAuthed(false));
    return () => { unsubLogin(); unsubLogout(); };
  }, []);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const setVar = () => {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty('--order-bar-h', `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => {
      ro.disconnect();
      // leave last known value; next mount will update
    };
  }, []);

  const hasItems = items.length > 0;
  const proceedLabel = useMemo(() => {
    if (initiator === 'order') {
      if (!hasItems) return 'Browse menu';
      return isAuthed ? 'Go to checkout' : 'Signup to checkout';
    }
    if (initiator === 'reserve') {
      return isAuthed ? 'Continue to reservation' : 'Signup to reserve';
    }
    return 'Get started';
  }, [initiator, hasItems, isAuthed]);

  const proceed = () => {
    if (initiator === 'order') {
      if (hasItems) {
        if (!isAuthed) { setAuthOpen(true); return; }
        navigate(`/orders/new?restaurantId=${encodeURIComponent(restaurantId)}`);
      } else {
        // On web, keep UX simple: encourage user to browse menu (stay on page)
        return;
      }
      return;
    }
    if (initiator === 'reserve') {
      if (!isAuthed) { setAuthOpen(true); return; }
      navigate(`/reservations/new?restaurantId=${encodeURIComponent(restaurantId)}`);
      return;
    }
  };

  return (
    <div ref={barRef} className="sticky bottom-0 left-0 right-0 z-50 bg-background/95 border-t border-border pb-safe pt-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="container mx-auto px-6 max-w-lg">
        <div className="flex flex-col gap-4">
          {/* Segmented intent toggle */}
          <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
            <button
              onClick={() => { setInitiator('order'); setActiveTab && setActiveTab('Menu'); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${initiator === 'order'
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              Order now
            </button>
            <button
              onClick={() => { setInitiator('reserve'); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${initiator === 'reserve'
                ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20 scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              Reserve
            </button>
          </div>

          {/* Preorder toggle for reservations */}
          {initiator === 'reserve' && (
            <div className="flex items-center justify-between py-1 px-1 animate-in slide-in-from-top-2 duration-300">
              <div className="flex-1 pr-4">
                <div className="text-sm font-bold text-foreground">Preorder items</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Add items now to have them ready when you arrive.</div>
              </div>
              <Switch
                checked={preOrderEnabled}
                onCheckedChange={(v) => {
                  setPreOrderEnabled(v);
                  if (v && setActiveTab) setActiveTab('Menu');
                }}
              />
            </div>
          )}

          {/* Proceed button */}
          <div className="flex items-center gap-3">
            <Button
              className={`flex-1 h-12 rounded-xl text-base font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98] ${initiator === 'order' && !hasItems ? 'bg-muted text-muted-foreground hover:bg-muted cursor-default' : ''
                }`}
              onClick={proceed}
              disabled={initiator === 'order' && !hasItems}
            >
              {proceedLabel}
            </Button>
          </div>

          {/* State indicator (Subtle) */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${initiator ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
              {initiator ? (initiator === 'order' ? 'Ordering Mode' : 'Reservation Mode') : 'Select Mode to start'}
            </span>
          </div>
        </div>
        <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => setAuthOpen(false)} />
      </div>
    </div>
  );
}
