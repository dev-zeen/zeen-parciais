import { router } from 'expo-router';
import {  Image } from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LeagueUserDetails } from '@/models/Leagues';

interface CardLeagueStatsProps {
  league: LeagueUserDetails;
  myTeamId?: number;
}

export const typeLeague = {
  A: 'Aberta',
  M: 'Moderada',
  F: 'Fechada',
};

export function LeagueCard({ league, myTeamId }: CardLeagueStatsProps) {
  const colorTheme = useThemeColor();

  const privacyLabel = typeLeague[league.tipo];
  const participantsInfo = league.mata_mata && league.quantidade_times
    ? `${league.total_times_liga} / ${league.quantidade_times} times`
    : `${league.total_times_liga} ${league.total_times_liga === 1 ? 'time' : 'times'}`;
  
  const meta = `${privacyLabel} · ${participantsInfo}`;

  const isOwner = !!myTeamId && league.time_dono_id === myTeamId;

  return (
    <AnimatedCard
      variant="flat"
      className="p-0"
      onPress={() => router.push(`/leagues/league/${league.slug}`)}>
      <View
        className="flex-row items-center"
        style={{ gap: 12, backgroundColor: 'transparent' }}>
        <Image
          source={{
            uri: league.mata_mata ? league.url_trofeu_png : league.url_flamula_png,
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colorTheme === 'dark' ? '#111827' : '#f3f4f6',
          }}
          alt={`Imagem da Liga ${league.nome}`}
        />

        <View style={{ flex: 1, backgroundColor: 'transparent', gap: 4 }}>
          <Text className="text-base font-bold" numberOfLines={1}>
            {league.nome}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {meta}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: 'transparent', flexWrap: 'wrap' }}>
            {isOwner && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colorTheme === 'dark' ? '#111827' : '#e5e7eb' }}>
                <Text className="text-[11px] font-semibold" style={{ color: '#a855f7' }}>
                  Dono
                </Text>
              </View>
            )}
            {league.mata_mata && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colorTheme === 'dark' ? '#111827' : '#e5e7eb' }}>
                <Text className="text-[11px] font-semibold" style={{ color: '#0057FF' }}>
                  Mata-mata
                </Text>
              </View>
            )}
            {!league.sem_capitao && (
              <View
                className="flex-row items-center px-2 py-1 rounded-full"
                style={{
                  gap: 6,
                  backgroundColor: colorTheme === 'dark' ? '#111827' : '#e5e7eb',
                }}>
                <Image
                  source={captainIcon}
                  style={{ width: 14, height: 14 }}
                  alt="Liga com capitão"
                />
                <Text className="text-[11px] font-semibold" style={{ color: '#f59e0b' }}>
                  Capitão
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}
