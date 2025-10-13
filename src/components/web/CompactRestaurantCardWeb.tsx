import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { RestaurantWeb } from "@/hooks/useRestaurantsWeb";
import RestaurantMetaWeb from "./RestaurantMetaWeb";

export interface CompactRestaurantCardWebProps {
  restaurant: RestaurantWeb;
}

export default function CompactRestaurantCardWeb({ restaurant }: CompactRestaurantCardWebProps) {
  const { id, name, cuisine } = restaurant;
  const image = (restaurant.coverImage || restaurant.logo || restaurant.image) as string | undefined;
  const km = typeof restaurant.distance === 'number' ? `${restaurant.distance.toFixed(1)} km` : undefined;
  const rating = restaurant.rating;
  const priceRange = restaurant.priceRange;
  const todayHours = restaurant.operatingHours ? Object.values(restaurant.operatingHours)[0] : undefined;

  return (
    <Link to={`/restaurant/${encodeURIComponent(id)}`} className="block">
      <Card className="flex-col rounded-2xl overflow-hidden border border-primary/20 bg-card/80 shadow-md hover:shadow-lg transition-shadow">
        {/* Top image */}
        <div className="h-[170px] w-full">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>

        {/* Bottom content */}
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-[15px] font-semibold truncate">{name}</div>
            {typeof rating === 'number' && (
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="mr-1">★</span>
                {rating.toFixed ? rating.toFixed(1) : rating}
              </div>
            )}
          </div>

          <div className="mt-0.5 text-[12px] text-muted-foreground truncate">
            {priceRange ? `${priceRange} · ` : ''}{cuisine || ''}
          </div>

          {/* Meta badges */}
          <div className="mt-1">
            <RestaurantMetaWeb restaurant={restaurant} />
          </div>

          {/* Distance and hours */}
          <div className="flex items-center gap-3 mt-2 text-[12px] text-muted-foreground">
            {km && <span>{km}</span>}
            {todayHours && <span className="truncate">{todayHours}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
