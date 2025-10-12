import React, { useEffect, useRef } from "react";

// Lightweight Leaflet loader using CDN so we don't need to add a package dependency.
// Tiles: OpenStreetMap standard.

type RestaurantLite = {
  id: string;
  name: string;
  coordinates?: { latitude?: number; longitude?: number };
};

function loadLeaflet(): Promise<typeof window & { L: any }> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) return resolve(window as any);
    // inject CSS
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // inject JS
    const scriptId = "leaflet-js";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.async = true;
      s.onload = () => resolve(window as any);
      s.onerror = reject;
      document.body.appendChild(s);
    } else {
      // wait a tick for existing script
      setTimeout(() => resolve(window as any), 0);
    }
  });
}

export default function MapViewLeaflet({
  restaurants,
  selectedIndex,
  onMarkerClick,
}: {
  restaurants: RestaurantLite[];
  selectedIndex: number;
  onMarkerClick?: (id: string) => void;
}) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!containerRef.current) return;
      const { L } = await loadLeaflet();
      if (!mounted) return;

      // find first valid coordinate
      const valid = restaurants.filter(r => typeof r.coordinates?.latitude === 'number' && typeof r.coordinates?.longitude === 'number');
      const center = valid[0] || null;
      const centerLat = center?.coordinates?.latitude ?? 0;
      const centerLon = center?.coordinates?.longitude ?? 0;

      const map = L.map(containerRef.current).setView([centerLat, centerLon], center ? 14 : 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;

      // add markers
      markersRef.current = valid.map((r) => {
        const m = L.marker([r.coordinates!.latitude!, r.coordinates!.longitude!]).addTo(map);
        m.bindPopup(r.name);
        if (onMarkerClick) {
          m.on('click', () => onMarkerClick(r.id));
        }
        return { id: r.id, marker: m };
      });
    })();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    // fly to selected restaurant
    const r = restaurants[selectedIndex];
    if (!r || !mapRef.current) return;
    const { latitude, longitude } = r.coordinates || {} as any;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      try {
        mapRef.current.flyTo([latitude, longitude], 16, { duration: 0.75 });
        const mm = markersRef.current.find((m) => m.id === r.id);
        if (mm?.marker) mm.marker.openPopup();
      } catch {}
    }
  }, [selectedIndex, restaurants]);

  return <div ref={containerRef} className="h-96 rounded-2xl border border-border overflow-hidden" />;
}
