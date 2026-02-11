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
  const cover = restaurant.coverImage || restaurant.image || "https://placehold.co/800x400/png?text=Restaurant";
  const logo = restaurant.logo || restaurant.image;
  const initial = (restaurant.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-border/50 mb-6 bg-muted group shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="h-60 md:h-72 w-full overflow-hidden">
        <img
          src={cover}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Premium Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 pt-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end">
        <div className="flex items-center gap-4">
          {/* Logo / Avatar */}
          <div className="w-14 h-14 rounded-full border-2 border-white/90 bg-white shadow-xl overflow-hidden shrink-0 flex items-center justify-center animate-in zoom-in-50 duration-500">
            {logo ? (
              <img src={logo} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-primary">{initial}</span>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md truncate">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-white/90 text-sm font-bold tracking-tight uppercase">{restaurant.cuisine || 'Restaurant'}</span>
              <span className="text-white/40 font-bold">·</span>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFC700" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
                <span className="text-xs font-black text-white">4.8</span>
                <span className="text-[10px] text-white/70 font-bold">(500+)</span>
              </div>
              {restaurant.priceRange && (
                <>
                  <span className="text-white/40 font-bold">·</span>
                  <span className="text-white/90 text-sm font-bold tracking-tight">{restaurant.priceRange}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
