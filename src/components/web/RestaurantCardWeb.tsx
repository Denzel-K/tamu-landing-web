import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface RestaurantCardWebProps {
  restaurant: {
    id: string;
    name: string;
    cuisine?: string;
    image?: string;
    logo?: string;
    distance?: number;
  };
}

export default function RestaurantCardWeb({ restaurant }: RestaurantCardWebProps) {
  const { id, name, cuisine, image, distance } = restaurant;
  const km = typeof distance === 'number' ? `${distance.toFixed(1)} km` : undefined;
  return (
    <Link to={`/restaurant/${encodeURIComponent(id)}`} className="block focus:outline-none">
      <Card className="overflow-hidden bg-card/70 border-border hover:shadow-md transition-shadow">
        {image ? (
          <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold leading-tight">{name}</div>
              {cuisine && <div className="text-sm text-muted-foreground">{cuisine}</div>}
            </div>
            {km && <div className="text-xs text-muted-foreground whitespace-nowrap">{km}</div>}
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3" />
      </Card>
    </Link>
  );
}
