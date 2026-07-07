import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { useUserLocation } from '@/components/nearby/useUserLocation';
import { EMPTY_DRAFT, NewBathroomForm, type NewBathroomDraft } from '@/components/rate/NewBathroomForm';
import { AMENITY_TAGS, CONDITION_TAGS } from '@/constants/tags';
import { FALLBACK_LOCATION, distanceMeters, formatDistance } from '@/lib/geo';
import { formatScore } from '@/lib/format';
import type { Bathroom } from '@/lib/types';
import { useAppStore } from '@/store/AppStore';
import { Colors, Radius, Spacing, scoreColor } from '@/theme/colors';

/** Sentinel picker id for "this bathroom isn't on the map yet". */
const NEW_BATHROOM_ID = 'new';
const NEARBY_PICKER_COUNT = 5;
const DEFAULT_SCORE = 5;

/** Quick-rate modal — the write path. Whole flow on one screen, chips over typing (SCOPE.md: under 30s). */
export default function RateScreen() {
  const router = useRouter();
  const { bathroomId: preselectedId } = useLocalSearchParams<{ bathroomId?: string }>();
  const { bathrooms, addBathroom, addRating } = useAppStore();
  const userLocation = useUserLocation();
  const insets = useSafeAreaInsets();

  const origin = userLocation ?? FALLBACK_LOCATION;

  const [selectedId, setSelectedId] = useState<string | null>(preselectedId ?? null);
  const [draft, setDraft] = useState<NewBathroomDraft>(EMPTY_DRAFT);
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [amenities, setAmenities] = useState<ReadonlySet<string>>(new Set<string>());
  const [conditions, setConditions] = useState<ReadonlySet<string>>(new Set<string>());
  const [caption, setCaption] = useState('');

  // Nearest few bathrooms; a preselected one is always shown even if it isn't among them.
  const choices = useMemo<Bathroom[]>(() => {
    const byDistance = [...bathrooms].sort(
      (a, b) =>
        distanceMeters(origin, { lat: a.lat, lng: a.lng }) -
        distanceMeters(origin, { lat: b.lat, lng: b.lng }),
    );
    const nearest = byDistance.slice(0, NEARBY_PICKER_COUNT);
    const preselected = preselectedId ? bathrooms.find((b) => b.id === preselectedId) : undefined;
    if (preselected && !nearest.some((b) => b.id === preselected.id)) {
      return [preselected, ...nearest.slice(0, NEARBY_PICKER_COUNT - 1)];
    }
    return nearest;
  }, [bathrooms, origin, preselectedId]);

  const canPost =
    selectedId === NEW_BATHROOM_ID ? draft.venue.trim().length > 0 : selectedId != null;

  const toggleIn = (set: ReadonlySet<string>, id: string): ReadonlySet<string> => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const handleScoreChange = (value: number) => {
    if (value !== score) Haptics.selectionAsync();
    setScore(value);
  };

  const handlePost = () => {
    if (!canPost || selectedId == null) return;

    let bathroomId = selectedId;
    if (selectedId === NEW_BATHROOM_ID) {
      const created = addBathroom({
        venue: draft.venue.trim(),
        name: draft.name.trim() || 'Main bathroom',
        lat: origin.lat,
        lng: origin.lng,
        access: draft.access,
        accessNote: draft.accessNote.trim() || undefined,
      });
      bathroomId = created.id;
    }

    addRating({
      bathroomId,
      score,
      amenities: [...amenities],
      conditions: [...conditions],
      caption: caption.trim() || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Where are you?">
          <View style={styles.pickerCard}>
            {choices.map((bathroom, index) => (
              <View key={bathroom.id}>
                {index > 0 ? <View style={styles.pickerSeparator} /> : null}
                <PickerRow
                  title={bathroom.venue}
                  subtitle={bathroom.name}
                  trailing={formatDistance(
                    distanceMeters(origin, { lat: bathroom.lat, lng: bathroom.lng }),
                  )}
                  selected={selectedId === bathroom.id}
                  onPress={() => setSelectedId(bathroom.id)}
                />
              </View>
            ))}
            <View style={styles.pickerSeparator} />
            <PickerRow
              title="Somewhere new"
              subtitle="Add a bathroom that isn't on the map yet"
              selected={selectedId === NEW_BATHROOM_ID}
              onPress={() => setSelectedId(NEW_BATHROOM_ID)}
            />
            {selectedId === NEW_BATHROOM_ID ? (
              <NewBathroomForm draft={draft} onChange={setDraft} />
            ) : null}
          </View>
        </Section>

        <Section title="Score">
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: scoreColor(score) }]}>
              {formatScore(score)}
            </Text>
            <Text style={styles.scoreOutOf}>/10</Text>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={0.5}
            value={score}
            onValueChange={handleScoreChange}
            minimumTrackTintColor={scoreColor(score)}
            maximumTrackTintColor={Colors.fill}
          />
        </Section>

        <Section title="Amenities" hint="What does this bathroom have?">
          <View style={styles.chipWrap}>
            {AMENITY_TAGS.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.label}
                icon={tag.icon}
                selected={amenities.has(tag.id)}
                onPress={() => setAmenities((prev) => toggleIn(prev, tag.id))}
              />
            ))}
          </View>
        </Section>

        <Section title="How was it?" hint="Just this visit — not the bathroom forever">
          <View style={styles.chipWrap}>
            {CONDITION_TAGS.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.label}
                icon={tag.icon}
                selected={conditions.has(tag.id)}
                color={tag.polarity === 'good' ? Colors.green : Colors.red}
                onPress={() => setConditions((prev) => toggleIn(prev, tag.id))}
              />
            ))}
          </View>
        </Section>

        <Section title="Anything else?">
          <TextInput
            style={styles.caption}
            value={caption}
            onChangeText={setCaption}
            placeholder="Optional caption…"
            placeholderTextColor={Colors.labelTertiary}
            multiline
          />
          <View style={styles.photoStub}>
            <Ionicons name="camera-outline" size={18} color={Colors.labelTertiary} />
            <Text style={styles.photoStubText}>Photos coming soon</Text>
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <Pressable
          accessibilityRole="button"
          disabled={!canPost}
          onPress={handlePost}
          style={({ pressed }) => [
            styles.postButton,
            !canPost && styles.postButtonDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.postLabel}>Post rating</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

function PickerRow({
  title,
  subtitle,
  trailing,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.pickerRow, pressed && { opacity: 0.7 }]}
    >
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? Colors.tint : Colors.labelTertiary}
      />
      <View style={styles.pickerBody}>
        <Text style={styles.pickerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.pickerSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <Text style={styles.pickerTrailing}>{trailing}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.labelSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.labelTertiary,
  },
  pickerCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pickerSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.separator,
    marginLeft: Spacing.lg + 22 + Spacing.md,
  },
  pickerBody: {
    flex: 1,
    gap: 2,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.label,
  },
  pickerSubtitle: {
    fontSize: 13,
    color: Colors.labelSecondary,
  },
  pickerTrailing: {
    fontSize: 13,
    color: Colors.labelTertiary,
    fontVariant: ['tabular-nums'],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreOutOf: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.labelTertiary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  caption: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    minHeight: 72,
    fontSize: 15,
    color: Colors.label,
    textAlignVertical: 'top',
  },
  photoStub: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.separator,
    paddingVertical: Spacing.md,
  },
  photoStubText: {
    fontSize: 13,
    color: Colors.labelTertiary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
    backgroundColor: Colors.bg,
  },
  postButton: {
    backgroundColor: Colors.tint,
    borderRadius: Radius.md,
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.label,
  },
});
