import { router } from 'expo-router';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { CupMatch as CupMatchModel } from '@/models/Leagues';
import { useGetClub } from '@/queries/club.query';

type TeamCupMatchProps = {
  match: CupMatchModel;
  teamId: number;
  opacity: number;
};

export function TeamCupMatch({ match, teamId, opacity }: TeamCupMatchProps) {
  const { data: team, isInitialLoading: isInitialLoadingTeam } = useGetClub(
    teamId,
    match.rodada_id
  );

  if (!match) {
    return <ActivityIndicator />;
  }

  const handlePress = (e: any) => {
    if (team?.time?.time_id) {
      e.stopPropagation();
      router.push(`/leagues/club/${team.time.time_id}`);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={team?.time?.time_id ? 0.7 : 1}
      disabled={!team?.time?.time_id}
      onPress={handlePress}
      className="justify-center items-center bg-transparent"
      style={{
        width: '30%',
        gap: 4,
        opacity: team && match.vencedor_id ? opacity : 1,
      }}>
      <View
        className="items-center"
        style={{
          gap: 8,
        }}>
        {isInitialLoadingTeam ? (
          <ActivityIndicator />
        ) : !isInitialLoadingTeam && team ? (
          <>
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
          </>
        ) : (
          <Text numberOfLines={1} className="text-xs">
            N/D
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
