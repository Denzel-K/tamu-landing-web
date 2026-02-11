import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/CartContext";
import { MenuItem, MenuCategory } from "@/lib/api/restaurants";
import MenuItemDetailsModalWeb from "./MenuItemDetailsModalWeb";
import { Plus, Minus } from "lucide-react";

export interface MenuCategoryWeb {
  category: string;
  items?: MenuItem[]
}

interface MenuListWebProps {
  menu?: MenuCategoryWeb[];
  restaurantId?: string;
  showControls?: boolean;
  canReserve?: boolean;
}

export default function MenuListWeb({
  menu,
  restaurantId,
  showControls = false,
  canReserve = false
}: MenuListWebProps) {
  const { items: cartItems, addItem, incrementItem, decrementItem } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const qtyOf = (key: string) => {
    const found = (cartItems || []).find(ci => (ci.id || ci.name) === key);
    return found?.quantity || 0;
  };

  const formatKsh = (n: number) => `Ksh${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleOpenModal = (it: MenuItem) => {
    setSelectedItem(it);
    setIsModalOpen(true);
  };

  if (!menu || menu.length === 0) {
    return <p className="text-sm text-muted-foreground py-10 text-center">Menu not available.</p>;
  }

  return (
    <div className="space-y-8">
      {menu.map((cat) => (
        <div key={cat.category} className="space-y-4">
          <h3 className="text-lg font-bold text-foreground/90 px-1 tracking-tight">{cat.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {(cat.items || []).map((it) => {
              const key = it.id || it.name;
              const q = qtyOf(key);
              const hasAddons = it.addons && it.addons.length > 0;

              return (
                <div
                  key={cat.category + key}
                  className="group relative rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden p-4"
                  onClick={() => handleOpenModal(it)}
                >
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted/50 border border-border shrink-0 shadow-sm">
                      {it.image ? (
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Menu</div>
                      )}
                      {q > 0 && (
                        <div className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                          {q}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="font-bold text-foreground text-base truncate leading-tight mb-1 group-hover:text-primary transition-colors">
                        {it.name}
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="text-primary font-black text-base">{formatKsh(it.price)}</div>

                        {showControls && (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {q > 0 ? (
                              <div className="flex items-center rounded-full border border-border bg-background shadow-sm hover:border-primary/30 transition-colors">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/5"
                                  onClick={() => decrementItem(key)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <div className="px-1 min-w-[20px] text-center text-xs font-bold">{q}</div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full text-primary hover:bg-primary/5"
                                  onClick={() => hasAddons ? handleOpenModal(it) : incrementItem(key)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="h-8 rounded-full px-4 font-bold text-xs gap-1.5 shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-105"
                                onClick={() => hasAddons ? handleOpenModal(it) : addItem({ id: key, name: it.name, price: it.price, quantity: 1 })}
                              >
                                <Plus className="h-3 w-3" />
                                Add
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <MenuItemDetailsModalWeb
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={restaurantId}
        canReserve={canReserve}
      />
    </div>
  );
}
