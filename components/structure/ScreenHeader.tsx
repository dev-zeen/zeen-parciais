import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

type HeaderAction = {
  icon: keyof typeof Feather.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  /** Número exibido sobre o ícone (ex.: pedidos pendentes) */
  badge?: number;
};

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  actions?: HeaderAction[];
  /** Esconde o botão de voltar (telas raiz de aba) */
  hideBack?: boolean;
};

/** Cabeçalho das telas empilhadas: voltar, imagem opcional, título e ações à direita. */
export function ScreenHeader({ title, subtitle, imageUrl, actions, hideBack }: ScreenHeaderProps) {
  const { colors, spacing, minTouch } = useTokens();

  const circle = {
    width: minTouch,
    height: minTouch,
    borderRadius: minTouch / 2,
    backgroundColor: colors.surface,
  };

  return (
    <View
      style={[
        styles.row,
        { gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
      ]}>
      {!hideBack ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={({ pressed }) => [styles.center, circle, { opacity: pressed ? 0.7 : 1 }]}>
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
      ) : null}

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
      ) : null}

      <View style={{ flex: 1 }}>
        <AppText variant="title" weight="bold" numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="label" color="textMuted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actions?.map((action) => (
        <Pressable
          key={action.icon}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={
            action.badge
              ? `${action.accessibilityLabel}, ${action.badge}`
              : action.accessibilityLabel
          }
          style={({ pressed }) => [styles.center, circle, { opacity: pressed ? 0.7 : 1 }]}>
          <Feather name={action.icon} size={20} color={colors.text} />
          {action.badge ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.negativeFill, borderColor: colors.bg },
              ]}>
              <AppText variant="caption" weight="bold" color="onNegativeFill">
                {action.badge > 9 ? '9+' : action.badge}
              </AppText>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 36,
    height: 36,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
