import React, { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PaymentMethodsResponse, PaymentConfigResponse } from "@/lib/api/payments";
import { startMpesaStk, submitManualMpesa, startCardPayment, fetchPaymentStatus } from "@/lib/api/paymentFlows";
import { Input } from "@/components/ui/input";
import { authLocal } from "@/lib/auth/authLocal";

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
  // Availability computation mirrors mobile logic
  const enabledFromConfig = {
    mpesa: !!paymentConfig?.enabledMethods?.mpesa,
    cash: !!paymentConfig?.enabledMethods?.cash,
    card: !!paymentConfig?.enabledMethods?.card,
  };

  // Prefill phone from authenticated user when dialog opens
  useEffect(() => {
    if (!open) return;
    try {
      const user = authLocal.getUser();
      const p = user?.phone || "";
      if (p) setPhone(normalizePhone254(p));
    } catch { /* noop */ }
  }, [open]);
  const enabledFromMethods = {
    mpesa: !!paymentMethods?.enabled?.mpesa,
    cash: !!paymentMethods?.enabled?.cash,
    card: !!paymentMethods?.enabled?.card,
  };
  const mpesaEnabled = enabledFromConfig.mpesa || enabledFromMethods.mpesa;
  const cardEnabled = enabledFromConfig.card || enabledFromMethods.card;
  const cashEnabled = enabledFromConfig.cash || enabledFromMethods.cash;

  // Instasend readiness (aggregator identifiers presence)
  const instasendReady = !!(
    paymentConfig?.instasend?.subMerchantId ||
    paymentConfig?.instasend?.mpesaProductCode ||
    paymentConfig?.instasend?.storeId
  );
  const stkAvailable = mpesaEnabled && instasendReady;

  // Merge manual M‑Pesa methods from config and endpoint
  type ManualMpesaMethod = NonNullable<PaymentConfigResponse["config"]>["manualMpesaMethods"] extends (infer U)[]
    ? U & { id: string; type: 'till' | 'paybill' | 'pochi'; label?: string; number: string; account?: string }
    : { id: string; type: 'till' | 'paybill' | 'pochi'; label?: string; number: string; account?: string };
  const manualMethods: ManualMpesaMethod[] = useMemo(() => {
    const fromConfig: ManualMpesaMethod[] = Array.isArray(paymentConfig?.manualMpesaMethods)
      ? (paymentConfig?.manualMpesaMethods as ManualMpesaMethod[])
      : [];
    const fromEndpoint: ManualMpesaMethod[] = Array.isArray(paymentMethods?.manualMpesaMethods)
      ? (paymentMethods?.manualMpesaMethods as ManualMpesaMethod[])
      : [];
    const keyOf = (m: ManualMpesaMethod) => `${m.id || ''}|${m.type}|${m.number}|${m.account || ''}`;
    const map = new Map<string, ManualMpesaMethod>();
    [...fromConfig, ...fromEndpoint].forEach((m) => map.set(m.id || keyOf(m), m));
    return Array.from(map.values());
  }, [paymentConfig, paymentMethods]);
  const manualAvailable = manualMethods.length > 0;

  const [phone, setPhone] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [selectedManualId, setSelectedManualId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Pre-select first manual method when manual becomes available
  useEffect(() => {
    if (manualAvailable && !selectedManualId) {
      const first = manualMethods[0];
      if (first?.id) setSelectedManualId(first.id);
    }
  }, [manualAvailable, manualMethods, selectedManualId]);

  const canSubmitManual = useMemo(() => manualCode.trim().length >= 6 && !!selectedManualId, [manualCode, selectedManualId]);
  const canSubmitStk = useMemo(() => /\d{9,}/.test(phone.replace(/\D/g, "")), [phone]);

  // Normalize phone to 254XXXXXXXXX similar to mobile
  const normalizePhone254 = (raw: string) => {
    const s = (raw || '').trim();
    if (!s) return '';
    if (/^07\d{8}$/.test(s)) return `254${s.slice(1)}`;
    if (/^\+254\d{9}$/.test(s)) return s.replace(/^\+/, '');
    if (/^254\d{9}$/.test(s)) return s;
    const digits = s.replace(/\D+/g, '');
    if (/^7\d{8}$/.test(digits)) return `254${digits}`;
    if (/^254\d{9}$/.test(digits)) return digits;
    return digits; // fallback: pass digits as-is
  };

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
          {stkAvailable && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <div className="text-sm font-semibold">M‑Pesa STK Push</div>
              <div className="flex gap-2 items-center">
                <Input placeholder="Phone e.g. 07XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Button disabled={!canSubmitStk || submitting} onClick={async () => {
                  try {
                    setSubmitting(true); setStatusMsg('Initiating STK push…');
                    const normalized = normalizePhone254(phone);
                    const res = await startMpesaStk({ businessId: context.businessId, amount: context.amount, orderId: context.serviceType === 'order' ? context.referenceId : undefined, reservationId: context.serviceType === 'reservation_fee' ? context.referenceId : undefined, phone: normalized });
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

          {manualAvailable && (
            <div className="rounded-md border border-border p-3">
              <div className="text-sm font-semibold mb-1">Manual M‑Pesa</div>
              <div className="text-xs text-muted-foreground mb-2">Pay via Pochi, Till or Paybill, then paste the code.</div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {manualMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`text-xs border rounded px-2 py-1 ${selectedManualId === m.id ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground'}`}
                      onClick={() => setSelectedManualId(m.id)}
                    >
                      {(m.label || m.type.toUpperCase())} • {m.number}{m.account ? ` • ${m.account}` : ''}
                    </button>
                  ))}
                </div>
                <div className="mt-1 flex gap-2 items-center">
                  <Input placeholder="M‑Pesa code" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
                  <Button size="sm" disabled={!canSubmitManual || submitting} onClick={async () => {
                    try {
                      setSubmitting(true); setStatusMsg('Submitting manual payment…');
                      const selected = manualMethods.find(m => m.id === selectedManualId);
                      await submitManualMpesa({
                        businessId: context.businessId,
                        amount: context.amount,
                        code: manualCode.trim(),
                        orderId: context.serviceType === 'order' ? context.referenceId : undefined,
                        reservationId: context.serviceType === 'reservation_fee' ? context.referenceId : undefined,
                        methodId: selected?.id,
                        methodType: selected?.type,
                      });
                      // Mirror mobile: do not mark as paid here; let confirmation flow/realtime handle it
                      onSubmittedManual?.();
                      onOpenChange(false);
                    } catch {
                      setStatusMsg('Failed to submit manual code.');
                    } finally { setSubmitting(false); }
                  }}>Submit Code</Button>
                </div>
              </div>
            </div>
          )}

          {statusMsg && (
            <div className="text-xs text-muted-foreground">{statusMsg}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
