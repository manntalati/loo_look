import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ScoreBadge } from '@/components/ScoreBadge';
import { BathroomListRow } from '@/components/nearby/BathroomListRow';
import { FREE_FILTER_ID, FilterBar } from '@/components/nearby/FilterBar';
import { SegmentedControl } from '@/components/nearby/SegmentedControl';
import { useUserLocation } from '@/components/nearby/useUserLocation';
import { FALLBACK_LOCATION, distanceMeters } from '@/lib/geo';
import type { Bathroom } from '@/lib/types';
import { useAppStore, type BathroomStats } from '@/store/AppStore';
import { Colors, Radius, Spacing } from '@/theme/colors';

const SEGMENTS = ['Map', 'List'] as const;
const REGION_DELTA = 0.02;

interface NearbyItem {
  bathroom: Bathroom;
  stats: BathroomStats;
  distanceM: number;
}

export default function NearbyScreen() {
  const router = useRouter();
  const { bathrooms, statsFor } = useAppStore();
  const userLocation = useUserLocation();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [filters, setFilters] = useState<ReadonlySet<string>>(new Set<string>());
  const mapRef = useRef<MapView>(null);

  // Never gated on permissions: render around campus until a fix arrives.
  const origin = userLocation ?? FALLBACK_LOCATION;

  const items = useMemo<NearbyItem[]>(
    () =>
      bathrooms
        .map((bathroom) => ({
          bathroom,
          stats: statsFor(bathroom.id),
          distanceM: distanceMeters(origin, { lat: bathroom.lat, lng: bathroom.lng }),
        }))
        .filter(({ bathroom, stats }) => {
          for (const id of filters) {
            if (id === FREE_FILTER_ID) {
              if (bathroom.access !== 'public') return false;
            } else if (!stats.amenities.includes(id)) {
              return false;
            }
          }
          return true;
        })
        .sort((a, b) => a.distanceM - b.distanceM),
    [bathrooms, statsFor, filters, origin],
  );

  const toggleFilter = useCallback((id: string) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Recenter once the location fix arrives (map mounted at the fallback first).
  useEffect(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          latitudeDelta: REGION_DELTA,
          longitudeDelta: REGION_DELTA,
        },
        600,
      );
    }
  }, [userLocation]);

  const openBathroom = useCallback(
    (id: string) => router.push(`/bathroom/${id}`),
    [router],
  );

  return (
    <View style={styles.container}>
      <View style={styles.segmentWrap}>
        <SegmentedControl
          segments={SEGMENTS}
          selectedIndex={segmentIndex}
          onChange={setSegmentIndex}
        />
      </View>
      <FilterBar selected={filters} onToggle={toggleFilter} />
      {segmentIndex === 0 ? (
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: origin.lat,
              longitude: origin.lng,
              latitudeDelta: REGION_DELTA,
              longitudeDelta: REGION_DELTA,
            }}
            showsUserLocation
          >
            {items.map(({ bathroom, stats }) => (
              <Marker
                key={bathroom.id}
                coordinate={{ latitude: bathroom.lat, longitude: bathroom.lng }}
                onPress={() => openBathroom(bathroom.id)}
              >
                <ScoreBadge score={stats.avgScore} size={32} />
              </Marker>
            ))}
          </MapView>
          {items.length === 0 ? (
            <View pointerEvents="none" style={styles.mapEmptyOverlay}>
              <EmptyFilters />
            </View>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.bathroom.id}
          renderItem={({ item }) => (
            <BathroomListRow
              bathroom={item.bathroom}
              stats={item.stats}
              distanceM={item.distanceM}
              onPress={() => openBathroom(item.bathroom.id)}
            />
          )}
          ItemSeparatorComponent={RowSeparator}
          ListEmptyComponent={<EmptyFilters />}
          contentContainerStyle={items.length === 0 ? styles.listEmpty : undefined}
        />
      )}
    </View>
  );
}

function EmptyFilters() {
  return (
    <View style={styles.empty}>
      <Ionicons name="funnel-outline" size={28} color={Colors.labelTertiary} />
      <Text style={styles.emptyText}>No bathrooms match — loosen your filters</Text>
    </View>
  );
}

function RowSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  segmentWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  mapWrap: {
    flex: 1,
  },
  mapEmptyOverlay: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.labelSecondary,
    textAlign: 'center',
  },
  listEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginLeft: Spacing.lg + 44 + Spacing.md,
  },
});
