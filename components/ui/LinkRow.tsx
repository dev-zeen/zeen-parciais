import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

type LinkRowProps = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  accessibilityHint?: string;
  onPress: () => void;
};

/** Linha de navegação discreta: ícone, título, subtítulo e seta. */
export function LinkRow({ icon, title, subtitle, accessibilityHint, onPress }: LinkRowProps) {
  const { colors, spacing, radius, minTouch } = useTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: minTouch,
          gap: spacing.sm,
          padding: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      <View
        style={[styles.icon, { borderRadius: radius.sm, backgroundColor: colors.brandContainer }]}>
        <Feather name={icon} size={20} color={colors.brandText} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body" weight="bold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="label" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
