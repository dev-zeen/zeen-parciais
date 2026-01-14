import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import useMarketStatus from '@/hooks/useMarketStatus';
import { TopPlayer } from '@/models/Player';
import { useGetTopPlayers, useGetTopReservePlayers } from '@/queries/players.query';
import { numberToString } from '@/utils/parseTo';

export function PlayerHighlightsCarousel() {
  const router = useRouter();
  const colorTheme = useColorScheme();
  const { allowRequest } = useMarketStatus();
  const { data: topPlayers } = useGetTopPlayers(allowRequest);
  const { data: topReservePlayers } = useGetTopReservePlayers(allowRequest);
  const [selectedTab, setSelectedTab] = useState<'titulares' | 'reservas'>('titulares');

  if ((!topPlayers || topPlayers.length === 0) && (!topReservePlayers || topReservePlayers.length === 0)) {
    return null;
  }

  const handleViewAll = () => {
    router.push('/(tabs)/players');
  };

  const displayPlayers = selectedTab === 'titulares' ? topPlayers : topReservePlayers;

  return (
    <AnimatedCard delay={500} variant="flat">
      <View className="gap-3" style={{ backgroundColor: 'transparent' }}>
        {/* Header */}
        <View className="flex-row items-center justify-between" style={{ backgroundColor: 'transparent' }}>
          <Text className="font-bold text-base">Mais Escalados</Text>
        </View>

        {/* Tabs */}
        <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
          <Pressable onPress={() => setSelectedTab('titulares')} style={{ flex: 1 }}>
            <View
              className={`py-2 rounded-lg ${
                selectedTab === 'titulares'
                  ? colorTheme === 'dark'
                    ? 'bg-blue-500'
                    : 'bg-blue-500'
                  : colorTheme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-gray-200'
              }`}>
              <Text
                className={`text-center text-sm font-semibold ${
                  selectedTab === 'titulares' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                Titulares
              </Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setSelectedTab('reservas')} style={{ flex: 1 }}>
            <View
              className={`py-2 rounded-lg ${
                selectedTab === 'reservas'
                  ? colorTheme === 'dark'
                    ? 'bg-blue-500'
                    : 'bg-blue-500'
                  : colorTheme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-gray-200'
              }`}>
              <Text
                className={`text-center text-sm font-semibold ${
                  selectedTab === 'reservas' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                Reservas
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}>
          {displayPlayers?.slice(0, 5).map((player, index) => (
            <PlayerHighlightCard key={player.Atleta.atleta_id} player={player} index={index} />
          ))}
        </ScrollView>
      </View>
    </AnimatedCard>
  );
}

function PlayerHighlightCard({ player, index }: { player: TopPlayer; index: number }) {
  const colorTheme = useColorScheme();

  return (
    <Pressable>
      <View
        className={`w-32 rounded-xl p-3 ${
          colorTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <View className="items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
          {/* Player Photo */}
          <Image
            source={{ uri: player.Atleta.foto?.replace('FORMATO', '140x140') }}
            className="w-16 h-16 rounded-full"
            alt={player.Atleta.apelido}
          />

          {/* Player Info */}
          <View className="items-center" style={{ gap: 4, backgroundColor: 'transparent' }}>
            <Text className="font-semibold text-xs text-center" numberOfLines={1}>
              {player.Atleta.apelido_abreviado}
            </Text>
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#3B82F620' }}>
              <Text className="text-blue-500 text-xs font-bold">
                {player.posicao_abreviacao.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="w-full items-center pt-1 border-t border-gray-200 dark:border-gray-700" style={{ gap: 4, backgroundColor: 'transparent' }}>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Escalações</Text>
            <Text className="font-bold text-sm">{numberToString(player.escalacoes)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
