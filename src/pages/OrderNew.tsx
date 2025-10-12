import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { createOrder, type OrderType, type NewOrderItem } from "@/lib/api/orders";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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

  const [orderType, setOrderType] = useState<OrderType | "">("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [partySize, setPartySize] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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
        } catch {}
      } catch (e: any) {
        if (!mounted) return; setError(e?.message || "Failed to load restaurant");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [rid]);

  const canSubmit = useMemo(() => {
    if (!restaurant) return false;
    if (!orderType) return false;
    if (orderType === "delivery" && deliveryAddress.trim().length < 6) return false;
    if (orderType === "dine-in" && !partySize) return false;
    return true;
  }, [restaurant, orderType, deliveryAddress, partySize]);

  const onSubmit = async () => {
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
      // Placeholder items; Phase 2 will use a cart
      const items: NewOrderItem[] = [];
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
      } catch {}
      try {
        if (!paymentConfig) {
          const pc = await fetchPaymentConfigForBusiness(restaurant.id);
          setPaymentConfig(pc?.config || null);
        }
      } catch {}
      // If M-Pesa enabled, open sheet; else proceed and show confirmation page with pay later
      const mpesaEnabled = (paymentMethods ? !!paymentMethods.enabled?.mpesa : true);
      if (mpesaEnabled) {
        setShowPay(true);
      } else {
        navigate(`/orders/confirmation/${encodeURIComponent(newId)}`);
      }
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

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">New Order • {restaurant.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Order Type</Label>
            <div className="flex gap-2">
              {(["dine-in", "takeaway", "delivery"] as const).map((t) => (
                <Button key={t} variant={orderType === t ? "default" : "outline"} type="button" onClick={() => setOrderType(t)}>{t}</Button>
              ))}
            </div>
          </div>

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
            <Button disabled={!canSubmit || submitting} onClick={onSubmit}>{submitting ? "Placing…" : "Place Order"}</Button>
          </div>
        </CardContent>
      </Card>
      <PaymentMethodSheetWeb
        open={showPay}
        onOpenChange={setShowPay}
        context={{ serviceType: 'order', referenceId: String(lastOrderId || ''), amount: 0, businessId: String(restaurant?.id || ''), allowPayLater: true }}
        paymentMethods={paymentMethods}
        paymentConfig={paymentConfig}
        onSuccessPaid={() => { setShowPay(false); if (lastOrderId) navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); }}
        onDeferCash={() => { setShowPay(false); if (lastOrderId) navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); }}
        onSubmittedManual={() => { setShowPay(false); if (lastOrderId) navigate(`/orders/confirmation/${encodeURIComponent(lastOrderId)}`); }}
      />
    </div>
  );
}
