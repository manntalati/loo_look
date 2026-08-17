import { useCallback, useEffect, useRef, useState } from 'react';

import type { LatLng } from '@/lib/geo';
import { fetchNearbyBathrooms } from '@/lib/restrooms';
import { useAppStore } from '@/store/AppStore';

export type NearbyLoadState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface NearbyBathroomsResult {
  state: NearbyLoadState;
  retry: () => void;
}

/**
 * Fetches public bathrooms near `origin` from OpenStreetMap and loads them into
 * the store. Refetches when the origin moves meaningfully (~0.005° ≈ 500m) so we
 * don't hammer Overpass on every tiny GPS jitter.
 */
export function useNearbyBathrooms(origin: LatLng | null): NearbyBathroomsResult {
  const { loadBathrooms } = useAppStore();
  const [state, setState] = useState<NearbyLoadState>('idle');
  const lastKey = useRef<string | null>(null);

  const run = useCallback(
    async (target: LatLng) => {
      setState('loading');
      try {
        const list = await fetchNearbyBathrooms(target);
        loadBathrooms(list);
        setState(list.length > 0 ? 'success' : 'empty');
      } catch {
        setState('error');
      }
    },
    [loadBathrooms],
  );

  const retry = useCallback(() => {
    if (origin) run(origin);
  }, [origin, run]);

  useEffect(() => {
    if (!origin) return;
    const key = `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    run(origin);
  }, [origin, run]);

  return { state, retry };
}
