import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';

import { Text, View } from '@/components/Themed';
import { BarChart } from '@/components/charts/BarChart';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PlayerHistoryStats } from '@/models/Player';
import { numberToString } from '@/utils/parseTo';

type PlayerStatsViewProps = {
  stats: PlayerHistoryStats | undefined;
  isLoading: boolean;
};

export function PlayerStatsView({ stats, isLoading }: PlayerStatsViewProps) {
  const colorTheme = useThemeColor();

  const processedStats = useMemo(() => {
    if (!stats || stats.length === 0) {
      return {
        bestScore: 0,
        worstScore: 0,
        totalPoints: 0,
        gamesPlayed: 0,
        totalRounds: 0,
        chartData: [],
        chartLabels: [],
        validStats: [],
      };
    }

    const validStats = stats.filter((stat) => stat.pontos !== null);
    const points = validStats.map((stat) => stat.pontos!);

    return {
      bestScore: points.length > 0 ? Math.max(...points) : 0,
      worstScore: points.length > 0 ? Math.min(...points) : 0,
      totalPoints: points.reduce((sum, p) => sum + p, 0),
      gamesPlayed: validStats.length,
      totalRounds: stats.length,
      chartData: points.length > 0 ? points : [0],
      chartLabels: validStats.map((stat) => `R${stat.rodada_id}`),
      validStats: stats,
    };
  }, [stats]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text
          className="text-base"
          style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Carregando estatísticas...
        </Text>
      </View>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Feather
          name="bar-chart-2"
          size={48}
          color={colorTheme === 'dark' ? '#6b7280' : '#9ca3af'}
        />
        <Text
          className="text-base mt-4 text-center"
          style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Nenhuma estatística disponível
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-transparent" style={{ gap: 12 }}>
      {/* Header */}
      <View
        className="items-center justify-center"
        style={{ gap: 4, backgroundColor: 'transparent' }}>
        <Feather name="trending-up" size={24} color="#3b82f6" />
        <Text className="text-lg font-bold">Estatísticas por Rodada</Text>
      </View>

      {/* Summary Cards */}
      <AnimatedCard variant="elevated" className="p-0" delay={0}>
        <View style={{ gap: 8, backgroundColor: 'transparent' }}>
          <View
            className="flex-row items-center pb-2"
            style={{
              gap: 6,
              backgroundColor: 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            }}>
            <Feather name="activity" size={16} color="#3b82f6" />
            <Text className="text-sm font-semibold">Resumo de Desempenho</Text>
          </View>

          <View
            className="flex-row flex-wrap justify-between"
            style={{ gap: 8, backgroundColor: 'transparent' }}>
            <View
              className={`flex-1 min-w-[45%] p-3 rounded-lg ${
                colorTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
              }`}
              style={{
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#166534' : '#86efac',
              }}>
              <View
                className="flex-row items-center justify-between"
                style={{ backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colorTheme === 'dark' ? '#4ade80' : '#16a34a' }}>
                  Melhor
                </Text>
                <Feather
                  name="arrow-up"
                  size={14}
                  color={colorTheme === 'dark' ? '#4ade80' : '#16a34a'}
                />
              </View>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: colorTheme === 'dark' ? '#22c55e' : '#15803d' }}>
                {numberToString(processedStats.bestScore)}
              </Text>
            </View>

            <View
              className={`flex-1 min-w-[45%] p-3 rounded-lg ${
                colorTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'
              }`}
              style={{
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#991b1b' : '#fca5a5',
              }}>
              <View
                className="flex-row items-center justify-between"
                style={{ backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colorTheme === 'dark' ? '#f87171' : '#dc2626' }}>
                  Pior
                </Text>
                <Feather
                  name="arrow-down"
                  size={14}
                  color={colorTheme === 'dark' ? '#f87171' : '#dc2626'}
                />
              </View>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: colorTheme === 'dark' ? '#ef4444' : '#b91c1c' }}>
                {numberToString(processedStats.worstScore)}
              </Text>
            </View>

            <View
              className={`flex-1 min-w-[45%] p-3 rounded-lg ${
                colorTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}
              style={{
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#1e3a8a' : '#93c5fd',
              }}>
              <View
                className="flex-row items-center justify-between"
                style={{ backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colorTheme === 'dark' ? '#60a5fa' : '#2563eb' }}>
                  Total
                </Text>
                <Feather
                  name="award"
                  size={14}
                  color={colorTheme === 'dark' ? '#60a5fa' : '#2563eb'}
                />
              </View>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: colorTheme === 'dark' ? '#3b82f6' : '#1d4ed8' }}>
                {numberToString(processedStats.totalPoints)}
              </Text>
            </View>

            <View
              className={`flex-1 min-w-[45%] p-3 rounded-lg ${
                colorTheme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
              }`}
              style={{
                borderWidth: 1,
                borderColor: colorTheme === 'dark' ? '#581c87' : '#d8b4fe',
              }}>
              <View
                className="flex-row items-center justify-between"
                style={{ backgroundColor: 'transparent' }}>
                <Text
                  className="text-xs font-medium"
                  style={{ color: colorTheme === 'dark' ? '#c084fc' : '#9333ea' }}>
                  Jogos
                </Text>
                <Feather
                  name="check-circle"
                  size={14}
                  color={colorTheme === 'dark' ? '#c084fc' : '#9333ea'}
                />
              </View>
              <Text
                className="text-xl font-bold mt-1"
                style={{ color: colorTheme === 'dark' ? '#a855f7' : '#7e22ce' }}>
                {processedStats.gamesPlayed}/{processedStats.totalRounds}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedCard>

      {/* Chart */}
      {processedStats.chartData.length > 0 && (
        <AnimatedCard variant="elevated" className="p-0" delay={100}>
          <View style={{ gap: 8, backgroundColor: 'transparent' }}>
            <View
              className="flex-row items-center"
              style={{ gap: 6, backgroundColor: 'transparent' }}>
              <Feather name="bar-chart-2" size={16} color="#3b82f6" />
              <Text className="text-sm font-semibold">Pontos por Rodada</Text>
            </View>
            <BarChart
              data={processedStats.chartData}
              labels={processedStats.chartLabels}
              height={140}
            />
          </View>
        </AnimatedCard>
      )}

      {/* Detailed Rounds List */}
      <AnimatedCard variant="elevated" className="p-0" delay={200}>
        <View style={{ gap: 10, backgroundColor: 'transparent' }}>
          <View
            className="flex-row items-center"
            style={{ gap: 6, backgroundColor: 'transparent' }}>
            <Feather name="list" size={16} color="#3b82f6" />
            <Text className="text-sm font-semibold">Rodadas Detalhadas</Text>
          </View>

          <View style={{ gap: 8, backgroundColor: 'transparent' }}>
            {processedStats.validStats.map((stat, index) => {
              const hasData = stat.pontos !== null;
              const isPositive = hasData && stat.pontos! > 0;
              const isNegative = hasData && stat.pontos! < 0;

              return (
                <View
                  key={`round-${stat.rodada_id}`}
                  className={`flex-row items-center justify-between p-3 rounded-lg ${
                    colorTheme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor: colorTheme === 'dark' ? '#4b5563' : '#e5e7eb',
                  }}>
                  <View
                    className="flex-row items-center"
                    style={{ gap: 10, backgroundColor: 'transparent' }}>
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        hasData
                          ? isPositive
                            ? 'bg-green-500/20'
                            : isNegative
                              ? 'bg-red-500/20'
                              : 'bg-gray-500/20'
                          : 'bg-gray-500/20'
                      }`}>
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: hasData
                            ? isPositive
                              ? colorTheme === 'dark'
                                ? '#4ade80'
                                : '#16a34a'
                              : isNegative
                                ? colorTheme === 'dark'
                                  ? '#f87171'
                                  : '#dc2626'
                                : colorTheme === 'dark'
                                  ? '#9ca3af'
                                  : '#6b7280'
                            : colorTheme === 'dark'
                              ? '#6b7280'
                              : '#9ca3af',
                        }}>
                        R{stat.rodada_id}
                      </Text>
                    </View>

                    <View style={{ backgroundColor: 'transparent' }}>
                      <Text
                        className="text-xs font-medium"
                        style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                        Pontuação
                      </Text>
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: hasData
                            ? isPositive
                              ? colorTheme === 'dark'
                                ? '#4ade80'
                                : '#16a34a'
                              : isNegative
                                ? colorTheme === 'dark'
                                  ? '#f87171'
                                  : '#dc2626'
                                : colorTheme === 'dark'
                                  ? '#d1d5db'
                                  : '#374151'
                            : colorTheme === 'dark'
                              ? '#6b7280'
                              : '#9ca3af',
                        }}>
                        {hasData ? `${numberToString(stat.pontos!)} pts` : '—'}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end" style={{ backgroundColor: 'transparent' }}>
                    <Text
                      className="text-xs font-medium"
                      style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      Preço
                    </Text>
                    <Text
                      className="text-sm font-bold"
                      style={{ color: colorTheme === 'dark' ? '#d1d5db' : '#374151' }}>
                      {hasData && stat.preco ? `C$ ${numberToString(stat.preco)}` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </AnimatedCard>
    </View>
  );
}
