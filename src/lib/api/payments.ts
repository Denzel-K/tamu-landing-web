import { getJson, withBase } from "./webApiConfig";

export interface PaymentMethodsResponse {
  businessId: string;
  enabled: { mpesa: boolean; card: boolean; cash: boolean };
  providers?: { mpesa?: string; card?: string };
  manualMpesaMethods?: Array<{ id: string; type: 'till' | 'paybill' | 'pochi'; label?: string; number: string; account?: string }>;
}

export interface PaymentConfigResponse {
  config: {
    businessId: string;
    enabledMethods: { mpesa: boolean; card: boolean; cash: boolean };
    provider: { mpesa: 'instasend' | 'daraja'; card?: string };
    instasend?: { baseUrl?: string; apiKey?: string; secret?: string; webhookSecret?: string; subMerchantId?: string; storeId?: string; mpesaProductCode?: string };
    manualMpesaMethods?: PaymentMethodsResponse['manualMpesaMethods'];
  } | null;
}

export async function fetchPaymentMethodsForRestaurant(restaurantId: string): Promise<PaymentMethodsResponse> {
  return getJson<PaymentMethodsResponse>(withBase(`/api/payment-methods?businessId=${encodeURIComponent(restaurantId)}`));
}

export async function fetchPaymentConfigForBusiness(restaurantId: string): Promise<PaymentConfigResponse> {
  return getJson<PaymentConfigResponse>(withBase(`/api/payment-configs?businessId=${encodeURIComponent(restaurantId)}`));
}
