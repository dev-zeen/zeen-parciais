import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTokens } from '@/hooks/useTokens';
import { fontFamily } from '@/styles/tokens';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel?: string;
};

/** Campo de busca com ícone e botão de limpar (Mercado e Rodada). */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: SearchFieldProps) {
  const { colors, radius, minTouch, fontSize } = useTokens();

  return (
    <View
      style={[
        styles.container,
        { minHeight: minTouch, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
      ]}>
      <Feather name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={[styles.input, { color: colors.text, fontSize: fontSize.body }]}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={12}>
          <Feather name="x-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontFamily,
  },
});
