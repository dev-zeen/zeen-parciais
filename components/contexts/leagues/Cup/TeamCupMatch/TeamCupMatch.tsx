import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Image, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { CupMatch as CupMatchModel } from '@/models/Leagues';
import { useGetClub } from '@/queries/club.query';

type TeamCupMatchProps = {
  match: CupMatchModel;
  teamId: number;
  isWinner?: boolean;
  hasWinner?: boolean;
};

export function TeamCupMatch({ match, teamId, isWinner, hasWinner }: TeamCupMatchProps) {
  const { data: team, isLoading: isLoadingTeam } = useGetClub(teamId, match.rodada_id);

  if (!match) {
    return <ActivityIndicator />;
  }

  const handlePress = (e: any) => {
    if (team?.time?.time_id) {
      e.stopPropagation();
      router.push(`/leagues/club/${team.time.time_id}`);
    }
  };

  const dimmed = hasWinner && !isWinner;

  return (
    <TouchableOpacity
      activeOpacity={team?.time?.time_id ? 0.7 : 1}
      disabled={!team?.time?.time_id}
      onPress={handlePress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        opacity: dimmed ? 0.35 : 1,
        backgroundColor: 'transparent',
      }}>
      <View style={{ alignItems: 'center', gap: 6, backgroundColor: 'transparent' }}>
        {isWinner && <Feather name="award" size={12} color="#FF8A00" />}

        {isLoadingTeam ? (
          <ActivityIndicator />
        ) : !isLoadingTeam && team ? (
          <>
            <Image
              source={{ uri: team?.time.url_escudo_png }}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
              alt={`Escudo do ${team?.time.nome}`}
            />
            <Text numberOfLines={1} className="text-xs font-semibold text-center">
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
