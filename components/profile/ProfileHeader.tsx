import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/theme/colors';

/** "Mann Talati" → "MT", "You" → "Y". */
function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
  const letters = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return letters.join('') || '?';
}

interface ProfileHeaderProps {
  name: string;
}

/** Centered header block: initials avatar, display name, since-line. */
export function ProfileHeader({ name }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initialsFor(name)}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subtitle}>Rating bathrooms since 2026</Text>
    </View>
  );
}

const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.tint,
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    color: Colors.label,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.labelSecondary,
    fontSize: 13,
  },
});
