import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';

import { Text, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import useMarketStatus from '@/hooks/useMarketStatus';

export function MarketStatusCard() {
  const { marketStatus } = useMarketStatus();

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

  const [marketClosingDate, setMarketClosingDate] = useState<string>('');

  useEffect(() => {
    if (marketStatus) {
      const { dia, mes, ano, hora, minuto } = marketStatus.fechamento;
      const date = new Date(ano, mes - 1, dia, hora, minuto);
      const closeMarket = format(date, "EEEE 'ás' HH:mm", {
        locale: ptBR,
      });
      setMarketClosingDate(closeMarket);
    }
  }, [marketStatus]);

  if (!marketStatus) {
    return <Loading />;
  }

  return (
    <View className="w-full flex-row items-center justify-between rounded-lg p-4">
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
          : `Rodada ${marketStatus?.rodada_atual}`
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
  );
}
