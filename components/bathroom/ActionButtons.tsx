import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Bathroom } from '@/lib/types';
import { Colors, Radius, Spacing } from '@/theme/colors';

/** Side-by-side primary actions: open Apple Maps directions, or rate this bathroom. */
export function ActionButtons({ bathroom }: { bathroom: Bathroom }) {
  const router = useRouter();

  const openDirections = () => {
    Linking.openURL('https://maps.apple.com/?daddr=' + bathroom.lat + ',' + bathroom.lng);
  };

  const openRate = () => {
    router.push({ pathname: '/rate', params: { bathroomId: bathroom.id } });
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={openDirections}
        style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
      >
        <Ionicons name="navigate" size={18} color={Colors.label} />
        <Text style={[styles.label, styles.primaryLabel]}>Directions</Text>
      </Pressable>
      <Pressable
        onPress={openRate}
        style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
      >
        <Ionicons name="star-outline" size={18} color={Colors.tint} />
        <Text style={[styles.label, styles.secondaryLabel]}>Rate</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: Radius.md,
  },
  primary: {
    backgroundColor: Colors.tint,
  },
  secondary: {
    backgroundColor: Colors.bgTertiary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: Colors.label,
  },
  secondaryLabel: {
    color: Colors.tint,
  },
});
