import { useCallback, useEffect, useState } from "react";
import { ImageBackground, Modal } from "react-native";

import { Market } from "@/app/(tabs)/team/market";
import footballField from "@/assets/images/field.png";
import { View } from "@/components/Themed";
import { AddPlayerButton } from "@/components/contexts/team/AddPlayerButton.tsx";
import { TeamPlayer } from "@/components/contexts/team/TeamPlayer";
import { LineupPlayers, LineupPosition } from "@/models/Formations";
import { useGetScoredPlayers } from "@/queries/stats.query";

type SoccerFieldProps = {
  lineup: LineupPlayers;
  capitain: number;
  isMarketClose: boolean;
  handleChangeCapitain?: (id: number) => void;
};

export function SoccerField({
  lineup,
  capitain,
  isMarketClose,
  handleChangeCapitain,
}: SoccerFieldProps) {
  const { data: playerStats } = useGetScoredPlayers(isMarketClose);
  const [positionMarketSearch, setPositionMarketSearch] =
    useState<LineupPosition | null>();

  const [playerIndex, setPlayerIndex] = useState(0);

  const [showMarketModal, setShowMarketModal] = useState(false);

  const handlePurchasePlayerOnMarket = useCallback(
    (player: LineupPosition, playerIndex: number) => {
      setPositionMarketSearch(player);
      setPlayerIndex(playerIndex);
    },
    [positionMarketSearch]
  );

  console.log("render soccer field?");

  const handleCloseMarketModal = useCallback(() => {
    setShowMarketModal(false);
    setPositionMarketSearch(null);
    setPlayerIndex(0);
  }, []);

  useEffect(() => {
    if (positionMarketSearch) setShowMarketModal(true);
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
                handlePurchasePlayerOnMarket={(e) =>
                  handlePurchasePlayerOnMarket(e, index)
                }
                positionLineup={position}
              />
            )}
          </View>
        );
      })}

      {showMarketModal && (
        <Modal animationType="slide" transparent visible={showMarketModal}>
          <Market
            position={positionMarketSearch}
            handleCloseMarketModal={handleCloseMarketModal}
            index={playerIndex}
          />
        </Modal>
      )}
    </View>
  );
}
