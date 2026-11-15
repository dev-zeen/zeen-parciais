import { Feather } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTokens } from '@/hooks/useTokens';
import { Market } from '@/models/Market';
import { Matches } from '@/models/Matches';
import { FullPlayer, IPositions } from '@/models/Stats';
import type { PlayerInsight } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

type MarketPlayerCardProps = {
  player: FullPlayer;
  market: Market;
  matches: Matches;
  positions: IPositions;
  /** Confronto e médias casa/fora, calculados uma vez pela lista */
  insight?: PlayerInsight;
  onPressAddPlayerToLineup: (player: FullPlayer) => void;
  onPressRemovePlayerFromLineup: (player: FullPlayer) => void;
  isButtonDisabled: boolean;
  /** Texto do botão quando a compra está indisponível (ex.: "Sem saldo") */
  disabledReason?: string;
  isSellPlayer?: boolean;
};

export function MarketPlayerCard({
  market,
  matches,
  positions,
  player,
  insight,
  onPressAddPlayerToLineup,
  onPressRemovePlayerFromLineup,
  isButtonDisabled,
  disabledReason,
  isSellPlayer,
}: MarketPlayerCardProps) {
  const { colors, radius, minTouch } = useTokens();
  const { isMarketClose } = useMarketStatus();

  const status = OBJECT_STATUS_MARKET_PLAYER[player.status_id];
  const match = insight?.match?.match;
  const club = market?.clubes?.[player.clube_id];
  const position = positions?.[player.posicao_id];
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
    ? { bg: colors.disabledFill, fg: colors.onDisabledFill }
    : isSellPlayer
      ? { bg: colors.negativeFill, fg: colors.onNegativeFill }
      : { bg: colors.accentFill, fg: colors.onAccentFill };

  const venue = (label: string, value: number | null, active: boolean) => (
    <AppText variant="label" weight={active ? 'bold' : 'regular'} color={active ? 'accent' : 'textMuted'}>
      {label} {value != null ? numberToString(value) : '-'}
    </AppText>
  );

  return (
    <Card style={styles.card}>
      <View>
        <Image
          source={{ uri: player.foto?.replace('FORMATO', '220x220') }}
          style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
          accessible={false}
        />
        {status ? (
          <View
            accessible
            accessibilityLabel={status.name}
            style={[styles.status, { backgroundColor: status.background, borderColor: colors.surface }]}>
            <Feather
              name={status.icon as keyof typeof Feather.glyphMap}
              color={status.color}
              size={12}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <AppText variant="title" weight="bold" numberOfLines={1}>
          {player.apelido_abreviado}
        </AppText>

        <View style={styles.meta}>
          <AppText variant="label" color="textMuted" numberOfLines={1}>
            {position?.abreviacao?.toUpperCase()} · {club?.abreviacao} · {player.jogos_num} jogos
          </AppText>
          {match ? (
            <View
              accessible
              accessibilityLabel={`${matches?.clubes?.[match.clube_casa_id]?.nome ?? 'mandante'} contra ${
                matches?.clubes?.[match.clube_visitante_id]?.nome ?? 'visitante'
              }`}
              style={styles.fixture}>
              <Image
                source={{ uri: matches?.clubes?.[match.clube_casa_id]?.escudos?.['60x60'] }}
                style={styles.shield}
              />
              <Feather name="x" size={10} color={colors.textMuted} />
              <Image
                source={{ uri: matches?.clubes?.[match.clube_visitante_id]?.escudos?.['60x60'] }}
                style={styles.shield}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.stats}>
          <Stat label="Média" value={numberToString(player.media_num)} tone={player.media_num > 0 ? 'positive' : 'negative'} />
          <Stat label="Última" value={numberToString(player.pontos_num)} tone={player.pontos_num > 0 ? 'positive' : 'negative'} />
          <Stat
            label="Mín. val."
            value={insight?.minToValorize != null ? numberToString(insight.minToValorize) : '-'}
            tone="accent"
          />
        </View>

        {insight?.hasGatoMestre ? (
          <View
            accessible
            accessibilityLabel={`Média em casa ${
              insight.avgHome != null ? numberToString(insight.avgHome) : 'indisponível'
            }, fora ${insight.avgAway != null ? numberToString(insight.avgAway) : 'indisponível'}`}
            style={styles.venues}>
            {venue('Casa', insight.avgHome, insight.match?.isHome === true)}
            <AppText variant="label" color="textMuted">
              ·
            </AppText>
            {venue('Fora', insight.avgAway, insight.match?.isHome === false)}
          </View>
        ) : null}
      </View>

      <Pressable
        disabled={disabled}
        onPress={() =>
          isSellPlayer ? onPressRemovePlayerFromLineup(player) : onPressAddPlayerToLineup(player)
        }
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${player.apelido}, ${price}`}
        accessibilityState={{ disabled }}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => [
          styles.button,
          {
            minHeight: Math.max(minTouch, 60),
            borderRadius: radius.md,
            backgroundColor: button.bg,
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
        <AppText variant="label" weight="bold" color={button.fg} align="center" numberOfLines={2}>
          {actionLabel}
        </AppText>
        <AppText variant="body" weight="bold" color={button.fg} numberOfLines={1}>
          {price}
        </AppText>
      </Pressable>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'positive' | 'negative' | 'accent';
}) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`}>
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
    gap: 10,
  },
  photo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  status: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  fixture: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  shield: {
    width: 16,
    height: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  venues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  button: {
    width: 92,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
