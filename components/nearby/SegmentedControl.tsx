import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/theme/colors';

interface SegmentedControlProps {
  segments: readonly string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/** iOS-style segmented control: pill track with a filled pill for the active segment. */
export function SegmentedControl({ segments, selectedIndex, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.track}>
      {segments.map((segment, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={segment}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(index)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{segment}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.pill,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  segmentSelected: {
    backgroundColor: Colors.fill,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.labelSecondary,
  },
  labelSelected: {
    color: Colors.label,
  },
});
