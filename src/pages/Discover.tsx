import { useEffect, useMemo, useState } from "react";
import { listRestaurants, type Restaurant } from "@/lib/api/restaurants";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MapViewLeaflet from "@/components/web/MapViewLeaflet";

export default function Discover() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const carouselRef = useState<HTMLDivElement | null>(null)[0] as any;
  const [activeDistance, setActiveDistance] = useState<number | 'All'>('All');
  const [activeCuisine, setActiveCuisine] = useState<string>('All');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null);
        const res = await listRestaurants();
        if (!mounted) return;
        setRestaurants(res.restaurants || []);
      } catch (e: any) {
        if (!mounted) return; setError(e?.message || "Failed to load restaurants");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.cuisine) set.add(r.cuisine); });
    return ['All', ...Array.from(set)];
  }, [restaurants]);

  const distanceChips = useMemo(() => (['All', 2, 5, 10] as const), []);

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      const matchesSearch = !search.trim() || r.name.toLowerCase().includes(search.toLowerCase()) || (r.cuisine || '').toLowerCase().includes(search.toLowerCase());
      const matchesCuisine = activeCuisine === 'All' || r.cuisine === activeCuisine;
      const matchesDistance = activeDistance === 'All' ? true : (typeof (r as any).distance === 'number' && (r as any).distance <= activeDistance);
      return matchesSearch && matchesCuisine && matchesDistance;
    });
  }, [restaurants, search, activeCuisine, activeDistance]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-40 w-full mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Restaurants</h1>
          <p className="text-sm text-muted-foreground">Search, filter, and explore nearby places.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>List</Button>
          <Button variant={viewMode === 'map' ? 'default' : 'outline'} onClick={() => setViewMode('map')}>Map</Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 mb-4">
        <Input placeholder="Search restaurants or cuisines" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex flex-wrap gap-2 items-center">
          {distanceChips.map((d) => (
            <button key={String(d)} onClick={() => setActiveDistance(d as any)} className={`px-3 py-1.5 rounded-full border text-sm ${String(activeDistance) === String(d) ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'}`}>{d === 'All' ? 'Any distance' : `${d} km`}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {cuisines.map(c => (
            <button key={c} onClick={() => setActiveCuisine(c)} className={`px-3 py-1.5 rounded-full border text-sm ${activeCuisine === c ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'}`}>{c}</button>
          ))}
        </div>
      </div>

      {viewMode === 'map' ? (
        <>
          <MapViewLeaflet
            restaurants={filtered as any}
            selectedIndex={selectedIndex}
            onMarkerClick={(id) => {
              const idx = filtered.findIndex(r => r.id === id);
              if (idx >= 0) {
                setSelectedIndex(idx);
                const cardWidth = 300; // approximate width incl. gap
                const el = document.getElementById(`map-card-${id}`);
                el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                const scroller = document.getElementById('map-cards');
                if (scroller) scroller.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
              }
            }}
          />
          <div id="map-cards" className="mt-3 overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className="flex gap-3" style={{ minWidth: '100%' }} onScroll={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              const cardWidth = 300; // must match above
              const idx = Math.round(target.scrollLeft / cardWidth);
              if (idx !== selectedIndex) setSelectedIndex(Math.max(0, Math.min(filtered.length - 1, idx)));
            }}>
              {filtered.map((r, i) => (
                <div id={`map-card-${r.id}`} key={r.id} className={`w-[280px] shrink-0 ${i === selectedIndex ? 'ring-2 ring-primary' : ''}`} onMouseEnter={() => setSelectedIndex(i)}>
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{r.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{r.cuisine || ""}</p>
                      <Link to={`/restaurant/${encodeURIComponent(r.id)}`} className="underline text-primary">View</Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{r.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{r.cuisine || ""}</p>
                <Link to={`/restaurant/${encodeURIComponent(r.id)}`} className="underline text-primary">View</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
