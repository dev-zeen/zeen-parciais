import { Feather } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Image, Modal, TouchableOpacity } from 'react-native';

import captainImage from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { TeamPlayerCard } from '@/components/contexts/team/TeamPlayerCard';
import { ENUM_STATUS_MARKET_PLAYER, OBJECT_STATUS_MARKET_PLAYER } from '@/constants/StatusPlayer';
import useMarketStatus from '@/hooks/useMarketStatus';
import { LineupPlayer } from '@/models/Formations';
import { FullPlayer } from '@/models/Stats';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { numberToString } from '@/utils/parseTo';

type TeamPlayerProps = {
  player?: LineupPlayer;
  isCaptain?: boolean;
  handleCaptain?: (id: number) => void;
  isPlayed?: boolean;
  isReplaced?: boolean;
  isEnteredInMatch?: boolean;
  isReservePlayer?: boolean;
  isViewOnly: boolean;
  round?: number;
};

export function TeamPlayer({
  player,
  isCaptain,
  isPlayed,
  isReplaced,
  isEnteredInMatch,
  isReservePlayer = false,
  isViewOnly = false,
  round,
}: TeamPlayerProps) {
  const { isMarketClose, marketStatus } = useMarketStatus();

  const [activePlayerCard, setActivePlayerCard] = useState(false);

  const removePlayerFromLineup = useTeamLineupStore((state) => state.removePlayerFromLineup);

  const handleModalPlayerCard = useCallback(() => {
    setActivePlayerCard((previous) => !previous);
  }, []);

  const handleRemovePlayerFromLayout = useCallback(
    (player: LineupPlayer | FullPlayer) => {
      if (isMarketClose) return;
      removePlayerFromLineup(player);
    },
    [isMarketClose, removePlayerFromLineup]
  );

  const partialScore = useMemo(() => {
    if (isPlayed) {
      const pontuacao = (player as LineupPlayer)?.pontuacao ?? 0;
      return isCaptain ? pontuacao * 1.5 : pontuacao;
    }
  }, [isCaptain, isPlayed, player]);

  const score = useMemo(() => {
    if (player?.pontos_num !== null) {
      return isCaptain
        ? (player as LineupPlayer)?.pontos_num * 1.5 || 0
        : (player as LineupPlayer)?.pontos_num ?? 0;
    }
  }, [isCaptain, player]);

  const scorePartialFormated = useMemo(
    () => (isMarketClose && isPlayed ? numberToString(partialScore) : '-'),
    [isMarketClose, isPlayed, partialScore]
  );

  const scoreFormated = useMemo(() => {
    if (!isNaN(score as number)) {
      return numberToString(score);
    }
    return '-';
  }, [score]);

  const scoreFinal = useMemo(
    () => (round === marketStatus?.rodada_atual ? scorePartialFormated : scoreFormated),
    [marketStatus?.rodada_atual, round, scoreFormated, scorePartialFormated]
  );

  const playerPrice = useMemo(() => numberToString(player?.preco_num), [player?.preco_num]);

  return (
    <View
      className={`items-center justify-center ${
        isReplaced || (isReservePlayer && !isEnteredInMatch && isMarketClose) ? 'opacity-60' : ''
      }`}
      style={{
        gap: 2,
        maxWidth: 76,
        minWidth: 76,
        backgroundColor: 'transparent',
      }}>
      {isMarketClose || isViewOnly ? (
        <View className="border border-neutral-200 items-center justify-center rounded-lg w-14 bg-neutral-50">
          <Text numberOfLines={1} className="text-blue-500 font-semibold text-center text-xs">
            {isReplaced ? '-' : scoreFinal}
          </Text>
        </View>
      ) : (
        <View className="border border-neutral-200 items-center justify-center rounded-lg w-14 bg-neutral-50">
          <Text numberOfLines={1} className="font-semibold text-xs text-blue-500">
            $ {playerPrice}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handleModalPlayerCard}
        onLongPress={() =>
          !isViewOnly ? handleRemovePlayerFromLayout(player as LineupPlayer | FullPlayer) : null
        }
        className={`justify-center items-center border-2 rounded-full ${
          player?.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL && !isViewOnly
            ? 'border-red-500 bg-red-500'
            : 'border-neutral-200'
        }`}
        key={player?.foto}>
        <Image
          source={{
            uri: player?.foto?.replace('FORMATO', '220x220'),
          }}
          className="w-11 h-11 rounded-full bg-neutral-100 overflow-hidden"
          alt={`Foto do ${player?.apelido}`}
        />
        {isCaptain && (
          <View
            className="relative w-0.5 h-0.5 justify-center items-center"
            style={{
              bottom: '80%',
              right: '25%',
              backgroundColor: OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.background,
            }}>
            <Image
              source={captainImage}
              className="w-5 h-5 rounded-full overflow-hidden"
              alt={`Foto do ${player?.apelido}`}
            />
          </View>
        )}
        {!isViewOnly ? (
          <View
            className="absolute w-4 h-4 rounded-xl justify-center items-center"
            style={{
              bottom: -2,
              right: 0,
              backgroundColor: OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.background,
            }}>
            <Feather
              name={
                OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                  ?.icon as keyof typeof Feather.glyphMap
              }
              color={OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.color}
              size={14}
            />
          </View>
        ) : (
          <></>
        )}
        {isReplaced || isEnteredInMatch ? (
          <View
            className="absolute w-4 h-4 rounded-xl justify-center items-center"
            style={{
              bottom: -2,
              right: 30,
              backgroundColor: isReplaced ? '#ef4444' : '#22c55e',
            }}>
            <Feather name={isReplaced ? 'arrow-down' : 'arrow-up'} color={'#fafafa'} size={14} />
          </View>
        ) : (
          <></>
        )}
      </TouchableOpacity>
      <View className="bg-neutral-50 items-center justify-center rounded py-0.5">
        <Text
          numberOfLines={1}
          className="font-semibold text-center text-gray-600"
          style={{
            fontSize: 11,
            paddingHorizontal: 3,
          }}>
          {player?.apelido_abreviado}
        </Text>
      </View>

      {activePlayerCard && (
        <Modal
          animationType="fade"
          transparent
          visible={activePlayerCard}
          onRequestClose={() => setActivePlayerCard(false)}>
          <TeamPlayerCard
            player={player as LineupPlayer}
            onClose={handleModalPlayerCard}
            isReservePlayer={isReservePlayer}
          />
        </Modal>
      )}
    </View>
  );
}
