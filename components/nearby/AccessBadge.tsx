import { StyleSheet, Text, View } from 'react-native';

import type { AccessType } from '@/lib/types';
import { Colors, Radius, Spacing } from '@/theme/colors';

const ACCESS_META: Record<AccessType, { label: string; color: string }> = {
  public: { label: 'Public', color: Colors.green },
  customers: { label: 'Customers', color: Colors.orange },
  code: { label: 'Code', color: Colors.red },
};

/** Subtle pill indicating how you get in: Public / Customers / Code. */
export function AccessBadge({ access }: { access: AccessType }) {
  const { label, color } = ACCESS_META[access];
  return (
    <View style={styles.pill}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
