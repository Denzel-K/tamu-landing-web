import React from "react";

type RestaurantHeaderLike = {
  id?: string;
  name: string;
  cuisine?: string;
  image?: string;
  logo?: string;
  coverImage?: string;
};

export default function NewOrderHeaderWeb({ restaurant }: { restaurant: RestaurantHeaderLike | null }) {
  if (!restaurant) return null;
  const cover = restaurant.logo || restaurant.coverImage || restaurant.image;
  return (
    <div className="w-full flex items-center gap-3 border-b border-border pb-3 mb-4">
      <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
        {cover ? (
          <img src={cover} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-lg font-bold">{(restaurant.name || '?')[0]}</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold truncate">{restaurant.name}</div>
        <div className="text-sm text-muted-foreground truncate">{restaurant.cuisine || ''}</div>
      </div>
    </div>
  );
}
