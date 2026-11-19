import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ref, useCallback, useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { CupMatchCard, CupPartials } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { CupTeamsList } from '@/components/contexts/leagues/Cup/CupTeamsList';
import { LeagueSummaryCard, SummaryStat } from '@/components/contexts/leagues/LeagueSummaryCard';
import {
  ShareLeagueCard,
  ShareLeagueCardRef,
  ShareLeagueData,
  ShareTeam,
} from '@/components/contexts/leagues/ShareLeagueCard';
import { CUP_STAGE_LABEL, formatPoints } from '@/components/contexts/leagues/leagueKinds';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useTabBarSpacing } from '@/hooks/useTabBarSpacing';
import { useTokens } from '@/hooks/useTokens';
import { CupMatch, League, TeamLeague } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';
import { useGetAppreciations } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';

type CupProps = {
  league: League;
  /** Botão de compartilhar do cabeçalho da liga */
  shareRef?: Ref<ShareLeagueCardRef>;
};

const formatDay = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : format(date, 'dd/MM', { locale: ptBR });
};

/**
 * Mata-mata: antes do sorteio mostra as vagas; depois, a situação do usuário, as fases
 * em ordem (navegáveis) e os confrontos da fase escolhida, com o do usuário primeiro.
 */
export function Cup({ league: cup, shareRef }: CupProps) {
  const { colors, spacing } = useTokens();
  const tabBarSpacing = useTabBarSpacing();
  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();
  const currentRound = marketStatus?.rodada_atual;

  const { data: myClub } = useGetMyClub(allowRequest);
  const { data: playerStats, refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);
  const { refetch: onRefetchValorizations } = useGetAppreciations(isMarketClose);
  const { clubsByLeague, onRefetchLeague, isRefetchingLeague } = useLeague({
    slug: cup.liga.slug,
  });

  const myTeamId = myClub?.time?.time_id;
  const brackets = cup.chaves_mata_mata;

  const rounds = useMemo(
    () =>
      Object.keys(brackets ?? {})
        .map(Number)
        .sort((a, b) => a - b),
    [brackets]
  );

  const teamsById = useMemo(() => {
    const map = new Map<number, TeamLeague>();
    (cup.times ?? []).forEach((team) => map.set(team.time_id, team));
    return map;
  }, [cup.times]);

  // Parcial ao vivo de cada time (capitão vale 1,5x quando a liga usa capitão).
  const partialsByTeamId = useMemo(() => {
    const result: CupPartials = {};
    if (!isMarketClose || !playerStats?.atletas || !clubsByLeague) return result;
    const useCaptain = !cup.liga.sem_capitao;

    Object.entries(clubsByLeague).forEach(([teamId, data]) => {
      const athletes = data?.atletas ?? [];
      const captain = playerStats.atletas[String(data?.capitao ?? 0)]?.pontuacao ?? 0;
      const points = athletes.reduce(
        (sum, id) => sum + (playerStats.atletas[String(id)]?.pontuacao ?? 0),
        0
      );
      result[Number(teamId)] = {
        partialScore: points + (useCaptain ? captain * 0.5 : 0),
        playersPlayed: athletes.filter((id) => playerStats.atletas[String(id)]).length,
      };
    });
    return result;
  }, [clubsByLeague, cup.liga.sem_capitao, isMarketClose, playerStats]);

  // Fase aberta por padrão: a da rodada atual, ou a última já disputada.
  const defaultRound = useMemo(() => {
    if (!rounds.length) return undefined;
    const reached = rounds.filter((round) => round <= (currentRound ?? 0));
    return reached.length ? reached[reached.length - 1] : rounds[0];
  }, [currentRound, rounds]);
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const round = selectedRound ?? defaultRound;

  const matches = useMemo(() => {
    const list = round != null ? (brackets?.[String(round)] ?? []) : [];
    const involves = (match: CupMatch) =>
      match.time_mandante_id === myTeamId || match.time_visitante_id === myTeamId;
    return [...list].sort((a, b) => Number(involves(b)) - Number(involves(a)));
  }, [brackets, myTeamId, round]);

  const onRefetch = useCallback(() => {
    Promise.allSettled([onRefetchLeague(), onRefetchStats(), onRefetchValorizations()]);
  }, [onRefetchLeague, onRefetchStats, onRefetchValorizations]);

  // Imagem para compartilhar: inscritos antes do sorteio; depois, a fase escolhida.
  const toShareTeam = (id: number): ShareTeam => {
    const team = teamsById.get(id);
    return {
      name: team?.nome ?? 'A definir',
      owner: team?.nome_cartola,
      shieldUrl: team?.url_escudo_png,
    };
  };
  const finalMatch = rounds
    .flatMap((r) => brackets?.[String(r)] ?? [])
    .find((match) => match.tipo_fase === 'F' && !!match.vencedor_id);
  const isLiveRound = !!isMarketClose && round === currentRound;
  const stage = round != null ? brackets?.[String(round)]?.[0]?.tipo_fase : undefined;
  const scoreOf = (match: CupMatch, teamId: number, official: number) => {
    if (isLiveRound) return formatPoints(partialsByTeamId[teamId]?.partialScore ?? 0);
    const played = !!match.vencedor_id || (round ?? 0) < (currentRound ?? 0);
    return played ? formatPoints(official) : undefined;
  };
  const shareData: ShareLeagueData = {
    kind: 'cup',
    name: cup.liga.nome,
    imageUrl: cup.liga.url_trofeu_png,
    totalTeams: cup.liga.total_times_liga,
    champion: finalMatch ? toShareTeam(finalMatch.vencedor_id!) : undefined,
    ...(rounds.length
      ? {
          context: `${stage ? CUP_STAGE_LABEL[stage] : 'Fase'} · rodada ${round}`,
          status: finalMatch
            ? { tone: 'finished', label: 'Encerrado' }
            : isLiveRound
              ? { tone: 'live', label: `Ao vivo · R${round}` }
              : (round ?? 0) > (currentRound ?? 0)
                ? { tone: 'pending', label: `Começa na R${round}` }
                : { tone: 'open', label: `Rodada ${round}` },
          matches: matches.map((match) => ({
            isMine:
              !!myTeamId &&
              (match.time_mandante_id === myTeamId || match.time_visitante_id === myTeamId),
            home: {
              ...toShareTeam(match.time_mandante_id),
              score: scoreOf(match, match.time_mandante_id, match.time_mandante_pontuacao),
              isWinner: match.vencedor_id === match.time_mandante_id,
            },
            away: {
              ...toShareTeam(match.time_visitante_id),
              score: scoreOf(match, match.time_visitante_id, match.time_visitante_pontuacao),
              isWinner: match.vencedor_id === match.time_visitante_id,
            },
          })),
        }
      : {
          context: `Inscrições · ${cup.liga.total_times_liga}/${cup.liga.quantidade_times ?? '?'} times`,
          status: { tone: 'pending', label: 'Aguardando sorteio' },
          table: cup.times?.length
            ? {
                columns: [],
                rows: cup.times.map((team, index) => ({
                  rank: index + 1,
                  name: team.nome,
                  owner: team.nome_cartola,
                  shieldUrl: team.url_escudo_png,
                  values: [],
                  isMine: team.time_id === myTeamId,
                })),
              }
            : undefined,
          emptyMessage: cup.times?.length ? undefined : 'Nenhum time inscrito ainda.',
        }),
  };
  const shareCard = <ShareLeagueCard ref={shareRef} data={shareData} />;

  if (!rounds.length) {
    return (
      <>
        <CupTeamsList
          cup={cup}
          myTeamId={myTeamId}
          isRefetching={isRefetchingLeague}
          onRefetch={onRefetch}
        />
        {shareCard}
      </>
    );
  }

  // Situação do usuário a partir do último confronto dele.
  const myMatches = rounds
    .flatMap((r) => brackets?.[String(r)] ?? [])
    .filter(
      (m) => !!myTeamId && (m.time_mandante_id === myTeamId || m.time_visitante_id === myTeamId)
    );
  const last = myMatches[myMatches.length - 1];
  const opponentId = last
    ? last.time_mandante_id === myTeamId
      ? last.time_visitante_id
      : last.time_mandante_id
    : undefined;
  const opponent = opponentId ? teamsById.get(opponentId) : undefined;

  const situation: SummaryStat = !last
    ? { label: 'Você', value: 'Fora', tone: 'textMuted' }
    : last.vencedor_id && last.vencedor_id !== myTeamId
      ? {
          label: 'Você',
          value: 'Eliminado',
          tone: 'negative',
          hint: `na ${CUP_STAGE_LABEL[last.tipo_fase].toLowerCase()}`,
        }
      : last.vencedor_id === myTeamId && last.tipo_fase === 'F'
        ? { label: 'Você', value: 'Campeão', tone: 'positive' }
        : last.vencedor_id === myTeamId && last.tipo_fase === 'T'
          ? { label: 'Você', value: '3º lugar', tone: 'positive' }
          : last.vencedor_id === myTeamId
            ? { label: 'Você', value: 'Classificado', tone: 'positive', hint: 'próxima fase' }
            : {
                label: 'Você',
                value: 'Em disputa',
                tone: 'accent',
                hint: CUP_STAGE_LABEL[last.tipo_fase].toLowerCase(),
              };

  const currentStage = round != null ? brackets?.[String(round)]?.[0]?.tipo_fase : undefined;
  const stats: SummaryStat[] = [
    { label: 'Fase', value: currentStage ? CUP_STAGE_LABEL[currentStage] : '-' },
    { label: 'Times', value: String(cup.liga.total_times_liga) },
    situation,
  ];

  const start = formatDay(cup.liga.data_inicio);
  const end = formatDay(cup.liga.data_fim);
  const isWaitingMine = !!last && !last.vencedor_id && !!opponent;

  const header = (
    <View style={{ gap: spacing.sm, paddingBottom: spacing.xs }}>
      <LeagueSummaryCard title="Sua campanha" stats={stats}>
        {isWaitingMine ? (
          <View style={[styles.next, { gap: spacing.xs, borderTopColor: colors.border }]}>
            <AppText variant="label" color="textMuted">
              {last!.rodada_id === currentRound ? 'Confronto atual' : `Rodada ${last!.rodada_id}`}
            </AppText>
            <Image source={{ uri: opponent!.url_escudo_png }} style={styles.opponentShield} />
            <AppText variant="label" weight="bold" numberOfLines={1} style={{ flex: 1 }}>
              vs {opponent!.nome}
            </AppText>
          </View>
        ) : null}
        <AppText variant="caption" color="textMuted">
          Rodadas {cup.liga.inicio_rodada}–{cup.liga.fim_rodada ?? '?'}
          {start && end ? ` · ${start} a ${end}` : ''}
        </AppText>
      </LeagueSummaryCard>

      {/* Fases em ordem: funciona como chaveamento navegável em telas pequenas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}>
        {rounds.map((r) => {
          const stage = brackets?.[String(r)]?.[0]?.tipo_fase;
          const done = (brackets?.[String(r)] ?? []).every((m) => !!m.vencedor_id);
          return (
            <Chip
              key={r}
              label={`${stage ? CUP_STAGE_LABEL[stage] : `Rodada ${r}`}${done ? ' ✓' : ''}`}
              accessibilityLabel={`${stage ? CUP_STAGE_LABEL[stage] : ''}, rodada ${r}${
                done ? ', encerrada' : ''
              }`}
              selected={r === round}
              onPress={() => setSelectedRound(r)}
            />
          );
        })}
      </ScrollView>

      <AppText variant="label" weight="bold" color="textMuted" accessibilityRole="header">
        {matches.length} {matches.length === 1 ? 'CONFRONTO' : 'CONFRONTOS'} · RODADA {round}
      </AppText>
    </View>
  );

  return (
    <>
      <FlatList
        data={matches}
        keyExtractor={(item) => `${item.chave_id}`}
        renderItem={({ item }) => (
          <CupMatchCard
            match={item}
            teamsById={teamsById}
            myTeamId={myTeamId}
            currentRound={currentRound}
            isMarketClose={isMarketClose}
            partialsByTeamId={partialsByTeamId}
            leagueSlug={cup.liga.slug}
          />
        )}
        extraData={partialsByTeamId}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.xs,
          paddingBottom: tabBarSpacing.contentBottom,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl onRefresh={onRefetch} refreshing={isRefetchingLeague} />}
      />
      {shareCard}
    </>
  );
}

const styles = StyleSheet.create({
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  opponentShield: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
