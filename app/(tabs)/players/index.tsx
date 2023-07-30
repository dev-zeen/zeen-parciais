import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  TextInput,
  useColorScheme,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { onGetPlayersPlayedMatch } from "@/app/(tabs)/players/players.helper";
import { Text, View } from "@/components/Themed";
import { PlayerCard } from "@/components/contexts/players/PlayerCard/PlayerCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import Colors from "@/constants/Colors";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { Player, PlayersStats } from "@/models/Stats";
import { useGetMarketStatus } from "@/queries/market";
import { useGetAppreciations } from "@/queries/players";
import { useGetScoredPlayers } from "@/queries/stats";
import { GRAY_OPACITY } from "@/styles/colors";

export default () => {
  const colorTheme = useColorScheme();

  const {
    data: playersStats,
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchPlayersStats,
  } = useGetScoredPlayers();

  const { data: marketStatus, isLoading: IsLoadingMarketStatus } =
    useGetMarketStatus();

  const { data: appreciations, isLoading: isLoadingAppreciations } =
    useGetAppreciations();

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

  useEffect(() => {
    if (playersStats) {
      const playersPlayedMatch = onGetPlayersPlayedMatch(playersStats);
      setFilteredDataSource(playersPlayedMatch);
    }
  }, [playersStats]);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<Player>) => {
      return (
        <PlayerCard
          player={player}
          club={playersStats?.clubes[String(player.clube_id)]}
          position={playersStats?.posicoes[player.posicao_id]}
          appreciation={appreciations?.atletas?.[player.id].variacao_num}
        />
      );
    },
    []
  );

  if (marketStatus?.status_mercado === MARKET_STATUS_NAME.ABERTO) {
    return (
      <View className="flex-row p-4 items-center rounded-lg justify-center mt-4">
        <Feather
          name="info"
          size={20}
          color={colorTheme === "dark" ? Colors.dark.tint : Colors.light.tint}
        />
        <Text className="text-sm ml-2">
          Os jogadores serão exibidos assim que obtiverem pontuação durante os
          jogos.
        </Text>
      </View>
    );
  }

  if (
    IsLoadingMarketStatus ||
    !marketStatus ||
    !playersStats ||
    isLoadingAppreciations
  ) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className={`flex-1 justify-center rounded-lg p-2`}
        style={{
          gap: 8,
        }}
      >
        <TextInput
          onChangeText={(text) => onSearchFilter(text)}
          value={search}
          placeholder="Buscar Jogador"
          placeholderTextColor={GRAY_OPACITY}
          className="rounded-lg p-3 mx-2 border-2 border-gray-400 bg-white"
        />

        <FlatList
          refreshControl={
            <RefreshControl
              onRefresh={onRefetchPlayersStats}
              refreshing={isRefetchingPlayersStats}
            />
          }
          data={filteredDataSource}
          keyExtractor={(item) => `${item.clube_id + item.apelido}`}
          renderItem={renderItem}
          initialNumToRender={15}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
