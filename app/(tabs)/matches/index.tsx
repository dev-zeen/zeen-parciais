import { useCallback } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";

import { MatchCard } from "@/components/contexts/matches/MatchCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { Match } from "@/models/Matches";
import { useGetMatchs } from "@/queries/matches.query";

export default () => {
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
      <FlatList
        contentContainerStyle={{
          gap: 8,
        }}
        refreshControl={
          <RefreshControl onRefresh={onRefetch} refreshing={isRefetching} />
        }
        initialNumToRender={10}
        data={data?.partidas}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </SafeAreaViewContainer>
  );
};
