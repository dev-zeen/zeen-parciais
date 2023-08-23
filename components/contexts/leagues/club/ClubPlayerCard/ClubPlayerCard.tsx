import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Image, useColorScheme } from 'react-native';

import { PlayerClub } from '@/app/(tabs)/leagues/club/[id]';
import captainImage from '@/assets/images/letter-c.png';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import { MARKET_STATUS_NAME } from '@/constants/Market';
import { MarketStatus } from '@/models/Market';
import { FullPlayer, PlayerStats } from '@/models/Stats';
import { useGetMarket } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
import { numberToString } from '@/utils/parseTo';

type ClubPlayerCardProps = {
  player: PlayerClub;
  currentRound: number;
  marketStatus: MarketStatus;
  isCapitain: boolean;
  appreciation?: number;
  playerStats?: PlayerStats;
  isReserve?: boolean;
};

export function ClubPlayerCard({
  player,
  playerStats,
  currentRound,
  marketStatus,
  appreciation,
  isReserve,
  isCapitain,
}: ClubPlayerCardProps) {
  const colorTheme = useColorScheme();

  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const scorePlayer = useCallback(
    (player: FullPlayer) => {
      const scoreWithCurrentRound =
        currentRound === marketStatus?.rodada_atual &&
        playerStats &&
        playerStats?.atletas[player.atleta_id]
          ? playerStats?.atletas[player.atleta_id]?.pontuacao
          : -1000;

      const scoreRound = player.pontos_num;

      const score =
        isMarketClose && currentRound === marketStatus?.rodada_atual
          ? scoreWithCurrentRound
          : scoreRound;

      return isCapitain ? score * 1.5 : score;
    },
    [currentRound, isCapitain, isMarketClose, marketStatus?.rodada_atual, playerStats]
  );

  // const onPressHandler = useCallback(() => {
  //   router.push(`/leagues/player/${player.atleta_id}`);
  // }, []);

  return (
    <View
      className={`rounded-lg p-2
          border-b ${colorTheme === 'dark' ? 'border-blue-500' : 'border-gray-200'}
          ${(player.isReplaced || isReserve) && 'opacity-50'}
          ${player.isJoined && 'opacity-100'}
          `}>
      <TouchableOpacity
        className="justify-between flex-row"
        activeOpacity={0.6}
        // onPress={onPressHandler}
      >
        <View className="flex-row gap-x-2 items-center">
          <View className="justify-center items-center px-1 gap-y-1">
            <Image
              source={{
                uri: market?.clubes[player.clube_id]?.escudos?.['45x45'],
              }}
              className="w-8 h-8"
              alt={`Imagem do time do escudo do ${market?.clubes[player.clube_id]?.nome}`}
            />
          </View>

          <View className="justify-center items-center">
            <Image
              source={{
                uri: player.foto.replace('FORMATO', '220x220'),
              }}
              className="w-14 h-14"
              alt={`Imagem do ${player.nome}`}
            />
          </View>

          <View>
            <View className="flex-row items-center justify-center gap-x-1">
              <Text className="text-sm font-semibold">{player.apelido_abreviado}</Text>
              {isCapitain && (
                <Image
                  source={captainImage}
                  className="w-5 h-5 rounded-full overflow-hidden"
                  alt={`Capitão do time`}
                />
              )}
            </View>

            <View className="flex-row items-center gap-x-1">
              <Text className="text-xs font-light capitalize">
                {positions?.[player.posicao_id].nome}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center">
          {isMarketClose ? (
            <Text
              className={`text-xs font-semibold ${
                appreciation && appreciation < 0 ? 'text-folly' : 'text-green-400'
              }`}>
              {appreciation ? numberToString(appreciation) : null}
              <Feather
                name={appreciation && appreciation < 0 ? 'arrow-down' : 'arrow-up'}
                color={appreciation && appreciation < 0 ? '#ef4444' : '#4ade80'}
              />
            </Text>
          ) : (
            <>
              {currentRound === marketStatus.rodada_atual - 1 && (
                <Text
                  className={`text-xs font-semibold ${
                    player.variacao_num && player.variacao_num < 0 ? 'text-folly' : 'text-green-400'
                  }`}>
                  {player.variacao_num ? numberToString(player.variacao_num) : null}
                  <Feather
                    name={
                      player.variacao_num && player.variacao_num < 0 ? 'arrow-down' : 'arrow-up'
                    }
                    color={player.variacao_num && player.variacao_num < 0 ? '#ef4444' : '#4ade80'}
                  />
                </Text>
              )}
            </>
          )}

          <Text
            className={`w-10 font-semibold text-sm text-right ${
              scorePlayer(player) > 0
                ? 'text-green-500'
                : scorePlayer(player) <= -30
                ? ''
                : 'text-red-500'
            }`}>
            {scorePlayer(player) < -30 ? '-' : numberToString(scorePlayer(player))}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
