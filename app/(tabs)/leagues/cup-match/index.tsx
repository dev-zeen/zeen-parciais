import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { CupMatchTeamDetails } from '@/components/contexts/leagues/Cup/CupMatchTeamDetails';
import { CUP_STAGE_LABEL } from '@/components/contexts/leagues/leagueKinds';
import { LoadingScreen } from '@/components/structure/LoadingScreen';
import { SafeAreaViewContainer } from '@/components/structure/SafeAreaViewContainer';
import { ScreenHeader } from '@/components/structure/ScreenHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useTeam from '@/hooks/useTeam';
import { useTokens } from '@/hooks/useTokens';
import { TeamLeague } from '@/models/Leagues';
import { useGetMyClub } from '@/queries/club.query';

/** Confronto do mata-mata: placar no topo e a escalação de cada lado em abas. */
export default function CupMatchScreen() {
  const { spacing } = useTokens();
  const { slug, chaveId } = useLocalSearchParams<{ slug: string; chaveId: string }>();
  const leagueSlug = slug ?? '';
  const chave = Number(chaveId);

  const { league } = useLeague({ slug: leagueSlug });
  const { marketStatus, isMarketClose, allowRequest } = useMarketStatus();
  const { data: myClub } = useGetMyClub(allowRequest);
  const { playerStats } = usePlayerStats();

  const cupMatch = useMemo(() => {
    if (!league?.chaves_mata_mata || !Number.isFinite(chave)) return null;
    for (const matches of Object.values(league.chaves_mata_mata)) {
      const found = matches.find((m) => m.chave_id === chave);
      if (found) return found;
    }
    return null;
  }, [chave, league]);

  const teamsById = useMemo(() => {
    const map = new Map<number, TeamLeague>();
    (league?.times ?? []).forEach((team) => map.set(team.time_id, team));
    return map;
  }, [league?.times]);

  const { team: homeTeam } = useTeam({
    teamId: cupMatch?.time_mandante_id ?? 0,
    round: cupMatch?.rodada_id ?? 0,
  });
  const { team: awayTeam } = useTeam({
    teamId: cupMatch?.time_visitante_id ?? 0,
    round: cupMatch?.rodada_id ?? 0,
  });

  const [side, setSide] = useState<'home' | 'away'>('home');

  if (!cupMatch || !marketStatus || !homeTeam || !awayTeam || !playerStats) {
    return <LoadingScreen title="Carregando confronto" />;
  }

  return (
    <SafeAreaViewContainer edges={['top']}>
      <ScreenHeader
        title={CUP_STAGE_LABEL[cupMatch.tipo_fase] ?? 'Confronto'}
        subtitle={[league?.liga.nome, `Rodada ${cupMatch.rodada_id}`].filter(Boolean).join(' · ')}
      />
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xs, gap: spacing.sm }}>
        <CupMatchCard
          match={cupMatch}
          teamsById={teamsById}
          myTeamId={myClub?.time?.time_id}
          currentRound={marketStatus.rodada_atual}
          isMarketClose={isMarketClose}
        />
        <SegmentedControl
          options={[
            { value: 'home', label: homeTeam.time.nome },
            { value: 'away', label: awayTeam.time.nome },
          ]}
          value={side}
          onChange={setSide}
        />
      </View>
      <CupMatchTeamDetails
        key={side}
        match={cupMatch}
        team={side === 'home' ? homeTeam : awayTeam}
        playerStats={playerStats}
      />
    </SafeAreaViewContainer>
  );
}
