import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, useColorScheme } from 'react-native';

import { BarChart } from '@/components/charts/BarChart';
import { Text, View } from '@/components/Themed';
import { PlayerHistoryStats } from '@/models/Player';
import { numberToString } from '@/utils/parseTo';

type PlayerStatsViewProps = {
  stats: PlayerHistoryStats | undefined;
  isLoading: boolean;
};

export function PlayerStatsView({ stats, isLoading }: PlayerStatsViewProps) {
  const colorTheme = useColorScheme();

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
        <Text className="text-base text-gray-500">Carregando estatísticas...</Text>
      </View>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Feather name="bar-chart-2" size={48} color="#9ca3af" />
        <Text className="text-base text-gray-500 mt-4 text-center">
          Nenhuma estatística disponível
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ gap: 10 }}>
      {/* Header */}
      <View className="items-center justify-center" style={{ gap: 2 }}>
        <Feather name="trending-up" size={20} color="#3b82f6" />
        <Text className="text-base font-bold">Estatísticas por Rodada</Text>
      </View>

        {/* Summary Cards */}
        <View
          className="flex-row flex-wrap justify-between"
          style={{ gap: 6 }}>
          <View
            className={`flex-1 min-w-[45%] p-2.5 rounded-lg ${
              colorTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
            }`}
            style={{
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#166534' : '#86efac',
            }}>
            <View
              className="flex-row items-center justify-between"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-xs font-medium text-green-600">Melhor</Text>
              <Feather name="arrow-up" size={14} color="#16a34a" />
            </View>
            <Text className="text-xl font-bold text-green-700 mt-0.5">
              {numberToString(processedStats.bestScore)}
            </Text>
          </View>

          <View
            className={`flex-1 min-w-[45%] p-2.5 rounded-lg ${
              colorTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'
            }`}
            style={{
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#991b1b' : '#fca5a5',
            }}>
            <View
              className="flex-row items-center justify-between"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-xs font-medium text-red-600">Pior</Text>
              <Feather name="arrow-down" size={14} color="#dc2626" />
            </View>
            <Text className="text-xl font-bold text-red-700 mt-0.5">
              {numberToString(processedStats.worstScore)}
            </Text>
          </View>

          <View
            className={`flex-1 min-w-[45%] p-2.5 rounded-lg ${
              colorTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
            }`}
            style={{
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#1e3a8a' : '#93c5fd',
            }}>
            <View
              className="flex-row items-center justify-between"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-xs font-medium text-blue-600">Total</Text>
              <Feather name="award" size={14} color="#2563eb" />
            </View>
            <Text className="text-xl font-bold text-blue-700 mt-0.5">
              {numberToString(processedStats.totalPoints)}
            </Text>
          </View>

          <View
            className={`flex-1 min-w-[45%] p-2.5 rounded-lg ${
              colorTheme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
            }`}
            style={{
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#581c87' : '#d8b4fe',
            }}>
            <View
              className="flex-row items-center justify-between"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-xs font-medium text-purple-600">Jogos</Text>
              <Feather name="check-circle" size={14} color="#9333ea" />
            </View>
            <Text className="text-xl font-bold text-purple-700 mt-0.5">
              {processedStats.gamesPlayed}/{processedStats.totalRounds}
            </Text>
          </View>
        </View>

        {/* Chart */}
        {processedStats.chartData.length > 0 && (
          <View
            className={`p-3 rounded-lg ${
              colorTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              borderWidth: 1,
              borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
            }}>
            <View
              className="flex-row items-center mb-1"
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
        )}

        {/* Detailed Rounds List */}
        <View
          className={`p-3 rounded-lg ${
            colorTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            borderWidth: 1,
            borderColor: colorTheme === 'dark' ? '#374151' : '#e5e7eb',
          }}>
          <View
            className="flex-row items-center mb-2"
            style={{ gap: 6, backgroundColor: 'transparent' }}>
            <Feather name="list" size={16} color="#3b82f6" />
            <Text className="text-sm font-semibold">Rodadas Detalhadas</Text>
          </View>

          <View style={{ gap: 6, backgroundColor: 'transparent' }}>
            {processedStats.validStats.map((stat, index) => {
              const hasData = stat.pontos !== null;
              const isPositive = hasData && stat.pontos! > 0;
              const isNegative = hasData && stat.pontos! < 0;

              return (
                <View
                  key={`round-${stat.rodada_id}`}
                  className={`flex-row items-center justify-between p-2 rounded-lg ${
                    colorTheme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                  style={{
                    borderWidth: 1,
                    borderColor: colorTheme === 'dark' ? '#4b5563' : '#e5e7eb',
                    backgroundColor: 'transparent',
                  }}>
                  <View
                    className="flex-row items-center"
                    style={{ gap: 8, backgroundColor: 'transparent' }}>
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        hasData
                          ? isPositive
                            ? 'bg-green-500/20'
                            : isNegative
                            ? 'bg-red-500/20'
                            : 'bg-gray-500/20'
                          : 'bg-gray-500/20'
                      }`}>
                      <Text
                        className={`text-xs font-bold ${
                          hasData
                            ? isPositive
                              ? 'text-green-600'
                              : isNegative
                              ? 'text-red-600'
                              : 'text-gray-600'
                            : 'text-gray-500'
                        }`}>
                        R{stat.rodada_id}
                      </Text>
                    </View>

                    <View style={{ backgroundColor: 'transparent' }}>
                      <Text className="text-xs text-gray-500 font-medium">Pontuação</Text>
                      <Text
                        className={`text-sm font-bold ${
                          hasData
                            ? isPositive
                              ? 'text-green-600'
                              : isNegative
                              ? 'text-red-600'
                              : 'text-gray-700'
                            : 'text-gray-500'
                        }`}>
                        {hasData ? `${numberToString(stat.pontos!)} pts` : '—'}
                      </Text>
                    </View>
                  </View>

                  <View
                    className="items-end"
                    style={{ backgroundColor: 'transparent' }}>
                    <Text className="text-xs text-gray-500 font-medium">Preço</Text>
                    <Text className="text-sm font-bold text-gray-700">
                      {hasData && stat.preco ? `C$ ${numberToString(stat.preco)}` : '—'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
    </View>
  );
}
