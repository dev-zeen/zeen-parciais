import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { Market } from '@/models/Market';
import { Matches } from '@/models/Matches';
import { FullPlayer, IPositions } from '@/models/Stats';
import { findPlayerMatch, type PlayerInsight } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

type MarketPlayerCardProps = {
  player: FullPlayer;
  market: Market;
  matches: Matches;
  positions: IPositions;
  /** Confronto e mínimo para valorizar, calculados uma vez pela lista */
  insight?: PlayerInsight;
  /** % dos times que escalaram o jogador; só existe para os mais escalados */
  selection?: number | null;
  onPressAddPlayerToLineup: (player: FullPlayer) => void;
  onPressRemovePlayerFromLineup: (player: FullPlayer) => void;
  isButtonDisabled: boolean;
  /** Texto do botão quando a compra está indisponível (ex.: "Sem saldo") */
  disabledReason?: string;
  isSellPlayer?: boolean;
  /** Marcado para comparação (segurar o card) */
  isCompared?: boolean;
  onLongPress?: (player: FullPlayer) => void;
};

/**
 * Card do mercado. Hierarquia: nome e preço em destaque; posição, clube e confronto
 * numa linha; média, última e mínimo para valorizar numa linha de números.
 */
export function MarketPlayerCard({
  market,
  matches,
  positions,
  player,
  insight,
  selection,
  onPressAddPlayerToLineup,
  onPressRemovePlayerFromLineup,
  isButtonDisabled,
  disabledReason,
  isSellPlayer,
  isCompared,
  onLongPress,
}: MarketPlayerCardProps) {
  const { colors, radius, minTouch } = useTokens();
  const { isMarketClose } = useMarketStatus();

  const status = OBJECT_STATUS_MARKET_PLAYER[player.status_id];
  const matchInfo = insight?.match ?? findPlayerMatch(player.clube_id, matches);
  const club = market?.clubes?.[player.clube_id];
  const position = positions?.[player.posicao_id]?.abreviacao?.toUpperCase();
  const price = `C$ ${numberToString(player.preco_num)}`;

  const disabled = isMarketClose || (!isSellPlayer && isButtonDisabled);
  const actionLabel = isMarketClose
    ? 'Fechado'
    : isSellPlayer
      ? 'Vender'
      : isButtonDisabled
        ? (disabledReason ?? 'Indisponível')
        : 'Comprar';

  const button = disabled
    ? { bg: colors.surfaceAlt, fg: colors.textMuted, icon: 'slash' as const }
    : isSellPlayer
      ? { bg: colors.negativeContainer, fg: colors.negative, icon: 'minus' as const }
      : { bg: colors.accentFill, fg: colors.onAccentFill, icon: 'plus' as const };

  const opponent = matchInfo?.opponent;
  const minToValorize = insight?.minToValorize;

  return (
    <Pressable
      onLongPress={onLongPress ? () => onLongPress(player) : undefined}
      accessibilityHint={onLongPress ? 'Segure para comparar com outro jogador' : undefined}
      accessibilityState={{ selected: !!isCompared }}
      style={[
        styles.card,
        {
          backgroundColor: isCompared ? colors.warningContainer : colors.surface,
          borderRadius: radius.md,
          borderColor: isCompared
            ? colors.warning
            : isSellPlayer
              ? colors.accentFill
              : 'transparent',
        },
      ]}>
      <View>
        <Image
          source={{ uri: player.foto?.replace('FORMATO', '140x140') }}
          style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
          accessible={false}
        />
        {status ? (
          <View
            accessible
            accessibilityLabel={status.name}
            style={[
              styles.status,
              { backgroundColor: status.background, borderColor: colors.surface },
            ]}>
            <Feather
              name={status.icon as keyof typeof Feather.glyphMap}
              color={status.color}
              size={10}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <AppText variant="title" weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {player.apelido_abreviado}
          </AppText>
          {isSellPlayer ? (
            <AppText variant="caption" weight="bold" color="accent">
              NO TIME
            </AppText>
          ) : null}
        </View>

        <View
          style={styles.meta}
          accessible
          accessibilityLabel={`${position ?? ''}, ${club?.nome ?? ''}${
            matchInfo
              ? `, joga ${matchInfo.isHome ? 'em casa' : 'fora'} contra ${opponent?.nome ?? 'adversário'}`
              : ''
          }`}>
          <AppText variant="label" weight="bold" color="textMuted">
            {position}
          </AppText>
          <AppText variant="label" color="textMuted" numberOfLines={1}>
            {club?.abreviacao}
          </AppText>
          {matchInfo ? (
            <>
              <AppText variant="label" color="textMuted">
                {matchInfo.isHome ? 'vs' : '@'}
              </AppText>
              {opponent?.escudos?.['30x30'] ? (
                <Image source={{ uri: opponent.escudos['30x30'] }} style={styles.shield} />
              ) : null}
              <AppText variant="label" color="textMuted" numberOfLines={1}>
                {opponent?.abreviacao}
              </AppText>
            </>
          ) : null}
        </View>

        <View style={styles.stats}>
          <Stat label="Méd" value={numberToString(player.media_num)} />
          <Stat
            label="Últ"
            value={numberToString(player.pontos_num)}
            tone={player.pontos_num > 0 ? 'positive' : player.pontos_num < 0 ? 'negative' : 'text'}
          />
          <Stat
            label="Mín"
            value={minToValorize != null ? numberToString(minToValorize) : '-'}
            accessibleLabel="Mínimo para valorizar"
          />
          {selection != null ? (
            <Stat label="Esc" value={`${Math.round(selection)}%`} accessibleLabel="Escalado por" />
          ) : null}
        </View>
      </View>

      <View style={styles.side}>
        <AppText variant="title" weight="bold" numberOfLines={1}>
          {price}
        </AppText>
        <Pressable
          disabled={disabled}
          onPress={() =>
            isSellPlayer ? onPressRemovePlayerFromLineup(player) : onPressAddPlayerToLineup(player)
          }
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${player.apelido}, ${price}`}
          accessibilityState={{ disabled }}
          android_ripple={{ color: colors.border }}
          hitSlop={{ top: 4, bottom: 4 }}
          style={({ pressed }) => [
            styles.button,
            {
              minHeight: minTouch - 8,
              borderRadius: radius.full,
              backgroundColor: button.bg,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <Feather name={button.icon} size={14} color={button.fg} />
          <AppText variant="label" weight="bold" color={button.fg} numberOfLines={1}>
            {actionLabel}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function Stat({
  label,
  value,
  tone = 'text',
  accessibleLabel,
}: {
  label: string;
  value: string;
  tone?: 'text' | 'positive' | 'negative';
  accessibleLabel?: string;
}) {
  return (
    <View
      style={styles.stat}
      accessible
      accessibilityLabel={`${accessibleLabel ?? label}: ${value}`}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="label" weight="bold" color={tone}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1.5,
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  status: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shield: {
    width: 14,
    height: 14,
  },
  stats: {
    flexDirection: 'row',
    // Em telas estreitas (ou com "Esc") os números quebram linha em vez de invadir o botão
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 2,
    marginTop: 1,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  side: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 14,
    minWidth: 104,
    overflow: 'hidden',
  },
});
