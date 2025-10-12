import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { createReservation, fetchReservationPolicy, type ReservationType } from "@/lib/api/reservations";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type ReservationPolicy = {
  requireFee?: boolean;
  feeAmount?: number;
  feeCurrency?: string;
  redemption?: { type?: string; percent?: number };
  freeCancelWindowMins?: number;
  lateCancelForfeitPercent?: number;
  noShowForfeitPercent?: number;
} | null;

export default function ReservationNew() {
  const [sp] = useSearchParams();
  const rid = sp.get("restaurantId") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<ReservationType | "">("");
  const [partySize, setPartySize] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");

  const [policy, setPolicy] = useState<ReservationPolicy>(null);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse['config'] | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [pendingRef, setPendingRef] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!rid) throw new Error("Missing restaurantId");
        const res = await getRestaurantById(rid);
        if (!mounted) return;
        setRestaurant(res.restaurant);
        try {
          const p = await fetchReservationPolicy(rid);
          if (mounted) setPolicy(p?.policy || null);
        } catch (e) {
          // Non-fatal if policy endpoint not available
          if (mounted) setPolicy(null);
        }
        // Prefetch payment context
        try {
          const [m, c] = await Promise.all([
            fetchPaymentMethodsForRestaurant(rid),
            fetchPaymentConfigForBusiness(rid),
          ]);
          if (mounted) {
            setPaymentMethods(m || null);
            setPaymentConfig(c?.config || null);
          }
        } catch (e) {console.log(e.message)}
      } catch (e) {
        if (!mounted) return; const msg = e instanceof Error ? e.message : "Failed to load restaurant"; setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [rid]);

  const canSubmit = useMemo(() => {
    if (!restaurant) return false;
    if (!type) return false;
    const ps = Number(partySize);
    if (!ps || ps <= 0) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    if (!/^\d{2}:\d{2}$/.test(time)) return false;
    // Require accepting policy if present
    if (policy && policyAccepted !== true) return false;
    return true;
  }, [restaurant, type, partySize, date, time, policy, policyAccepted]);

  const onSubmit = async () => {
    if (!restaurant) return;
    setSubmitting(true);
    try {
      const res = await createReservation({
        restaurantId: restaurant.id,
        type: type as ReservationType,
        partySize: Number(partySize),
        date,
        time,
        specialRequests: notes || undefined,
        occasion: occasion || undefined,
      });
      toast({ title: "Reservation placed", description: `Reservation ID: ${res.reservation.id}` });
      navigate(`/reservations/confirmation/${encodeURIComponent(res.reservation.id)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Could not place reservation", description: msg, variant: "destructive" });
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
      <h1 className="text-2xl font-bold mb-4">New Reservation • {restaurant.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reservation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reservation Type</Label>
            <div className="flex gap-2">
              {(["table", "space"] as const).map((t) => (
                <Button key={t} variant={type === t ? "default" : "outline"} type="button" onClick={() => setType(t)}>{t}</Button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partySize">Party Size</Label>
              <Input id="partySize" inputMode="numeric" value={partySize} onChange={(e) => setPartySize(e.target.value.replace(/[^0-9]/g, ""))} placeholder="2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion (optional)</Label>
              <Input id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Birthday, Anniversary…" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests (optional)</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests" />
          </div>

          {policy && (
            <div className="rounded border border-border p-4 space-y-2">
              <div className="text-sm text-muted-foreground">
                {policy.requireFee ? (
                  <>Reservation fee required: {Number(policy.feeAmount || 0).toFixed(2)} {policy.feeCurrency || 'USD'}</>
                ) : (
                  <>No reservation fee required</>
                )}
              </div>
              {typeof policy.redemption?.percent === 'number' && (
                <div className="text-xs text-muted-foreground">Redeemable at restaurant: {policy.redemption.percent}%</div>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                />
                <span>I have read and agree to the reservation policy.</span>
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline" asChild>
              <Link to={`/restaurant/${encodeURIComponent(restaurant.id)}`}>Back</Link>
            </Button>
            <Button
              disabled={!canSubmit || submitting}
              onClick={async () => {
                // If fee required, open payment sheet first
                const feeRequired = !!policy?.requireFee && Number(policy?.feeAmount || 0) > 0;
                if (feeRequired) {
                  // ensure payment context is available
                  try { if (!paymentMethods) setPaymentMethods(await fetchPaymentMethodsForRestaurant(restaurant.id)); } catch(e) {console.log(e.message)}
                  try { if (!paymentConfig) { const pc = await fetchPaymentConfigForBusiness(restaurant.id); setPaymentConfig(pc?.config || null); } } catch(e) {console.log(e.message)}
                  setPendingRef(`resv:${restaurant.id}:${Date.now()}`);
                  setShowPay(true);
                  return;
                }
                await onSubmit();
              }}
            >
              {submitting ? "Placing…" : "Place Reservation"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <PaymentMethodSheetWeb
        open={showPay}
        onOpenChange={setShowPay}
        context={{ serviceType: 'reservation_fee', referenceId: String(pendingRef || ''), amount: Number(policy?.feeAmount || 0), businessId: String(restaurant?.id || ''), allowPayLater: false }}
        paymentMethods={paymentMethods}
        paymentConfig={paymentConfig}
        onSuccessPaid={async () => { setShowPay(false); await onSubmit(); }}
        onDeferCash={() => { /* not allowed for fee */ }}
        onSubmittedManual={async () => { setShowPay(false); await onSubmit(); }}
      />
    </div>
  );
}
