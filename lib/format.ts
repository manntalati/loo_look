/** "8.4" — scores always display one decimal. */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/** Coarse relative time for review lists: "just now", "3h ago", "2d ago", "5w ago". */
export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 9) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString();
}
