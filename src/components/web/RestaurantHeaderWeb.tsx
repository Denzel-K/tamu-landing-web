import React from "react";

type RestaurantHeaderLike = {
  id?: string;
  name: string;
  cuisine?: string;
  image?: string;
  logo?: string;
  coverImage?: string;
  priceRange?: string;
};

interface RestaurantHeaderWebProps {
  restaurant: RestaurantHeaderLike;
}

export default function RestaurantHeaderWeb({ restaurant }: RestaurantHeaderWebProps) {
  const cover = restaurant.coverImage || restaurant.logo || restaurant.image;
  const initial = (restaurant.name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border mb-4">
      <div className="h-56 md:h-64 w-full">
        {cover ? (
          <img src={cover} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-2xl font-bold">
              {initial}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="text-white text-2xl font-extrabold drop-shadow">{restaurant.name}</div>
        {restaurant.cuisine && (
          <div className="text-white/90 text-sm drop-shadow">{restaurant.priceRange ? `${restaurant.priceRange} · ` : ''}{restaurant.cuisine}</div>
        )}
      </div>
    </div>
  );
}
