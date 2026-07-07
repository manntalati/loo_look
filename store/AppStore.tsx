import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { CURRENT_USER_ID, MOCK_BATHROOMS, MOCK_RATINGS, MOCK_USERS } from '@/data/mock';
import type { Bathroom, Rating, User } from '@/lib/types';

// In-memory store for v0 — state resets on reload. Swapped for a real backend
// (Supabase proposed) once the flows are proven. See SCOPE.md.

export interface BathroomStats {
  /** null when the bathroom has no ratings yet. */
  avgScore: number | null;
  ratingCount: number;
  /** Amenity ids tagged by at least half of raters, most-tagged first. */
  amenities: string[];
  lastRatedAt: string | null;
}

export type NewBathroom = Omit<Bathroom, 'id' | 'createdBy' | 'createdAt'>;
export type NewRating = Omit<Rating, 'id' | 'userId' | 'createdAt'>;

interface AppStoreValue {
  bathrooms: Bathroom[];
  ratings: Rating[];
  users: Record<string, User>;
  currentUser: User;
  /** Returns the created bathroom so a rating can be attached immediately. */
  addBathroom: (input: NewBathroom) => Bathroom;
  addRating: (input: NewRating) => Rating;
  ratingsFor: (bathroomId: string) => Rating[];
  statsFor: (bathroomId: string) => BathroomStats;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>(MOCK_BATHROOMS);
  const [ratings, setRatings] = useState<Rating[]>(MOCK_RATINGS);

  const users = useMemo(
    () => Object.fromEntries(MOCK_USERS.map((u) => [u.id, u])),
    [],
  );
  const currentUser = users[CURRENT_USER_ID];

  const addBathroom = useCallback((input: NewBathroom): Bathroom => {
    const bathroom: Bathroom = {
      ...input,
      id: `b-${Date.now().toString(36)}`,
      createdBy: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
    };
    setBathrooms((prev) => [...prev, bathroom]);
    return bathroom;
  }, []);

  const addRating = useCallback((input: NewRating): Rating => {
    const rating: Rating = {
      ...input,
      id: `r-${Date.now().toString(36)}`,
      userId: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
    };
    setRatings((prev) => [rating, ...prev]);
    return rating;
  }, []);

  const ratingsFor = useCallback(
    (bathroomId: string) =>
      ratings
        .filter((r) => r.bathroomId === bathroomId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ratings],
  );

  const statsFor = useCallback(
    (bathroomId: string): BathroomStats => {
      const rs = ratings.filter((r) => r.bathroomId === bathroomId);
      if (rs.length === 0) {
        return { avgScore: null, ratingCount: 0, amenities: [], lastRatedAt: null };
      }
      const counts = new Map<string, number>();
      for (const r of rs) {
        for (const id of r.amenities) counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      const amenities = [...counts.entries()]
        .filter(([, count]) => count * 2 >= rs.length)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);
      return {
        avgScore: rs.reduce((sum, r) => sum + r.score, 0) / rs.length,
        ratingCount: rs.length,
        amenities,
        lastRatedAt: rs.reduce((max, r) => (r.createdAt > max ? r.createdAt : max), rs[0].createdAt),
      };
    },
    [ratings],
  );

  const value = useMemo(
    () => ({ bathrooms, ratings, users, currentUser, addBathroom, addRating, ratingsFor, statsFor }),
    [bathrooms, ratings, users, currentUser, addBathroom, addRating, ratingsFor, statsFor],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const value = useContext(AppStoreContext);
  if (!value) throw new Error('useAppStore must be used inside AppStoreProvider');
  return value;
}
