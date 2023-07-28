import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  TextInput,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { CardPlayerStats } from "@/components/contexts/stats/card-player-stats";
import { Loading } from "@/components/structure/loading/loading";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { IPlayersStats, Player, PlayersStats } from "@/models/Stats";
import { useGetMarketStatus } from "@/queries/market";
import { GRAY_OPACITY } from "@/styles/colors";
import { FontAwesome } from "@expo/vector-icons";
import { QueryObserverResult } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListPlayersStatsProps {
  playersStats?: PlayersStats;
  isRefetchingStats: boolean;
  onRefetch: () => Promise<QueryObserverResult>;
}

export function ListPlayersStats({
  playersStats,
  onRefetch,
  isRefetchingStats,
}: ListPlayersStatsProps) {
  const { data: marketStatus, isLoading: IsLoadingMarketStatus } =
    useGetMarketStatus();

  const [marketCloseDate, setMarketCloseDate] = useState<string>("");

  const [search, setSearch] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState<
    Player[] | undefined
  >();

  const onSearchFilter = useCallback(
    (text: string) => {
      if (text) {
        const newData = onGetPlayersPlayedMatch(
          playersStats as PlayersStats
        )?.filter((item: Player) => {
          const itemData = item.apelido
            ? item.apelido.toUpperCase()
            : "".toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        });
        setFilteredDataSource(newData);
        setSearch(text);
      } else {
        const playersPlayedMatch = onGetPlayersPlayedMatch(
          playersStats as PlayersStats
        );
        setFilteredDataSource(playersPlayedMatch);
        setSearch(text);
      }
    },
    [filteredDataSource, setFilteredDataSource, search, setSearch]
  );

  const onGetPlayersPlayedMatch = (playersStats: PlayersStats): Player[] => {
    const allPlayers =
      playersStats &&
      Object.keys(playersStats.atletas).map(
        (item: string) => (playersStats.atletas as IPlayersStats)[item]
      );

    const playersPlayedMatch = allPlayers.sort((a: Player, b: Player) => {
      if (a.pontuacao <= b.pontuacao) return 1;
      return -1;
    });

    return playersPlayedMatch;
  };

  useEffect(() => {
    if (playersStats) {
      const playersPlayedMatch = onGetPlayersPlayedMatch(playersStats);
      setFilteredDataSource(playersPlayedMatch);
    }
  }, [playersStats]);

  useEffect(() => {
    if (marketStatus) {
      const { dia, mes, ano, hora, minuto } = marketStatus.fechamento;

      const date = new Date(ano, mes - 1, dia, hora, minuto);

      const closeMarket = format(date, "cccc 'ás' HH:mm", {
        locale: ptBR,
      });

      setMarketCloseDate(closeMarket);
    }
  }, [marketStatus]);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<Player>) => {
      return (
        <CardPlayerStats
          player={player}
          club={playersStats?.clubes[String(player.clube_id)]}
          position={playersStats?.posicoes[player.posicao_id]}
        />
      );
    },
    []
  );

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO) {
    return (
      <View className="items-center mt-4">
        <View className="flex-row justify-center items-center bg-white rounded-lg mx-2 p-10">
          <Text className="font-medium italic">
            {" "}
            Mercado Aberto até {`${marketCloseDate}`}
          </Text>
        </View>

        <View className="flex-row justify-center items-center bg-white rounded-lg mx-8 mt-1 py-4 px-8">
          <FontAwesome name="info-circle" size={20} />
          <Text className="text-gray-600 text-sm ml-2">
            Os jogadores serão exibidos assim que obtiverem pontuação durante os
            jogos.
          </Text>
        </View>
      </View>
    );
  }

  if (IsLoadingMarketStatus || !marketStatus || !playersStats) {
    return <Loading />;
  }

  return (
    <>
      <TextInput
        onChangeText={(text) => onSearchFilter(text)}
        value={search}
        underlineColorAndroid="transparent"
        placeholder="Buscar Jogador"
        placeholderTextColor={GRAY_OPACITY}
        className="flex-row justify-between items-center bg-white rounded-lg p-3 my-2 mx-2"
      />
      <FlatList
        refreshControl={
          <RefreshControl
            onRefresh={onRefetch}
            refreshing={isRefetchingStats}
          />
        }
        data={filteredDataSource}
        keyExtractor={(item) => `${item.clube_id + item.apelido}`}
        renderItem={renderItem}
      />
    </>
  );
}
