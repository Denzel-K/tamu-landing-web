import React, { createContext, useContext, useMemo, useState } from "react";

export type CartItem = { id?: string; name: string; price: number; quantity: number };
export type Initiator = 'order' | 'reserve' | null;

interface CartState {
  items: CartItem[];
  preOrderEnabled: boolean;
  initiator: Initiator;
  setPreOrderEnabled: (v: boolean) => void;
  setInitiator: (i: Initiator) => void;
  addItem: (it: CartItem) => void;
  clearCart: () => void;
}

const CartCtx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [preOrderEnabled, setPreOrderEnabled] = useState(false);
  const [initiator, setInitiator] = useState<Initiator>(null);
  const value = useMemo<CartState>(() => ({
    items,
    preOrderEnabled,
    initiator,
    setPreOrderEnabled,
    setInitiator,
    addItem: (it) => setItems((prev) => {
      const idx = prev.findIndex(p => (p.id || p.name) === (it.id || it.name));
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + it.quantity };
        return copy;
      }
      return [...prev, it];
    }),
    clearCart: () => setItems([]),
  }), [items, preOrderEnabled, initiator]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
