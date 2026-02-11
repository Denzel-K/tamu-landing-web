import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/lib/cart/CartContext";
import { MenuItem, Addon } from "@/lib/api/restaurants";
import { Feather, ShoppingCart, Plus, Minus, Info } from "lucide-react";

interface MenuItemDetailsModalWebProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    restaurantId?: string;
    canReserve?: boolean;
}

export default function MenuItemDetailsModalWeb({
    item,
    isOpen,
    onClose,
    restaurantId,
    canReserve = false,
}: MenuItemDetailsModalWebProps) {
    const {
        items: cartItems,
        addItem,
        incrementItem,
        decrementItem,
        initiator,
        setInitiator,
        setPreOrderEnabled
    } = useCart();

    const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
    const [selectedCrust, setSelectedCrust] = useState<string | null>(null);

    // Sync with cart if item already exists
    const cartItem = useMemo(() => {
        if (!item) return null;
        return cartItems.find((i) => (i.id || i.name) === (item.id || item.name));
    }, [item, cartItems]);

    const quantity = cartItem?.quantity || 0;

    if (!item) return null;

    const accompaniments = item.addons?.filter(a => !a.type || a.type === 'accompaniment') || [];
    const crusts = item.addons?.filter(a => a.type === 'crust') || [];
    const isPizza = item.name.toLowerCase().includes('pizza');

    const formatKsh = (n: number) =>
        `Ksh${Number(n || 0).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const calculateTotalPrice = () => {
        let total = item.price;
        selectedAddons.forEach((a) => (total += a.price));
        if (selectedCrust) {
            const crust = crusts.find(c => c.id === selectedCrust);
            if (crust) total += crust.price;
        }
        return total;
    };

    const toggleAddon = (addon: Addon) => {
        setSelectedAddons((prev) =>
            prev.find((a) => a.id === addon.id)
                ? prev.filter((a) => a.id !== addon.id)
                : [...prev, addon]
        );
    };

    const handleAddToCart = () => {
        addItem({
            id: item.id || item.name,
            name: item.name,
            price: item.price,
            quantity: 1,
            selectedAddons: [
                ...selectedAddons,
                ...(selectedCrust ? [crusts.find(c => c.id === selectedCrust)!] : [])
            ].map(a => ({ name: a.name, price: a.price }))
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl">
                <ScrollArea className="max-h-[90vh]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                            src={item.image || "https://placehold.co/600x400/png?text=Menu+Item"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-md text-white"
                            onClick={onClose}
                        >
                            <Feather name="x" className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="relative">
                            {quantity > 0 && (
                                <div className="absolute -top-10 left-0 bg-yellow-400 text-yellow-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-500">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
                                    POPULAR
                                </div>
                            )}
                            <DialogTitle className="text-3xl font-black tracking-tight text-foreground">
                                {item.name}
                            </DialogTitle>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-2xl font-black text-primary">{formatKsh(item.price)}</span>
                                {item.cuisine && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">{item.cuisine}</span>}
                            </div>
                            {item.description && (
                                <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-medium">
                                    {item.description}
                                </p>
                            )}
                        </div>

                        {!initiator && (
                            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
                                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                                    <Info className="w-4 h-4" /> Selection Required
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Please select how you'd like to receive your order to continue.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setInitiator('order')}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        Order Now
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!canReserve}
                                        onClick={() => {
                                            setInitiator('reserve');
                                            setPreOrderEnabled(true);
                                        }}
                                        className={canReserve ? "border-primary text-primary hover:bg-primary/5" : "opacity-50"}
                                    >
                                        {canReserve ? "Reserve & Pre-order" : "No Reservation"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={!initiator ? "opacity-30 pointer-events-none" : ""}>
                            {crusts.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold">Choose Your Crust</Label>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Required</span>
                                    </div>
                                    <RadioGroup value={selectedCrust || ""} onValueChange={setSelectedCrust} className="grid gap-2">
                                        {crusts.map((crust) => (
                                            <div key={crust.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                                                <RadioGroupItem value={crust.id} id={crust.id} />
                                                <Label htmlFor={crust.id} className="flex-1 cursor-pointer font-medium">
                                                    {crust.name}
                                                </Label>
                                                <span className="text-xs text-primary font-bold">+{formatKsh(crust.price)}</span>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}

                            {accompaniments.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold">Add Accompaniments</Label>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Optional</span>
                                    </div>
                                    <div className="grid gap-2">
                                        {accompaniments.map((addon) => (
                                            <div key={addon.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                                                <Checkbox
                                                    id={addon.id}
                                                    checked={selectedAddons.some(a => a.id === addon.id)}
                                                    onCheckedChange={() => toggleAddon(addon)}
                                                />
                                                <Label htmlFor={addon.id} className="flex-1 cursor-pointer font-medium">
                                                    {addon.name}
                                                </Label>
                                                <span className="text-xs text-primary font-bold">+{formatKsh(addon.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
                        {quantity === 0 ? (
                            <Button
                                onClick={handleAddToCart}
                                disabled={!initiator || (crusts.length > 0 && !selectedCrust)}
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                            >
                                Add 1 for {formatKsh(calculateTotalPrice())}
                            </Button>
                        ) : (
                            <div className="flex items-center gap-4 w-full">
                                <div className="flex items-center rounded-xl border border-border bg-muted/30 h-12 px-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => decrementItem(item.id || item.name)}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => incrementItem(item.id || item.name)}
                                        className="h-8 w-8 text-primary hover:bg-primary/10"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button
                                    className="flex-1 h-12 font-bold gap-2 shadow-lg shadow-primary/20"
                                    onClick={onClose}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    View Cart
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
