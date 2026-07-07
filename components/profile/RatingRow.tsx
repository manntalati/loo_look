import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScoreBadge } from '@/components/ScoreBadge';
import { timeAgo } from '@/lib/format';
import type { Bathroom, Rating } from '@/lib/types';
import { Colors, Spacing } from '@/theme/colors';

interface RatingRowProps {
  rating: Rating;
  /** undefined when the rated bathroom is no longer in the store. */
  bathroom?: Bathroom;
  onPress: () => void;
}

/** One of the current user's ratings: score bubble, venue/name, relative time, caption. */
export function RatingRow({ rating, bathroom, onPress }: RatingRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ScoreBadge score={rating.score} size={36} />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.venue} numberOfLines={1}>
            {bathroom ? bathroom.venue : 'Unknown bathroom'}
          </Text>
          <Text style={styles.time}>{timeAgo(rating.createdAt)}</Text>
        </View>
        {bathroom ? (
          <Text style={styles.name} numberOfLines={1}>
            {bathroom.name}
          </Text>
        ) : null}
        {rating.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {rating.caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  body: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  venue: {
    flex: 1,
    color: Colors.label,
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: Colors.labelTertiary,
    fontSize: 12,
  },
  name: {
    color: Colors.labelSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  caption: {
    color: Colors.labelSecondary,
    fontSize: 13,
    marginTop: Spacing.xs,
  },
});
