import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import useMarketStatus from '@/hooks/useMarketStatus';
import usePartialScore from '@/hooks/usePartialScore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FullClubInfo } from '@/models/Club';
import { numberToString } from '@/utils/parseTo';

type StatsClubCardProps = {
  team: FullClubInfo;
  round?: number;
};

type StatItem = {
  label: string;
  value: number;
  variation?: number;
  icon?: 'dollar-sign' | 'zap' | 'award' | 'users';
  color?: string;
  suffix?: string;
  int?: boolean;
};

export function StatsClubCard({ team, round }: StatsClubCardProps) {
  const colorTheme = useThemeColor();

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

  const stats: StatItem[] = useMemo(() => {
    const isCurrentRound = isMarketClose && round === marketStatus?.rodada_atual;

    if (isCurrentRound) {
      return [
        {
          label: 'Patrimônio',
          value: totalPartialValorization ?? 0,
          variation: partialValorization,
        },
        {
          label: 'Parcial',
          value: partialScore ?? 0,
        },
        {
          label: 'Total',
          value: totalPartialScore ?? 0,
        },
        {
          label: 'Pontuados',
          value: playersHaveAlreadyPlayed || 0,
          suffix: '/12',
          int: true,
        },
      ];
    }

    return [
      {
        label: 'Patrimônio',
        value: team.patrimonio ?? 0,
        icon: 'dollar-sign' as const,
        color: '#0057FF',
      },
      {
        label: 'Rodada',
        value: team.pontos ?? 0,
        icon: 'zap' as const,
        color: '#00E094',
      },
      {
        label: 'Total',
        value: team.pontos_campeonato ?? 0,
        icon: 'award' as const,
        color: '#F59E0B',
      },
    ];
  }, [
    isMarketClose,
    round,
    marketStatus?.rodada_atual,
    totalPartialValorization,
    partialValorization,
    partialScore,
    totalPartialScore,
    playersHaveAlreadyPlayed,
    team.patrimonio,
    team.pontos,
    team.pontos_campeonato,
  ]);

  return (
    <AnimatedCard variant="flat" className="p-0">
      <View className="flex-row" style={{ gap: 8, backgroundColor: 'transparent' }}>
        {stats.map((stat, index) => (
          <View
            key={index}
            className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: colorTheme === 'dark' ? '#1F293730' : '#F3F4F6' }}>
            <View
              className="flex-row items-center justify-between mb-2"
              style={{ backgroundColor: 'transparent' }}>
              <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                {stat.label}
              </Text>
              <View
                className="w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}>
                <Feather name={stat.icon} size={12} color={stat.color} />
              </View>
            </View>

            <Text className="font-bold text-sm mb-1" numberOfLines={1}>
              {stat.int ? Math.round(stat.value) : numberToString(stat.value)}
              {stat.suffix && <Text className="text-sm text-gray-500">{stat.suffix}</Text>}
            </Text>

            {stat.variation !== undefined && stat.variation !== null && stat.variation !== 0 && (
              <View
                className="flex-row items-center"
                style={{ gap: 2, backgroundColor: 'transparent' }}>
                <Feather
                  name={stat.variation >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={10}
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
    </AnimatedCard>
  );
}
