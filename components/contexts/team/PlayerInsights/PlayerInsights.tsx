import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SCOUTS } from '@/constants/Scouts';
import { useTokens } from '@/hooks/useTokens';
import type { PlayerInsight } from '@/utils/insights';
import { numberToString } from '@/utils/parseTo';

type PlayerInsightsProps = {
  insight: PlayerInsight;
  /** Escudo e nome do clube do jogador, para o bloco de confronto */
  clubName?: string;
};

const FORM_LABEL = { v: 'V', e: 'E', d: 'D' } as const;
const FORM_NAME = { v: 'vitória', e: 'empate', d: 'derrota' } as const;
const MAX_SCOUTS = 6;

/** Blocos informativos da ficha: confronto, casa x fora, minutos e scouts por jogo. */
export function PlayerInsights({ insight, clubName }: PlayerInsightsProps) {
  const { colors, spacing } = useTokens();
  const { match } = insight;

  const formColors = {
    v: { bg: colors.positiveContainer, text: 'positive' },
    e: { bg: colors.surfaceAlt, text: 'textMuted' },
    d: { bg: colors.negativeContainer, text: 'negative' },
  } as const;

  const renderForm = (form: ('v' | 'e' | 'd')[], label: string) => (
    <View
      accessible
      accessibilityLabel={`${label}: ${
        form.length ? form.map((item) => FORM_NAME[item]).join(', ') : 'sem jogos recentes'
      }`}
      style={styles.formRow}>
      {form.map((item, index) => (
        <View key={`${item}-${index}`} style={[styles.formDot, { backgroundColor: formColors[item].bg }]}>
          <AppText variant="caption" weight="bold" color={formColors[item].text}>
            {FORM_LABEL[item]}
          </AppText>
        </View>
      ))}
    </View>
  );

  const venueValue = (value: number | null) => (value != null ? numberToString(value) : '-');

  return (
    <View style={{ gap: spacing.xs }}>
      {/* Confronto */}
      <Card tone="alt" style={{ gap: spacing.xs }}>
        <AppText variant="label" weight="bold" color="textMuted">
          CONFRONTO DA RODADA
        </AppText>
        {match ? (
          <>
            <View style={styles.matchRow}>
              {match.opponent?.escudos?.['60x60'] ? (
                <Image
                  source={{ uri: match.opponent.escudos['60x60'] }}
                  style={styles.shield}
                  accessible={false}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight="bold" numberOfLines={1}>
                  {match.isHome ? 'Em casa' : 'Fora'} contra {match.opponent?.nome ?? 'adversário'}
                </AppText>
                <AppText variant="label" color="textMuted" numberOfLines={1}>
                  {formatMatchDate(match.match.timestamp)}
                  {match.opponentRank ? ` · adversário em ${match.opponentRank}º` : ''}
                </AppText>
              </View>
            </View>
            <View style={styles.formsRow}>
              <View style={styles.formBlock}>
                <AppText variant="caption" color="textMuted" numberOfLines={1}>
                  {clubName ?? 'Seu time'}
                </AppText>
                {renderForm(match.teamForm, `Últimos jogos de ${clubName ?? 'seu time'}`)}
              </View>
              <View style={styles.formBlock}>
                <AppText variant="caption" color="textMuted" numberOfLines={1}>
                  {match.opponent?.nome ?? 'Adversário'}
                </AppText>
                {renderForm(
                  match.opponentForm,
                  `Últimos jogos de ${match.opponent?.nome ?? 'adversário'}`
                )}
              </View>
            </View>
          </>
        ) : (
          <AppText variant="body" color="textMuted">
            O clube não joga nesta rodada.
          </AppText>
        )}
      </Card>

      {insight.hasGatoMestre ? (
        <>
          {/* Casa x Fora */}
          <Card tone="alt" style={{ gap: spacing.xs }}>
            <AppText variant="label" weight="bold" color="textMuted">
              MÉDIA DE PONTOS
            </AppText>
            <View style={styles.venueRow}>
              {(
                [
                  { key: 'home', label: 'Em casa', value: insight.avgHome, active: match?.isHome === true },
                  { key: 'away', label: 'Fora', value: insight.avgAway, active: match?.isHome === false },
                ] as const
              ).map((venue) => (
                <View
                  key={venue.key}
                  accessible
                  accessibilityLabel={`Média ${venue.label.toLowerCase()}: ${venueValue(venue.value)}${
                    venue.active ? ', mando desta rodada' : ''
                  }`}
                  style={[
                    styles.venue,
                    {
                      backgroundColor: venue.active ? colors.accentContainer : colors.surface,
                      borderColor: venue.active ? colors.accent : colors.border,
                    },
                  ]}>
                  <AppText variant="label" color="textMuted">
                    {venue.label}
                    {venue.active ? ' · esta rodada' : ''}
                  </AppText>
                  <AppText variant="heading" weight="bold" color={venue.active ? 'accent' : 'text'}>
                    {venueValue(venue.value)}
                  </AppText>
                </View>
              ))}
            </View>
            {insight.avgMinutes != null ? (
              <AppText variant="label" color="textMuted">
                Joga em média {Math.round(insight.avgMinutes)} minutos por partida
              </AppText>
            ) : null}
          </Card>

          {/* Scouts por jogo */}
          {insight.scoutsPerGame.length > 0 ? (
            <Card tone="alt" style={{ gap: spacing.xs }}>
              <AppText variant="label" weight="bold" color="textMuted">
                SCOUTS POR JOGO
              </AppText>
              <View style={styles.scouts}>
                {insight.scoutsPerGame.slice(0, MAX_SCOUTS).map((scout) => {
                  const info = (SCOUTS as Record<string, { name: string; points: number }>)[scout.code];
                  const isPositive = (info?.points ?? 0) >= 0;
                  return (
                    <View key={scout.code} style={styles.scout}>
                      <AppText variant="body" numberOfLines={1} style={{ flex: 1 }}>
                        {info?.name ?? scout.code}
                      </AppText>
                      <AppText variant="body" weight="bold" color={isPositive ? 'positive' : 'negative'}>
                        {numberToString(scout.value)}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}
        </>
      ) : (
        <Card tone="alt">
          <AppText variant="body" color="textMuted">
            Médias em casa e fora indisponíveis no momento.
          </AppText>
        </Card>
      )}
    </View>
  );
}

function formatMatchDate(timestampSeconds?: number) {
  if (!timestampSeconds) return 'Data a definir';
  return format(new Date(timestampSeconds * 1000), "EEE, dd/MM 'às' HH:mm", { locale: ptBR });
}

const styles = StyleSheet.create({
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shield: {
    width: 36,
    height: 36,
  },
  formsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formBlock: {
    flex: 1,
    gap: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 4,
    minHeight: 22,
  },
  formDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueRow: {
    flexDirection: 'row',
    gap: 8,
  },
  venue: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  scouts: {
    gap: 6,
  },
  scout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
