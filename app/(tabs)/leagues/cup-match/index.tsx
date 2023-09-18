import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { View } from '@/components/Themed';
import { CupMatchCard } from '@/components/contexts/leagues/Cup/CupMatchCard';
import { CupMatchTeamDetails } from '@/components/contexts/leagues/Cup/CupMatchTeamDetails';
import { Loading } from '@/components/structure/Loading';
import { ITabs, Tabs } from '@/components/structure/Tabs';
import Colors from '@/constants/Colors';
import useTeam from '@/hooks/useTeam';
import { FullClubInfo } from '@/models/Club';
import { CupMatch } from '@/models/Leagues';

export default () => {
  const colorTheme = useColorScheme();

  const { match } = useLocalSearchParams();

  const cupMatch: CupMatch = useMemo(() => JSON.parse(match as string), [match]);

  const { team: homeTeam } = useTeam({
    teamId: cupMatch.time_mandante_id ?? 0,
    round: cupMatch.rodada_id,
  });

  const { team: awayTeam } = useTeam({
    teamId: cupMatch.time_visitante_id ?? 0,
    round: cupMatch.rodada_id,
  });

  const tabs: ITabs[] = [
    {
      id: 1,
      title: homeTeam?.time.nome as string,
      content: () => {
        return <CupMatchTeamDetails match={cupMatch} team={homeTeam as FullClubInfo} />;
      },
    },
    {
      id: 2,
      title: awayTeam?.time.nome as string,
      content: () => {
        return <CupMatchTeamDetails match={cupMatch} team={awayTeam as FullClubInfo} />;
      },
    },
  ];

  if (!homeTeam || !awayTeam) return <Loading />;

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
        <CupMatchCard match={cupMatch} />
      </View>

      <Tabs tabs={tabs} />
    </View>
  );
};
