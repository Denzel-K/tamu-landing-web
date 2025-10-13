import React from "react";

export default function NearbyRestaurantsLoaderWeb() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 select-none">
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        {/* Radar waves using Tailwind's animate-ping with staggered delays */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-emerald-400/40 animate-ping"
            style={{ width: 120, height: 120, animationDelay: `${i * 350}ms`, animationDuration: '1600ms' }}
          />
        ))}

        {/* Map pin (SVG) with subtle bob animation using CSS */}
        <div className="flex items-center justify-center" style={{ animation: 'tamu-bob 1.2s ease-in-out infinite alternate' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-7.58 8-13a8 8 0 1 0-16 0c0 5.42 8 13 8 13z" stroke="#10b981" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="9" r="3" fill="#10b981" />
          </svg>
        </div>

        {/* Inline keyframes for bobbing (scoped) */}
        <style>{`
          @keyframes tamu-bob {
            0% { transform: translateY(0) scale(0.98); }
            100% { transform: translateY(-6px) scale(1); }
          }
        `}</style>
      </div>

      <div className="mt-4 text-center">
        <div className="text-lg font-semibold">Locating nearby restaurants...</div>
        <div className="text-muted-foreground mt-1">Please ensure location is enabled</div>
      </div>
    </div>
  );
}
