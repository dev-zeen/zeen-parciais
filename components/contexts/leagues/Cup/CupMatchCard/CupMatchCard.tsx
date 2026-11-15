import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { CUP_STAGE_LABEL, formatPoints } from '@/components/contexts/leagues/leagueKinds';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { useTokens } from '@/hooks/useTokens';
import { CupMatch, TeamLeague } from '@/models/Leagues';
import { useGetClub } from '@/queries/club.query';

export type CupPartials = Record<number, { partialScore: number; playersPlayed: number }>;

type CupMatchCardProps = {
  match: CupMatch;
  /** Times da liga; evita uma requisição por time */
  teamsById: Map<number, TeamLeague>;
  myTeamId?: number;
  currentRound?: number;
  isMarketClose?: boolean;
  partialsByTeamId?: CupPartials;
  /** Sem slug o card não navega (ex.: já na tela do confronto) */
  leagueSlug?: string;
};

/**
 * Confronto em formato de chave: um time por linha, pontuação à direita, vencedor em
 * destaque e perdedor esmaecido. Rodada atual com bola rolando mostra a parcial.
 */
export const CupMatchCard = memo(
  ({
    match,
    teamsById,
    myTeamId,
    currentRound,
    isMarketClose,
    partialsByTeamId,
    leagueSlug,
  }: CupMatchCardProps) => {
    const { colors, spacing, radius } = useTokens();

    const homeId = match.time_mandante_id;
    const awayId = match.time_visitante_id;
    const isTbd = !homeId || !awayId;
    const isCurrent = match.rodada_id === currentRound;
    const isLive = isCurrent && !!isMarketClose && !match.vencedor_id;
    const isPlayed = !!match.vencedor_id || (currentRound ?? 0) > match.rodada_id;
    const showScore = !isTbd && (isPlayed || isLive);
    const isMine = !!myTeamId && (homeId === myTeamId || awayId === myTeamId);

    const scoreOf = (teamId: number, official: number) =>
      isLive && partialsByTeamId?.[teamId] ? partialsByTeamId[teamId].partialScore : official;

    const home = { id: homeId, score: scoreOf(homeId, match.time_mandante_pontuacao) };
    const away = { id: awayId, score: scoreOf(awayId, match.time_visitante_pontuacao) };
    // Vencedor oficial; durante o jogo, quem está na frente.
    const leaderId =
      match.vencedor_id ??
      (isLive && home.score !== away.score
        ? home.score > away.score
          ? homeId
          : awayId
        : undefined);

    const status = isTbd
      ? { label: 'A definir', tone: 'neutral' as const }
      : isLive
        ? { label: 'Ao vivo', tone: 'negative' as const }
        : match.vencedor_id
          ? { label: 'Encerrado', tone: 'neutral' as const }
          : { label: `Rodada ${match.rodada_id}`, tone: 'neutral' as const };

    const canOpen = !!leagueSlug && !isTbd && showScore;

    return (
      <Pressable
        disabled={!canOpen}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/leagues/cup-match',
            params: { slug: leagueSlug ?? '', chaveId: String(match.chave_id) },
          })
        }
        accessibilityRole={canOpen ? 'button' : undefined}
        accessibilityHint={canOpen ? 'Abre as escalações do confronto' : undefined}
        android_ripple={{ color: colors.border }}
        style={({ pressed }) => [
          {
            gap: spacing.xs,
            padding: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: isMine ? colors.accentContainer : colors.surface,
            borderWidth: 1,
            borderColor: isMine ? colors.accentFill : 'transparent',
            overflow: 'hidden',
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <View style={styles.header}>
          <AppText variant="caption" weight="bold" color="textMuted">
            {CUP_STAGE_LABEL[match.tipo_fase]?.toUpperCase()}
            {isMine ? ' · SEU CONFRONTO' : ''}
          </AppText>
          <Badge label={status.label} tone={status.tone} />
        </View>

        {[home, away].map((side) => (
          <TeamLine
            key={`${match.chave_id}-${side.id}`}
            teamId={side.id}
            round={match.rodada_id}
            team={side.id ? teamsById.get(side.id) : undefined}
            score={showScore ? side.score : undefined}
            playersPlayed={isLive ? partialsByTeamId?.[side.id]?.playersPlayed : undefined}
            isWinner={!!leaderId && leaderId === side.id}
            isOfficial={!!match.vencedor_id}
            isLoser={!!match.vencedor_id && match.vencedor_id !== side.id}
            isMine={side.id === myTeamId}
          />
        ))}

        {canOpen ? (
          <View style={[styles.footer]}>
            <AppText variant="caption" color="textMuted">
              Ver escalações
            </AppText>
            <Feather name="chevron-right" size={12} color={colors.textMuted} />
          </View>
        ) : null}
      </Pressable>
    );
  }
);

function TeamLine({
  teamId,
  round,
  team,
  score,
  playersPlayed,
  isWinner,
  isOfficial,
  isLoser,
  isMine,
}: {
  teamId: number;
  round: number;
  team?: TeamLeague;
  score?: number;
  playersPlayed?: number;
  isWinner: boolean;
  /** Resultado final: só então o vencedor ganha o ✓ (ao vivo é só quem está na frente) */
  isOfficial: boolean;
  isLoser: boolean;
  isMine: boolean;
}) {
  const { colors, spacing } = useTokens();
  // Só busca o time se ele não veio na liga (ex.: time que saiu depois do sorteio).
  const { data: fetched } = useGetClub(teamId && !team ? teamId : undefined, round);
  const name = team?.nome ?? fetched?.time?.nome;
  const shield = team?.url_escudo_png ?? fetched?.time?.url_escudo_png;

  if (!teamId) {
    return (
      <View style={[styles.line, { gap: spacing.xs }]}>
        <View style={[styles.shield, { backgroundColor: colors.surfaceAlt }]} />
        <AppText variant="body" color="textMuted">
          A definir
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[styles.line, { gap: spacing.xs, opacity: isLoser ? 0.45 : 1 }]}
      accessible
      accessibilityLabel={`${name ?? 'Time'}${isMine ? ', seu time' : ''}${
        score != null ? `, ${formatPoints(score)} pontos` : ''
      }${isWinner ? (isOfficial ? ', vencedor' : ', na frente') : ''}`}>
      <Image
        source={{ uri: shield }}
        style={[styles.shield, { backgroundColor: colors.surfaceAlt }]}
      />
      <AppText
        variant="body"
        weight={isWinner || isMine ? 'bold' : 'medium'}
        numberOfLines={1}
        style={{ flex: 1 }}>
        {name ?? '...'}
      </AppText>
      {playersPlayed != null ? (
        <AppText variant="caption" color="textMuted">
          {playersPlayed}/12
        </AppText>
      ) : null}
      {score != null ? (
        <AppText variant="title" weight="bold" color={isWinner ? 'positive' : 'text'}>
          {formatPoints(score)}
        </AppText>
      ) : null}
      <View style={styles.check}>
        {isWinner && isOfficial ? (
          <Feather name="check-circle" size={16} color={colors.positive} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  shield: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  check: {
    width: 18,
    alignItems: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
  },
});
