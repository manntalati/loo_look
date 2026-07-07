import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { IoniconName } from '@/constants/tags';
import { Colors, Radius, Spacing } from '@/theme/colors';

interface ChipProps {
  label: string;
  icon?: IoniconName;
  selected?: boolean;
  /** Tint when selected; defaults to the system blue. */
  color?: string;
  onPress?: () => void;
}

/** Pill-shaped tag chip. Interactive when onPress is given, otherwise a static badge. */
export function Chip({ label, icon, selected = false, color = Colors.tint, onPress }: ChipProps) {
  const fg = selected ? color : Colors.labelSecondary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: `${color}26`, borderColor: color },
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bgTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.separator,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
