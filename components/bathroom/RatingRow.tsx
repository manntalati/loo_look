import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { ScoreBadge } from '@/components/ScoreBadge';
import { conditionById, type ConditionTag } from '@/constants/tags';
import { timeAgo } from '@/lib/format';
import type { Rating } from '@/lib/types';
import { Colors, Spacing } from '@/theme/colors';

interface RatingRowProps {
  rating: Rating;
  /** Reviewer display name, already resolved (falls back to "Someone" upstream). */
  userName: string;
}

/** One review: score bubble, who + when, visit-condition chips, optional caption. */
export function RatingRow({ rating, userName }: RatingRowProps) {
  const conditions = rating.conditions
    .map((id) => conditionById.get(id))
    .filter((tag): tag is ConditionTag => tag != null);

  return (
    <View style={styles.row}>
      <ScoreBadge score={rating.score} size={32} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.time}>{timeAgo(rating.createdAt)}</Text>
        </View>
        {conditions.length > 0 ? (
          <View style={styles.chips}>
            {conditions.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.label}
                icon={tag.icon}
                selected
                color={tag.polarity === 'good' ? Colors.green : Colors.red}
              />
            ))}
          </View>
        ) : null}
        {rating.caption ? <Text style={styles.caption}>{rating.caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  body: {
    flex: 1,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.label,
  },
  time: {
    fontSize: 13,
    color: Colors.labelTertiary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  caption: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.labelSecondary,
  },
});
