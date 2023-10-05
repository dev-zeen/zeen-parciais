import { Link } from 'expo-router';
import { Image, TouchableOpacity } from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { LeagueUserDetails } from '@/models/Leagues';

interface CardLeagueStatsProps {
  league: LeagueUserDetails;
}

export const typeLeague = {
  A: 'Aberta',
  M: 'Moderada',
  F: 'Fechada',
};

export function LeagueCard({ league }: CardLeagueStatsProps) {
  return (
    <View className="mx-2 px-2 rounded-lg">
      <Link
        asChild
        href={
          {
            pathname: '/leagues/league/[id]',
            params: {
              id: league.slug,
            },
          } as never
        }>
        <TouchableOpacity activeOpacity={0.6}>
          <View className="flex-row rounded-lg py-2 gap-x-2 items-center">
            <Image
              source={{
                uri: league.mata_mata ? league.url_trofeu_png : league.url_flamula_png,
              }}
              className="w-12 h-12 rounded-full"
              alt={`Imagem da Liga ${league.nome}`}
            />

            <View className="flex-1 flex-row items-center justify-between">
              <View className="gap-y-1">
                <View>
                  <Text className="text-sm font-bold">{league.nome}</Text>
                  <Text className="text-xs ">
                    {typeLeague[league.tipo]} | {`${league.total_times_liga} Cartoleiros`}
                  </Text>
                </View>
              </View>
            </View>

            {!league.sem_capitao && (
              <Image
                source={captainIcon}
                style={{
                  width: 20,
                  height: 20,
                  margin: 4,
                }}
                alt="Liga com Capitão"
              />
            )}
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
