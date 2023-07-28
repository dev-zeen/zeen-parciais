import { useCallback, useEffect, useState } from "react";
import { ImageBackground, Modal } from "react-native";

import footballField from "@/assets/images/field.png";
import { PlayerFootballField } from "@/components/contexts/team/player-football-field";
import { FormationPlayer, ISchema } from "@/models/Formations";

import { AddPlayerButton } from "@/components/contexts/team/add-player-button";

// TODO import { Market } from '@app/(tabs)/team/market';
import { View } from "@/components/Themed";
import { useGetMarket } from "@/queries/market";

type FootballFieldProps = {
  schema: ISchema;
  capitain: number;
  handleChangeCapitain?: (id: number) => void;
};

export function FootballField({
  schema,
  capitain,
  handleChangeCapitain,
}: FootballFieldProps) {
  const { data: market } = useGetMarket();
  const [positionMarketSearch, setPositionMarketSearch] =
    useState<FormationPlayer | null>();

  const [activeModalMarket, setActiveModalMarket] = useState(false);

  const handleBuyPlayerOnMarket = useCallback(
    (player: FormationPlayer) => {
      setPositionMarketSearch(player);
    },
    [positionMarketSearch]
  );

  const handleCloseMarketModal = useCallback(() => {
    setActiveModalMarket(false);
    setPositionMarketSearch(null);
  }, []);

  useEffect(() => {
    if (positionMarketSearch) setActiveModalMarket(true);
  }, [positionMarketSearch]);

  return (
    <View className="flex-1 justify-center items-center rounded-lg">
      <View className="flex-1">
        <ImageBackground
          source={footballField}
          style={{
            height: 435,
            width: 410,
          }}
          alt="Campo de futebol"
        />
      </View>

      {schema.players.map((position) => {
        return (
          <View
            key={`${position.left} + ${position.position} + ${position.top}`}
            className="absolute"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {position.player ? (
              <PlayerFootballField
                player={position.player}
                hasCaptain={capitain === position.player?.atleta_id}
                handleCapitain={handleChangeCapitain}
              />
            ) : (
              <AddPlayerButton
                handleBuyPlayerOnMarket={handleBuyPlayerOnMarket}
                positionSchema={position}
              />
            )}
          </View>
        );
      })}

      <Modal animationType="slide" transparent visible={activeModalMarket}>
        {/* <Market
          market={market as MarketModel}
          position={positionMarketSearch}
          handleCloseMarketModal={handleCloseMarketModal}
        /> */}
      </Modal>
    </View>
  );
}
