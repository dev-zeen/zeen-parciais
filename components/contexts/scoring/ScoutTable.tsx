import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { AppText } from '@/components/ui/AppText';
import { SCOUTS } from '@/constants/Scouts';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useTokens } from '@/hooks/useTokens';
import { numberToString } from '@/utils/parseTo';
import { SCOUT_GROUPS, ScoutCode } from '@/utils/scoring';

/** Maior valor absoluto da tabela: define o tamanho cheio da barra. */
const MAX_POINTS = Math.max(...Object.values(SCOUTS).map((scout) => Math.abs(scout.points)));

/** Tabela de scouts agrupada, com barras que crescem conforme o peso de cada lance. */
export function ScoutTable() {
  const { colors, spacing } = useTokens();

  return (
    <View style={{ gap: spacing.xs }}>
      {SCOUT_GROUPS.map((group, index) => (
        <AnimatedCard key={group.title} delay={index * 120} variant="flat">
          <View style={{ gap: spacing.xs }}>
            <View style={[styles.title, { gap: spacing.xs }]}>
              <Feather
                name={group.icon as keyof typeof Feather.glyphMap}
                size={18}
                color={colors.brand}
              />
              <AppText variant="title" weight="bold" accessibilityRole="header">
                {group.title}
              </AppText>
            </View>
            {group.codes.map((code, rowIndex) => (
              <ScoutRow key={code} code={code} delay={index * 120 + rowIndex * 60} />
            ))}
          </View>
        </AnimatedCard>
      ))}
    </View>
  );
}

function ScoutRow({ code, delay }: { code: ScoutCode; delay: number }) {
  const { colors, radius } = useTokens();
  const reduceMotion = useReduceMotion();
  const [grow] = useState(() => new Animated.Value(0));

  const scout = SCOUTS[code];
  const isPositive = scout.points >= 0;
  const share = Math.abs(scout.points) / MAX_POINTS;

  useEffect(() => {
    Animated.timing(grow, {
      toValue: share,
      duration: reduceMotion ? 0 : 700,
      delay: reduceMotion ? 0 : delay + 300,
      useNativeDriver: false,
    }).start();
  }, [delay, grow, reduceMotion, share]);

  const width = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${scout.name}: ${isPositive ? 'mais' : 'menos'} ${numberToString(
        Math.abs(scout.points)
      )} pontos`}>
      <View
        style={[
          styles.code,
          {
            borderRadius: radius.sm,
            backgroundColor: isPositive ? colors.positiveContainer : colors.negativeContainer,
          },
        ]}>
        <AppText variant="label" weight="bold" color={isPositive ? 'positive' : 'negative'}>
          {scout.code}
        </AppText>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="body" numberOfLines={1}>
          {scout.name}
        </AppText>
        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <Animated.View
            style={[
              styles.fill,
              { width, backgroundColor: isPositive ? colors.positiveFill : colors.negativeFill },
            ]}
          />
        </View>
      </View>
      <AppText
        variant="body"
        weight="bold"
        color={isPositive ? 'positive' : 'negative'}
        style={styles.points}>
        {isPositive ? '+' : ''}
        {numberToString(scout.points)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  code: {
    width: 40,
    paddingVertical: 4,
    alignItems: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  points: {
    minWidth: 44,
    textAlign: 'right',
  },
});
