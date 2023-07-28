import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItemInfo, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { MarketPlayerCard } from "@/components/contexts/market/MarketPlayerCard";
import { Loading } from "@/components/structure/Loading";
import { SafeAreaViewContainer } from "@/components/structure/SafeAreaViewContainer";
import { ENUM_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { FormationPlayer, ISchema } from "@/models/Formations";
import { Market as MarketModel } from "@/models/Market";
import { FullPlayer } from "@/models/Stats";
import useTeamSchemaStore from "@/store/useTeamSchemaStore";
import { Feather } from "@expo/vector-icons";

type MarketProps = {
  market: MarketModel;
  position?: FormationPlayer | null;
  handleCloseMarketModal: () => void;
};

export function Market({
  position,
  handleCloseMarketModal,
  market,
}: MarketProps) {
  const upateSchema = useTeamSchemaStore((state) => state.updateSchema);
  const schema = useTeamSchemaStore((state) => state.schema);

  const [marketPlayers, setMarketPlayers] = useState<FullPlayer[]>();
  const [searchPlayerParam, setSearchPlayerParam] =
    useState<FormationPlayer | null>();

  const handleBuyPlayer = (schema: ISchema, player: FullPlayer) => {
    handleCloseMarketModal();
    const playersUpdated = schema?.players.map((item) => {
      if (player.posicao_id === item.position && !item.player) {
        return {
          ...item,
          player,
        };
      }
      return item;
    });

    const schemaUpdated: ISchema = {
      ...schema,
      players: playersUpdated,
    };

    upateSchema(schemaUpdated);
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
          onPress={() => handleBuyPlayer(schema as ISchema, player)}
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
        initialNumToRender={100}
        removeClippedSubviews={true}
        windowSize={5}
      />
    </SafeAreaViewContainer>
  );
}
