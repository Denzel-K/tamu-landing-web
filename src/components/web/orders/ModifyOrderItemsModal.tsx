import { useState, useEffect, useMemo } from "react";
import { X, Plus, Minus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRestaurantById } from "@/lib/api/restaurants";
import type { WebOrderItem } from "@/lib/api/orders";

interface ModifyOrderItemsModalProps {
  visible: boolean;
  onClose: () => void;
  order: {
    id?: string;
    restaurantId?: string;
    items?: WebOrderItem[];
  } | null;
  onSave: (items: WebOrderItem[]) => Promise<void>;
}

type MenuItem = {
  id?: string;
  name: string;
  price: number;
  image?: string;
  photoUrl?: string;
  images?: string[];
};

type MenuCategory = {
  category: string;
  items: MenuItem[];
};

export default function ModifyOrderItemsModal({
  visible,
  onClose,
  order,
  onSave,
}: ModifyOrderItemsModalProps) {
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<WebOrderItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (!visible) {
      setInitialized(false);
      return;
    }

    if (visible && !initialized && order?.restaurantId) {
      setLoading(true);
      getRestaurantById(order.restaurantId)
        .then((res) => {
          setRestaurant(res.restaurant);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      setItems(JSON.parse(JSON.stringify(order.items || [])));
      setInitialized(true);
    }
  }, [visible, initialized, order?.restaurantId, order?.items]);

  const allMenuItems = useMemo(() => {
    if (!restaurant?.menu) return [];
    const menu = restaurant.menu as MenuCategory[];
    return menu.flatMap((cat) => cat.items);
  }, [restaurant]);

  const categories = useMemo(() => {
    if (!restaurant?.menu) return [];
    const menu = restaurant.menu as MenuCategory[];
    const unique = Array.from(new Set(menu.map((c) => c.category))).sort();
    return ["All", ...unique];
  }, [restaurant]);

  const activeMenu = useMemo(() => {
    if (!restaurant?.menu) return [];
    const menu = restaurant.menu as MenuCategory[];
    if (selectedCategory === "All") return menu;
    return menu.filter((c) => c.category === selectedCategory);
  }, [restaurant, selectedCategory]);

  const updateQuantity = (name: string, delta: number) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.name === name);
      if (idx !== -1) {
        const next = [...prev];
        const newQty = Math.max(0, next[idx].quantity + delta);
        if (newQty === 0) {
          next.splice(idx, 1);
        } else {
          next[idx] = { ...next[idx], quantity: newQty };
        }
        return next;
      }
      return prev;
    });
  };

  const addItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          name: item.name,
          price: item.price,
          quantity: 1,
          menuItemId: item.id,
          image: item.image || item.photoUrl || item.images?.[0],
        },
      ];
    });
  };

  const handleSave = async () => {
    if (items.length === 0) return;
    setSaving(true);
    try {
      await onSave(items);
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col mx-4 border-2 border-primary/20 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-3xl font-black text-foreground">Edit Order</h2>
            <p className="text-xs text-muted-foreground font-mono">
              #{(order?.id || "").slice(-6).toUpperCase()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Selected Items */}
          <div className="md:w-2/5 p-6 border-r border-border flex flex-col">
            <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              Your Selection
            </h3>
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-sm font-bold text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs font-black text-primary">
                        Ksh {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-background rounded-lg border border-border/60 p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/10"
                        onClick={() => updateQuantity(item.name, -1)}
                      >
                        {item.quantity > 1 ? (
                          <Minus className="h-3 w-3 text-primary" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-destructive" />
                        )}
                      </Button>
                      <span className="min-w-[24px] text-center font-black text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-primary/10"
                        onClick={() => updateQuantity(item.name, 1)}
                      >
                        <Plus className="h-3 w-3 text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm italic">
                    No items selected
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Menu Items */}
          <div className="md:w-3/5 p-6 flex flex-col">
            <h3 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              Add More Items
            </h3>

            {/* Category Tabs */}
            <div className="mb-4">
              <ScrollArea className="w-full">
                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full font-bold whitespace-nowrap ${
                        selectedCategory === cat
                          ? "shadow-md"
                          : "hover:border-primary/50"
                      }`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Menu Items Grid */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeMenu.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-xs font-black text-muted-foreground/60 mb-3 ml-1">
                        {cat.category.toUpperCase()}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {cat.items.map((item) => {
                          const inCart = items.find((i) => i.name === item.name);
                          const itemImage =
                            item.image || item.photoUrl || item.images?.[0];
                          return (
                            <button
                              key={item.name}
                              onClick={() => addItem(item)}
                              className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                inCart
                                  ? "bg-primary/5 border-primary/30 shadow-md"
                                  : "bg-card border-border/60 hover:border-primary/40 hover:shadow"
                              }`}
                            >
                              {itemImage && (
                                <img
                                  src={itemImage}
                                  alt={item.name}
                                  className="w-full h-24 object-cover rounded-xl mb-2"
                                />
                              )}
                              <p className="text-sm font-bold text-foreground truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  Ksh {item.price.toLocaleString()}
                                </span>
                                <div
                                  className={`rounded-full p-1.5 ${
                                    inCart ? "bg-primary" : "bg-primary/10"
                                  }`}
                                >
                                  {inCart ? (
                                    <Check className="h-3 w-3 text-white" />
                                  ) : (
                                    <Plus className="h-3 w-3 text-primary" />
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-muted-foreground">
              Updated Total
            </span>
            <span className="text-3xl font-black text-primary">
              Ksh {total.toLocaleString()}
            </span>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="w-full py-6 rounded-2xl text-lg font-black shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              "Confirm Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
