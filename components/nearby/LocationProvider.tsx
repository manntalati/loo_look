import * as Location from 'expo-location';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { LatLng } from '@/lib/geo';

export type LocationStatus = 'pending' | 'granted' | 'denied' | 'unavailable';

export interface UserLocationResult {
  location: LatLng | null;
  status: LocationStatus;
  /** Re-request permission and a fresh fix (e.g. after the user enables location). */
  refresh: () => void;
}

const LocationContext = createContext<UserLocationResult | null>(null);

/**
 * Resolves the user's location once and shares it app-wide, so every screen
 * (Nearby, the rate flow, …) leads with the same fix instead of each
 * re-requesting it. Location-first: we prefer the real position and only fall
 * back to a default once we know it's unavailable.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<LocationStatus>('pending');
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => {
    setLocation(null);
    setStatus('pending');
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let permission: string | undefined;
      try {
        permission = (await Location.requestForegroundPermissionsAsync()).status;
      } catch {
        // Permissions API unavailable (some browsers) — fall through and just try.
      }
      // Attempt a fix even if the permission query says otherwise: on web the
      // Permissions API is unreliable, so let the actual position request be the
      // source of truth.
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setStatus('granted');
        }
      } catch {
        if (!cancelled) setStatus(permission === 'granted' ? 'unavailable' : 'denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return (
    <LocationContext.Provider value={{ location, status, refresh }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation(): UserLocationResult {
  const value = useContext(LocationContext);
  if (!value) throw new Error('useUserLocation must be used inside LocationProvider');
  return value;
}
