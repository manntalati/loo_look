import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { ScoreBadge } from '@/components/ScoreBadge';
import { AccessCard } from '@/components/bathroom/AccessCard';
import { ActionButtons } from '@/components/bathroom/ActionButtons';
import { RatingRow } from '@/components/bathroom/RatingRow';
import { amenityById, type AmenityTag } from '@/constants/tags';
import { useAppStore } from '@/store/AppStore';
import { Colors, Spacing } from '@/theme/colors';

/** Bathroom profile — the read path. "Is this worth walking to?" in one glance. */
export default function BathroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bathrooms, users, ratingsFor, statsFor } = useAppStore();
  const insets = useSafeAreaInsets();

  const bathroom = bathrooms.find((b) => b.id === id);

  if (!bathroom) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.notFound}>
          <Ionicons name="help-circle-outline" size={48} color={Colors.labelTertiary} />
          <Text style={styles.notFoundTitle}>Bathroom not found</Text>
          <Text style={styles.notFoundText}>
            It may have been removed. Head back and pick another one nearby.
          </Text>
        </View>
      </>
    );
  }

  const stats = statsFor(bathroom.id);
  const ratings = ratingsFor(bathroom.id);
  const amenities = stats.amenities
    .map((amenityId) => amenityById.get(amenityId))
    .filter((tag): tag is AmenityTag => tag != null);

  return (
    <>
      <Stack.Screen options={{ title: bathroom.venue }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <View style={styles.hero}>
          <ScoreBadge score={stats.avgScore} size={64} />
          <View style={styles.heroText}>
            <Text style={styles.title}>{bathroom.name}</Text>
            <Text style={styles.venue}>{bathroom.venue}</Text>
            <Text style={styles.ratingCount}>
              {stats.ratingCount === 1 ? '1 rating' : `${stats.ratingCount} ratings`}
            </Text>
          </View>
        </View>

        <AccessCard bathroom={bathroom} />

        <ActionButtons bathroom={bathroom} />

        {amenities.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Amenities</Text>
            <View style={styles.chipWrap}>
              {amenities.map((tag) => (
                <Chip key={tag.id} label={tag.label} icon={tag.icon} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ratings</Text>
          {ratings.length === 0 ? (
            <Text style={styles.emptyText}>No ratings yet — be the first.</Text>
          ) : (
            ratings.map((rating, index) => (
              <View key={rating.id}>
                {index > 0 ? <View style={styles.separator} /> : null}
                <RatingRow
                  rating={rating}
                  userName={users[rating.userId]?.name ?? 'Someone'}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  heroText: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.label,
  },
  venue: {
    fontSize: 16,
    color: Colors.labelSecondary,
  },
  ratingCount: {
    fontSize: 13,
    color: Colors.labelSecondary,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.label,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.labelTertiary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Colors.bg,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.label,
  },
  notFoundText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.labelSecondary,
    textAlign: 'center',
  },
});
