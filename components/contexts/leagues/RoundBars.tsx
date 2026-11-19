import { useRef } from 'react';
import { Pressable, ScrollView, ScrollViewInstance, StyleSheet, View } from 'react-native';

import { formatPoints } from '@/components/contexts/leagues/leagueKinds';
import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';
import type { RoundScore } from '@/hooks/useTeamSeason';

const BAR_WIDTH = 22;
const CHART_HEIGHT = 96;

type RoundBarsProps = {
  rounds: RoundScore[];
  selected: number;
  bestRound?: number;
  average?: number;
  /** Rodada em andamento, com a parcial (barra tracejada) */
  live?: { round: number; points: number };
  onSelect: (round: number) => void;
};

/**
 * Pontuação por rodada em barras. Serve de gráfico e de navegação: tocar numa barra abre
 * aquela rodada. Começa rolado até a rodada mais recente.
 */
export function RoundBars({
  rounds,
  selected,
  bestRound,
  average,
  live,
  onSelect,
}: RoundBarsProps) {
  const { colors, radius } = useTokens();
  const scrollRef = useRef<ScrollViewInstance>(null);

  const bars = live ? [...rounds, { round: live.round, points: live.points }] : rounds;
  const max = Math.max(1, ...bars.map((bar) => bar.points ?? 0));
  const averageTop =
    average != null && average > 0 ? CHART_HEIGHT - (average / max) * CHART_HEIGHT : undefined;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      contentContainerStyle={styles.content}>
      <View>
        <View style={[styles.bars, { height: CHART_HEIGHT }]}>
          {averageTop != null ? (
            <View
              pointerEvents="none"
              style={[styles.average, { top: averageTop, borderColor: colors.textMuted }]}
            />
          ) : null}
          {bars.map((bar) => {
            const isLive = live?.round === bar.round;
            const isSelected = bar.round === selected;
            const isBest = bar.round === bestRound;
            const points = bar.points;
            const height =
              points != null && points > 0 ? Math.max(4, (points / max) * CHART_HEIGHT) : 4;
            const fill = isSelected
              ? colors.accentFill
              : isBest
                ? colors.positiveFill
                : points == null
                  ? colors.surfaceAlt
                  : colors.border;
            return (
              <Pressable
                key={bar.round}
                onPress={() => onSelect(bar.round)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Rodada ${bar.round}, ${
                  points == null ? 'não escalou' : `${formatPoints(points)} pontos`
                }${isBest ? ', melhor rodada' : ''}${isLive ? ', em andamento' : ''}`}
                hitSlop={{ top: 8, bottom: 8 }}
                style={[styles.barSlot, { height: CHART_HEIGHT }]}>
                <View
                  style={{
                    width: BAR_WIDTH - 6,
                    height,
                    borderTopLeftRadius: radius.sm / 2,
                    borderTopRightRadius: radius.sm / 2,
                    backgroundColor: isLive && !isSelected ? 'transparent' : fill,
                    borderWidth: isLive ? 1.5 : 0,
                    borderStyle: 'dashed',
                    borderColor: colors.accentFill,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.labels}>
          {bars.map((bar) => (
            <AppText
              key={bar.round}
              variant="caption"
              weight={bar.round === selected ? 'bold' : 'regular'}
              color={bar.round === selected ? 'accent' : 'textMuted'}
              align="center"
              style={{ width: BAR_WIDTH }}>
              {bar.round}
            </AppText>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 4,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barSlot: {
    width: BAR_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  average: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  labels: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
