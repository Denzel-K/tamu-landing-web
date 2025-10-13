import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MapViewLeaflet from "@/components/web/MapViewLeaflet";
import { useRestaurantsWeb, type RestaurantWeb } from "@/hooks/useRestaurantsWeb";
import RestaurantCardWeb from "@/components/web/RestaurantCardWeb";
import CompactRestaurantCardWeb from "@/components/web/CompactRestaurantCardWeb";
import MapViewRestaurantCardWeb from "@/components/web/MapViewRestaurantCardWeb";

export default function Discover() {
  const {
    restaurants,
    featuredRestaurants,
    loading,
    refreshing,
    error,
    locationPermissionGranted,
    loadingLocation,
    requestLocationPermission,
  } = useRestaurantsWeb();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeDistance, setActiveDistance] = useState<number | 'All'>('All');
  const [activeFilters, setActiveFilters] = useState<string[]>(['All']);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach(r => { if (r.cuisine) set.add(r.cuisine!); });
    return ['All', ...Array.from(set)];
  }, [restaurants]);

  const distanceChips = useMemo<ReadonlyArray<'All' | number>>(() => (['All', 2, 5, 10] as const), []);

  const filtered = useMemo<RestaurantWeb[]>(() => {
    return restaurants.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || (r.cuisine || '').toLowerCase().includes(q);
      const matchesCuisine = activeFilters.includes('All') || activeFilters.includes(r.cuisine || '');
      const matchesDistance = activeDistance === 'All' ? true : (typeof r.distance === 'number' && r.distance <= activeDistance);
      return matchesSearch && matchesCuisine && matchesDistance;
    });
  }, [restaurants, search, activeFilters, activeDistance]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as { id: string; text: string; type: 'restaurant' | 'cuisine' }[];
    const nameMatches = restaurants
      .filter(r => r.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((r, i) => ({ id: `r${i}-${r.id}`, text: r.name, type: 'restaurant' as const }));
    const cuisineMatches = cuisines
      .filter(c => c !== 'All' && c.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c, i) => ({ id: `c${i}-${c}`, text: c, type: 'cuisine' as const }));
    return [...nameMatches, ...cuisineMatches].slice(0, 5);
  }, [search, restaurants, cuisines]);

  const toggleFilter = useCallback((value: string) => {
    setActiveFilters(prev => {
      if (value === 'All') return ['All'];
      const has = prev.includes(value);
      const next = has ? prev.filter(v => v !== value) : [...prev.filter(v => v !== 'All'), value];
      return next.length === 0 ? ['All'] : next;
    });
  }, []);

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
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-sm text-muted-foreground">Search, filter, and explore nearby restaurants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>List</Button>
          <Button variant={viewMode === 'map' ? 'default' : 'outline'} onClick={() => setViewMode('map')}>Map</Button>
        </div>
      </div>

      {!locationPermissionGranted && (
        <div className="mb-3">
          <Button variant="outline" onClick={requestLocationPermission} disabled={loadingLocation}>
            {loadingLocation ? 'Locating…' : 'Enable location to see distances'}
          </Button>
        </div>
      )}

      {/* Featured above search (list view only) */}
      {viewMode === 'list' && featuredRestaurants && featuredRestaurants.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2">Featured</h2>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-4 pr-2" style={{ minWidth: '100%' }}>
              {featuredRestaurants.map((r) => (
                <div key={r.id} className="w-[320px] shrink-0">
                  <RestaurantCardWeb restaurant={r} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <Input placeholder="Search restaurants or cuisines" value={search} onChange={(e) => setSearch(e.target.value)} />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-sm">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                  onClick={() => setSearch(s.text)}
                >
                  {s.text}
                  <span className="ml-2 text-muted-foreground text-xs">{s.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {distanceChips.map((d) => (
            <button key={String(d)} onClick={() => setActiveDistance(d)} className={`px-3 py-1.5 rounded-full border text-sm ${String(activeDistance) === String(d) ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'}`}>{d === 'All' ? 'Any distance' : `${d} km`}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {cuisines.map(c => {
            const active = activeFilters.includes(c);
            return (
              <button key={c} onClick={() => toggleFilter(c)} className={`px-3 py-1.5 rounded-full border text-sm ${active ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'}`}>{c}</button>
            );
          })}
        </div>
      </div>

      {/* Featured moved above search and hidden in map view */}

      {viewMode === 'map' ? (
        <>
          <MapViewLeaflet
            restaurants={filtered}
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
          <div
            id="map-cards"
            className="mt-3 overflow-x-auto whitespace-nowrap no-scrollbar focus:outline-none"
            tabIndex={0}
            aria-label="Restaurant map carousel"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = Math.min(selectedIndex + 1, filtered.length - 1);
                if (next !== selectedIndex) {
                  setSelectedIndex(next);
                  const scroller = document.getElementById('map-cards');
                  if (scroller) scroller.scrollTo({ left: next * 300, behavior: 'smooth' });
                }
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = Math.max(selectedIndex - 1, 0);
                if (prev !== selectedIndex) {
                  setSelectedIndex(prev);
                  const scroller = document.getElementById('map-cards');
                  if (scroller) scroller.scrollTo({ left: prev * 300, behavior: 'smooth' });
                }
              }
            }}
          >
            <div className="flex gap-3" style={{ minWidth: '100%' }} onScroll={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              const cardWidth = 300; // must match above
              const idx = Math.round(target.scrollLeft / cardWidth);
              if (idx !== selectedIndex) setSelectedIndex(Math.max(0, Math.min(filtered.length - 1, idx)));
            }}>
              {filtered.map((r, i) => (
                <div
                  id={`map-card-${r.id}`}
                  key={r.id}
                  className={`w-[300px] shrink-0`}
                >
                  <MapViewRestaurantCardWeb
                    restaurant={r}
                    isActive={i === selectedIndex}
                    asLink={false}
                    onClick={() => {
                      if (i !== selectedIndex) {
                        setSelectedIndex(i);
                        const scroller = document.getElementById('map-cards');
                        if (scroller) scroller.scrollTo({ left: i * 300, behavior: 'smooth' });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-2">Nearby Restaurants</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <CompactRestaurantCardWeb key={r.id} restaurant={r} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-10">No restaurants found. Try adjusting your search or filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
