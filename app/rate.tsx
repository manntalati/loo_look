import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
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
import { useUserLocation } from '@/components/nearby/LocationProvider';
import { AMENITY_TAGS, CONDITION_TAGS, type IoniconName } from '@/constants/tags';
import { FALLBACK_LOCATION, distanceMeters, formatDistance } from '@/lib/geo';
import { formatScore } from '@/lib/format';
import type { AccessType, Bathroom } from '@/lib/types';
import { useAppStore } from '@/store/AppStore';
import { Colors, Radius, Spacing, scoreColor } from '@/theme/colors';

type Step = 'place' | 'newPlace' | 'score' | 'amenities' | 'conditions' | 'notes';

const NEW_ID = 'new';
const NEARBY_COUNT = 6;
const DEFAULT_SCORE = 7;

const FLOW_EXISTING: Step[] = ['place', 'score', 'amenities', 'conditions', 'notes'];
const FLOW_NEW: Step[] = ['place', 'newPlace', 'score', 'amenities', 'conditions', 'notes'];

const STEP_HEADER: Record<Step, { icon: IoniconName; title: string }> = {
  place: { icon: 'location', title: 'Where are you?' },
  newPlace: { icon: 'add', title: 'New spot' },
  score: { icon: 'star', title: 'Rate it' },
  amenities: { icon: 'sparkles', title: "What's here?" },
  conditions: { icon: 'happy', title: 'How was it?' },
  notes: { icon: 'create', title: 'Add a note' },
};

const ACCESS_OPTIONS: { value: AccessType; label: string; icon: IoniconName }[] = [
  { value: 'public', label: 'Public', icon: 'earth-outline' },
  { value: 'customers', label: 'Customers', icon: 'people-outline' },
  { value: 'code', label: 'Code', icon: 'keypad-outline' },
];

/** Quick-rate flow — one question at a time over a dimmed backdrop (SCOPE.md: under 30s, chips over typing). */
export default function RateScreen() {
  const router = useRouter();
  const { bathroomId: preselectedId } = useLocalSearchParams<{ bathroomId?: string }>();
  const { bathrooms, addBathroom, addRating } = useAppStore();
  const { location } = useUserLocation();
  const insets = useSafeAreaInsets();
  const origin = location ?? FALLBACK_LOCATION;

  // Opened from a bathroom profile → skip the picker and rate that spot directly.
  const [step, setStep] = useState<Step>(preselectedId ? 'score' : 'place');
  const [history, setHistory] = useState<Step[]>(preselectedId ? ['place'] : []);

  const [selectedId, setSelectedId] = useState<string | null>(preselectedId ?? null);
  const [venue, setVenue] = useState('');
  const [access, setAccess] = useState<AccessType>('public');
  const [score, setScore] = useState(DEFAULT_SCORE);
  const [amenities, setAmenities] = useState<ReadonlySet<string>>(new Set<string>());
  const [conditions, setConditions] = useState<ReadonlySet<string>>(new Set<string>());
  const [note, setNote] = useState('');

  const isNew = selectedId === NEW_ID;
  const flow = isNew ? FLOW_NEW : FLOW_EXISTING;
  const progress = (flow.indexOf(step) + 1) / flow.length;

  const selectedName = isNew
    ? venue.trim() || 'New spot'
    : bathrooms.find((b) => b.id === selectedId)?.venue;

  const choices = useMemo<Bathroom[]>(
    () =>
      [...bathrooms]
        .sort(
          (a, b) =>
            distanceMeters(origin, { lat: a.lat, lng: a.lng }) -
            distanceMeters(origin, { lat: b.lat, lng: b.lng }),
        )
        .slice(0, NEARBY_COUNT),
    [bathrooms, origin],
  );

  const dismiss = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const go = (next: Step) => {
    setHistory((h) => [...h, step]);
    setStep(next);
  };

  const back = () => {
    if (history.length === 0) {
      dismiss();
      return;
    }
    setStep(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const advance = () => {
    const next = flow[flow.indexOf(step) + 1];
    if (next) go(next);
  };

  const toggle = (setter: Dispatch<SetStateAction<ReadonlySet<string>>>, id: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pickExisting = (id: string) => {
    setSelectedId(id);
    go('score');
  };

  const pickNew = () => {
    setSelectedId(NEW_ID);
    go('newPlace');
  };

  const handleScoreChange = (value: number) => {
    if (value !== score && Platform.OS !== 'web') Haptics.selectionAsync();
    setScore(value);
  };

  const handlePost = () => {
    let bathroomId = selectedId;
    if (isNew) {
      const created = addBathroom({
        venue: venue.trim(),
        name: 'Main bathroom',
        lat: origin.lat,
        lng: origin.lng,
        access,
      });
      bathroomId = created.id;
    }
    if (!bathroomId || bathroomId === NEW_ID) return;
    addRating({
      bathroomId,
      score,
      amenities: [...amenities],
      conditions: [...conditions],
      caption: note.trim() || undefined,
    });
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dismiss();
  };

  const footer =
    step === 'place'
      ? null
      : step === 'notes'
        ? { label: 'Post', onPress: handlePost, disabled: false }
        : step === 'newPlace'
          ? { label: 'Continue', onPress: advance, disabled: venue.trim().length === 0 }
          : { label: 'Continue', onPress: advance, disabled: false };

  const header = STEP_HEADER[step];

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityLabel="Close" />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <View style={styles.grabber} />

          <View style={styles.topBar}>
            {history.length > 0 ? (
              <RoundButton icon="chevron-back" onPress={back} />
            ) : (
              <View style={styles.roundSpacer} />
            )}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <RoundButton icon="close" onPress={dismiss} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepIcon}>
              <Ionicons name={header.icon} size={26} color={Colors.tint} />
            </View>
            <Text style={styles.stepTitle}>{header.title}</Text>
            {step !== 'place' && step !== 'newPlace' && selectedName ? (
              <View style={styles.contextLine}>
                <Ionicons name="location" size={13} color={Colors.labelSecondary} />
                <Text style={styles.contextText} numberOfLines={1}>
                  {selectedName}
                </Text>
              </View>
            ) : null}

            {step === 'place' ? (
              <View style={styles.list}>
                {choices.map((bathroom) => (
                  <PlaceRow
                    key={bathroom.id}
                    title={bathroom.venue}
                    subtitle={bathroom.name}
                    trailing={formatDistance(
                      distanceMeters(origin, { lat: bathroom.lat, lng: bathroom.lng }),
                    )}
                    onPress={() => pickExisting(bathroom.id)}
                  />
                ))}
                <PlaceRow
                  accent
                  title="Add a new spot"
                  subtitle="Not on the map yet"
                  onPress={pickNew}
                />
              </View>
            ) : null}

            {step === 'newPlace' ? (
              <View style={styles.stepContent}>
                <TextInput
                  style={styles.input}
                  value={venue}
                  onChangeText={setVenue}
                  placeholder="Name of the place"
                  placeholderTextColor={Colors.labelTertiary}
                  autoCapitalize="words"
                  autoFocus
                  returnKeyType="done"
                />
                <Text style={styles.miniLabel}>Access</Text>
                <View style={styles.chipWrap}>
                  {ACCESS_OPTIONS.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      icon={option.icon}
                      selected={access === option.value}
                      onPress={() => setAccess(option.value)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {step === 'score' ? (
              <View style={styles.stepContent}>
                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreValue, { color: scoreColor(score) }]}>
                    {formatScore(score)}
                  </Text>
                  <Text style={styles.scoreOut}>/10</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10}
                  step={0.5}
                  value={score}
                  onValueChange={handleScoreChange}
                  minimumTrackTintColor={scoreColor(score)}
                  maximumTrackTintColor={Colors.fill}
                  thumbTintColor={scoreColor(score)}
                />
              </View>
            ) : null}

            {step === 'amenities' ? (
              <View style={styles.chipWrap}>
                {AMENITY_TAGS.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.label}
                    icon={tag.icon}
                    selected={amenities.has(tag.id)}
                    onPress={() => toggle(setAmenities, tag.id)}
                  />
                ))}
              </View>
            ) : null}

            {step === 'conditions' ? (
              <View style={styles.chipWrap}>
                {CONDITION_TAGS.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.label}
                    icon={tag.icon}
                    selected={conditions.has(tag.id)}
                    color={tag.polarity === 'good' ? Colors.green : Colors.red}
                    onPress={() => toggle(setConditions, tag.id)}
                  />
                ))}
              </View>
            ) : null}

            {step === 'notes' ? (
              <View style={styles.stepContent}>
                <TextInput
                  style={styles.noteBox}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note (optional)…"
                  placeholderTextColor={Colors.labelTertiary}
                  multiline
                />
                <View style={styles.photoStub}>
                  <Ionicons name="camera-outline" size={18} color={Colors.labelTertiary} />
                  <Text style={styles.photoStubText}>Photos coming soon</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {footer ? (
            <Pressable
              accessibilityRole="button"
              disabled={footer.disabled}
              onPress={footer.onPress}
              style={({ pressed }) => [
                styles.primary,
                footer.disabled && styles.primaryDisabled,
                pressed && !footer.disabled && styles.primaryPressed,
              ]}
            >
              <Text style={styles.primaryLabel}>{footer.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function RoundButton({ icon, onPress }: { icon: IoniconName; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.round, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={20} color={Colors.label} />
    </Pressable>
  );
}

function PlaceRow({
  title,
  subtitle,
  trailing,
  accent,
  onPress,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
  accent?: boolean;
  onPress: () => void;
}): ReactNode {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.placeRow, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.placeIcon, accent && styles.placeIconAccent]}>
        <Ionicons
          name={accent ? 'add' : 'business-outline'}
          size={20}
          color={accent ? Colors.tint : Colors.labelSecondary}
        />
      </View>
      <View style={styles.placeBody}>
        <Text style={styles.placeTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.placeSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text style={styles.placeTrailing}>{trailing}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={Colors.labelTertiary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  kav: {
    width: '100%',
  },
  card: {
    maxHeight: '90%',
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.fill,
    marginBottom: Spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  round: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundSpacer: {
    width: 32,
    height: 32,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.bgTertiary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.tint,
  },
  scroll: {
    flexShrink: 1,
  },
  body: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  stepIcon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.tint}26`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.label,
    textAlign: 'center',
  },
  contextLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  contextText: {
    fontSize: 14,
    color: Colors.labelSecondary,
    maxWidth: '80%',
  },
  stepContent: {
    gap: Spacing.md,
  },
  list: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeIconAccent: {
    backgroundColor: `${Colors.tint}26`,
  },
  placeBody: {
    flex: 1,
    gap: 2,
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.label,
  },
  placeSub: {
    fontSize: 13,
    color: Colors.labelSecondary,
  },
  placeTrailing: {
    fontSize: 13,
    color: Colors.labelTertiary,
    fontVariant: ['tabular-nums'],
  },
  input: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 17,
    color: Colors.label,
  },
  miniLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.labelSecondary,
    marginTop: Spacing.xs,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scoreOut: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.labelTertiary,
  },
  noteBox: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    minHeight: 96,
    fontSize: 16,
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
  primary: {
    backgroundColor: Colors.tint,
    borderRadius: Radius.pill,
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    marginTop: Spacing.sm,
  },
  primaryDisabled: {
    opacity: 0.4,
  },
  primaryPressed: {
    opacity: 0.85,
  },
  primaryLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.label,
  },
});
