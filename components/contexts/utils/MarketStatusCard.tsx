import { useEffect, useState } from "react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Text, View } from "@/components/Themed";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { useGetMarketStatus } from "@/queries/market";

export function MarketStatusCard() {
  const { data: marketStatus } = useGetMarketStatus();

  const [marketCloseDate, setMarketCloseDate] = useState<string>("");

  useEffect(() => {
    if (marketStatus) {
      const { dia, mes, ano, hora, minuto } = marketStatus.fechamento;
      const date = new Date(ano, mes - 1, dia, hora, minuto);
      const closeMarket = format(date, "EEEE 'ás' HH:mm", {
        locale: ptBR,
      });
      setMarketCloseDate(closeMarket);
    }
  }, [marketStatus]);

  return (
    <View className="flex-1 w-full flex-row items-center justify-between rounded-lg p-3">
      <View className="flex-row justify-center items-center gap-1">
        <View className="relative flex-row items-center h-4 w-4 rounded-full ">
          <View
            className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
              marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO
                ? "bg-green-500"
                : "bg-red-400"
            }`}
          ></View>
        </View>
        <Text className="font-light text-xs">
          {`${
            marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO
              ? "Mercado Aberto"
              : "Mercado Fechado"
          }`}
        </Text>
      </View>
      <View>
        <Text className="italic text-sm font-medium">{`${
          marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO
            ? `até ${marketCloseDate}`
            : `Rodada ${marketStatus?.rodada_atual}`
        } `}</Text>
      </View>
    </View>
  );
}
