import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { CupMatchTeamDetails } from '@/components/contexts/leagues/Cup/CupMatchTeamDetails';
import { Loading } from '@/components/structure/Loading';
import { ITab, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePlayerStats from '@/hooks/usePlayerStats';
import useTeam from '@/hooks/useTeam';
import { FullClubInfo } from '@/models/Club';
import { CupMatch } from '@/models/Leagues';
import { PlayerStats } from '@/models/Stats';

export default () => {
  const colorTheme = useColorScheme();

  const { slug, chaveId } = useLocalSearchParams();
  const leagueSlug = typeof slug === 'string' ? slug : '';
  const chaveIdNum = typeof chaveId === 'string' ? Number(chaveId) : NaN;

  const { league } = useLeague({ slug: leagueSlug });
  const { marketStatus, isMarketClose } = useMarketStatus();

  const cupMatch = useMemo(() => {
    if (!league?.chaves_mata_mata || !Number.isFinite(chaveIdNum)) return null;
    const rounds = Object.keys(league.chaves_mata_mata);
    for (const round of rounds) {
      const matches = league.chaves_mata_mata[round] ?? [];
      const found = matches.find((m) => m.chave_id === chaveIdNum);
      if (found) return found;
    }
    return null;
  }, [chaveIdNum, league?.chaves_mata_mata]);

  const { playerStats } = usePlayerStats();

  if (!cupMatch || !leagueSlug || !marketStatus) return <Loading />;

  const { team: homeTeam } = useTeam({
    teamId: cupMatch.time_mandante_id ?? 0,
    round: cupMatch.rodada_id,
  });

  const { team: awayTeam } = useTeam({
    teamId: cupMatch.time_visitante_id ?? 0,
    round: cupMatch.rodada_id,
  });

  const tabs: ITab[] = useMemo(() => {
    if (!homeTeam || !awayTeam || !playerStats) return [];
    return [
      {
        id: 1,
        title: homeTeam.time.nome,
        content: () => <CupMatchTeamDetails match={cupMatch} team={homeTeam} playerStats={playerStats} />,
      },
      {
        id: 2,
        title: awayTeam.time.nome,
        content: () => <CupMatchTeamDetails match={cupMatch} team={awayTeam} playerStats={playerStats} />,
      },
    ];
  }, [awayTeam, cupMatch, homeTeam, playerStats]);

  if (!homeTeam || !awayTeam || !playerStats) return <Loading />;

  return (
    <View
      style={{
        flex: 1,
        gap: 8,
        backgroundColor:
          colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
      }}>
      <View
        className="px-2 rounded-lg"
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === 'dark' ? Colors.dark.backgroundFull : Colors.light.backgroundFull,
        }}>
        <CupMatchCard
          match={cupMatch}
          leagueSlug={leagueSlug}
          currentRound={marketStatus.rodada_atual}
          isMarketClose={isMarketClose}
        />
      </View>

      <Tabs tabs={tabs} />
    </View>
  );
};
