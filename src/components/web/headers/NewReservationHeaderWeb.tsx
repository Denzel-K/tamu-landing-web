import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type RestaurantHeaderLike = {
  id?: string;
  name: string;
  cuisine?: string;
  image?: string;
  logo?: string;
  coverImage?: string;
};

export default function NewReservationHeaderWeb({ restaurant }: { restaurant: RestaurantHeaderLike | null | undefined }) {
  const navigate = useNavigate();
  if (!restaurant) return null;
  const cover = restaurant.logo || restaurant.coverImage || restaurant.image;
  return (
    <div className="w-full flex items-center justify-between gap-3 border-b border-border pb-3 mb-4">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2 mr-2" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Button>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
          {cover ? (
            <img src={cover} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-lg font-bold">{(restaurant.name || '?')[0]}</div>
          )}
        </div>
        <div className="min-w-0 text-right">
          <div className="text-xl font-bold truncate">{restaurant.name}</div>
          <div className="text-sm text-muted-foreground truncate">{restaurant.cuisine || ''}</div>
        </div>
      </div>
    </div>
  );
}
