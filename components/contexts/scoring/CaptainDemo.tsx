import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useTokens } from '@/hooks/useTokens';
import { haptics } from '@/utils/haptics';
import { numberToString } from '@/utils/parseTo';
import { CAPTAIN_MULTIPLIER, captainPoints } from '@/utils/scoring';

const EXAMPLES = [
  { name: 'Mitou', points: 10 },
  { name: 'Foi mal', points: -3 },
];

/** Liga e desliga o capitão para mostrar o ×1,5 nos pontos positivos e negativos. */
export function CaptainDemo() {
  const { colors, spacing, radius, minTouch } = useTokens();
  const [isCaptain, setIsCaptain] = useState(false);
  const [pop] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1.2, useNativeDriver: true, speed: 40, bounciness: 14 }),
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 18 }),
    ]).start();
  }, [isCaptain, pop]);

  const toggle = () => {
    haptics.selection();
    setIsCaptain((current) => !current);
  };

  return (
    <Card padding={spacing.md} style={{ gap: spacing.sm }}>
      <View style={{ gap: 2 }}>
        <AppText variant="title" weight="bold">
          Capitão vale ×{numberToString(CAPTAIN_MULTIPLIER)}
        </AppText>
        <AppText variant="label" color="textMuted">
          O multiplicador vale para o bem e para o mal. Toque no botão para ver.
        </AppText>
      </View>

      <View style={[styles.row, { gap: spacing.xs }]}>
        {EXAMPLES.map((example) => {
          const value = isCaptain ? captainPoints(example.points) : example.points;
          const isPositive = value >= 0;
          return (
            <View
              key={example.name}
              style={[
                styles.tile,
                {
                  gap: 4,
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: isPositive ? colors.positiveContainer : colors.negativeContainer,
                },
              ]}>
              <View style={styles.tileHeader}>
                <AppText variant="label" weight="medium" color="textMuted">
                  {example.name}
                </AppText>
                {isCaptain ? (
                  <View style={[styles.badge, { backgroundColor: colors.brand }]}>
                    <AppText variant="caption" weight="bold" color="onBrand">
                      C
                    </AppText>
                  </View>
                ) : null}
              </View>
              <Animated.View style={{ transform: [{ scale: pop }] }}>
                <AppText
                  variant="display"
                  weight="bold"
                  color={isPositive ? 'positive' : 'negative'}
                  maxFontSizeMultiplier={1.2}>
                  {numberToString(value)}
                </AppText>
              </Animated.View>
              <AppText variant="caption" color="textMuted">
                {isCaptain
                  ? `${numberToString(example.points)} × ${numberToString(CAPTAIN_MULTIPLIER)}`
                  : 'pontos do jogador'}
              </AppText>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={toggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: isCaptain }}
        accessibilityLabel="Jogador é o capitão"
        style={({ pressed }) => [
          styles.button,
          {
            minHeight: minTouch,
            borderRadius: radius.full,
            backgroundColor: isCaptain ? colors.brandContainer : colors.brand,
            opacity: pressed ? 0.8 : 1,
          },
        ]}>
        <AppText variant="body" weight="bold" color={isCaptain ? 'text' : 'onBrand'}>
          {isCaptain ? 'Tirar a braçadeira' : 'Tornar capitão'}
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
