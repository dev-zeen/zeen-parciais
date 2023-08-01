import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItemInfo, TouchableOpacity } from "react-native";

import { Feather } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import { MarketPlayerCard } from "@/components/contexts/market/MarketPlayerCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ENUM_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { LineupPlayers, LineupPosition } from "@/models/Formations";
import { Market as MarketModel } from "@/models/Market";
import { FullPlayer } from "@/models/Stats";

import useTeamLineupStore from "@/store/useTeamLineupStore";

type MarketProps = {
  market: MarketModel;
  position?: LineupPosition | null;
  handleCloseMarketModal: () => void;
};

export function Market({
  position,
  handleCloseMarketModal,
  market,
}: MarketProps) {
  const upateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);

  const [marketPlayers, setMarketPlayers] = useState<FullPlayer[]>();
  const [searchPlayerParam, setSearchPlayerParam] =
    useState<LineupPosition | null>();

  const handleBuyPlayer = (lineup: LineupPlayers, player: FullPlayer) => {
    handleCloseMarketModal();
    const playersUpdated = lineup?.players.map((item) => {
      if (player.posicao_id === item.position && !item.player) {
        return {
          ...item,
          player,
        };
      }
      return item;
    });

    const lineupUpdated: LineupPlayers = {
      ...lineup,
      players: playersUpdated,
    };

    upateLineup(lineupUpdated);
  };

  useEffect(() => {
    if (position) {
      setSearchPlayerParam(position);
      const marketPlayersUpdated = market?.atletas
        .filter(
          (item) =>
            item.posicao_id === position.position &&
            item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL
        )
        .sort((a, b) => b.preco_num - a.preco_num);
      setMarketPlayers(marketPlayersUpdated);
    } else {
      const marketPlayersLikely = market.atletas.filter(
        (item) => item.status_id === ENUM_STATUS_MARKET_PLAYER.PROVAVEL
      );
      setMarketPlayers(marketPlayersLikely);
    }
  }, [searchPlayerParam]);

  const renderItem = useCallback(
    ({ item: player }: ListRenderItemInfo<FullPlayer>) => {
      return (
        <MarketPlayerCard
          onPress={() => handleBuyPlayer(lineup as LineupPlayers, player)}
          player={player}
        />
      );
    },
    []
  );

  if (!marketPlayers) return <Loading />;

  return (
    <SafeAreaViewContainer>
      <View
        className="justify-between items-center flex-row p-2 mx-2 rounded-lg mb-2"
        style={{
          marginHorizontal: 4,
        }}
      >
        <TouchableOpacity
          onPress={handleCloseMarketModal}
          className="p-2 rounded-full bg-white"
        >
          <Feather name="x" color="#525252" size={24} />
        </TouchableOpacity>

        <Text className="font-semibold text-lg">Mercado</Text>

        <TouchableOpacity className="p-2 bg-white rounded-full">
          <Feather name="search" color="#525252" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{
          gap: 8,
        }}
        data={marketPlayers}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.atleta_id}`}
        initialNumToRender={5}
        removeClippedSubviews={true}
        windowSize={5}
      />
    </SafeAreaViewContainer>
  );
}
