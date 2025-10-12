import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCart } from "@/lib/cart/CartContext";
import { useNavigate } from "react-router-dom";

export default function OrderReserveBarWeb({ restaurantId }: { restaurantId: string }) {
  const { items, initiator, preOrderEnabled, setInitiator, setPreOrderEnabled, clearCart } = useCart();
  const navigate = useNavigate();

  const hasItems = items.length > 0;
  const proceedLabel = useMemo(() => {
    if (initiator === 'order') return hasItems ? 'Go to checkout' : 'Browse menu';
    if (initiator === 'reserve') return 'Continue to reservation';
    return 'Get started';
  }, [initiator, hasItems]);

  const proceed = () => {
    if (initiator === 'order') {
      if (hasItems) {
        navigate(`/orders/new?restaurantId=${encodeURIComponent(restaurantId)}`);
      } else {
        // On web, keep UX simple: encourage user to browse menu (stay on page)
        return;
      }
      return;
    }
    if (initiator === 'reserve') {
      navigate(`/reservations/new?restaurantId=${encodeURIComponent(restaurantId)}`);
      return;
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-card/95 border-t border-border px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button className={`flex-1 ${initiator === 'order' ? '' : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary'}`} variant={initiator === 'order' ? 'default' : 'secondary'} onClick={() => setInitiator('order')}>Order now</Button>
          <Button className={`flex-1 ${initiator === 'reserve' ? '' : 'bg-accent/10 hover:bg-accent/20 text-foreground border border-accent'}`} variant={initiator === 'reserve' ? 'default' : 'secondary'} onClick={() => setInitiator('reserve')}>Reserve</Button>
        </div>

        {initiator === 'reserve' && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Preorder items</div>
              <div className="text-xs text-muted-foreground">Add items now to have them ready when you arrive.</div>
            </div>
            <Switch checked={preOrderEnabled} onCheckedChange={(v) => {
              setPreOrderEnabled(v);
              if (!v && items.length === 0) {
                // If turning off preorder and no items, nothing else to do
              }
            }} />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button className="flex-1" onClick={proceed}>{proceedLabel}</Button>
          {items.length > 0 && (
            <Button variant="secondary" onClick={clearCart}>Clear</Button>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {initiator ? (
            <>Mode: {initiator === 'order' ? 'Ordering' : 'Reservation'}{initiator === 'reserve' ? ` • Preorder: ${preOrderEnabled ? 'On' : 'Off'}` : ''}</>
          ) : (
            <>Mode: Idle</>
          )}
        </div>
      </div>
    </div>
  );
}
