/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  selectedAddons?: { name: string; price: number }[]
};
export type Initiator = 'order' | 'reserve' | null;

interface CartState {
  items: CartItem[];
  preOrderEnabled: boolean;
  initiator: Initiator;
  restaurantId: string | null;
  tableNumber: string | null;
  waiterName: string | null;
  requestUtensils: boolean;
  orderNotes: string;
  setPreOrderEnabled: (v: boolean) => void;
  setInitiator: (i: Initiator) => void;
  setRestaurantId: (id: string | null) => void;
  setTableNumber: (num: string | null) => void;
  setWaiterName: (name: string | null) => void;
  setRequestUtensils: (v: boolean) => void;
  setOrderNotes: (notes: string) => void;
  addItem: (it: CartItem) => void;
  incrementItem: (key: string) => void;
  decrementItem: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartCtx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [preOrderEnabled, setPreOrderEnabled] = useState(false);
  const [initiator, setInitiator] = useState<Initiator>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [waiterName, setWaiterName] = useState<string | null>(null);
  const [requestUtensils, setRequestUtensils] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");

  const value = useMemo<CartState>(() => ({
    items,
    preOrderEnabled,
    initiator,
    restaurantId,
    tableNumber,
    waiterName,
    requestUtensils,
    orderNotes,
    setPreOrderEnabled,
    setInitiator,
    setRestaurantId,
    setTableNumber,
    setWaiterName,
    setRequestUtensils,
    setOrderNotes,
    addItem: (it) => setItems((prev) => {
      // Prioritize matching by ID, then fallback to name
      const findKey = (p: CartItem) => p.id || p.name;
      const itKey = findKey(it);
      const idx = prev.findIndex(p => findKey(p) === itKey);

      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + it.quantity };
        return copy;
      }
      return [...prev, it];
    }),
    incrementItem: (key) => setItems((prev) => {
      const idx = prev.findIndex(p => (p.id || p.name) === key);
      if (idx < 0) return prev;
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
      return copy;
    }),
    decrementItem: (key) => setItems((prev) => {
      const idx = prev.findIndex(p => (p.id || p.name) === key);
      if (idx < 0) return prev;
      const current = prev[idx];
      const nextQty = current.quantity - 1;
      if (nextQty <= 0) {
        return prev.filter((p, i) => i !== idx);
      }
      const copy = prev.slice();
      copy[idx] = { ...current, quantity: nextQty };
      return copy;
    }),
    removeItem: (key) => setItems((prev) => prev.filter(p => (p.id || p.name) !== key)),
    clearCart: () => {
      setItems([]);
      setPreOrderEnabled(false);
      setInitiator(null);
      setRequestUtensils(false);
      setOrderNotes("");
    },
  }), [items, preOrderEnabled, initiator, restaurantId, tableNumber, waiterName, requestUtensils, orderNotes]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
