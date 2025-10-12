import React, { useMemo } from "react";

interface RestaurantLite {
  id: string;
  name: string;
  coordinates?: { latitude?: number; longitude?: number };
}

// Renders a static OpenStreetMap image with up to 5 markers to avoid dependency installs.
// If no valid coordinates are available, shows a friendly placeholder.
export default function MapViewWeb({ restaurants }: { restaurants: RestaurantLite[] }) {
  const markers = useMemo(() => {
    return restaurants
      .map(r => ({ id: r.id, name: r.name, lat: r.coordinates?.latitude, lon: r.coordinates?.longitude }))
      .filter(m => typeof m.lat === 'number' && typeof m.lon === 'number' && isFinite(m.lat!) && isFinite(m.lon!))
      .slice(0, 5);
  }, [restaurants]);

  if (markers.length === 0) {
    return (
      <div className="h-96 rounded-2xl border border-border bg-card flex items-center justify-center">
        <div className="text-sm text-muted-foreground px-4 text-center">Map preview unavailable. No valid coordinates found for the selected restaurants.</div>
      </div>
    );
  }

  // Center at first marker
  const centerLat = markers[0].lat;
  const centerLon = markers[0].lon;

  // Build static map URL
  // Using staticmap.openstreetmap.de (note: availability may vary; replace with your own static map service if needed)
  const base = "https://staticmap.openstreetmap.de/staticmap.php";
  const markerParams = markers.map(m => `markers=${m.lat},${m.lon},lightblue1`).join("&");
  const url = `${base}?center=${centerLat},${centerLon}&zoom=13&size=800x400&${markerParams}`;

  return (
    <div className="h-96 rounded-2xl border border-border bg-card overflow-hidden">
      <img src={url} alt="Map" className="w-full h-full object-cover" />
    </div>
  );
}
