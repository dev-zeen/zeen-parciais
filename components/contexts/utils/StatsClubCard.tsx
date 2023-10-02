import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePartialScore from '@/hooks/usePartialScore';
import { FullClubInfo } from '@/models/Club';
import { numberToString } from '@/utils/parseTo';

type StatsClubCardProps = {
  team: FullClubInfo;
  round?: number;
};

export function StatsClubCard({ team, round }: StatsClubCardProps) {
  const colorTheme = useColorScheme();

  const { isMarketClose, marketStatus } = useMarketStatus();

  const {
    totalPartialValorization,
    partialValorization,
    partialScore,
    playersHaveAlreadyPlayed,
    totalPartialScore,
  } = usePartialScore({
    teamId: team.time.time_id,
  });

  return (
    <>
      {isMarketClose && round === marketStatus?.rodada_atual ? (
        <View
          className={`flex-row justify-between items-center gap-2 ${
            colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
          }`}>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <View className="flex-row">
              <Text className="font-semibold text-xs">Patr.</Text>
              <View className="flex-row pl-1 justify-center items-center">
                <Text className="font-semibold text-xs">{numberToString(partialValorization)}</Text>
                <Feather
                  size={12}
                  name={partialValorization && partialValorization < 0 ? 'arrow-down' : 'arrow-up'}
                  color={partialValorization && partialValorization < 0 ? '#ef4444' : '#4ade80'}
                />
              </View>
            </View>

            <Text className="font-semibold text-md text-green-500">
              {numberToString(totalPartialValorization)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <Text className="font-semibold text-xs">Parcial</Text>
            <Text className="font-semibold text-md text-green-500">
              {numberToString(partialScore)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <Text className="font-semibold text-xs">Total</Text>

            <Text className="font-semibold text-md text-green-500">
              {numberToString(totalPartialScore)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <Text className="font-semibold text-xs">Pontuados</Text>

            <Text className="font-semibold text-md text-green-500">
              {`${playersHaveAlreadyPlayed || '0'}/12`}
            </Text>
          </View>
        </View>
      ) : (
        <View
          className={`flex-row justify-between items-center gap-2 ${
            colorTheme === 'dark' ? 'bg-dark' : 'bg-light'
          }`}>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <Text className="font-semibold text-xs">Patrim.</Text>
            <Text className="font-semibold text-md text-blue-500">
              {numberToString(team.patrimonio)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <Text className="font-semibold text-xs">Rodada</Text>
            <Text className="font-semibold text-md text-blue-500">
              {numberToString(team.pontos)}
            </Text>
          </View>
          <View className="flex-1 rounded-lg px-2 py-4 items-center justify-center">
            <Text className="font-semibold text-xs">Total</Text>
            <Text className="font-semibold text-md text-blue-500">
              {numberToString(team.pontos_campeonato)}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}
