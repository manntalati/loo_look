import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScoreBadge } from '@/components/ScoreBadge';
import { AccessBadge } from '@/components/nearby/AccessBadge';
import { amenityById } from '@/constants/tags';
import { formatDistance } from '@/lib/geo';
import type { Bathroom } from '@/lib/types';
import type { BathroomStats } from '@/store/AppStore';
import { Colors, Spacing } from '@/theme/colors';

const MAX_AMENITY_ICONS = 4;

interface BathroomListRowProps {
  bathroom: Bathroom;
  stats: BathroomStats;
  distanceM: number;
  onPress: () => void;
}

/** One Nearby list entry: score bubble, venue + bathroom name, access, amenities, distance. */
export function BathroomListRow({ bathroom, stats, distanceM, onPress }: BathroomListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <ScoreBadge score={stats.avgScore} size={44} />
      <View style={styles.body}>
        <Text style={styles.venue} numberOfLines={1}>
          {bathroom.venue}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {bathroom.name}
        </Text>
        <View style={styles.meta}>
          <AccessBadge access={bathroom.access} />
          {stats.amenities.slice(0, MAX_AMENITY_ICONS).map((id) => {
            const tag = amenityById.get(id);
            if (!tag) return null;
            return <Ionicons key={id} name={tag.icon} size={14} color={Colors.labelTertiary} />;
          })}
        </View>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.distance}>{formatDistance(distanceM)}</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.labelTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowPressed: {
    backgroundColor: Colors.bgElevated,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  venue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.label,
  },
  name: {
    fontSize: 13,
    color: Colors.labelSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  distance: {
    fontSize: 13,
    color: Colors.labelSecondary,
    fontVariant: ['tabular-nums'],
  },
});
