import { StyleSheet, TextInput, View } from 'react-native';

import { SegmentedControl } from '@/components/nearby/SegmentedControl';
import type { AccessType } from '@/lib/types';
import { Colors, Radius, Spacing } from '@/theme/colors';

/** Controlled state for the inline add-a-bathroom mini-form. Venue is the only required field. */
export interface NewBathroomDraft {
  venue: string;
  name: string;
  access: AccessType;
  accessNote: string;
}

export const EMPTY_DRAFT: NewBathroomDraft = {
  venue: '',
  name: '',
  access: 'public',
  accessNote: '',
};

const ACCESS_VALUES: readonly AccessType[] = ['public', 'customers', 'code'];
const ACCESS_LABELS: readonly string[] = ['Public', 'Customers', 'Code'];

const ACCESS_NOTE_PLACEHOLDER: Record<AccessType, string> = {
  public: '',
  customers: 'e.g. Ask barista for the key (optional)',
  code: 'e.g. Code printed on your receipt (optional)',
};

interface NewBathroomFormProps {
  draft: NewBathroomDraft;
  onChange: (draft: NewBathroomDraft) => void;
}

/** Inline mini-form for a bathroom we don't know about yet. Chips-not-typing everywhere else,
 *  so this is the only typing in the flow — kept to one required field. */
export function NewBathroomForm({ draft, onChange }: NewBathroomFormProps) {
  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        value={draft.venue}
        onChangeText={(venue) => onChange({ ...draft, venue })}
        placeholder="Venue (required) — e.g. Grainger Library"
        placeholderTextColor={Colors.labelTertiary}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        value={draft.name}
        onChangeText={(name) => onChange({ ...draft, name })}
        placeholder="e.g. 2nd Floor — by the elevators"
        placeholderTextColor={Colors.labelTertiary}
        autoCapitalize="words"
        returnKeyType="done"
      />
      <SegmentedControl
        segments={ACCESS_LABELS}
        selectedIndex={ACCESS_VALUES.indexOf(draft.access)}
        onChange={(index) => onChange({ ...draft, access: ACCESS_VALUES[index] ?? 'public' })}
      />
      {draft.access !== 'public' ? (
        <TextInput
          style={styles.input}
          value={draft.accessNote}
          onChangeText={(accessNote) => onChange({ ...draft, accessNote })}
          placeholder={ACCESS_NOTE_PLACEHOLDER[draft.access]}
          placeholderTextColor={Colors.labelTertiary}
          autoCapitalize="sentences"
          returnKeyType="done"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  input: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
    fontSize: 15,
    color: Colors.label,
  },
});
