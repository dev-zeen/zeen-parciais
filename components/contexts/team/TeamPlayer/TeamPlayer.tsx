import { useCallback, useState } from "react";
import { Image, Modal, TouchableOpacity } from "react-native";

import { Feather } from "@expo/vector-icons";

import captainImage from "@/assets/images/letter-c.png";
import { Text, View } from "@/components/Themed";
import { TeamPlayerCard } from "@/components/contexts/team/TeamPlayerCard";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import {
  ENUM_STATUS_MARKET_PLAYER,
  OBJECT_STATUS_MARKET_PLAYER,
} from "@/constants/StatusPlayer";
import { LineupPlayer } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { useGetMarketStatus } from "@/queries/market.query";
import useTeamLineupStore from "@/store/useTeamLineupStore";
import { numberToString } from "@/utils/parseTo";

type TeamPlayerProps = {
  player?: LineupPlayer;
  hasCaptain?: boolean;
  handleCapitain?: (id: number) => void;
  isPlayed?: boolean;
  isReservePlayer?: boolean;
};

export function TeamPlayer({
  player,
  hasCaptain,
  isPlayed,
  isReservePlayer = false,
}: TeamPlayerProps) {
  const { data: marketStatus } = useGetMarketStatus();

  const [activePlayerCard, setActivePlayerCard] = useState(false);

  const isMarketClose =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const removePlayerFromLineup = useTeamLineupStore(
    (state) => state.removePlayerFromLineup
  );

  const handleModalPlayerCard = () => {
    setActivePlayerCard((previous) => !previous);
  };

  const handleRemovePlayerFromLayout = useCallback(
    (player: LineupPlayer | FullPlayer) => {
      removePlayerFromLineup(player);
    },
    []
  );

  const scoreWithMarketStatus = isMarketClose
    ? hasCaptain
      ? (player as LineupPlayer)?.pontuacao * 1.5 || 0
      : (player as LineupPlayer)?.pontuacao
    : hasCaptain
    ? (player as LineupPlayer)?.pontos_num * 1.5 || 0
    : (player as LineupPlayer)?.pontos_num;

  const scoreFinal = isPlayed ? numberToString(scoreWithMarketStatus) : "-";

  const playerPrice = numberToString(player?.preco_num);

  return (
    <View
      className="items-center justify-center"
      style={{
        gap: 2,
        maxWidth: 90,
        minWidth: 90,
        backgroundColor: "transparent",
      }}
    >
      {isMarketClose ? (
        <View className="border border-neutral-200 items-center justify-center rounded-lg w-14 bg-neutral-50">
          <Text
            numberOfLines={1}
            className={`text-blue-500 font-semibold text-center text-xs`}
          >
            {scoreFinal}
          </Text>
        </View>
      ) : (
        <View className="border border-neutral-200 items-center justify-center rounded-lg w-14 bg-neutral-50">
          <Text
            numberOfLines={1}
            className="font-semibold text-xs text-blue-500"
          >
            $ {playerPrice}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.6}
        onPress={handleModalPlayerCard}
        onLongPress={() =>
          handleRemovePlayerFromLayout(player as LineupPlayer | FullPlayer)
        }
        className={`justify-center items-center border-2 w-12 h-12 rounded-full ${
          player?.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL
            ? "border-red-500 bg-red-500"
            : "border-neutral-200"
        }`}
        key={player?.foto}
      >
        <Image
          source={{
            uri: player?.foto.replace("FORMATO", "220x220"),
          }}
          className="w-11 h-11 rounded-full bg-neutral-100 overflow-hidden"
          alt={`Foto do ${player?.apelido}`}
        />
        {hasCaptain && (
          <View
            className="relative w-0.5 h-0.5 justify-center items-center"
            style={{
              bottom: "85%",
              right: "50%",
              backgroundColor:
                OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                  ?.background,
            }}
          >
            <Image
              source={captainImage}
              className="w-5 h-5 rounded-full overflow-hidden"
              alt={`Foto do ${player?.apelido}`}
            />
          </View>
        )}
        <View
          className="absolute w-4 h-4 rounded-xl justify-center items-center"
          style={{
            bottom: -2,
            right: 0,
            backgroundColor:
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                ?.background,
          }}
        >
          <Feather
            name={
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                ?.icon as keyof typeof Feather.glyphMap
            }
            color={
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.color
            }
            size={14}
          />
        </View>
      </TouchableOpacity>
      <View className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg px-1">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-semibold text-gray-800 text-center text-xs"
        >
          {player?.apelido_abreviado}
        </Text>
      </View>

      {activePlayerCard && (
        <Modal
          animationType="fade"
          transparent
          visible={activePlayerCard}
          onRequestClose={() => setActivePlayerCard(false)}
        >
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
