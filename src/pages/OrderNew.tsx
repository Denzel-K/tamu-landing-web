import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { createOrder, type OrderType, type NewOrderItem } from "@/lib/api/orders";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import NewOrderHeaderWeb from "@/components/web/headers/NewOrderHeaderWeb";
import OrderTypeSelectorWeb from "@/components/web/orders/OrderTypeSelectorWeb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import CartSummaryWeb from "@/components/web/orders/CartSummaryWeb";
import { useCart } from "@/lib/cart/CartContext";
import type { CartItem } from "@/lib/cart/CartContext";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import AuthModalWeb from "@/components/auth/AuthModalWeb";

export default function OrderNew() {
  const [sp] = useSearchParams();
  const rid = sp.get("restaurantId") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse['config'] | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'payment' | 'confirmation'>('select');
  const [paidJustNow, setPaidJustNow] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(!!authLocal.getAccessToken());

  const [orderType, setOrderType] = useState<OrderType | "">("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [partySize, setPartySize] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { items: cartItems } = useCart();

  useEffect(() => {
    // Gate: prompt login if unauthenticated
    if (!isAuthed) setAuthOpen(true);
    const unsubLogin = authBus.subscribe('login', () => { setIsAuthed(true); setAuthOpen(false); });
    const unsubLogout = authBus.subscribe('logout', () => { setIsAuthed(false); setAuthOpen(true); });
    return () => { unsubLogin(); unsubLogout(); };
  }, [isAuthed]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!rid) throw new Error("Missing restaurantId");
        const res = await getRestaurantById(rid);
        if (!mounted) return;
        setRestaurant(res.restaurant);
        // Prefetch payments for this business
        try {
          const [m, c] = await Promise.all([
            fetchPaymentMethodsForRestaurant(rid),
            fetchPaymentConfigForBusiness(rid),
          ]);
          if (!mounted) return;
          setPaymentMethods(m || null);
          setPaymentConfig(c?.config || null);
        } catch (err: unknown) { /* non-fatal: payment methods unavailable */ }
      } catch (e: unknown) {
        if (!mounted) return;
        const msg = e instanceof Error ? e.message : "Failed to load restaurant";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [rid]);

  const canSubmit = useMemo(() => {
    if (!restaurant) return false;
    if (!orderType) return false;
    if ((cartItems?.length || 0) === 0) return false;
    if (orderType === "delivery" && deliveryAddress.trim().length < 6) return false;
    if (orderType === "dine-in" && !partySize) return false;
    return true;
  }, [restaurant, orderType, deliveryAddress, partySize, cartItems]);

  const onSubmit = async () => {
    if (!isAuthed) { setAuthOpen(true); return; }
    if (!restaurant) return;
    setFormError(null);
    if (!orderType) { setFormError("Please select an order type"); return; }
    if (orderType === "delivery" && deliveryAddress.trim().length < 6) { setFormError("Please enter a valid delivery address"); return; }
    if (orderType === "dine-in") {
      const ps = Number(partySize);
      if (!ps || ps <= 0) { setFormError("Please provide a valid party size"); return; }
    }
    setSubmitting(true);
    try {
      // Use cart items
      const items: NewOrderItem[] = (cartItems || []).map((it) => ({ id: it.id, name: it.name, price: it.price, quantity: it.quantity } as NewOrderItem));
      const payload = {
        restaurantId: restaurant.id,
        items,
        type: orderType as OrderType,
        tableNumber: orderType === "dine-in" ? tableNumber || undefined : undefined,
        partySize: orderType === "dine-in" ? Number(partySize) || undefined : undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
      };
      const res = await createOrder(payload);
      const newId = res.order.id;
      setLastOrderId(newId);
      // Ensure payments loaded
      try {
        if (!paymentMethods) setPaymentMethods(await fetchPaymentMethodsForRestaurant(restaurant.id));
      } catch (err) { /* non-fatal: payment methods unavailable */ }
      try {
        if (!paymentConfig) {
          const pc = await fetchPaymentConfigForBusiness(restaurant.id);
          setPaymentConfig(pc?.config || null);
        }
      } catch (err) { /* non-fatal: payment config unavailable */ }
      try {
        // If M-Pesa enabled, open sheet; else proceed and show confirmation page with pay later
        const mpesaEnabled = (paymentMethods ? !!paymentMethods.enabled?.mpesa : true);
        if (mpesaEnabled) {
          setPaidJustNow(false);
          setStep('payment');
          setShowPay(true);
        } else {
          setPaidJustNow(false);
          setStep('confirmation');
          navigate(`/orders/confirmation/${encodeURIComponent(newId)}`);
        }
      } catch (e) { console.log(e.message); }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Could not place order", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (<div className="container mx-auto px-6 py-10">Loading…</div>);
  if (error || !restaurant) return (
    <div className="container mx-auto px-6 py-10">
      <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3">{error || "Restaurant not found"}</div>
      <Link to="/discover" className="underline text-primary">Back to Discover</Link>
    </div>
  );

  // Select step
  if (step === 'select') {
    return (
      <div className="container mx-auto px-6 py-8">
        <NewOrderHeaderWeb restaurant={restaurant} />
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <div className={`px-2 py-1 rounded ${step === 'select' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>1. Details</div>
          <div className="h-px flex-1 bg-border" />
          <div className={`px-2 py-1 rounded bg-muted`}>2. Payment</div>
          <div className="h-px flex-1 bg-border" />
          <div className={`px-2 py-1 rounded bg-muted`}>3. Confirmation</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderTypeSelectorWeb
                availableOrderTypes={restaurant.availableOrderTypes || []}
                selectedOrderType={orderType || null}
                onSelectOrderType={(t) => setOrderType(t)}
              />

              {orderType === "delivery" && (
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Input id="deliveryAddress" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter delivery address" />
                </div>
              )}

              {orderType === "dine-in" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partySize">Party Size</Label>
                    <Input id="partySize" inputMode="numeric" value={partySize} onChange={(e) => setPartySize(e.target.value.replace(/[^0-9]/g, ""))} placeholder="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number (optional)</Label>
                    <Input id="tableNumber" inputMode="numeric" value={tableNumber} onChange={(e) => setTableNumber(e.target.value.replace(/[^0-9]/g, ""))} placeholder="7" />
                  </div>
                </div>
              )}

              {formError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{formError}</div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" asChild>
                  <Link to={`/restaurant/${encodeURIComponent(restaurant.id)}`}>Back</Link>
                </Button>
                <Button disabled={!canSubmit || submitting} onClick={onSubmit}>{!isAuthed ? "Signup to place order" : (submitting ? "Placing…" : "Place Order")}</Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:sticky lg:top-[88px]">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <CartSummaryWeb items={cartItems as CartItem[]} />
              </CardContent>
            </Card>
          </div>
        </div>

        <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => setAuthOpen(false)} />
      </div>
    );
  }

  // Payment step
  if (step === 'payment') {
    const totalAmt = (cartItems || []).reduce((s, it) => s + (Number(it.price)||0) * (Number(it.quantity)||0), 0);
    return (
      <div className="container mx-auto px-6 py-8">
        <NewOrderHeaderWeb restaurant={restaurant} />
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <div className={`px-2 py-1 rounded bg-muted`}>1. Details</div>
          <div className="h-px flex-1 bg-border" />
          <div className={`px-2 py-1 rounded ${step === 'payment' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>2. Payment</div>
          <div className="h-px flex-1 bg-border" />
          <div className={`px-2 py-1 rounded bg-muted`}>3. Confirmation</div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Select how you’d like to pay. Total: {totalAmt.toFixed(2)}</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => { if (!isAuthed) { setAuthOpen(true); return; } setShowPay(true); }}>Pay Now</Button>
              <Button variant="outline" onClick={() => { setShowPay(false); setPaidJustNow(false); if (lastOrderId) { setStep('confirmation'); navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); } }}>Pay Later</Button>
            </div>
          </CardContent>
        </Card>

        <PaymentMethodSheetWeb
          open={showPay}
          onOpenChange={setShowPay}
          context={{ serviceType: 'order', referenceId: String(lastOrderId || ''), amount: totalAmt, businessId: String(restaurant?.id || ''), allowPayLater: true }}
          paymentMethods={paymentMethods}
          paymentConfig={paymentConfig}
          onSuccessPaid={() => { setShowPay(false); setPaidJustNow(true); if (lastOrderId) { setStep('confirmation'); navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); } }}
          onDeferCash={() => { setShowPay(false); setPaidJustNow(false); if (lastOrderId) { setStep('confirmation'); navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); } }}
          onSubmittedManual={() => { setShowPay(false); setPaidJustNow(false); if (lastOrderId) { setStep('confirmation'); navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); } }}
        />
      </div>
    );
  }

  // Confirmation step delegates to dedicated route
  return (
    <div className="container mx-auto px-6 py-10">Redirecting…</div>
  );
}
