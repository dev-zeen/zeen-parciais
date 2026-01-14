import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { Loading } from '@/components/structure/Loading';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarketStatus from '@/hooks/useMarketStatus';
import { numberToString } from '@/utils/parseTo';

export function MarketStatusCard() {
  const { marketStatus, isBallRolling, currentRoundInfo } = useMarketStatus();
  const colorTheme = useColorScheme();

  const MARKET_STATUS_COLOR_NAMED = {
    1: 'bg-green-500',
    2: '',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
  };

  const MARKET_STATUS_NAMED = {
    1: 'Mercado Aberto',
    2: 'Mercado Fechado',
    3: 'Mercado em Atualização',
    4: 'Mercado em Manutenção',
  };

  const marketClosingDate: string | undefined = useMemo(() => {
    if (marketStatus) {
      const { dia, mes, ano, hora, minuto } = marketStatus.fechamento;
      const date = new Date(ano, mes - 1, dia, hora, minuto);
      return format(date, "EEEE 'ás' HH:mm", {
        locale: ptBR,
      });
    }
  }, [marketStatus]);

  const isFinalRound = useMemo(() => {
    return currentRoundInfo?.numero === currentRoundInfo?.rodadaFinal;
  }, [currentRoundInfo]);

  if (!marketStatus) {
    return <Loading />;
  }

  const getBackgroundColor = () => {
    if (marketStatus.status_mercado === MARKET_STATUS_NAME.ABERTO) {
      return colorTheme === 'dark' ? '#15803d30' : '#dcfce7';
    } else if (marketStatus.status_mercado === MARKET_STATUS_NAME.FECHADO) {
      return colorTheme === 'dark' ? '#b9131330' : '#fee2e2';
    } else {
      return colorTheme === 'dark' ? '#ea580c30' : '#ffedd5';
    }
  };

  return (
    <AnimatedCard delay={100} variant="flat">
      <View
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
      <View className="flex-row items-center justify-between" style={{ backgroundColor: 'transparent' }}>
        {/* Status Indicator */}
        <View className="flex-row items-center" style={{ gap: 8, backgroundColor: 'transparent' }}>
          <View
            className={`rounded-full h-2.5 w-2.5 ${
              MARKET_STATUS_COLOR_NAMED[marketStatus.status_mercado]
            }`}
          />
        
          <Text className="font-semibold text-sm">
            {marketStatus.status_mercado === MARKET_STATUS_NAME.ABERTO
              ? 'Mercado Aberto'
              : marketStatus.status_mercado === MARKET_STATUS_NAME.FECHADO
              ? isBallRolling
                ? 'Bola Rolando'
                : 'Mercado Fechado'
              : MARKET_STATUS_NAMED[marketStatus.status_mercado]}
          </Text>
        </View>

        {/* Time/Round Info */}
        <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          {marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO
            ? marketClosingDate
            : currentRoundInfo?.nome || `Rodada ${marketStatus?.rodada_atual}`}
        </Text>
      </View>

      {/* Additional Info Row */}
      {(isBallRolling || isFinalRound) && (
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'transparent' }}>
          {isBallRolling && (
            <View className="flex-row items-center" style={{ gap: 4, backgroundColor: 'transparent' }}>
              <View className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Atualização em tempo real
              </Text>
            </View>
          )}
          {isFinalRound && (
            <View className="bg-yellow-500 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-black">Rodada Final</Text>
            </View>
          )}
        </View>
      )}
      </View>
    </AnimatedCard>
  );
}
