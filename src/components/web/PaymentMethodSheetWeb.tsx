import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PaymentMethodsResponse, PaymentConfigResponse } from "@/lib/api/payments";
import { startMpesaStk, submitManualMpesa, startCardPayment, fetchPaymentStatus } from "@/lib/api/paymentFlows";
import { Input } from "@/components/ui/input";

interface PaymentMethodSheetWebProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  context: { serviceType: 'order' | 'reservation_fee'; referenceId: string; amount: number; businessId: string; allowPayLater?: boolean };
  paymentMethods: PaymentMethodsResponse | null;
  paymentConfig: PaymentConfigResponse['config'] | null;
  onSuccessPaid: () => void;
  onDeferCash: () => void;
  onSubmittedManual?: () => void;
}

export default function PaymentMethodSheetWeb({ open, onOpenChange, context, paymentMethods, paymentConfig, onSuccessPaid, onDeferCash, onSubmittedManual }: PaymentMethodSheetWebProps) {
  const mpesaEnabled = !!paymentMethods?.enabled?.mpesa;
  const cardEnabled = !!paymentMethods?.enabled?.card;
  const cashEnabled = !!paymentMethods?.enabled?.cash;
  const [phone, setPhone] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const canSubmitManual = useMemo(() => manualCode.trim().length >= 6, [manualCode]);
  const canSubmitStk = useMemo(() => /\d{9,}/.test(phone.replace(/\D/g, "")), [phone]);

  const pollStatus = async (reference: string) => {
    // simple polling loop with a timeout
    const started = Date.now();
    let delay = 1200;
    while (Date.now() - started < 60_000) {
      const res = await fetchPaymentStatus(reference);
      if (res.status === 'success') return 'success';
      if (res.status === 'failed' || res.status === 'cancelled') return res.status;
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(5000, Math.round(delay * 1.3));
    }
    return 'pending';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your {context.serviceType === 'order' ? 'Order' : 'Reservation Fee'}</DialogTitle>
          <DialogDescription>
            Amount: {context.amount.toFixed(2)} • Reference: {context.referenceId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          {mpesaEnabled && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="text-sm font-semibold">M‑Pesa STK Push</div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Phone e.g. 07XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Button disabled={!canSubmitStk || submitting} onClick={async () => {
                  try {
                    setSubmitting(true); setStatusMsg('Initiating STK push…');
                    const res = await startMpesaStk({ businessId: context.businessId, amount: context.amount, orderId: context.serviceType === 'order' ? context.referenceId : undefined, reservationId: context.serviceType === 'reservation_fee' ? context.referenceId : undefined, phone });
                    setStatusMsg('Awaiting payment confirmation…');
                    const outcome = await pollStatus(res.reference);
                    if (outcome === 'success') { onSuccessPaid(); }
                    else { setStatusMsg('Payment not completed. You can try again.'); }
                  } catch {
                    setStatusMsg('Failed to initiate M‑Pesa.');
                  } finally { setSubmitting(false); }
                }}>Pay</Button>
              </div>
            </div>
          )}
          {cardEnabled && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="text-sm font-semibold">Card Payment</div>
              <Button variant="outline" disabled={submitting} onClick={async () => {
                try {
                  setSubmitting(true); setStatusMsg('Starting card payment…');
                  const res = await startCardPayment({ businessId: context.businessId, amount: context.amount, orderId: context.serviceType === 'order' ? context.referenceId : undefined, reservationId: context.serviceType === 'reservation_fee' ? context.referenceId : undefined });
                  if (res.redirectUrl) {
                    window.location.href = res.redirectUrl;
                    return;
                  }
                  // If no redirect, attempt to poll status using the returned reference
                  const outcome = await pollStatus(res.reference);
                  if (outcome === 'success') onSuccessPaid(); else setStatusMsg('Card payment not completed.');
                } catch {
                  setStatusMsg('Failed to start card payment.');
                } finally { setSubmitting(false); }
              }}>Pay with Card</Button>
            </div>
          )}
          {cashEnabled && context.allowPayLater !== false && (
            <Button variant="secondary" className="w-full" disabled={submitting} onClick={() => onDeferCash()}>Pay Later (Cash)</Button>
          )}

          {paymentConfig?.manualMpesaMethods?.length ? (
            <div className="rounded-md border border-border p-3">
              <div className="text-sm font-semibold mb-1">Manual M‑Pesa</div>
              <div className="text-xs text-muted-foreground mb-2">Use a listed till/paybill and submit your code.</div>
              <div className="flex flex-wrap gap-2">
                {paymentConfig.manualMpesaMethods.map((m) => (
                  <div key={m.id} className="text-xs border border-border rounded px-2 py-1">{m.type.toUpperCase()} {m.number}{m.account ? ` • ${m.account}` : ''}</div>
                ))}
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <Input placeholder="M‑Pesa code" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
                <Button size="sm" disabled={!canSubmitManual || submitting} onClick={async () => {
                  try {
                    setSubmitting(true); setStatusMsg('Submitting manual payment…');
                    const res = await submitManualMpesa({ businessId: context.businessId, amount: context.amount, code: manualCode.trim(), orderId: context.serviceType === 'order' ? context.referenceId : undefined, reservationId: context.serviceType === 'reservation_fee' ? context.referenceId : undefined });
                    const outcome = await pollStatus(res.reference);
                    if (outcome === 'success') onSuccessPaid(); else setStatusMsg('Manual payment not confirmed yet.');
                  } catch {
                    setStatusMsg('Failed to submit manual code.');
                  } finally { setSubmitting(false); }
                }}>Submit Code</Button>
              </div>
            </div>
          ) : null}

          {statusMsg && (
            <div className="text-xs text-muted-foreground">{statusMsg}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
