import { getJson, withBase } from "./webApiConfig";

export interface Addon {
  id: string;
  name: string;
  price: number;
  type?: 'accompaniment' | 'crust' | 'variant' | string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  addons?: Addon[];
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine?: string;
  image?: string;
  logo?: string;
  menu?: MenuCategory[];
  reservationCapacity?: { table?: { min: number; max: number }; space?: { min: number; max: number } };
  availableReservationTypes?: string[];
  availableOrderTypes?: string[];
}

export async function listRestaurants() {
  return getJson<{ restaurants: Restaurant[] }>(withBase("/api/restaurants"));
}

export async function getRestaurantById(id: string) {
  return getJson<{ restaurant: Restaurant }>(withBase(`/api/restaurants/${encodeURIComponent(id)}`));
}

export async function getRestaurantByEmail(email: string) {
  return getJson<{ restaurant: Restaurant | null }>(withBase(`/api/restaurants/by-email?email=${encodeURIComponent(email)}`));
}
