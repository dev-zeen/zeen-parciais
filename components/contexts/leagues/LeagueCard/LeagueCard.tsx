import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Image, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LeagueUserDetails } from '@/models/Leagues';

interface CardLeagueStatsProps {
  league: LeagueUserDetails;
}

export function LeagueCard({ league }: CardLeagueStatsProps) {
  const router = useRouter();

  const typeLeague = {
    A: 'Aberta',
    M: 'Moderada',
    F: 'Fechada',
  };

  const totalClubs = new Intl.NumberFormat('pt-BR').format(league.total_times_liga);

  const onPressHandler = useCallback(() => {
    router.push(`/leagues/${league.slug}`);
  }, [league.slug, router]);

  return (
    <View className="rounded-lg mx-2 px-2">
      <TouchableOpacity activeOpacity={0.6} onPress={onPressHandler}>
        <View className="flex-row py-2 gap-x-2">
          <Image
            source={{
              uri: league.url_flamula_png,
            }}
            className="w-12 h-12 rounded-full"
            alt={`Imagem da Liga ${league.nome}`}
          />

          <View className="flex-1 flex-row items-center justify-between">
            <View className="gap-y-1">
              <View>
                <Text className="text-sm font-bold">{league.nome}</Text>
                <Text className="text-xs font-light">
                  {typeLeague[league.tipo]} | {totalClubs} Cartoleiros
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
