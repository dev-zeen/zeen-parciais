import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { listDefaultLineups } from '@/components/contexts/team/_team.helpers';
import { Chip } from '@/components/ui/Chip';
import { haptics } from '@/utils/haptics';

type FormationSelectorProps = {
  formation: string;
  disabled?: boolean;
  /** Recebe o id do esquema (posição na lista + 1), como a API espera */
  onFormationChange: (formationIndex: number) => void;
};

export function FormationSelector({
  formation,
  disabled = false,
  onFormationChange,
}: FormationSelectorProps) {
  const formations = useMemo(() => listDefaultLineups(), []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Formação tática"
      style={styles.scroll}
      contentContainerStyle={styles.content}>
      {formations.map((item, index) => (
        <Chip
          key={item}
          label={item}
          selected={item === formation}
          disabled={disabled}
          accessibilityLabel={`Formação ${item}`}
          onPress={() => {
            if (item === formation) return;
            haptics.selection();
            onFormationChange(index + 1);
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  content: {
    gap: 8,
    paddingHorizontal: 2,
  },
});
