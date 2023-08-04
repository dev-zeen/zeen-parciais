import { useCallback, useEffect, useState } from "react";
import { ImageBackground, Modal } from "react-native";

import { Market } from "@/app/(tabs)/team/market";
import footballField from "@/assets/images/field.png";
import { View } from "@/components/Themed";
import { AddPlayerButton } from "@/components/contexts/team/AddPlayerButton.tsx";
import { TeamPlayer } from "@/components/contexts/team/TeamPlayer";
import { LineupPlayers, LineupPosition } from "@/models/Formations";
import { Market as MarketModal } from "@/models/Market";
import { useGetMarket } from "@/queries/market.query";
import { useGetScoredPlayers } from "@/queries/stats.query";

type SoccerFieldProps = {
  lineup: LineupPlayers;
  capitain: number;
  handleChangeCapitain?: (id: number) => void;
};

export function SoccerField({
  lineup,
  capitain,
  handleChangeCapitain,
}: SoccerFieldProps) {
  const { data: market } = useGetMarket();
  const { data: playerStats } = useGetScoredPlayers();
  const [positionMarketSearch, setPositionMarketSearch] =
    useState<LineupPosition | null>();

  const [playerIndex, setPlayerIndex] = useState(0);

  const [activeModalMarket, setActiveModalMarket] = useState(false);

  const handleBuyPlayerOnMarket = useCallback(
    (player: LineupPosition, playerIndex: number) => {
      setPositionMarketSearch(player);
      setPlayerIndex(playerIndex);
    },
    [positionMarketSearch]
  );

  const handleCloseMarketModal = useCallback(() => {
    setActiveModalMarket(false);
    setPositionMarketSearch(null);
    setPlayerIndex(0);
  }, []);

  useEffect(() => {
    if (positionMarketSearch) setActiveModalMarket(true);
  }, [positionMarketSearch]);

  return (
    <View className="flex-1 justify-center items-center rounded-lg pt-2">
      <View className="flex-1 rounded-lg">
        <ImageBackground
          source={footballField}
          className="flex-1 rounded-lg"
          style={{
            height: 390,
            width: 370,
          }}
          alt="Campo de futebol"
        />
      </View>

      {lineup.players.map((position, index) => {
        return (
          <View
            key={`${position.left} + ${position.position} + ${position.top}`}
            className="absolute"
            style={{
              top: position.top as any,
              left: position.left as any,
              backgroundColor: "transparent",
            }}
          >
            {position.player ? (
              <TeamPlayer
                player={position.player}
                hasCaptain={capitain === position.player?.atleta_id}
                handleCapitain={handleChangeCapitain}
                isPlayed={
                  playerStats?.atletas?.[position.player.atleta_id]
                    ?.entrou_em_campo
                }
              />
            ) : (
              <AddPlayerButton
                handleBuyPlayerOnMarket={(e) =>
                  handleBuyPlayerOnMarket(e, index)
                }
                positionLineup={position}
              />
            )}
          </View>
        );
      })}

      <Modal animationType="slide" transparent visible={activeModalMarket}>
        <Market
          market={market as MarketModal}
          position={positionMarketSearch}
          handleCloseMarketModal={handleCloseMarketModal}
          index={playerIndex}
        />
      </Modal>
    </View>
  );
}
