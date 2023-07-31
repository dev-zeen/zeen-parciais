import { useEffect, useState } from "react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Text, View } from "@/components/Themed";
import { Loading } from "@/components/structure/Loading";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { useGetMarketStatus } from "@/queries/market.query";

export function MarketStatusCard() {
  const { data: marketStatus } = useGetMarketStatus();

  const MARKET_STATUS_COLOR_NAMED = {
    1: "bg-green-500",
    2: "bg-red-500",
    3: "bg-yellow-500",
    4: "bg-orange-500",
  };

  const MARKET_STATUS_NAMED = {
    1: "ABERTO",
    2: "FECHADO",
    3: "EM ATUALIZAÇÃO",
    4: "EM MANUTENÇÃO",
  };

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

  if (!marketStatus) {
    return <Loading />;
  }

  return (
    <View className="w-full flex-row items-center justify-between rounded-lg p-3">
      <View className="flex-row justify-center items-center gap-1">
        <View className="relative flex-row items-center h-4 w-4 rounded-full ">
          <View
            className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
              MARKET_STATUS_COLOR_NAMED[marketStatus.status_mercado]
            }`}
          ></View>
        </View>
        <Text className="font-light text-xs">
          {`${MARKET_STATUS_NAMED[marketStatus.status_mercado]}`}
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
