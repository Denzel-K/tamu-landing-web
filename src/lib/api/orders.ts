import { getJson, withBase } from "./webApiConfig";

export type OrderType = "dine-in" | "takeaway" | "delivery";

export interface NewOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addons?: { name: string; price: number }[];
}

export async function createOrder(payload: {
  restaurantId: string;
  items: NewOrderItem[];
  type: OrderType;
  tableNumber?: string;
  partySize?: number;
  deliveryAddress?: string;
  orderNotes?: string;
  requestUtensils?: boolean;
  waiter?: string;
}) {
  return getJson<{ order: { id: string }; realtimeToken?: string }>(withBase("/api/orders"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface WebOrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  menuItemId?: string;
  addons?: { name: string; price: number }[];
}

export interface WebOrder {
  id: string;
  status?: string;
  items: WebOrderItem[];
  restaurant?: { id: string; name?: string };
  businessId?: string;
  waiterName?: string;
}

export async function fetchOrderById(id: string) {
  return getJson<{ order: WebOrder | null }>(withBase(`/api/orders/${encodeURIComponent(id)}`));
}

export async function updateOrder(
  id: string,
  payload: { items?: WebOrderItem[] }
) {
  return getJson<{ order: WebOrder }>(
    withBase(`/api/orders`),
    {
      method: "PATCH",
      body: JSON.stringify({ orderId: id, ...payload }),
    }
  );
}

export async function cancelOrder(id: string) {
  return getJson<{ ok: boolean }>(withBase(`/api/orders`), {
    method: "PATCH",
    body: JSON.stringify({ orderId: id, status: 'cancelled' }),
  });
}
