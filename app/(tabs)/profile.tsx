import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyRatings } from '@/components/profile/EmptyRatings';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { RatingRow } from '@/components/profile/RatingRow';
import { StatsRow } from '@/components/profile/StatsRow';
import { useAppStore } from '@/store/AppStore';
import { Colors, Spacing } from '@/theme/colors';

// Lightweight local profile — no auth in v0; accounts/friends land in v1 (SCOPE.md).
export default function ProfileScreen() {
  const router = useRouter();
  const { bathrooms, ratings, currentUser } = useAppStore();

  const myRatings = useMemo(
    () =>
      ratings
        .filter((r) => r.userId === currentUser.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ratings, currentUser.id],
  );

  const addedCount = useMemo(
    () => bathrooms.filter((b) => b.createdBy === currentUser.id).length,
    [bathrooms, currentUser.id],
  );

  const avgScore =
    myRatings.length > 0
      ? myRatings.reduce((sum, r) => sum + r.score, 0) / myRatings.length
      : null;

  const bathroomById = useMemo(
    () => new Map(bathrooms.map((b) => [b.id, b])),
    [bathrooms],
  );

  return (
    <FlatList
      data={myRatings}
      keyExtractor={(rating) => rating.id}
      renderItem={({ item }) => (
        <RatingRow
          rating={item}
          bathroom={bathroomById.get(item.bathroomId)}
          onPress={() => router.push(`/bathroom/${item.bathroomId}`)}
        />
      )}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={
        <View style={styles.header}>
          <ProfileHeader name={currentUser.name} />
          <StatsRow
            ratingCount={myRatings.length}
            addedCount={addedCount}
            avgScore={avgScore}
          />
          {myRatings.length > 0 ? (
            <Text style={styles.sectionTitle}>Your ratings</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={<EmptyRatings onRatePress={() => router.push('/rate')} />}
      ListFooterComponent={
        <Text style={styles.footer}>Accounts &amp; friends coming in v1</Text>
      }
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    gap: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.label,
    fontSize: 17,
    fontWeight: '700',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginLeft: 36 + Spacing.md,
  },
  footer: {
    color: Colors.labelTertiary,
    fontSize: 12,
    textAlign: 'center',
    paddingTop: Spacing.xl,
  },
});
