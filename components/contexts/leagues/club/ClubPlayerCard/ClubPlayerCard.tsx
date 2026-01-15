import { Feather } from '@expo/vector-icons';
import { useCallback } from 'react';
import {  Image } from 'react-native';

import { PlayerClub } from '@/app/(tabs)/leagues/club/[id]';
import captainImage from '@/assets/images/letter-c.png';
import { Text, TouchableOpacity, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MarketStatus } from '@/models/Market';
import { FullPlayer, PlayerStats } from '@/models/Stats';
import { useGetMarket } from '@/queries/market.query';
import { useGetPositions } from '@/queries/players.query';
import { useGetScoredPlayers } from '@/queries/stats.query';
import { numberToString } from '@/utils/parseTo';

type ClubPlayerCardProps = {
  player: PlayerClub;
  currentRound: number;
  marketStatus: MarketStatus;
  isCaptain: boolean;
  appreciation?: number;
  playerStats?: PlayerStats;
  isReserve?: boolean;
  isReplacePlayer?: boolean;
};

export function ClubPlayerCard({
  player,
  currentRound,
  marketStatus,
  appreciation,
  isReserve,
  isCaptain,
  isReplacePlayer,
}: ClubPlayerCardProps) {
  const colorTheme = useThemeColor();

  const { data: market } = useGetMarket();
  const { data: positions } = useGetPositions();
  const { isMarketClose } = useMarketStatus();

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

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

      return isCaptain ? score * 1.5 : score;
    },
    [currentRound, isCaptain, isMarketClose, marketStatus?.rodada_atual, playerStats]
  );

  return (
    <View className="rounded-lg p-2">
      <TouchableOpacity className="justify-between flex-row" activeOpacity={0.6}>
        <View className="flex-row gap-x-2 items-center">
          <Image
            source={{
              uri: player.foto?.replace('FORMATO', '220x220'),
            }}
            className={`w-14 h-14 rounded-full           ${
              (player.isReplaced || isReserve) && 'opacity-30'
            }
            ${player.isJoined && 'opacity-100'}`}
            alt={`Imagem do ${player?.nome}`}
          />

          <View>
            <View className="flex-row items-center gap-x-1">
              <Text className="text-sm font-semibold">{player.apelido_abreviado}</Text>
              {isCaptain && (
                <Image
                  source={captainImage}
                  className="w-5 h-5 rounded-full overflow-hidden"
                  alt={'Capitão do time'}
                />
              )}
            </View>

            <View className="flex-row items-center gap-x-1">
              <Text className="text-xs capitalize" style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>{positions?.[player.posicao_id]?.nome}</Text>
              <View className="rounded-full bg-gray-300 h-1 w-1" />
              <Text className="text-xs capitalize" style={{ color: colorTheme === 'dark' ? '#9ca3af' : '#6b7280' }}>{market?.clubes[player.clube_id]?.nome}</Text>
            </View>
          </View>

          {isReplacePlayer && (
            <Feather
              name="shuffle"
              size={20}
              color={colorTheme === 'dark' ? Colors.light.background : Colors.dark.background}
            />
          )}
        </View>

        <View className="flex-row items-center">
          {scorePlayer(player) > -20 ? (
            <>
              {isMarketClose && appreciation && currentRound === marketStatus.rodada_atual ? (
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
                  {!isMarketClose && currentRound === marketStatus.rodada_atual - 1 ? (
                    <Text
                      className={`text-xs font-semibold ${
                        player.variacao_num && player.variacao_num < 0
                          ? 'text-folly'
                          : 'text-green-400'
                      }`}>
                      {player.variacao_num ? numberToString(player.variacao_num) : null}
                      <Feather
                        name={
                          player.variacao_num && player.variacao_num < 0 ? 'arrow-down' : 'arrow-up'
                        }
                        color={
                          player.variacao_num && player.variacao_num < 0 ? '#ef4444' : '#4ade80'
                        }
                      />
                    </Text>
                  ) : (
                    <></>
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
                {numberToString(scorePlayer(player))}
              </Text>
            </>
          ) : (
            <Text> - </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
