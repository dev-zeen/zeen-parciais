import { Feather } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';
import { IClub } from '@/models/Club';
import { FullPlayer } from '@/models/Stats';
import { PlayerInsight } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

export type ComparedPlayer = {
  player: FullPlayer;
  insight: PlayerInsight;
  /** % de escalação, quando está entre os mais escalados */
  selection?: number | null;
};

type Row = {
  label: string;
  values: [number | null, number | null];
  format: (value: number) => string;
  /** Qual lado é melhor: maior (padrão) ou menor (preço, mínimo p/ valorizar) */
  better?: 'higher' | 'lower';
};

const points = (value: number) => numberToString(value);

function buildRows([a, b]: [ComparedPlayer, ComparedPlayer]): Row[] {
  const pair = (pick: (item: ComparedPlayer) => number | null | undefined) =>
    [pick(a) ?? null, pick(b) ?? null] as [number | null, number | null];

  const rows: Row[] = [
    {
      label: 'Preço',
      values: pair((x) => x.player.preco_num),
      better: 'lower',
      format: (v) => `C$ ${points(v)}`,
    },
    { label: 'Projeção', values: pair((x) => x.insight.projected), format: points },
    { label: 'Média', values: pair((x) => x.player.media_num), format: points },
    { label: 'Média no mando', values: pair((x) => x.insight.avgVenue), format: points },
    { label: 'Última', values: pair((x) => x.player.pontos_num), format: points },
    { label: 'Jogos', values: pair((x) => x.player.jogos_num), format: String },
    {
      label: 'Mín. p/ valorizar',
      values: pair((x) => x.insight.minToValorize),
      better: 'lower',
      format: points,
    },
    {
      label: 'Minutos por jogo',
      values: pair((x) => x.insight.avgMinutes),
      format: (v) => `${Math.round(v)}'`,
    },
    { label: 'Escalado por', values: pair((x) => x.selection), format: (v) => `${Math.round(v)}%` },
  ];
  return rows.filter((row) => row.values.some((value) => value !== null));
}

/** Lado vencedor da linha: 0, 1 ou null (empate ou falta de dado). */
function winnerOf({ values: [a, b], better = 'higher' }: Row): 0 | 1 | null {
  if (a === null || b === null || a === b) return null;
  return (better === 'higher' ? a > b : a < b) ? 0 : 1;
}

type PlayerCompareProps = {
  players: [ComparedPlayer, ComparedPlayer];
  clubs?: IClub;
  onClose: () => void;
};

/** Dois jogadores lado a lado, com o melhor valor de cada linha destacado. */
export function PlayerCompare({ players, clubs, onClose }: PlayerCompareProps) {
  const { colors, spacing, radius, minTouch } = useTokens();
  const rows = buildRows(players);

  return (
    <View style={{ gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}>
      <View style={styles.header}>
        <AppText variant="title" weight="bold" style={{ flex: 1 }} accessibilityRole="header">
          Comparar jogadores
        </AppText>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar comparação"
          style={[styles.close, { width: minTouch, height: minTouch }]}>
          <Feather name="x" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.row}>
        <View style={styles.label} />
        {players.map(({ player, insight }) => {
          const opponent = insight.match?.opponent;
          return (
            <View key={player.atleta_id} style={styles.playerHead}>
              <Image
                source={{ uri: player.foto?.replace('FORMATO', '140x140') }}
                style={[styles.photo, { backgroundColor: colors.surfaceAlt }]}
              />
              <AppText variant="body" weight="bold" numberOfLines={1} align="center">
                {player.apelido_abreviado}
              </AppText>
              <AppText variant="caption" color="textMuted" numberOfLines={1} align="center">
                {clubs?.[player.clube_id]?.abreviacao}
                {insight.match
                  ? ` ${insight.match.isHome ? 'vs' : '@'} ${opponent?.abreviacao ?? ''}`
                  : ' · sem jogo'}
              </AppText>
            </View>
          );
        })}
      </View>

      <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 2 }}>
        {rows.map((row) => {
          const winner = winnerOf(row);
          return (
            <View
              key={row.label}
              style={[styles.row, { paddingVertical: 8, borderRadius: radius.sm }]}
              accessible
              accessibilityLabel={`${row.label}: ${players[0].player.apelido} ${
                row.values[0] !== null ? row.format(row.values[0]) : 'sem dado'
              }, ${players[1].player.apelido} ${
                row.values[1] !== null ? row.format(row.values[1]) : 'sem dado'
              }`}>
              <AppText variant="label" color="textMuted" style={styles.label}>
                {row.label}
              </AppText>
              {row.values.map((value, side) => (
                <View
                  key={side}
                  style={[
                    styles.value,
                    {
                      borderRadius: radius.full,
                      backgroundColor: winner === side ? colors.positiveContainer : 'transparent',
                    },
                  ]}>
                  <AppText
                    variant="body"
                    weight={winner === side ? 'bold' : 'regular'}
                    color={winner === side ? 'positive' : 'text'}>
                    {value !== null ? row.format(value) : '-'}
                  </AppText>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  close: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1.1,
  },
  playerHead: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  value: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    marginHorizontal: 4,
  },
});
