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
import { APPRECIATIONS, CURRENT_STATS } from "@/constants/Keys";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { Appreciations } from "@/models/Player";
import { Player, PlayerStats } from "@/models/Stats";
import { useGetMarketStatus } from "@/queries/market.query";
import { useGetAppreciations } from "@/queries/players.query";
import { useGetScoredPlayers } from "@/queries/stats.query";
import { GRAY_OPACITY } from "@/styles/colors";
import { onGetFromStorage } from "@/utils/asyncStorage";
import { normalizeQuery } from "@/utils/format";

export default () => {
  const colorTheme = useColorScheme();

  const [currentStats, setCurrentStats] = useState<PlayerStats>();
  const [currentAppreciations, setCurrentAppreciations] =
    useState<Appreciations>();

  const { data: marketStatus, isLoading: IsLoadingMarketStatus } =
    useGetMarketStatus();

  const allowRequest =
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const {
    isRefetching: isRefetchingPlayersStats,
    refetch: onRefetchPlayersStats,
  } = useGetScoredPlayers();

  const { refetch: onRefetchAppreciations } = useGetAppreciations(allowRequest);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState<
    Player[] | undefined
  >();

  useEffect(() => {
    onGetFromStorage<string>(CURRENT_STATS).then((res) => {
      if (res) {
        const statsFormated = JSON.parse(res);
        const data = onGetPlayersPlayedMatch(statsFormated);
        setFilteredDataSource(data);
        setCurrentStats(statsFormated);
      }
    });
    onGetFromStorage<Appreciations>(APPRECIATIONS).then((res) => {
      if (res) {
        setCurrentAppreciations(res);
      }
    });

    return () => {
      setCurrentAppreciations(undefined);
      setFilteredDataSource(undefined);
      setCurrentStats(undefined);
    };
  }, []);

  const onSearchFilter = useCallback(
    async (text: string) => {
      if (text.length > 2) {
        const newData = onGetPlayersPlayedMatch(
          currentStats as PlayerStats
        )?.filter((item: Player) => {
          const itemData = normalizeQuery(item.apelido);
          const textData = normalizeQuery(text);
          return itemData.includes(textData);
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
          club={(currentStats as PlayerStats)?.clubes[String(player.clube_id)]}
          position={(currentStats as PlayerStats)?.posicoes[player.posicao_id]}
          appreciation={
            (currentAppreciations as Appreciations).atletas?.[player.id]
              .variacao_num
          }
        />
      );
    },
    [currentAppreciations, currentStats]
  );

  if (!currentStats) {
    return (
      <View className="flex-row p-4 items-center rounded-lg justify-center mt-4">
        <Feather name="info" size={20} color={Colors.light.tint} />
        <Text className="text-sm ml-2">
          Os jogadores serão exibidos assim que obtiverem pontuação durante os
          jogos.
        </Text>
      </View>
    );
  }

  if (IsLoadingMarketStatus || !marketStatus || !currentAppreciations) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className={`flex-1 justify-center rounded-lg mx-2`}
        style={{
          gap: 8,
          backgroundColor:
            colorTheme === "dark" ? Colors.dark.backgroundFull : "#F5F5F5",
        }}
      >
        <TextInput
          onChangeText={onSearchFilter}
          value={searchQuery}
          placeholder="Buscar Jogador"
          placeholderTextColor={GRAY_OPACITY}
          className="rounded-lg p-3 border-2 border-gray-300 bg-white mx-4"
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
          initialNumToRender={12}
          maxToRenderPerBatch={25}
          contentContainerStyle={{
            paddingTop: 4,
            backgroundColor:
              colorTheme === "dark" ? Colors.dark.backgroundFull : "#F5F5F5",
            gap: 4,
          }}
          style={{
            paddingBottom: 4,
            backgroundColor:
              colorTheme === "dark" ? Colors.dark.backgroundFull : "#F5F5F5",
          }}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
