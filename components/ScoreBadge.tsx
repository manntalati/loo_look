import { StyleSheet, Text, View } from 'react-native';

import { formatScore } from '@/lib/format';
import { Colors, scoreColor } from '@/theme/colors';

interface ScoreBadgeProps {
  /** null renders an empty "unrated" badge. */
  score: number | null;
  size?: number;
}

/** Beli-style colored score bubble: solid circle, bold one-decimal number. */
export function ScoreBadge({ score, size = 44 }: ScoreBadgeProps) {
  const rated = score != null;
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        rated
          ? { backgroundColor: scoreColor(score) }
          : { borderWidth: 1.5, borderColor: Colors.labelTertiary },
      ]}
    >
      <Text
        style={[
          styles.text,
          { fontSize: size * 0.36 },
          rated ? styles.ratedText : { color: Colors.labelTertiary },
        ]}
      >
        {rated ? formatScore(score) : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ratedText: {
    color: '#000000',
  },
});
