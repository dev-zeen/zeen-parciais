// import { PlayersToSell } from '@app/(tabs)/team/team.helpers'; // TODO
import { Loading } from "@/components/structure/Loading/loading";
import { OBJECT_STATUS_MARKET_PLAYER } from "@/constants/StatusPlayer";
import { PlayerFormation } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { useGetPositions } from "@/queries/players";
import { numberToString } from "@/utils/parseTo";
import { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import useTeamSchemaStore from "@/store/useTeamSchemaStore";
import { FontAwesome } from "@expo/vector-icons";

type ListSellPlayersProps = {
  // players: PlayersToSell[]; // TODO
  players: any[];
  handleClose: () => void;
  handleCloseSuccessSellPlayers: () => void;
};

export function ListSellPlayers({
  players,
  handleClose,
  handleCloseSuccessSellPlayers,
}: ListSellPlayersProps) {
  const { data: positions } = useGetPositions();

  const removePlayerSchema = useTeamSchemaStore(
    (state) => state.removePlayerSchema
  );

  const [playersSell, setPlayersSell] = useState<any[]>();
  // const [playersSell, setPlayersSell] = useState<PlayersToSell[]>();

  useEffect(() => {
    if (players.length > 0) {
      setPlayersSell(players);
    }
  }, []);

  const onRemovePlayerSchema = useCallback(
    (id: number) => {
      const playerSellUpdated = playersSell?.map((position) => {
        const positionUpdated = position.players.filter(
          (player) => player.player?.atleta_id !== id
        );
        return { ...position, players: positionUpdated };
      });

      const updatedPlayerSellWithoutEmptyPositions = playerSellUpdated?.filter(
        (position) => position.players.length > position.quantityToNewFormation
      );

      return updatedPlayerSellWithoutEmptyPositions;
    },
    [playersSell]
  );

  const handleSellPlayer = useCallback(
    (player: FullPlayer | PlayerFormation) => {
      const playersUpdated = onRemovePlayerSchema(player?.atleta_id);
      setPlayersSell(playersUpdated);
      removePlayerSchema(player);

      if (playersUpdated?.length === 0) return handleCloseSuccessSellPlayers();
    },
    [playersSell]
  );

  if (!positions) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-white mt-10">
      <View
        className="justify-between items-center flex-row border-b border-neutral-200 p-2"
        style={{
          marginHorizontal: 4,
        }}
      >
        <TouchableOpacity
          onPress={handleClose}
          className="p-1 border-2 border-red-300 bg-red-100 rounded-full"
        >
          <FontAwesome name="xing" color="#525252" size={30} /> // TODO icon =
          'x'
        </TouchableOpacity>
      </View>
      <View className="py-2">
        <ScrollView>
          <View
            style={{
              gap: 16,
            }}
          >
            {playersSell?.map(
              ({
                position,
                players,
                quantityToNewFormation,
                quantityToSell,
              }) => {
                return (
                  <View
                    key={position}
                    style={{
                      gap: 1,
                    }}
                  >
                    <View
                      className="flex-row items-center justify-center"
                      style={{ gap: 4 }}
                    >
                      <FontAwesome name="warning" size={18} />
                      <Text className="text-base font-semibold">
                        Vai ser preciso vender {quantityToSell}{" "}
                        {(positions as any)[String(position)].nome}(s)
                      </Text>
                    </View>

                    <View
                      style={{
                        gap: 4,
                      }}
                    >
                      {players.map(({ player }) => {
                        return (
                          <View
                            className={`bg-white rounded-lg border-b border-gray-200 flex-row items-center justify-between p-2`}
                            key={player?.atleta_id}
                          >
                            <View
                              className="flex-row items-center"
                              style={{
                                gap: 8,
                              }}
                            >
                              <Image
                                source={{
                                  uri: player?.foto.replace(
                                    "FORMATO",
                                    "220x220"
                                  ),
                                }}
                                className="w-16 h-16 rounded-3xl"
                                alt={`Imagem do ${player?.nome}`}
                              />
                              <View className="flex-1 justify-between">
                                <View className="flex-row justify-between items-center flex-1">
                                  <Text className="flex-row text-base font-semibold">
                                    {player?.apelido}
                                  </Text>

                                  <View className="flex-row" style={{ gap: 4 }}>
                                    <Text className="font-medium text-gray-400 text-xs">
                                      {
                                        OBJECT_STATUS_MARKET_PLAYER[
                                          (player as any)?.status_id
                                        ].name
                                      }
                                    </Text>
                                    <View
                                      className="flex-row"
                                      style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 10,
                                        backgroundColor:
                                          OBJECT_STATUS_MARKET_PLAYER[
                                            (player as any)?.status_id
                                          ]?.background,
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      <FontAwesome
                                        // name={
                                        //   OBJECT_STATUS_MARKET_PLAYER[
                                        //     (player as any)?.status_id
                                        //   ]?.icon
                                        // }
                                        name="info"
                                        color={
                                          OBJECT_STATUS_MARKET_PLAYER[
                                            (player as any)?.status_id
                                          ]?.color
                                        }
                                        size={14}
                                      />
                                    </View>
                                  </View>
                                </View>

                                <View className="flex-row justify-between items-center flex-1">
                                  <View
                                    className="items-start justify-start"
                                    style={{ gap: 8 }}
                                  >
                                    <View
                                      className="flex-row justify-between items-center flex-1"
                                      style={{
                                        gap: 8,
                                      }}
                                    >
                                      <View className="items-center justify-center">
                                        <Text
                                          className="font-light text-gray-600 uppercase"
                                          style={{
                                            fontSize: 10,
                                          }}
                                        >
                                          Média
                                        </Text>
                                        <Text className="font-semibold text-xs">
                                          {numberToString(player?.media_num)}
                                        </Text>
                                      </View>

                                      <View className="items-center justify-center">
                                        <Text
                                          className="font-light text-gray-600 uppercase"
                                          style={{
                                            fontSize: 10,
                                          }}
                                        >
                                          Última
                                        </Text>
                                        <Text className="font-semibold text-xs">
                                          {numberToString(player?.pontos_num)}
                                        </Text>
                                      </View>

                                      <View className="items-center justify-center">
                                        <Text
                                          className="font-light text-gray-600 uppercase"
                                          style={{
                                            fontSize: 10,
                                          }}
                                        >
                                          Min P/ Val
                                        </Text>
                                        <Text className="font-semibold text-xs">
                                          {numberToString(
                                            player?.minimo_para_valorizar
                                          )}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>

                                  <View
                                    className="items-end justify-end pl-3"
                                    style={{
                                      gap: 8,
                                    }}
                                  >
                                    <TouchableOpacity
                                      onPress={() =>
                                        handleSellPlayer(
                                          player as FullPlayer | PlayerFormation
                                        )
                                      }
                                      className="bg-red-500 rounded-lg py-2 px-4 disabled:bg-gray-300"
                                      activeOpacity={0.6}
                                    >
                                      <Text className="text-white text-xs font-semibold">
                                        Vender
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              }
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
