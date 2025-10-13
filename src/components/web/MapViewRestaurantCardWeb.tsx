import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { RestaurantWeb } from "@/hooks/useRestaurantsWeb";

interface MapViewRestaurantCardWebProps {
  restaurant: RestaurantWeb;
  isActive?: boolean;
  asLink?: boolean;
  onClick?: () => void;
}

export default function MapViewRestaurantCardWeb({ restaurant, isActive = false, asLink = true, onClick }: MapViewRestaurantCardWebProps) {
  const { id, name, cuisine } = restaurant;
  const image = restaurant.logo || restaurant.coverImage || restaurant.image;
  const km = typeof restaurant.distance === 'number' ? `${restaurant.distance.toFixed(1)} km` : undefined;
  const rating = restaurant.rating;
  const priceRange = restaurant.priceRange;

  const content = (
      <Card
        className={
          `flex flex-row items-stretch rounded-2xl overflow-hidden border bg-card/80 transition-all h-[120px] ` +
          `${isActive ? 'border-primary ring-2 ring-primary shadow-lg' : 'border-primary/20 shadow-md'} ` +
          `hover:shadow-lg hover:ring-1 hover:ring-primary/40 cursor-pointer`
        }
      >
        {/* Left image with fixed height */}
        <div className="w-[120px] h-full">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
          )}
        </div>
        {/* Right content */}
        <div className="relative flex-1 p-3">
          <div className="flex items-center">
            <div className="flex-1 text-[14px] font-semibold truncate">{name}</div>
            {typeof rating === 'number' && (
              <div className="flex items-center ml-2 text-xs text-muted-foreground">
                <span className="inline-block mr-1">★</span>
                {rating.toFixed ? rating.toFixed(1) : rating}
              </div>
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
            {priceRange ? `${priceRange} · ` : ''}{cuisine || ''}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            {km && <span>{km}</span>}
          </div>
          {/* Bottom-right arrow; avoid nested anchors when asLink is true */}
          {asLink ? (
            <button
              type="button"
              aria-label={`Open ${name} details`}
              className="absolute bottom-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-border bg-background/80 hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={(e) => {
                // the whole card is already a link in asLink=true mode; stop bubbling to avoid duplicate triggers
                e.stopPropagation();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h12M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <Link
              to={`/restaurant/${encodeURIComponent(id)}`}
              aria-label={`Open ${name} details`}
              className="absolute bottom-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-full border border-border bg-background/80 hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={(e) => {
                // prevent bubbling to onClick selection if present
                e.stopPropagation();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h12M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </Card>
  );

  if (asLink) {
    return (
      <Link to={`/restaurant/${encodeURIComponent(id)}`} className="block">
        {content}
      </Link>
    );
  }

  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }} className="block focus:outline-none">
      {content}
    </div>
  );
}
