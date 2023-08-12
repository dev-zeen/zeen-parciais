import { useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  useColorScheme,
} from "react-native";

import { View } from "@/components/Themed";
import { MatchCard } from "@/components/contexts/matches/MatchCard";
import { MarketStatusCard } from "@/components/contexts/utils/MarketStatusCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { Match } from "@/models/Matches";
import { useGetMatchs } from "@/queries/matches.query";

export default () => {
  const colorTheme = useColorScheme();

  const { data, isLoading, refetch: onRefetch, isRefetching } = useGetMatchs();

  const keyExtractor = useCallback(
    (item: Match) => `${item.clube_casa_id}`,
    []
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Match>) => {
      return (
        <MatchCard
          match={item}
          homeClub={data?.clubes[item.clube_casa_id]}
          awayClub={data?.clubes[item.clube_visitante_id]}
        />
      );
    },
    [data]
  );

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <SafeAreaViewContainer>
      <View
        className={`mx-2 ${colorTheme === "dark" ? `bg-dark` : "bg-light"}`}
        style={{
          gap: 8,
          flex: 1,
        }}
      >
        <MarketStatusCard />
        <FlatList
          contentContainerStyle={{
            gap: 8,
            paddingBottom: 8,
          }}
          refreshControl={
            <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
          }
          initialNumToRender={10}
          data={data?.partidas}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaViewContainer>
  );
};
