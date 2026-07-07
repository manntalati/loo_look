import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { IoniconName } from '@/constants/tags';
import type { AccessType, Bathroom } from '@/lib/types';
import { Colors, Radius, Spacing } from '@/theme/colors';

const ACCESS_META: Record<AccessType, { label: string; icon: IoniconName; color: string }> = {
  public: { label: 'Public', icon: 'earth-outline', color: Colors.green },
  customers: { label: 'Customers only', icon: 'storefront-outline', color: Colors.orange },
  code: { label: 'Code required', icon: 'keypad-outline', color: Colors.yellow },
};

/** Elevated card answering "can I get in, and how do I find it once inside". */
export function AccessCard({ bathroom }: { bathroom: Bathroom }) {
  const meta = ACCESS_META[bathroom.access];
  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: `${meta.color}26` }]}>
        <Ionicons name={meta.icon} size={14} color={meta.color} />
        <Text style={[styles.badgeLabel, { color: meta.color }]}>{meta.label}</Text>
      </View>
      {bathroom.accessNote ? (
        <View style={styles.noteRow}>
          <Ionicons name="key-outline" size={15} color={Colors.labelSecondary} />
          <Text style={styles.noteText}>{bathroom.accessNote}</Text>
        </View>
      ) : null}
      {bathroom.directionsNote ? (
        <View style={styles.noteRow}>
          <Ionicons name="navigate-outline" size={15} color={Colors.labelSecondary} />
          <Text style={styles.noteText}>{bathroom.directionsNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 28,
    borderRadius: Radius.pill,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.labelSecondary,
  },
});
