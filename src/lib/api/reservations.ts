import { getJson, withBase } from "./webApiConfig";

export type ReservationType = "table" | "space";

export interface NewReservationPayload {
  restaurantId: string;
  type: ReservationType;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  specialRequests?: string;
  occasion?: string;
}

export async function createReservation(payload: NewReservationPayload) {
  return getJson<{ reservation: { id: string }; realtimeToken?: string }>(withBase("/api/reservations"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchReservationPolicy(businessId: string) {
  return getJson<{ policy: any | null }>(withBase(`/api/reservations/policy?businessId=${encodeURIComponent(businessId)}`));
}
