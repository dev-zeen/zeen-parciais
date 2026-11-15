import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ENUM_STATUS_MARKET_PLAYER, OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { MIN_TOUCH, useTokens } from '@/hooks/useTokens';
import { LineupPlayer } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import type { FieldStat } from '@/store/useTeamLineupStore';
import type { PlayerInsight } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

export const PLAYER_SLOT_MAX_WIDTH = 76;
export const PLAYER_AVATAR_SIZE = 44;
/** Altura reservada para a etiqueta acima do avatar; a vaga vazia usa o mesmo valor para alinhar. */
export const PLAYER_LABEL_HEIGHT = 20;

type TeamPlayerProps = {
  player?: LineupPlayer | FullPlayer;
  isCaptain?: boolean;
  isPlayed?: boolean;
  isReplaced?: boolean;
  isEnteredInMatch?: boolean;
  isReservePlayer?: boolean;
  isViewOnly: boolean;
  round?: number;
  width?: number;
  /** Dado exibido na etiqueta com o mercado aberto */
  fieldStat?: FieldStat;
  insight?: PlayerInsight;
  onPress?: (player: LineupPlayer | FullPlayer) => void;
};

export function TeamPlayer({
  player,
  isCaptain,
  isPlayed,
  isReplaced,
  isEnteredInMatch,
  isReservePlayer = false,
  isViewOnly = false,
  round,
  width = PLAYER_SLOT_MAX_WIDTH,
  fieldStat = 'price',
  insight,
  onPress,
}: TeamPlayerProps) {
  const { colors, field } = useTokens();
  const { isMarketClose, marketStatus } = useMarketStatus();

  const showScore = isMarketClose || isViewOnly;

  const scoreLabel = useMemo(() => {
    if (isReplaced) return '-';

    const multiplier = isCaptain ? 1.5 : 1;

    if (round === marketStatus?.rodada_atual) {
      if (!isMarketClose || !isPlayed) return '-';
      return numberToString(((player as LineupPlayer)?.pontuacao ?? 0) * multiplier);
    }

    const points = player?.pontos_num;
    if (points === null) return '-';
    const score = (points ?? 0) * multiplier;
    return isNaN(score) ? '-' : numberToString(score);
  }, [isCaptain, isMarketClose, isPlayed, isReplaced, marketStatus?.rodada_atual, player, round]);

  const statLabel = useMemo(() => {
    switch (fieldStat) {
      case 'average':
        return numberToString(player?.media_num);
      case 'min':
        return insight?.minToValorize != null ? numberToString(insight.minToValorize) : '-';
      case 'match':
        if (!insight?.match) return '-';
        return insight.match.isHome ? 'Casa' : 'Fora';
      default:
        return `C$ ${numberToString(player?.preco_num)}`;
    }
  }, [fieldStat, insight, player?.media_num, player?.preco_num]);

  if (!player) return null;

  const status = OBJECT_STATUS_MARKET_PLAYER[player.status_id];
  const isUnlikely = player.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL;
  const isDimmed = isReplaced || (isReservePlayer && !isEnteredInMatch && isMarketClose);
  const label = showScore ? scoreLabel : statLabel;
  const opponentShield =
    !showScore && fieldStat === 'match' ? insight?.match?.opponent?.escudos?.['30x30'] : undefined;

  const accessibilityLabel = [
    player.apelido,
    isCaptain ? 'capitão' : null,
    !isViewOnly && status ? status.name : null,
    showScore ? `pontuação ${label}` : accessibleStat(fieldStat, label, insight),
    isReplaced ? 'substituído' : null,
    isEnteredInMatch ? 'entrou na partida' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={() => onPress?.(player)}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Abre a ficha do jogador"
      style={({ pressed }) => [
        styles.slot,
        { width, minHeight: MIN_TOUCH, opacity: isDimmed ? 0.6 : pressed ? 0.7 : 1 },
      ]}>
      <View
        style={[
          styles.label,
          { backgroundColor: field.chipBg, borderColor: field.chipBorder, maxWidth: width - 2 },
        ]}>
        {opponentShield ? (
          <Image source={{ uri: opponentShield }} style={styles.shield} accessible={false} />
        ) : null}
        <AppText
          variant="caption"
          weight="bold"
          color={field.chipText}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}>
          {label}
        </AppText>
      </View>

      <View>
        <Image
          source={{ uri: player.foto?.replace('FORMATO', '220x220') }}
          style={[
            styles.avatar,
            {
              borderColor: isUnlikely && !isViewOnly ? colors.negativeFill : field.slotBorder,
              backgroundColor: field.chipBg,
            },
          ]}
          accessible={false}
        />

        {isCaptain ? (
          <View style={[styles.badge, styles.badgeTopLeft, { backgroundColor: colors.brand }]}>
            <AppText variant="caption" weight="bold" color="onBrand" maxFontSizeMultiplier={1}>
              C
            </AppText>
          </View>
        ) : null}

        {!isViewOnly && status ? (
          <View
            style={[
              styles.badge,
              styles.badgeBottomRight,
              { backgroundColor: status.background },
            ]}>
            <Feather
              name={status.icon as keyof typeof Feather.glyphMap}
              color={status.color}
              size={12}
            />
          </View>
        ) : null}

        {isReplaced || isEnteredInMatch ? (
          <View
            style={[
              styles.badge,
              styles.badgeBottomLeft,
              { backgroundColor: isReplaced ? colors.negativeFill : colors.positiveFill },
            ]}>
            <Feather
              name={isReplaced ? 'arrow-down' : 'arrow-up'}
              color={isReplaced ? colors.onNegativeFill : colors.onPositiveFill}
              size={12}
            />
          </View>
        ) : null}
      </View>

      <View style={[styles.name, { backgroundColor: field.chipBg, maxWidth: width - 2 }]}>
        <AppText
          variant="caption"
          weight="bold"
          color={field.chipText}
          numberOfLines={1}
          maxFontSizeMultiplier={1.3}>
          {player.apelido_abreviado}
        </AppText>
      </View>
    </Pressable>
  );
}

function accessibleStat(fieldStat: FieldStat, label: string, insight?: PlayerInsight) {
  switch (fieldStat) {
    case 'average':
      return `média ${label}`;
    case 'min':
      return `mínimo para valorizar ${label}`;
    case 'match':
      if (!insight?.match) return 'sem jogo na rodada';
      return `joga ${insight.match.isHome ? 'em casa' : 'fora'} contra ${
        insight.match.opponent?.nome ?? 'adversário'
      }`;
    default:
      return `preço ${label}`;
  }
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    minHeight: PLAYER_LABEL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  shield: {
    width: 14,
    height: 14,
  },
  avatar: {
    width: PLAYER_AVATAR_SIZE,
    height: PLAYER_AVATAR_SIZE,
    borderRadius: PLAYER_AVATAR_SIZE / 2,
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTopLeft: {
    top: -3,
    left: -5,
  },
  badgeBottomRight: {
    bottom: -3,
    right: -5,
  },
  badgeBottomLeft: {
    bottom: -3,
    left: -5,
  },
  name: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
});
