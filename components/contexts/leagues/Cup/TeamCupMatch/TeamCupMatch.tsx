import { useCallback } from 'react';
import { Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import { CupMatch as CupMatchModel } from '@/models/Leagues';
import { useGetClub } from '@/queries/club.query';

type TeamCupMatchProps = {
  match: CupMatchModel;
  teamId: number;
};

export function TeamCupMatch({ match, teamId }: TeamCupMatchProps) {
  const { data: team, isInitialLoading: isInitialLoadingTeam } = useGetClub(
    teamId,
    match.rodada_id
  );

  const teamOpacity = useCallback((score?: number, compareScore?: number) => {
    if (score && compareScore) {
      return score > compareScore ? 1 : 0.3;
    }
    return 1;
  }, []);

  if (isInitialLoadingTeam) {
    return <Loading />;
  }

  return (
    <View
      className="justify-center items-center bg-transparent"
      style={{
        width: '30%',
        gap: 4,
        opacity: teamOpacity(match.time_mandante_pontuacao, match.time_visitante_pontuacao),
      }}>
      {team ? (
        <View
          className="items-center"
          style={{
            gap: 8,
          }}>
          <Image
            source={{
              uri: team?.time.url_escudo_png,
            }}
            className="w-10 h-10"
            alt={`Escudo do ${team?.time.nome}`}
          />

          <Text numberOfLines={1} className="text-xs font-semibold">
            {team?.time.nome ?? '-'}
          </Text>
        </View>
      ) : (
        <Text numberOfLines={1} className="text-xs">
          A definir
        </Text>
      )}
    </View>
  );
}
