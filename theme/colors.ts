// iOS system dark palette. Placeholder until the dedicated design pass (see SCOPE.md —
// "Design direction (deferred)"). Screens must use these tokens, never raw hex.

export const Colors = {
  bg: '#000000',
  bgElevated: '#1C1C1E',
  bgTertiary: '#2C2C2E',
  fill: '#3A3A3C',
  separator: '#38383A',
  label: '#FFFFFF',
  labelSecondary: 'rgba(235,235,245,0.6)',
  labelTertiary: 'rgba(235,235,245,0.3)',
  tint: '#0A84FF',
  green: '#30D158',
  yellow: '#FFD60A',
  orange: '#FF9F0A',
  red: '#FF453A',
};

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 };

/** Beli-style score color: 8+ green, 6+ yellow, 4+ orange, below red. */
export function scoreColor(score: number): string {
  if (score >= 8) return Colors.green;
  if (score >= 6) return Colors.yellow;
  if (score >= 4) return Colors.orange;
  return Colors.red;
}
