import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { LineChart } from '@/components/charts/LineChart';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePartialScore from '@/hooks/usePartialScore';
import { numberToString } from '@/utils/parseTo';

export function StatsOverviewCard() {
  const colorTheme = useColorScheme();
  const { myClub, historyClub } = useMyClub();
  const { isMarketClose } = useMarketStatus();

  const {
    totalPartialValorization,
    partialValorization,
    partialScore,
  } = usePartialScore({
    teamId: myClub?.time.time_id as number,
  });

  const stats = useMemo(() => {
    if (!myClub) return null;

    return [
      {
        label: 'Patrimônio',
        value: isMarketClose ? totalPartialValorization : (myClub.patrimonio ?? 0),
        variation: isMarketClose ? (partialValorization ?? 0) : (myClub.variacao_patrimonio ?? 0),
        icon: 'dollar-sign' as const,
        color: '#3B82F6',
      },
      {
        label: 'Rodada',
        value: myClub.pontos ?? 0,
        variation: myClub.variacao_pontos ?? 0,
        icon: 'zap' as const,
        color: '#22C55E',
      },
      {
        label: isMarketClose ? 'Parcial' : 'Campeonato',
        value: isMarketClose ? (partialScore ?? 0) : (myClub.pontos_campeonato ?? 0),
        variation: 0,
        icon: 'award' as const,
        color: '#F59E0B',
      },
    ];
  }, [myClub, isMarketClose, totalPartialValorization, partialValorization, partialScore]);

  if (!stats) return null;

  return (
    <AnimatedCard delay={300} variant="flat">
      <View style={{ gap: 12, backgroundColor: 'transparent' }}>
        {/* Stats Grid */}
        <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
          {stats.map((stat, index) => (
            <View 
              key={index}
              className="flex-1 rounded-xl p-3"
              style={{ backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6' }}>
              <View className="flex-row items-center justify-between mb-2" style={{ backgroundColor: 'transparent' }}>
                <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                  {stat.label}
                </Text>
                <View 
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}>
                  <Feather name={stat.icon} size={12} color={stat.color} />
                </View>
              </View>
              
              <Text className="font-bold text-lg mb-1" numberOfLines={1}>
                {numberToString(stat.value)}
              </Text>
              
              {stat.variation !== 0 && (
                <View className="flex-row items-center" style={{ gap: 2, backgroundColor: 'transparent' }}>
                  <Feather
                    name={stat.variation >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={10}
                    color={stat.variation >= 0 ? '#22C55E' : '#EF4444'}
                  />
                  <Text
                    className={`text-xs font-semibold ${
                      stat.variation >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {numberToString(Math.abs(stat.variation))}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Chart */}
        {historyClub && historyClub.length > 0 && (
          <View style={{ backgroundColor: 'transparent' }}>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Evolução (últimas 5 rodadas)
            </Text>
            <LineChart
              data={historyClub.slice(-5).map((h) => h.pontos ?? 0)}
              labels={historyClub.slice(-5).map((h) => `R${h.rodada_id}`)}
              height={70}
              showGrid={false}
            />
          </View>
        )}
      </View>
    </AnimatedCard>
  );
}
