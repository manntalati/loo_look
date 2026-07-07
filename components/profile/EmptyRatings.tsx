import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/theme/colors';

interface EmptyRatingsProps {
  onRatePress: () => void;
}

/** Shown in place of the ratings list when the user has no ratings yet. */
export function EmptyRatings({ onRatePress }: EmptyRatingsProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="water-outline" size={44} color={Colors.labelTertiary} />
      <Text style={styles.title}>No ratings yet</Text>
      <Pressable
        onPress={onRatePress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>Rate your first bathroom</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl * 2,
  },
  title: {
    color: Colors.label,
    fontSize: 17,
    fontWeight: '600',
  },
  button: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.tint,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    height: 44,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    color: Colors.label,
    fontSize: 15,
    fontWeight: '600',
  },
});
