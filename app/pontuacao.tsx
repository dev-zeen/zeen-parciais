import { Feather } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { BouncingBall } from '@/components/contexts/scoring/BouncingBall';
import { CaptainDemo } from '@/components/contexts/scoring/CaptainDemo';
import { ScoringReplay } from '@/components/contexts/scoring/ScoringReplay';
import { ScoutTable } from '@/components/contexts/scoring/ScoutTable';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { useTokens } from '@/hooks/useTokens';
import { field } from '@/styles/tokens';

const TEAM_RULES: { icon: keyof typeof Feather.glyphMap; title: string; text: string }[] = [
  {
    icon: 'users',
    title: 'Parcial do time',
    text: 'É a soma dos pontos dos titulares que entraram em campo, com o capitão valendo ×1,5.',
  },
  {
    icon: 'user-x',
    title: 'Não entrou em campo',
    text: 'Jogador que não entra em campo não pontua. O reserva da mesma posição entra no lugar dele.',
  },
  {
    icon: 'star',
    title: 'Reserva de luxo',
    text: 'Substitui o titular da posição com a pior nota, se pontuar mais que ele, e só se todos os titulares da posição jogarem.',
  },
  {
    icon: 'file-text',
    title: 'Vale a súmula',
    text: 'Os pontos seguem a súmula da partida e podem ser corrigidos depois do jogo.',
  },
];

export default function ScoringScreen() {
  const { colors, spacing, radius } = useTokens();

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader title="Como funciona a pontuação" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.xs, gap: spacing.xs, paddingBottom: 32 }}>
        {/* Abertura: gramado com a bola quicando */}
        <View style={[styles.hero, { borderRadius: radius.lg }]}>
          <Image
            source={require('@/assets/images/field.png')}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            accessible={false}
          />
          <View
            style={[styles.heroOverlay, { padding: spacing.md, backgroundColor: colors.overlay }]}>
            <BouncingBall />
            <AppText variant="heading" weight="bold" color={field.chipBg} align="center">
              Cada lance vale pontos
            </AppText>
            <AppText variant="body" color={field.chipBg} align="center">
              Gols, assistências, desarmes e defesas somam. Cartões, faltas e gols contra tiram.
            </AppText>
          </View>
        </View>

        <ScoringReplay />
        <CaptainDemo />

        <AppText
          variant="label"
          weight="bold"
          color="textMuted"
          style={{ marginTop: spacing.xs, marginLeft: spacing.xxs }}>
          QUANTO VALE CADA LANCE
        </AppText>
        <ScoutTable />

        <AppText
          variant="label"
          weight="bold"
          color="textMuted"
          style={{ marginTop: spacing.xs, marginLeft: spacing.xxs }}>
          COMO O TIME SOMA
        </AppText>
        {TEAM_RULES.map((rule, index) => (
          <AnimatedCard key={rule.title} delay={200 + index * 100} variant="flat">
            <View style={[styles.rule, { gap: spacing.sm }]}>
              <View
                style={[
                  styles.ruleIcon,
                  { borderRadius: radius.sm, backgroundColor: colors.accentContainer },
                ]}>
                <Feather name={rule.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="body" weight="bold">
                  {rule.title}
                </AppText>
                <AppText variant="label" color="textMuted">
                  {rule.text}
                </AppText>
              </View>
            </View>
          </AnimatedCard>
        ))}

        <AppText
          variant="caption"
          color="textMuted"
          align="center"
          style={{ marginTop: spacing.xs }}>
          Valores da temporada 2026.
        </AppText>
      </ScrollView>
    </SafeAreaViewContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
  },
  heroOverlay: {
    alignItems: 'center',
    gap: 8,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
