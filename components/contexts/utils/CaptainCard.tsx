import { Feather } from '@expo/vector-icons';
import { Image, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import { useGetMarket } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { numberToString } from '@/utils/parseTo';

export function CaptainCard() {
  const colorTheme = useColorScheme();
  const { isMarketClose } = useMarketStatus();
  const { captain } = useMyClub();
  const { data: playerStats } = useGetScoredPlayers(isMarketClose);
  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();

  const getPositionColor = (positionName?: string) => {
    switch (positionName?.toLowerCase()) {
      case 'goleiro':
        return '#F59E0B'; // orange
      case 'lateral':
      case 'zagueiro':
        return '#3B82F6'; // blue
      case 'meia':
        return '#22C55E'; // green
      case 'atacante':
        return '#EF4444'; // red
      default:
        return '#8B5CF6'; // purple
    }
  };

  // Estado vazio - quando não tem capitão
  if (!captain) {
    return (
      <AnimatedCard delay={300} variant="flat" >
        <View style={{ gap: 12, backgroundColor: 'transparent' }}>
          {/* Header */}
          <View className="flex-row items-center justify-between" style={{ backgroundColor: 'transparent' }}>
            <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: colorTheme === 'dark' ? '#F59E0B40' : '#FCD34D30',
                }}>
                <Feather name="alert-circle" size={16} color="#F59E0B" />
              </View>
              <Text className="font-bold text-base">Seu Capitão</Text>
            </View>
            <View
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#FCD34D30' : '#FEF3C7',
              }}>
              <Text className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">
                x1.5
              </Text>
            </View>
          </View>

          {/* Empty State - Aviso */}
          <View
            className="flex-row items-center rounded-lg p-3"
            style={{
              gap: 12,
              backgroundColor: colorTheme === 'dark' ? '#FCD34D20' : '#FEF3C7',
            }}>
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#FCD34D40' : '#FBBF24',
              }}>
              <Feather name="info" size={24} color={colorTheme === 'dark' ? '#FCD34D' : '#FFFFFF'} />
            </View>

            <View className="flex-1" style={{ gap: 2, backgroundColor: 'transparent' }}>
              <Text className="font-semibold text-sm text-yellow-800 dark:text-yellow-300">
                Capitão não definido
              </Text>
              <Text className="text-xs text-yellow-700 dark:text-yellow-400">
                Selecione seu capitão ao escalar seu time
              </Text>
            </View>
          </View>
        </View>
      </AnimatedCard>
    );
  }

  // Estado com capitão selecionado
  const position = positions?.[String(captain.posicao_id)];
  const club =
    market?.clubes?.[String(captain.clube_id)] ?? playerStats?.clubes?.[String(captain.clube_id)];
  const score = playerStats?.atletas?.[String(captain.atleta_id)]?.pontuacao;
  const captainScore = score ? score * 1.5 : 0;

  return (
    <AnimatedCard delay={300} variant="flat">
      <View style={{ gap: 12, backgroundColor: 'transparent' }}>
        {/* Header */}
        <View className="flex-row items-center justify-between" style={{ backgroundColor: 'transparent' }}>
          <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#FCD34D40' : '#FCD34D30',
              }}>
              <Feather name="award" size={16} color="#F59E0B" />
            </View>
            <View style={{ backgroundColor: 'transparent' }}>
              <Text className="font-bold text-base">Seu Capitão</Text>
            </View>
          </View>
          <View
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: colorTheme === 'dark' ? '#FCD34D30' : '#FEF3C7',
            }}>
            <Text className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">
              x1.5
            </Text>
          </View>
        </View>

        {/* Player Info */}
        <View className="flex-row items-center" style={{ gap: 12, backgroundColor: 'transparent' }}>
          {/* Photo with Captain Badge */}
          <View style={{ backgroundColor: 'transparent' }}>
            <Image
              source={{ uri: captain.foto?.replace('FORMATO', '220x220') }}
              className="w-20 h-20 rounded-full"
              style={{
                borderWidth: 3,
                borderColor: '#F59E0B',
              }}
              alt={captain.apelido}
            />
            <View
              className="absolute -bottom-1 -right-1 rounded-full items-center justify-center"
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#F59E0B',
                borderWidth: 2,
                borderColor: colorTheme === 'dark' ? '#1F2937' : '#FFFFFF',
              }}>
              <Text className="text-white text-sm font-bold">C</Text>
            </View>
          </View>

          {/* Details */}
          <View className="flex-1" style={{ gap: 8, backgroundColor: 'transparent' }}>
            <Text className="font-bold" numberOfLines={1}>
              {captain.apelido}
            </Text>
            {!!club?.nome_fantasia && (
              <View
                className="flex-row items-center"
                style={{ gap: 8, backgroundColor: 'transparent' }}>
                {!!club?.escudos?.['30x30'] && (
                  <Image
                    source={{ uri: club.escudos['30x30'] }}
                    style={{ width: 18, height: 18, borderRadius: 9 }}
                    alt={club.nome_fantasia}
                  />
                )}
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400" numberOfLines={1}>
                  {club.nome_fantasia}
                </Text>
              </View>
            )}
            <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
              <View
                className="px-2.5 py-1 rounded-md"
                style={{ backgroundColor: `${getPositionColor(position?.nome)}25` }}>
                <Text
                  className="text-xs font-bold uppercase"
                  style={{ color: getPositionColor(position?.nome) }}>
                  {position?.abreviacao || 'N/A'}
                </Text>
              </View>
              {captain.preco_num && (
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  C$ {numberToString(captain.preco_num)}
                </Text>
              )}
            </View>
            {isMarketClose && score !== undefined && (
              <View className="flex-row items-center" style={{ gap: 6, backgroundColor: 'transparent' }}>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {numberToString(score)} × 1.5 =
                </Text>
                <Text
                  className={`text-base font-bold ${
                    captainScore > 0 ? 'text-green-500' : captainScore < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                  {numberToString(captainScore)} pts
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}
