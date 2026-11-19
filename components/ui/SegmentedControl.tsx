import { View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { useTokens } from '@/hooks/useTokens';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  accessibilityLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Alternância entre abas no mesmo padrão dos chips de filtro: selecionada em laranja,
 * as demais em superfície sólida com texto normal (legível nos dois temas).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { spacing } = useTokens();

  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: spacing.xs }}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          accessibilityLabel={option.accessibilityLabel}
          accessibilityRole="tab"
          selected={option.value === value}
          onPress={() => onChange(option.value)}
          fill
        />
      ))}
    </View>
  );
}
