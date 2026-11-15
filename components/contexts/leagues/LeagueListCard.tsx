import { Feather } from '@expo/vector-icons';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { LEAGUE_KIND, LeagueKind } from './leagueKinds';

import { AppText } from '@/components/ui/AppText';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { useTokens } from '@/hooks/useTokens';

export type LeagueListItem = {
  key: string;
  kind: LeagueKind;
  name: string;
  imageUrl?: string;
  /** Linha de contexto: privacidade, times, rodadas */
  meta: string;
  /** Posição do usuário, quando a API informa */
  position?: number;
  /** Positivo = subiu na tabela */
  variation?: number;
  isOwner?: boolean;
  status?: { label: string; tone: BadgeTone };
  href: string;
};

const positionFormat = new Intl.NumberFormat('pt-BR');

type LeagueListCardProps = {
  item: LeagueListItem;
  onPress: (href: string) => void;
};

/**
 * Card da lista de ligas. A posição do usuário fica à direita, em destaque, porque é a
 * primeira coisa que se procura; tipo, dono e status ficam em selos abaixo do nome.
 */
export const LeagueListCard = memo(({ item, onPress }: LeagueListCardProps) => {
  const { colors, spacing, radius } = useTokens();
  const kind = LEAGUE_KIND[item.kind];
  const hasPosition = !!item.position && item.position > 0;
  const variation = item.variation ?? 0;
  // Identidade da modalidade: o fundo do escudo usa a cor dela.
  const tint = {
    accent: colors.accentContainer,
    info: colors.infoContainer,
    positive: colors.positiveContainer,
  }[kind.tone as 'accent' | 'info' | 'positive'];

  return (
    <Pressable
      onPress={() => onPress(item.href)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${kind.label}, ${item.meta}${
        hasPosition ? `, você está em ${item.position}º` : ''
      }`}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        styles.card,
        {
          gap: spacing.sm,
          padding: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View
        style={[
          styles.image,
          { backgroundColor: tint ?? colors.surfaceAlt, borderRadius: radius.sm },
        ]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.imageInner} resizeMode="contain" />
        ) : (
          <Feather name={kind.icon} size={20} color={colors.textMuted} />
        )}
      </View>

      <View style={styles.info}>
        <AppText variant="title" weight="bold" numberOfLines={1}>
          {item.name}
        </AppText>
        <AppText variant="label" color="textMuted" numberOfLines={1}>
          {item.meta}
        </AppText>
        <View style={styles.badges}>
          <Badge label={kind.label} tone={kind.tone} />
          {item.isOwner ? <Badge label="Sua liga" /> : null}
          {item.status ? <Badge label={item.status.label} tone={item.status.tone} /> : null}
        </View>
      </View>

      {hasPosition ? (
        <View style={styles.position}>
          <AppText variant="heading" weight="bold">
            {positionFormat.format(item.position!)}º
          </AppText>
          {variation !== 0 ? (
            <View style={styles.variation}>
              <Feather
                name={variation > 0 ? 'arrow-up' : 'arrow-down'}
                size={11}
                color={variation > 0 ? colors.positive : colors.negative}
              />
              <AppText
                variant="caption"
                weight="bold"
                color={variation > 0 ? 'positive' : 'negative'}>
                {Math.abs(variation)}
              </AppText>
            </View>
          ) : (
            <AppText variant="caption" color="textMuted">
              posição
            </AppText>
          )}
        </View>
      ) : (
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInner: {
    width: 40,
    height: 40,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  position: {
    alignItems: 'flex-end',
    minWidth: 48,
  },
  variation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
