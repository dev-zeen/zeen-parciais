import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';

import { PlayersToSell } from '@/app/(tabs)/team/team.helpers';
import { Text, View } from '@/components/Themed';
import { Loading } from '@/components/structure/Loading';
import Colors from '@/constants/Colors';
import { OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import { LineupPlayer, LineupPlayers } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import { useGetPositions } from '@/queries/players.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { numberToString } from '@/utils/parseTo';
import { onRemovePlayerFromLineup, onRemovePlayerFromSellPlayers } from '@/utils/team';

type ListPlayersSaleProps = {
  players: PlayersToSell[];
  handleClose: () => void;
  handleCloseSuccessSellPlayers: (lineup: LineupPlayers) => void;
};

export function ListPlayersSale({
  players,
  handleClose,
  handleCloseSuccessSellPlayers,
}: ListPlayersSaleProps) {
  const colorTheme = useColorScheme();

  const { data: positions } = useGetPositions();

  const lineup = useTeamLineupStore((state) => state.lineup);

  const [lineupState, setLineupState] = useState<LineupPlayers | undefined>(lineup);

  const [playersSell, setPlayersSell] = useState<PlayersToSell[]>();

  const handleSellPlayer = useCallback(
    (player: FullPlayer | LineupPlayer) => {
      const positionSellUpdated = onRemovePlayerFromSellPlayers(
        playersSell as PlayersToSell[],
        player?.atleta_id
      );

      setPlayersSell(positionSellUpdated as PlayersToSell[]);

      const lineUpdated = onRemovePlayerFromLineup(lineupState as LineupPlayers, player);
      setLineupState(lineUpdated);

      if (positionSellUpdated?.length === 0) {
        return handleCloseSuccessSellPlayers(lineUpdated);
      }
    },
    [handleCloseSuccessSellPlayers, lineupState, playersSell]
  );

  useEffect(() => {
    if (players.length > 0) {
      setPlayersSell(players);
    }
  }, [players]);

  if (!positions) {
    return <Loading />;
  }

  return (
    <View
      className="flex-1 pt-28 rounded-3xl"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}>
      <View className="flex-1">
        <View
          className="items-center justify-end flex-row pt-2 mx-2 rounded-lg mb-2"
          style={{
            marginHorizontal: 4,
            gap: 16,
          }}>
          <TouchableOpacity
            onPress={handleClose}
            className="p-2 rounded-full border border-red-400 bg-red-300">
            <Feather name="x" color="#525252" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View
            style={{
              gap: 16,
            }}>
            {playersSell?.map(({ position, players, quantityToSell }) => {
              return (
                <View
                  key={position}
                  style={{
                    gap: 1,
                  }}>
                  <View className="flex-row items-center justify-center" style={{ gap: 4 }}>
                    <Feather
                      name="alert-circle"
                      size={18}
                      color={colorTheme === 'dark' ? Colors.dark.text : Colors.light.text}
                    />
                    <Text className="text-base font-semibold">
                      Vai ser preciso vender {quantityToSell}{' '}
                      {(positions as any)[String(position)].nome}(s)
                    </Text>
                  </View>

                  <View
                    style={{
                      gap: 4,
                    }}>
                    {players
                      .filter((item) => item.player)
                      .map(({ player }) => {
                        return (
                          <View
                            className="rounded-lg border-b border-gray-200 flex-row items-center justify-between p-2"
                            key={player?.atleta_id}>
                            <View
                              className="flex-row items-center"
                              style={{
                                gap: 8,
                              }}>
                              <Image
                                source={{
                                  uri: player?.foto?.replace('FORMATO', '220x220'),
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
                                    <Text className="font-medium text-xs">
                                      {
                                        OBJECT_STATUS_MARKET_PLAYER[(player as any)?.status_id]
                                          ?.name
                                      }
                                    </Text>
                                    <View
                                      className="flex-row"
                                      style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 10,
                                        backgroundColor:
                                          OBJECT_STATUS_MARKET_PLAYER[(player as any)?.status_id]
                                            ?.background,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <Feather
                                        name={
                                          OBJECT_STATUS_MARKET_PLAYER[(player as any)?.status_id]
                                            ?.icon as keyof typeof Feather.glyphMap
                                        }
                                        color={
                                          OBJECT_STATUS_MARKET_PLAYER[(player as any)?.status_id]
                                            ?.color
                                        }
                                        size={14}
                                      />
                                    </View>
                                  </View>
                                </View>

                                <View className="flex-row justify-between items-center flex-1">
                                  <View className="items-start justify-start" style={{ gap: 8 }}>
                                    <View
                                      className="flex-row justify-between items-center flex-1"
                                      style={{
                                        gap: 8,
                                      }}>
                                      <View className="items-center justify-center">
                                        <Text
                                          className="font-light uppercase"
                                          style={{
                                            fontSize: 10,
                                          }}>
                                          Média
                                        </Text>
                                        <Text className="font-semibold text-xs">
                                          {numberToString(player?.media_num)}
                                        </Text>
                                      </View>

                                      <View className="items-center justify-center">
                                        <Text
                                          className="font-light uppercase"
                                          style={{
                                            fontSize: 10,
                                          }}>
                                          Última
                                        </Text>
                                        <Text className="font-semibold text-xs">
                                          {numberToString(player?.pontos_num)}
                                        </Text>
                                      </View>

                                      <View className="items-center justify-center">
                                        <Text
                                          className="font-light uppercase"
                                          style={{
                                            fontSize: 10,
                                          }}>
                                          Min P/ Val
                                        </Text>
                                        <Text className="font-semibold text-xs">
                                          {numberToString(player?.minimo_para_valorizar)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>

                                  <View
                                    className="items-end justify-end pl-3"
                                    style={{
                                      gap: 8,
                                    }}>
                                    <TouchableOpacity
                                      onPress={() => {
                                        handleSellPlayer(player as FullPlayer | LineupPlayer);
                                      }}
                                      className="bg-red-500 rounded-lg py-2 px-4 disabled:bg-gray-300"
                                      activeOpacity={0.6}>
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
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
