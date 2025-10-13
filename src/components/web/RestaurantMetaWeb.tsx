import { Badge } from "@/components/ui/badge";
import type { RestaurantWeb } from "@/hooks/useRestaurantsWeb";

interface RestaurantMetaWebProps {
  restaurant: RestaurantWeb;
}

// Lightweight web version of RestaurantMeta used on mobile.
// Shows available order types, reservation types, and special features as small badges.
export default function RestaurantMetaWeb({ restaurant }: RestaurantMetaWebProps) {
  const order: string[] = restaurant.availableOrderTypes || [];
  const reserve: string[] = restaurant.availableReservationTypes || [];
  const features: string[] = restaurant.specialFeatures || [];

  const items: string[] = [];
  if (order.length) items.push(...order);
  if (reserve.length) items.push(...reserve);
  if (features.length) items.push(...features);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((text, i) => (
        <Badge key={i} variant="secondary" className="text-[10px] font-medium py-0.5 px-2 rounded-full">
          {text}
        </Badge>
      ))}
    </div>
  );
}
