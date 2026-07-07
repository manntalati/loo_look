import { StyleSheet, Text, View } from 'react-native';

import { formatScore } from '@/lib/format';
import { Colors, Radius, Spacing } from '@/theme/colors';

interface StatsRowProps {
  ratingCount: number;
  addedCount: number;
  /** null when the user has no ratings yet. */
  avgScore: number | null;
}

/** Three equal stat cells in an elevated rounded card. */
export function StatsRow({ ratingCount, addedCount, avgScore }: StatsRowProps) {
  return (
    <View style={styles.card}>
      <StatCell value={String(ratingCount)} label="Ratings" />
      <StatCell value={String(addedCount)} label="Added" />
      <StatCell value={avgScore != null ? formatScore(avgScore) : '—'} label="Avg score" />
    </View>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: {
    color: Colors.label,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: Colors.labelSecondary,
    fontSize: 12,
  },
});
