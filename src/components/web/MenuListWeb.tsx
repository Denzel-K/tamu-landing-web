import React from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/CartContext";

type MenuItem = { id?: string; name: string; price: number; description?: string; image?: string; photoUrl?: string; images?: string[] };
export interface MenuCategory { category: string; items?: MenuItem[] }

export default function MenuListWeb({ menu, restaurantId, showControls = false }: { menu?: MenuCategory[]; restaurantId?: string; showControls?: boolean }) {
  const { items: cartItems, addItem, incrementItem, decrementItem } = useCart();
  const qtyOf = (key: string) => {
    const found = (cartItems || []).find(ci => (ci.id || ci.name) === key);
    return found?.quantity || 0;
  };
  const formatKsh = (n: number) => `Ksh${Number(n||0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (!menu || menu.length === 0) {
    return <p className="text-sm text-muted-foreground">Menu not available.</p>;
  }
  return (
    <div className="space-y-4">
      {menu.map((cat) => (
        <div key={cat.category}>
          <h3 className="text-sm font-semibold text-foreground/90 mb-2 tracking-tight">{cat.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(cat.items || []).map((it) => {
              const key = it.id || `${cat.category}:${it.name}`;
              const q = qtyOf(key);
              const imgSrc = it.image || it.photoUrl || (it.images && it.images[0]);
              return (
                <div key={(cat.category || "") + (it.id || it.name)} className="rounded-xl border border-border bg-card overflow-hidden p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted/50 border border-border">
                      {imgSrc ? (
                        <img src={imgSrc} alt={it.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-[15px] truncate">{it.name}</div>
                      <div className="text-primary font-bold mt-0.5">{formatKsh(it.price)}</div>
                    </div>
                    {showControls ? (
                      <div className="flex items-center rounded-full border border-border bg-background">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          disabled={q === 0}
                          onClick={() => decrementItem(key)}
                          aria-label={`Decrease ${it.name}`}
                        >
                          -
                        </Button>
                        <div className="px-2 min-w-[24px] text-center text-sm font-semibold">{q}</div>
                        <Button
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => (q === 0 ? addItem({ id: key, name: it.name, price: it.price, quantity: 1 }) : incrementItem(key))}
                          aria-label={`Increase ${it.name}`}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" className="rounded-full pointer-events-none opacity-60">
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
