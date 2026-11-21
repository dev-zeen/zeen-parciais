import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SCOUTS } from '@/constants/Scouts';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useTokens } from '@/hooks/useTokens';
import { haptics } from '@/utils/haptics';
import { numberToString } from '@/utils/parseTo';
import { SCORING_EXAMPLE, ScoringEvent, sumScoutPoints } from '@/utils/scoring';

const STEP_MS = 1100;

/** Replay de uma partida: cada lance aparece com os pontos e o placar do jogador sobe. */
export function ScoringReplay() {
  const { colors, spacing, radius, minTouch } = useTokens();
  const reduceMotion = useReduceMotion();
  const [step, setStep] = useState(0);
  const [pulse] = useState(() => new Animated.Value(1));
  const [progress] = useState(() => new Animated.Value(0));

  const total = SCORING_EXAMPLE.length;
  const visible = reduceMotion ? total : step;
  const events = SCORING_EXAMPLE.slice(0, visible);
  const points = sumScoutPoints(events.map((event) => event.code));
  const isFinished = visible >= total;
  const minute = isFinished ? 90 : (events[events.length - 1]?.minute ?? 0);

  // Avança um lance por vez
  useEffect(() => {
    if (reduceMotion || step >= total) return;
    const id = setTimeout(() => setStep((current) => current + 1), step === 0 ? 500 : STEP_MS);
    return () => clearTimeout(id);
  }, [reduceMotion, step, total]);

  // Placar pulsa e a barra do tempo de jogo anda a cada lance
  useEffect(() => {
    if (visible === 0) return;
    if (!reduceMotion) haptics.selection();
    Animated.sequence([
      Animated.spring(pulse, { toValue: 1.25, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  }, [pulse, reduceMotion, visible]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: minute / 90,
      duration: reduceMotion ? 0 : 600,
      useNativeDriver: false,
    }).start();
  }, [minute, progress, reduceMotion]);

  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const isPositive = points >= 0;

  return (
    <Card padding={spacing.md} style={{ gap: spacing.sm }}>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="title" weight="bold">
            Do lance ao ponto
          </AppText>
          <AppText variant="label" color="textMuted">
            Um atacante numa partida comum
          </AppText>
        </View>

        <Animated.View
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${numberToString(points)} pontos`}
          style={[
            styles.score,
            {
              borderRadius: radius.md,
              backgroundColor: isPositive ? colors.positiveContainer : colors.negativeContainer,
              transform: [{ scale: pulse }],
            },
          ]}>
          <AppText
            variant="heading"
            weight="bold"
            color={isPositive ? 'positive' : 'negative'}
            maxFontSizeMultiplier={1.3}>
            {numberToString(points)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            pontos
          </AppText>
        </Animated.View>
      </View>

      {/* Tempo de jogo */}
      <View style={{ gap: 4 }}>
        <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
          <Animated.View
            style={[styles.fill, { width: progressWidth, backgroundColor: colors.brand }]}
          />
        </View>
        <AppText variant="caption" color="textMuted">
          {isFinished ? 'Fim de jogo' : `${minute}' do jogo`}
        </AppText>
      </View>

      <View style={{ gap: spacing.xs }}>
        {events.map((event) => (
          <EventRow key={event.minute} event={event} animate={!reduceMotion} />
        ))}
      </View>

      {isFinished ? (
        <View style={{ gap: spacing.xs }}>
          <AppText variant="label" color="textMuted">
            Somando os {total} lances, ele fez {numberToString(points)} pontos. Cada scout tem um
            valor fixo, positivo ou negativo.
          </AppText>
          {!reduceMotion ? (
            <Pressable
              onPress={() => setStep(0)}
              accessibilityRole="button"
              accessibilityLabel="Ver o exemplo de novo"
              style={({ pressed }) => [
                styles.replay,
                {
                  minHeight: minTouch,
                  borderRadius: radius.full,
                  backgroundColor: colors.accentContainer,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Feather name="rotate-ccw" size={16} color={colors.accent} />
              <AppText variant="body" weight="bold" color="accent">
                Ver de novo
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function EventRow({ event, animate }: { event: ScoringEvent; animate: boolean }) {
  const { colors, spacing, radius } = useTokens();
  const [enter] = useState(() => new Animated.Value(animate ? 0 : 1));

  useEffect(() => {
    if (!animate) return;
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
  }, [animate, enter]);

  const scout = SCOUTS[event.code];
  const isPositive = scout.points >= 0;
  const translateX = enter.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] });

  return (
    <Animated.View
      style={[
        styles.event,
        {
          gap: spacing.xs,
          padding: spacing.xs,
          borderRadius: radius.sm,
          backgroundColor: colors.surfaceAlt,
          opacity: enter,
          transform: [{ translateX }],
        },
      ]}>
      <View style={[styles.minute, { borderRadius: radius.sm, backgroundColor: colors.surface }]}>
        <AppText variant="label" weight="bold">
          {event.minute}&apos;
        </AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body" weight="medium" numberOfLines={1}>
          {event.label}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {scout.code} · {scout.name}
        </AppText>
      </View>
      <AppText variant="title" weight="bold" color={isPositive ? 'positive' : 'negative'}>
        {isPositive ? '+' : ''}
        {numberToString(scout.points)}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  score: {
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minute: {
    width: 40,
    paddingVertical: 4,
    alignItems: 'center',
  },
  replay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
