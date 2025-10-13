import { withBase, getJson } from "./webApiConfig";

// Generic payment flow helpers. Adjust endpoints to match backend.
// Returns opaque transaction/reference IDs where applicable.

export interface StartMpesaResponse { reference: string; status?: string }
export interface StartCardResponse { reference: string; redirectUrl?: string }
export interface PaymentStatusResponse { status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled'; paidAmount?: number; provider?: string }

export async function startMpesaStk(params: { businessId: string; amount: number; orderId?: string; reservationId?: string; phone?: string }) {
  return getJson<StartMpesaResponse>(withBase(`/api/payments/mpesa/stk`), {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function submitManualMpesa(params: { businessId: string; amount: number; code: string; orderId?: string; reservationId?: string; methodId?: string; methodType?: 'till' | 'paybill' | 'pochi' }) {
  return getJson<StartMpesaResponse>(withBase(`/api/payments/mpesa/manual`), {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function startCardPayment(params: { businessId: string; amount: number; orderId?: string; reservationId?: string }) {
  return getJson<StartCardResponse>(withBase(`/api/payments/card`), {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchPaymentStatus(reference: string) {
  return getJson<PaymentStatusResponse>(withBase(`/api/payments/status?ref=${encodeURIComponent(reference)}`));
}
