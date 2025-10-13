import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { createReservation, fetchReservationPolicy, type ReservationType } from "@/lib/api/reservations";
import { fetchPaymentMethodsForRestaurant, fetchPaymentConfigForBusiness, type PaymentMethodsResponse, type PaymentConfigResponse } from "@/lib/api/payments";
import PaymentMethodSheetWeb from "@/components/web/PaymentMethodSheetWeb";
import NewReservationHeaderWeb from "@/components/web/headers/NewReservationHeaderWeb";
import ReservationTypeSelectorWeb from "@/components/web/reservations/ReservationTypeSelectorWeb";
import DateTimeFieldWeb from "@/components/web/common/DateTimeFieldWeb";
import ReservationSummaryWeb from "@/components/web/reservations/ReservationSummaryWeb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { authLocal, authBus } from "@/lib/auth/authLocal";
import AuthModalWeb from "@/components/auth/AuthModalWeb";

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'summary'>('select');

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
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(!!authLocal.getAccessToken());

  useEffect(() => {
    // Gate: prompt login if unauthenticated when landing
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
    if (!isAuthed) { setAuthOpen(true); return; }
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

  // Select step UI
  if (step === 'select') {
    return (
      <div className="container mx-auto px-6 py-8">
        <NewReservationHeaderWeb restaurant={restaurant} />
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <div className={`px-2 py-1 rounded ${step === 'select' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>1. Details</div>
          <div className="h-px flex-1 bg-border" />
          <div className={`px-2 py-1 rounded bg-muted`}>2. Review</div>
          <div className="h-px flex-1 bg-border" />
          <div className={`px-2 py-1 rounded bg-muted`}>3. Confirmation</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Reservation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReservationTypeSelectorWeb
                availableReservationTypes={restaurant.availableReservationTypes || []}
                selectedReservationType={type || undefined}
                onSelectReservationType={(t) => setType(t)}
              />

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

              <DateTimeFieldWeb
                valueDate={date}
                valueTime={time}
                onChangeDate={(v) => setDate(v)}
                onChangeTime={(v) => setTime(v)}
              />

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
                  disabled={!canSubmit}
                  onClick={() => { if (!isAuthed) { setAuthOpen(true); return; } setStep('summary'); }}
                >
                  {isAuthed ? 'Review Reservation' : 'Signup to reserve'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:sticky lg:top-[88px]">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ReservationSummaryWeb reservation={{ type, partySize: Number(partySize)||0, date, time, restaurant: { name: restaurant.name } }} />
              </CardContent>
            </Card>
          </div>
        </div>

        <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => setAuthOpen(false)} />
      </div>
    );
  }

  // Summary step UI
  return (
    <div className="container mx-auto px-6 py-8">
      <NewReservationHeaderWeb restaurant={restaurant} />
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <div className={`px-2 py-1 rounded bg-muted`}>1. Details</div>
        <div className="h-px flex-1 bg-border" />
        <div className={`px-2 py-1 rounded ${step === 'summary' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>2. Review</div>
        <div className="h-px flex-1 bg-border" />
        <div className={`px-2 py-1 rounded bg-muted`}>3. Confirmation</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Review & Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReservationSummaryWeb reservation={{ type, partySize: Number(partySize)||0, date, time, restaurant: { name: restaurant.name } }} />
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

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={() => setStep('select')}>Edit</Button>
              <Button
                disabled={submitting || !policyAccepted}
                onClick={async () => {
                  if (!isAuthed) { setAuthOpen(true); return; }
                  const feeRequired = !!policy?.requireFee && Number(policy?.feeAmount || 0) > 0;
                  if (feeRequired) {
                    try { if (!paymentMethods) setPaymentMethods(await fetchPaymentMethodsForRestaurant(restaurant.id)); } catch (e) { /* non-fatal */ }
                    try { if (!paymentConfig) { const pc = await fetchPaymentConfigForBusiness(restaurant.id); setPaymentConfig(pc?.config || null); } } catch (e) { /* non-fatal */ }
                    setPendingRef(`resv:${restaurant.id}:${Date.now()}`);
                    setShowPay(true);
                    return;
                  }
                  await onSubmit();
                }}
              >
                {!isAuthed ? 'Signup to reserve' : (submitting ? 'Placing…' : 'Place Reservation')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-[88px]">
          <Card>
            <CardHeader>
              <CardTitle>Policy</CardTitle>
            </CardHeader>
            <CardContent>
              {policy ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  <div>
                    {policy.requireFee ? (
                      <>Reservation fee required: {Number(policy.feeAmount || 0).toFixed(2)} {policy.feeCurrency || 'USD'}</>
                    ) : (
                      <>No reservation fee required</>
                    )}
                  </div>
                  {typeof policy.redemption?.percent === 'number' && (
                    <div>Redeemable at restaurant: {policy.redemption.percent}%</div>
                  )}
                  {typeof policy.freeCancelWindowMins === 'number' && (
                    <div>Free cancel window: {policy.freeCancelWindowMins} mins</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No specific policy provided.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
      <AuthModalWeb open={authOpen} onOpenChange={setAuthOpen} onAuthed={() => setAuthOpen(false)} />
    </div>
  );
}
