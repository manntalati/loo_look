import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/Chip';
import { AMENITY_TAGS } from '@/constants/tags';
import { Colors, Spacing } from '@/theme/colors';

/** Pseudo-filter id for "Free" — matches access === 'public', not an amenity tag. */
export const FREE_FILTER_ID = 'free';

interface FilterBarProps {
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

/** Horizontal strip of filter chips: a leading "Free" chip plus one per amenity tag. */
export function FilterBar({ selected, onToggle }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}
    >
      <Chip
        label="Free"
        icon="cash-outline"
        selected={selected.has(FREE_FILTER_ID)}
        color={Colors.green}
        onPress={() => onToggle(FREE_FILTER_ID)}
      />
      {AMENITY_TAGS.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.label}
          icon={tag.icon}
          selected={selected.has(tag.id)}
          onPress={() => onToggle(tag.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexGrow: 0,
  },
  content: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
