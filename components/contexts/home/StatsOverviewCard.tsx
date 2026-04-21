import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';

import { Text, View } from '@/components/Themed';
import { LineChart } from '@/components/charts/LineChart';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePartialScore from '@/hooks/usePartialScore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { numberToString } from '@/utils/parseTo';

export function StatsOverviewCard() {
  const colorTheme = useThemeColor();
  const { myClub, historyClub } = useMyClub();
  const { isMarketClose } = useMarketStatus();

  const { totalPartialValorization, partialValorization, partialScore } = usePartialScore({
    teamId: myClub?.time.time_id as number,
  });

  // Filtra histórico com dados válidos (memoizado para performance)
  const validHistory = useMemo(() => {
    if (!historyClub) return [];
    return historyClub.filter((h) => h.pontos !== null && h.patrimonio !== null);
  }, [historyClub]);

  // Pega últimas rodadas válidas para o gráfico
  const chartData = useMemo(() => {
    // Limita a 5 rodadas para melhor legibilidade e espaço das labels em mobile
    const lastRounds = validHistory.slice(-5);
    return {
      pontos: lastRounds.map((h) => h.pontos ?? 0),
      labels: lastRounds.map((h) => `R${h.rodada_id}`),
      count: lastRounds.length,
    };
  }, [validHistory]);

  const stats = useMemo(() => {
    if (!myClub) return null;

    return [
      {
        label: 'Patrimônio',
        value: isMarketClose ? totalPartialValorization : (myClub.patrimonio ?? 0),
        variation: isMarketClose ? (partialValorization ?? 0) : (myClub.variacao_patrimonio ?? 0),
        icon: 'dollar-sign' as const,
        color: '#0057FF',
      },
      {
        label: 'Rodada',
        value: myClub.pontos ?? 0,
        variation: myClub.variacao_pontos ?? 0,
        icon: 'zap' as const,
        color: '#00E094',
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
      <View style={{ gap: 16, backgroundColor: 'transparent' }}>
        {/* Stats Grid */}
        <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
          {stats.map((stat, index) => (
            <View
              key={index}
              className="flex-1 rounded-xl p-3"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6',
                minHeight: 88,
              }}>
              <View
                className="flex-row items-center justify-between mb-2"
                style={{ backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs font-medium text-gray-500 dark:text-gray-400"
                  numberOfLines={1}>
                  {stat.label}
                </Text>
                <View
                  className="w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}>
                  <Feather name={stat.icon} size={14} color={stat.color} />
                </View>
              </View>

              <Text className="font-bold text-xl mb-1" numberOfLines={1}>
                {numberToString(stat.value)}
              </Text>

              {stat.variation !== 0 && (
                <View
                  className="flex-row items-center"
                  style={{ gap: 3, backgroundColor: 'transparent' }}>
                  <Feather
                    name={stat.variation >= 0 ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={stat.variation >= 0 ? '#00E094' : '#EF4444'}
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

        {/* Chart Section */}
        {chartData.count > 0 && (
          <View style={{ backgroundColor: 'transparent' }}>
            {/* Header com contexto */}
            <View
              className="flex-row items-center justify-between mb-3"
              style={{ backgroundColor: 'transparent' }}>
              <View style={{ backgroundColor: 'transparent' }}>
                <Text className="text-sm font-semibold mb-0.5">Histórico de Pontuação</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {chartData.count === 1
                    ? '1 rodada disputada'
                    : `${chartData.count} rodadas disputadas`}
                </Text>
              </View>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6' }}>
                <Feather
                  name="trending-up"
                  size={16}
                  color={colorTheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                />
              </View>
            </View>

            {/* Gráfico com altura otimizada */}
            <View
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: colorTheme === 'dark' ? '#111827' : '#F9FAFB',
                marginHorizontal: -16,
              }}>
              <LineChart
                data={chartData.pontos}
                labels={chartData.labels}
                height={220}
                showGrid={false}
              />
            </View>
          </View>
        )}
      </View>
    </AnimatedCard>
  );
}
