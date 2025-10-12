import { getJson, withBase } from "./webApiConfig";

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  customerId?: string;
  createdAt?: string;
}

export async function listReviews(restaurantId: string) {
  return getJson<{ reviews: Review[] }>(withBase(`/api/restaurants/${encodeURIComponent(restaurantId)}/reviews`));
}

export async function checkEligibility(restaurantId: string) {
  return getJson<{ isCustomer: boolean; customerId?: string }>(withBase(`/api/restaurants/${encodeURIComponent(restaurantId)}/reviews/eligibility`));
}

export async function createReview(restaurantId: string, body: { rating: number; comment: string }) {
  return getJson<{ review: { id: string } }>(withBase(`/api/restaurants/${encodeURIComponent(restaurantId)}/reviews`), {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateReview(restaurantId: string, reviewId: string, body: { rating?: number; comment?: string }) {
  return getJson<{ success: boolean }>(withBase(`/api/restaurants/${encodeURIComponent(restaurantId)}/reviews/${encodeURIComponent(reviewId)}`), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteReview(restaurantId: string, reviewId: string) {
  return getJson<{ success: boolean }>(withBase(`/api/restaurants/${encodeURIComponent(restaurantId)}/reviews/${encodeURIComponent(reviewId)}`), {
    method: "DELETE",
  });
}
