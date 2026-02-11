import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRestaurantById, type Restaurant } from "@/lib/api/restaurants";
import { createReservation, fetchReservationPolicy, checkExistingReservations, type ReservationType } from "@/lib/api/reservations";
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
import { Info, ShieldCheck, CreditCard, Clock, Calendar as CalendarIcon, Users, MessageSquare, Gift, Loader2 } from "lucide-react";

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
        } catch (e) { console.log(e.message) }
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

    // Capacity validation
    const cap = type === 'table' ? restaurant.reservationCapacity?.table : restaurant.reservationCapacity?.space;
    if (cap) {
      if (ps < cap.min) return false;
      if (ps > cap.max) return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    if (!/^\d{2}:\d{2}$/.test(time)) return false;
    // Require accepting policy if present
    if (policy && policyAccepted !== true) return false;
    return true;
  }, [restaurant, type, partySize, date, time, policy, policyAccepted]);

  const handleReviewStep = async () => {
    if (!isAuthed) { setAuthOpen(true); return; }
    if (!restaurant) return;

    // Conflict check
    try {
      setSubmitting(true);
      const { count } = await checkExistingReservations(restaurant.id);
      if (count > 0) {
        toast({
          title: "Existing Reservation Found",
          description: "You already have an active reservation for this restaurant. Please manage your existing booking or contact the restaurant.",
          variant: "destructive"
        });
        return;
      }
      setStep('summary');
    } catch (e) {
      console.error("Conflict check failed", e);
      // Proceed anyway if check fails, but log it
      setStep('summary');
    } finally {
      setSubmitting(false);
    }
  };

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

              <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="partySize" className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Party Size
                  </Label>
                  <Input id="partySize" inputMode="numeric" value={partySize} onChange={(e) => setPartySize(e.target.value.replace(/[^0-9]/g, ""))} placeholder="2" className="focus-visible:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion" className="text-sm font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" /> Occasion (optional)
                  </Label>
                  <Input id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Birthday, Anniversary…" className="focus-visible:ring-primary/20 transition-all" />
                </div>
              </div>

              <DateTimeFieldWeb
                valueDate={date}
                valueTime={time}
                onChangeDate={(v) => setDate(v)}
                onChangeTime={(v) => setTime(v)}
              />

              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Special Requests (optional)
                </Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requests" className="focus-visible:ring-primary/20 transition-all border-muted-foreground/20 hover:border-primary/30" />
              </div>

              {policy && (
                <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Reservation Policy
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/40">
                      <CreditCard className="w-4 h-4 text-primary/70" />
                      <div>
                        {policy.requireFee ? (
                          <span className="text-foreground font-medium">Fee required: {Number(policy.feeAmount || 0).toFixed(2)} {policy.feeCurrency || 'USD'}</span>
                        ) : (
                          <span>No reservation fee required</span>
                        )}
                        {typeof policy.redemption?.percent === 'number' && (
                          <p className="text-[11px] opacity-80">Redeemable at restaurant: {policy.redemption.percent}%</p>
                        )}
                      </div>
                    </div>

                    {typeof policy.freeCancelWindowMins === 'number' && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/40">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <div>
                          <span className="text-foreground font-medium">Free cancellation</span>
                          <p className="text-[11px] opacity-80">Up to {policy.freeCancelWindowMins} minutes before reserved time.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 p-2 cursor-pointer group">
                    <div className="relative flex items-center pt-0.5">
                      <input
                        type="checkbox"
                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all"
                        checked={policyAccepted}
                        onChange={(e) => setPolicyAccepted(e.target.checked)}
                      />
                    </div>
                    <span className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                      I have read and agree to the reservation policy.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button variant="outline" asChild className="hover:bg-muted transition-colors px-8">
                  <Link to={`/restaurant/${encodeURIComponent(restaurant.id)}`}>Back</Link>
                </Button>
                <Button
                  disabled={!canSubmit || submitting}
                  onClick={handleReviewStep}
                  className="px-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                >
                  {isAuthed ? 'Review Reservation' : 'Signup to reserve'}
                  {submitting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
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
                <ReservationSummaryWeb reservation={{ type, partySize: Number(partySize) || 0, date, time, restaurant: { name: restaurant.name } }} />
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

      <div className="grid lg:grid-cols-3 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="lg:col-span-2 overflow-hidden border-border/60">
          <CardHeader className="bg-muted/30 border-b border-border/40">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Review & Confirm
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <ReservationSummaryWeb reservation={{ type, partySize: Number(partySize) || 0, date, time, restaurant: { name: restaurant.name } }} />

            {policy && (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Info className="w-4 h-4 text-primary" /> Important Information
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/40">
                    <CreditCard className="w-4 h-4 text-primary/70" />
                    <div>
                      {policy.requireFee ? (
                        <span className="text-foreground font-medium">Fee required: {Number(policy.feeAmount || 0).toFixed(2)} {policy.feeCurrency || 'USD'}</span>
                      ) : (
                        <span>No reservation fee required</span>
                      )}
                    </div>
                  </div>

                  {typeof policy.freeCancelWindowMins === 'number' && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/40">
                      <Clock className="w-4 h-4 text-primary/70" />
                      <div>
                        <span className="text-foreground font-medium">Free cancellation window</span>
                        <p className="text-[11px] opacity-80">Up to {policy.freeCancelWindowMins} minutes before reserved time.</p>
                      </div>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 p-2 cursor-pointer group">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all"
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                    />
                  </div>
                  <span className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                    I have read and agree to the reservation policy.
                  </span>
                </label>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border/40">
              <Button variant="outline" onClick={() => setStep('select')} className="hover:bg-muted transition-colors px-8">Edit Details</Button>
              <Button
                disabled={submitting || !policyAccepted}
                className="px-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
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
                {!isAuthed ? 'Signup to reserve' : (submitting ? 'Placing…' : 'Confirm Reservation')}
                {submitting && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-[88px]">
          <Card className="border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Policy Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {policy ? (
                <div className="text-sm text-muted-foreground space-y-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-primary/60 mt-0.5" />
                    <div>
                      <div className="text-foreground font-medium">Payment</div>
                      {policy.requireFee ? (
                        <p className="text-[11px] leading-relaxed">A deposit of {Number(policy.feeAmount || 0).toFixed(2)} {policy.feeCurrency || 'USD'} is required to secure your booking.</p>
                      ) : (
                        <p className="text-[11px] leading-relaxed">No upfront fee required for this reservation.</p>
                      )}
                    </div>
                  </div>
                  {typeof policy.freeCancelWindowMins === 'number' && (
                    <div className="flex items-start gap-3 border-t border-border/30 pt-4">
                      <Clock className="w-4 h-4 text-primary/60 mt-0.5" />
                      <div>
                        <div className="text-foreground font-medium">Cancellation</div>
                        <p className="text-[11px] leading-relaxed">Free cancellation available up to {policy.freeCancelWindowMins} minutes before arrival.</p>
                      </div>
                    </div>
                  )}
                  {typeof policy.redemption?.percent === 'number' && (
                    <div className="flex items-start gap-3 border-t border-border/30 pt-4">
                      <ShieldCheck className="w-4 h-4 text-primary/60 mt-0.5" />
                      <div>
                        <div className="text-foreground font-medium">Redemption</div>
                        <p className="text-[11px] leading-relaxed">{policy.redemption.percent}% of your fee is redeemable against your bill.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-2 italic">
                  <Info className="w-4 h-4 opacity-50" /> No specific policy provided.
                </div>
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
