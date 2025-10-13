import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listRestaurants, type Restaurant } from "@/lib/api/restaurants";

export type LocationCoordinates = { latitude: number; longitude: number };

const DEFAULT_LOCATION: LocationCoordinates = { latitude: 30.6187, longitude: -96.3365 }; // TAMU College Station

function calcDistanceKm(a: LocationCoordinates, b: LocationCoordinates) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aHarv = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  return R * c;
}

export type RestaurantWeb = Restaurant & {
  distance?: number;
  coordinates?: { latitude?: number; longitude?: number };
  rating?: number;
  priceRange?: string;
  coverImage?: string;
  specialFeatures?: string[];
  operatingHours?: Record<string, string>;
};

export interface UseRestaurantsWebReturn {
  restaurants: RestaurantWeb[];
  featuredRestaurants: RestaurantWeb[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  userLocation: LocationCoordinates | null;
  locationPermissionGranted: boolean;
  loadingLocation: boolean;
  requestLocationPermission: () => Promise<boolean>;
  refreshRestaurants: () => Promise<void>;
}

export function useRestaurantsWeb(): UseRestaurantsWebReturn {
  const [restaurants, setRestaurants] = useState<RestaurantWeb[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const lastLocRef = useRef<LocationCoordinates | null>(null);

  // Compute distances when we have user location
  const enrichWithDistance = useCallback(
    (items: Restaurant[], loc: LocationCoordinates | null): RestaurantWeb[] => {
      return items.map((r) => {
        const coords = (r as RestaurantWeb).coordinates as { latitude?: number; longitude?: number } | undefined;
        let distance: number | undefined;
        if (
          loc &&
          coords &&
          typeof coords.latitude === "number" &&
          typeof coords.longitude === "number" &&
          !(coords.latitude === 0 && coords.longitude === 0)
        ) {
          distance = calcDistanceKm(loc, { latitude: coords.latitude, longitude: coords.longitude });
        }
        const withMeta: RestaurantWeb = { ...(r as Restaurant), distance, coordinates: coords };
        return withMeta;
      });
    },
    []
  );

  const fetchAll = useCallback(async (loc: LocationCoordinates | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRestaurants();
      const items: Restaurant[] = res.restaurants || [];
      const enriched: RestaurantWeb[] = enrichWithDistance(items, loc);
      setRestaurants(enriched);
    } catch (e) {
      setError(e?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }, [enrichWithDistance]);

  useEffect(() => {
    // Initialize location (best effort) then fetch
    let mounted = true;
    (async () => {
      try {
        setLoadingLocation(true);
        if (navigator.geolocation) {
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                if (!mounted) return done();
                const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setUserLocation(loc);
                setLocationPermissionGranted(true);
                lastLocRef.current = loc;
                done();
              },
              () => {
                // denied or error
                setLocationPermissionGranted(false);
                setUserLocation(DEFAULT_LOCATION);
                lastLocRef.current = DEFAULT_LOCATION;
                done();
              },
              { enableHighAccuracy: true, timeout: 4000 }
            );
          });
        } else {
          setUserLocation(DEFAULT_LOCATION);
          lastLocRef.current = DEFAULT_LOCATION;
        }
      } finally {
        setLoadingLocation(false);
      }
      await fetchAll(lastLocRef.current);
    })();
    return () => { mounted = false; };
  }, [fetchAll]);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) return false;
    setLoadingLocation(true);
    try {
      const loc = await new Promise<LocationCoordinates | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 6000 }
        );
      });
      if (loc) {
        setLocationPermissionGranted(true);
        setUserLocation(loc);
        lastLocRef.current = loc;
        await fetchAll(loc);
        return true;
      }
      return false;
    } finally {
      setLoadingLocation(false);
    }
  }, [fetchAll]);

  const refreshRestaurants = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll(lastLocRef.current);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  const featuredRestaurants = useMemo<RestaurantWeb[]>(() => {
    // Simple heuristic: mark those that have menus or available order types as featured
    const f = restaurants.filter((r) => (r as RestaurantWeb).availableOrderTypes?.length || (r.menu && r.menu.length > 0));
    return f.slice(0, 10);
  }, [restaurants]);

  return {
    restaurants,
    featuredRestaurants,
    loading,
    refreshing,
    error,
    userLocation,
    locationPermissionGranted,
    loadingLocation,
    requestLocationPermission,
    refreshRestaurants,
  };
}

export default useRestaurantsWeb;
