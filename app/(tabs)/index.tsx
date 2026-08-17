import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { RateFab } from '@/components/RateFab';
import { BathroomListRow } from '@/components/nearby/BathroomListRow';
import { FREE_FILTER_ID, FilterBar } from '@/components/nearby/FilterBar';
import { NearbyMap } from '@/components/nearby/NearbyMap';
import { SegmentedControl } from '@/components/nearby/SegmentedControl';
import { useNearbyBathrooms } from '@/components/nearby/useNearbyBathrooms';
import { useUserLocation } from '@/components/nearby/LocationProvider';
import { FALLBACK_LOCATION, distanceMeters } from '@/lib/geo';
import type { IoniconName } from '@/constants/tags';
import type { Bathroom } from '@/lib/types';
import { useAppStore, type BathroomStats } from '@/store/AppStore';
import { Colors, Radius, Spacing } from '@/theme/colors';

const SEGMENTS = ['Map', 'List'] as const;

interface NearbyItem {
  bathroom: Bathroom;
  stats: BathroomStats;
  distanceM: number;
}

export default function NearbyScreen() {
  const router = useRouter();
  const { bathrooms, statsFor, loadDemoData } = useAppStore();
  const { location, status, refresh } = useUserLocation();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [filters, setFilters] = useState<ReadonlySet<string>>(new Set<string>());

  const locating = status === 'pending';
  const locationDenied = status === 'denied' || status === 'unavailable';

  // Lead with the user's real location; only fall back to a default (used for
  // distances against opt-in demo data) once location is unavailable.
  const origin = location ?? FALLBACK_LOCATION;

  // Fetch live worldwide data only once we have a real fix.
  const { state: loadState, retry } = useNearbyBathrooms(location);

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

  const openBathroom = useCallback(
    (id: string) => router.push(`/bathroom/${id}`),
    [router],
  );

  // Before any bathrooms exist, take over the screen with a clear status.
  if (bathrooms.length === 0) {
    if (locating) {
      return <StatusScreen icon="navigate-outline" title="Finding your location…" spinner />;
    }
    if (locationDenied) {
      return (
        <StatusScreen
          icon="location-outline"
          title="Turn on location"
          subtitle="Loo Look uses your location to find bathrooms near you — anywhere in the world."
          actionLabel="Try again"
          onAction={refresh}
          secondaryLabel="Browse demo spots"
          onSecondary={loadDemoData}
        />
      );
    }
    if (loadState === 'loading' || loadState === 'idle') {
      return <StatusScreen icon="search-outline" title="Finding bathrooms near you…" spinner />;
    }
    if (loadState === 'error') {
      return (
        <StatusScreen
          icon="cloud-offline-outline"
          title="Couldn't load bathrooms"
          subtitle="Check your connection and try again."
          actionLabel="Retry"
          onAction={retry}
        />
      );
    }
    return (
      <StatusScreen
        icon="sad-outline"
        title="No public bathrooms nearby"
        subtitle="OpenStreetMap has none mapped within 3 km of you yet."
        actionLabel="Retry"
        onAction={retry}
      />
    );
  }

  return (
    <View style={styles.container}>
      {locationDenied ? (
        <Pressable style={styles.banner} onPress={refresh} accessibilityRole="button">
          <Ionicons name="location-outline" size={16} color={Colors.yellow} />
          <Text style={styles.bannerText}>
            Demo spots — tap to enable location for bathrooms near you.
          </Text>
        </Pressable>
      ) : null}
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
          <NearbyMap
            origin={origin}
            userLocation={location}
            markers={items.map(({ bathroom, stats }) => ({
              id: bathroom.id,
              lat: bathroom.lat,
              lng: bathroom.lng,
              score: stats.avgScore,
            }))}
            onMarkerPress={openBathroom}
          />
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
      <RateFab />
    </View>
  );
}

interface StatusScreenProps {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  spinner?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

function StatusScreen({
  icon,
  title,
  subtitle,
  spinner,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: StatusScreenProps) {
  return (
    <View style={styles.statusScreen}>
      {spinner ? (
        <ActivityIndicator size="large" color={Colors.tint} />
      ) : (
        <Ionicons name={icon} size={40} color={Colors.labelTertiary} />
      )}
      <Text style={styles.statusTitle}>{title}</Text>
      {subtitle ? <Text style={styles.statusSubtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [styles.statusButton, pressed && styles.statusButtonPressed]}
        >
          <Text style={styles.statusButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryLabel && onSecondary ? (
        <Pressable onPress={onSecondary} accessibilityRole="button" style={styles.statusSecondary}>
          <Text style={styles.statusSecondaryText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgElevated,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.labelSecondary,
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
  statusScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.label,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.labelSecondary,
    textAlign: 'center',
  },
  statusButton: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.tint,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  statusButtonPressed: {
    opacity: 0.7,
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.label,
  },
  statusSecondary: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  statusSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.tint,
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
