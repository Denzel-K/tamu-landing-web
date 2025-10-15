import React, { useEffect, useMemo, useRef } from "react";

// Lightweight Leaflet loader using CDN so we don't need to add a package dependency.
// Tiles: OpenStreetMap standard.

type RestaurantLite = {
  id: string;
  name: string;
  coordinates?: { latitude?: number; longitude?: number };
};

// Minimal Leaflet typings to avoid any
type LeafletIcon = object;
interface LeafletMap {
  setView(latlng: [number, number], zoom: number): LeafletMap;
  remove(): void;
  flyTo(latlng: [number, number], zoom: number, options?: { duration?: number }): void;
}
interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(html: string): void;
  on(event: string, handler: () => void): void;
  setIcon(icon: LeafletIcon): void;
  openPopup(): void;
}
interface LeafletNS {
  map(element: HTMLElement): LeafletMap;
  tileLayer(url: string, options: { maxZoom: number; attribution: string }): { addTo(map: LeafletMap): void };
  marker(latlng: [number, number], options?: { icon?: LeafletIcon }): LeafletMarker;
  icon(options: { iconUrl: string; shadowUrl?: string; iconSize: [number, number]; iconAnchor: [number, number]; popupAnchor?: [number, number]; shadowSize?: [number, number] }): LeafletIcon;
  divIcon(options: { html: string; className?: string; iconSize?: [number, number]; iconAnchor?: [number, number] }): LeafletIcon;
}

function loadLeaflet(): Promise<{ L: LeafletNS }> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { L?: LeafletNS };
    if (w.L) return resolve({ L: w.L });
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
      s.onload = () => {
        const ww = window as unknown as { L?: LeafletNS };
        if (ww.L) resolve({ L: ww.L }); else reject(new Error("Leaflet not available"));
      };
      s.onerror = reject;
      document.body.appendChild(s);
    } else {
      // wait a tick for existing script
      setTimeout(() => {
        const ww = window as unknown as { L?: LeafletNS };
        if (ww.L) resolve({ L: ww.L });
      }, 0);
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
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Array<{ id: string; marker: LeafletMarker }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeId = useMemo(() => restaurants[selectedIndex]?.id, [restaurants, selectedIndex]);
  const leafletRef = useRef<LeafletNS | null>(null);
  const markerClickRef = useRef<typeof onMarkerClick>();
  useEffect(() => { markerClickRef.current = onMarkerClick; }, [onMarkerClick]);

  function makePinIcon(active: boolean) {
    const L = leafletRef.current!;
    // Default Leaflet marker and a red variant from open-source color marker set
    const iconUrl = active
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
      : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    return L.icon({
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  // Initialize map when restaurants change (or on mount)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!containerRef.current) return;
      const { L } = await loadLeaflet();
      if (!mounted) return;
      leafletRef.current = L;

      // Clean any existing map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // find first valid coordinate
      const valid = restaurants.filter(r => typeof r.coordinates?.latitude === 'number' && typeof r.coordinates?.longitude === 'number');
      const center = valid[0] || null;
      const centerLat = center?.coordinates?.latitude ?? 0;
      const centerLon = center?.coordinates?.longitude ?? 0;

      const map = L.map(containerRef.current!).setView([centerLat, centerLon], center ? 14 : 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;

      // add markers with default (inactive) icons; active state handled in separate effect
      markersRef.current = valid.map((r) => {
        const m = L.marker([r.coordinates!.latitude!, r.coordinates!.longitude!], { icon: makePinIcon(false) }).addTo(map);
        m.bindPopup(r.name);
        m.on('click', () => markerClickRef.current && markerClickRef.current(r.id));
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
  }, [restaurants]);

  useEffect(() => {
    // fly to selected restaurant
    const r = restaurants[selectedIndex];
    if (!r || !mapRef.current) return;
    const latitude = r.coordinates?.latitude;
    const longitude = r.coordinates?.longitude;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      try {
        mapRef.current.flyTo([latitude, longitude], 16, { duration: 0.75 });
        const mm = markersRef.current.find((m) => m.id === r.id);
        if (mm?.marker) mm.marker.openPopup();
      } catch(e) {console.log(e.message)}
    }
  }, [selectedIndex, restaurants]);

  useEffect(() => {
    // update marker icons to reflect active state
    if (!markersRef.current?.length || !leafletRef.current) return;
    markersRef.current.forEach(({ id, marker }) => {
      const isActive = id === activeId;
      try {
        marker.setIcon(makePinIcon(isActive));
      } catch(e) {console.log(e.message)}
    });
  }, [activeId]);

  return <div ref={containerRef} className="h-96 rounded-2xl border border-border overflow-hidden" />;
}
