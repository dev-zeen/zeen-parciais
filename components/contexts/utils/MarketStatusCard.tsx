import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

import { Text, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarketStatus from '@/hooks/useMarketStatus';
import { numberToString } from '@/utils/parseTo';

export function MarketStatusCard() {
  const { marketStatus, isBallRolling, currentRoundInfo } = useMarketStatus();

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

  return (
    <View className="w-full rounded-lg p-4">
      <View className="flex-row items-center justify-between mb-2">
        {marketStatus.status_mercado !== MARKET_STATUS_NAME.FECHADO && (
          <View className="flex-row justify-center items-center gap-1">
            <View
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                MARKET_STATUS_COLOR_NAMED[marketStatus.status_mercado]
              }`}
            />
            <Text className="font-semibold text-xs">
              {`${MARKET_STATUS_NAMED[marketStatus.status_mercado]}`}
            </Text>
          </View>
        )}

        <Text className="text-xs font-semibold">{`${
          marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO
            ? `até ${marketClosingDate}`
            : `${currentRoundInfo?.nome || `Rodada ${marketStatus?.rodada_atual}`}`
        } `}</Text>

        {marketStatus.status_mercado === MARKET_STATUS_NAME.FECHADO && (
          <View className="flex-row justify-center items-center gap-1">
            <View
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${MARKET_STATUS_COLOR_NAMED[1]}`}
            />
            <Text className="text-xs font-semibold">Atualização em tempo real</Text>
          </View>
        )}
      </View>

      {/* Additional info row */}
      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        {isBallRolling && (
          <View className="flex-row items-center gap-1">
            <View className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 animate-pulse" />
            <Text className="text-xs text-gray-600 dark:text-gray-400">Bola rolando</Text>
          </View>
        )}

        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {numberToString(marketStatus.times_escalados)} times escalados
        </Text>

        {isFinalRound && (
          <View className="bg-yellow-500 px-2 py-1 rounded">
            <Text className="text-xs font-semibold text-black">Rodada Final</Text>
          </View>
        )}
      </View>
    </View>
  );
}
