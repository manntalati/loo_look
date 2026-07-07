import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface AmenityTag {
  id: string;
  label: string;
  icon: IoniconName;
}

export interface ConditionTag extends AmenityTag {
  polarity: 'good' | 'bad';
}

// Persistent amenities — properties of the bathroom itself. Aggregated across
// ratings onto the bathroom profile; power the Nearby filters. (SCOPE.md)
export const AMENITY_TAGS: AmenityTag[] = [
  { id: 'bidet', label: 'Bidet / jet spray', icon: 'water-outline' },
  { id: 'plush-tp', label: 'Plush TP (3+ ply)', icon: 'layers-outline' },
  { id: 'changing-table', label: 'Changing table', icon: 'body-outline' },
  { id: 'accessible', label: 'Accessible stall', icon: 'accessibility-outline' },
  { id: 'gender-neutral', label: 'Gender-neutral', icon: 'people-outline' },
  { id: 'single-occupancy', label: 'Single occupancy', icon: 'lock-closed-outline' },
  { id: 'paper-towels', label: 'Paper towels', icon: 'file-tray-outline' },
  { id: 'hand-dryer', label: 'Hand dryer', icon: 'flash-outline' },
];

// Visit conditions — properties of one visit. Belong to the individual rating
// and shade its score; never used for filtering.
export const CONDITION_TAGS: ConditionTag[] = [
  { id: 'spotless', label: 'Spotless', icon: 'sparkles-outline', polarity: 'good' },
  { id: 'stocked', label: 'Fully stocked', icon: 'checkmark-circle-outline', polarity: 'good' },
  { id: 'no-line', label: 'No line', icon: 'walk-outline', polarity: 'good' },
  { id: 'smells-great', label: 'Smells great', icon: 'flower-outline', polarity: 'good' },
  { id: 'messy', label: 'Messy', icon: 'trash-outline', polarity: 'bad' },
  { id: 'out-of-tp', label: 'Out of TP', icon: 'alert-circle-outline', polarity: 'bad' },
  { id: 'long-line', label: 'Long line', icon: 'time-outline', polarity: 'bad' },
  { id: 'smelly', label: 'Smelly', icon: 'cloud-outline', polarity: 'bad' },
  { id: 'broken-lock', label: 'Broken lock', icon: 'ban-outline', polarity: 'bad' },
];

export const amenityById = new Map(AMENITY_TAGS.map((t) => [t.id, t]));
export const conditionById = new Map(CONDITION_TAGS.map((t) => [t.id, t]));
