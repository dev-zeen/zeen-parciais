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
import { CURRENT_STATS } from "@/constants/Keys";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { Player, PlayerStats } from "@/models/Stats";
import { useGetMarketStatus } from "@/queries/market";
import { useGetAppreciations } from "@/queries/players";
import { useGetScoredPlayers } from "@/queries/stats";
import { GRAY_OPACITY } from "@/styles/colors";
import { onGetFromStorage } from "@/utils/asyncStorage";
import { normalizeQuery } from "@/utils/format";

export default () => {
  const colorTheme = useColorScheme();

  const [currentStats, setCurrentStats] = useState<PlayerStats>();

  const {
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchPlayersStats,
  } = useGetScoredPlayers();

  const { data: marketStatus, isLoading: IsLoadingMarketStatus } =
    useGetMarketStatus();

  const {
    data: appreciations,
    isLoading: isLoadingAppreciations,
    refetch: onRefetchAppreciations,
  } = useGetAppreciations();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState<
    Player[] | undefined
  >();

  useEffect(() => {
    onGetFromStorage<PlayerStats>(CURRENT_STATS).then((res) => {
      if (res) {
        const data = onGetPlayersPlayedMatch(res as PlayerStats);
        setFilteredDataSource(data);
        setCurrentStats(res);
      }
    });
  }, []);

  const onSearchFilter = useCallback(
    async (text: string) => {
      if (text) {
        const newData = onGetPlayersPlayedMatch(
          currentStats as PlayerStats
        )?.filter((item: Player) => {
          const itemData = normalizeQuery(item.apelido);
          const textData = normalizeQuery(text);
          return itemData.indexOf(textData) > -1;
        });
        setFilteredDataSource(newData);
        setSearchQuery(text);
      } else {
        const playersPlayedMatch = onGetPlayersPlayedMatch(
          currentStats as PlayerStats
        );
        setFilteredDataSource(playersPlayedMatch);
        setSearchQuery(text);
      }
    },
    [currentStats]
  );

  const onRefetch = useCallback(async () => {
    await onRefetchAppreciations();
    await onRefetchPlayersStats();
  }, [onRefetchAppreciations, onRefetchPlayersStats]);

  const isRefetching = isRefetchingPlayersStats;

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<Player>) => {
      return (
        <PlayerCard
          player={player}
          club={currentStats?.clubes[String(player.clube_id)]}
          position={currentStats?.posicoes[player.posicao_id]}
          appreciation={appreciations?.atletas?.[player.id].variacao_num}
        />
      );
    },
    [appreciations, currentStats]
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
    isLoadingAppreciations ||
    !appreciations
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
          onChangeText={onSearchFilter}
          value={searchQuery}
          placeholder="Buscar Jogador"
          placeholderTextColor={GRAY_OPACITY}
          className="rounded-lg p-3 mx-2 border-2 border-gray-200 bg-white"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <FlatList
          refreshControl={
            <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
          }
          data={filteredDataSource}
          keyExtractor={(item) => `${item.clube_id + item.apelido}`}
          renderItem={renderItem}
          initialNumToRender={20}
          maxToRenderPerBatch={200}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
