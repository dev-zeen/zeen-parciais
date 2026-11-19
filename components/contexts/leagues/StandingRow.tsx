import { ReactNode, memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';

/** Largura das colunas numéricas, igual no cabeçalho e nas linhas */
export const STAT_COLUMN = 30;
const RANK_WIDTH = 28;
const SHIELD = 32;

type StandingRowProps = {
  rank: number;
  name: string;
  owner?: string;
  shieldUrl?: string;
  isPro?: boolean;
  isMine?: boolean;
  /** Colunas à direita (pontuação, V/E/D...) */
  children: ReactNode;
  /** Conteúdo extra abaixo da linha (detalhes expandidos) */
  footer?: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

/**
 * Linha de classificação. Pódio com cor (1º ouro, 2º e 3º neutros), linha do usuário
 * com fundo de destaque. As colunas numéricas vêm de quem usa (clássica ou pontos corridos).
 */
export const StandingRow = memo(
  ({
    rank,
    name,
    owner,
    shieldUrl,
    isPro,
    isMine,
    children,
    footer,
    onPress,
    accessibilityLabel,
    accessibilityHint,
  }: StandingRowProps) => {
    const { colors, spacing, radius } = useTokens();

    const rankStyle =
      rank === 1
        ? { bg: colors.warningContainer, fg: 'warning' as const }
        : rank <= 3
          ? { bg: colors.surfaceAlt, fg: 'text' as const }
          : { bg: 'transparent', fg: 'textMuted' as const };

    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => [
          {
            borderRadius: radius.md,
            backgroundColor: isMine ? colors.accentContainer : colors.surface,
            borderWidth: 1,
            borderColor: isMine ? colors.accentFill : 'transparent',
            overflow: 'hidden',
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <View
          style={[
            styles.row,
            { gap: spacing.xs, paddingVertical: 10, paddingHorizontal: spacing.sm },
          ]}>
          <View style={[styles.rank, { backgroundColor: rankStyle.bg }]}>
            <AppText variant="label" weight="bold" color={rankStyle.fg}>
              {rank}
            </AppText>
          </View>

          <View>
            <Image
              source={{ uri: shieldUrl }}
              style={[styles.shield, { backgroundColor: colors.surfaceAlt }]}
            />
            {isPro ? (
              <View
                style={[
                  styles.pro,
                  {
                    backgroundColor: colors.warningFill,
                    borderColor: isMine ? colors.accentContainer : colors.surface,
                  },
                ]}
              />
            ) : null}
          </View>

          <View style={styles.name}>
            <AppText variant="body" weight="bold" numberOfLines={1}>
              {name}
            </AppText>
            {owner ? (
              <AppText variant="caption" color="textMuted" numberOfLines={1}>
                {isMine ? 'Você' : owner}
              </AppText>
            ) : null}
          </View>

          {children}
        </View>
        {footer}
      </Pressable>
    );
  }
);

type HeaderColumn = {
  label: string;
  width?: number;
  /** Mesmo alinhamento do valor na linha (pontuação fica à direita) */
  align?: 'center' | 'right';
};

/**
 * Cabeçalho alinhado às colunas do StandingRow: mesmo padding e a mesma borda (transparente)
 * da linha, para os títulos ficarem exatamente sobre os valores.
 */
export function StandingHeader({
  columns,
  leading,
}: {
  columns: HeaderColumn[];
  /** Conteúdo na coluna do nome (ex.: selo "ao vivo") */
  leading?: ReactNode;
}) {
  const { spacing } = useTokens();

  return (
    <View
      style={[
        styles.row,
        {
          gap: spacing.xs,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: 'transparent',
        },
      ]}>
      <AppText
        variant="caption"
        weight="bold"
        color="textMuted"
        align="center"
        style={{ width: RANK_WIDTH }}
        accessibilityElementsHidden
        importantForAccessibility="no">
        #
      </AppText>
      <View
        style={[
          styles.name,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            marginLeft: SHIELD + spacing.xs,
          },
        ]}>
        {leading ?? (
          <AppText variant="caption" weight="bold" color="textMuted" accessibilityElementsHidden>
            TIME
          </AppText>
        )}
      </View>
      {columns.map((column) => (
        <AppText
          key={column.label}
          variant="caption"
          weight="bold"
          color="textMuted"
          align={column.align ?? 'center'}
          numberOfLines={1}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{ width: column.width ?? STAT_COLUMN }}>
          {column.label}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: RANK_WIDTH,
    height: RANK_WIDTH,
    borderRadius: RANK_WIDTH / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    width: SHIELD,
    height: SHIELD,
    borderRadius: SHIELD / 2,
  },
  pro: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
  },
  name: {
    flex: 1,
    minWidth: 0,
  },
});
