import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { LatLng } from '@/lib/geo';

/**
 * Requests foreground location permission on mount and resolves the current
 * position. Returns null until (and unless) a fix is available — callers fall
 * back to FALLBACK_LOCATION and never block the UI on this.
 */
export function useUserLocation(): LatLng | null {
  const [location, setLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({});
        if (!cancelled) {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        }
      } catch {
        // Silently keep the fallback — location is a progressive enhancement.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return location;
}
