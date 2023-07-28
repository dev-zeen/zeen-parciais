import { Image, TouchableOpacity } from "react-native";

import {
  ENUM_STATUS_MARKET_PLAYER,
  OBJECT_STATUS_MARKET_PLAYER,
} from "@//constants/StatusPlayer";
import { PlayerFormation } from "@/models/Formations";
import { FullPlayer } from "@/models/Stats";
import { numberToString } from "@/utils/parseTo";

import captainImage from "@/assets/images/letter-c.png";
import { View } from "@/components/Themed";
import { MARKET_STATUS_NAME } from "@/constants/Market";
import { useGetMarketStatus } from "@/queries/market";
import useTeamSchemaStore from "@/store/useTeamSchemaStore";
import { FontAwesome } from "@expo/vector-icons";

type PlayerFootballFieldProps = {
  player?: PlayerFormation | FullPlayer;
  hasCaptain?: boolean;
  handleCapitain?: (id: number) => void;
};

export function PlayerFootballField({
  player,
  hasCaptain,
}: PlayerFootballFieldProps) {
  const { data: marketStatus } = useGetMarketStatus();

  const marketIsClosed =
    marketStatus?.status_mercado === MARKET_STATUS_NAME.FECHADO;

  const removePlayerSchema = useTeamSchemaStore(
    (state) => state.removePlayerSchema
  );

  const scoreWithMarketStatus = marketIsClosed
    ? hasCaptain
      ? (player as PlayerFormation)?.pontuacao * 1.5
      : (player as PlayerFormation)?.pontuacao
    : hasCaptain
    ? (player as PlayerFormation)?.pontos_num * 1.5
    : (player as PlayerFormation)?.pontos_num;

  const scoreFinal = numberToString(scoreWithMarketStatus);

  const playerPrice = numberToString(player?.preco_num);

  return (
    <View
      className="items-center justify-center"
      style={{
        gap: 2,
        maxWidth: 90,
        minWidth: 90,
      }}
    >
      {marketIsClosed ? (
        <View className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg w-14">
          {(player as PlayerFormation) ? (
            <Text
              numberOfLines={1}
              className={`font-bold ${
                scoreWithMarketStatus > 0 && "text-blue-500"
              } ${scoreWithMarketStatus === 0 && "text-gray-400"} ${
                scoreWithMarketStatus < 0 && "text-red-500"
              }   text-center`}
              style={{
                fontSize: 11,
              }}
            >
              {scoreFinal}
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              className="font-bold text-gray-400"
              style={{
                fontSize: 11,
              }}
            >
              -
            </Text>
          )}
        </View>
      ) : (
        <View className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg w-14">
          <Text
            numberOfLines={1}
            className="font-bold  text-gray-500"
            style={{
              fontSize: 11,
            }}
          >
            $ {playerPrice}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.6}
        onLongPress={() =>
          removePlayerSchema(player as PlayerFormation | FullPlayer)
        }
        className={`justify-center items-center border-2 w-12 h-12 rounded-full ${
          player?.status_id !== ENUM_STATUS_MARKET_PLAYER.PROVAVEL
            ? "border-red-500 bg-red-500"
            : "border-neutral-200 bg-neutral-50"
        }`}
        key={player?.foto}
      >
        <Image
          source={{
            uri: player?.foto.replace("FORMATO", "220x220"),
          }}
          className="w-10 h-10 rounded-full bg-white overflow-hidden"
          alt={`Foto do ${player?.apelido}`}
        />
        {hasCaptain && (
          <View
            style={{
              position: "relative",
              bottom: "85%",
              right: "50%",
              backgroundColor:
                OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                  ?.background,
              width: 2,
              height: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={captainImage}
              className="w-5 h-5 rounded-full bg-white overflow-hidden"
              alt={`Foto do ${player?.apelido}`}
            />
          </View>
        )}
        <View
          style={{
            position: "absolute",
            bottom: -2,
            right: 0,
            backgroundColor:
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]
                ?.background,
            width: 18,
            height: 18,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome
            // name={
            //   OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.icon
            // }
            name="info"
            color={
              OBJECT_STATUS_MARKET_PLAYER[player?.status_id as number]?.color
            }
            size={14}
          />
        </View>
      </TouchableOpacity>
      <View
        style={{
          paddingHorizontal: 2,
        }}
        className="border border-neutral-200 bg-neutral-50 items-center justify-center rounded-lg"
      >
        <Text
          style={{
            fontSize: 11,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-semibold text-gray-500 text-center"
        >
          {player?.apelido_abreviado}
        </Text>
      </View>
    </View>
  );
}
