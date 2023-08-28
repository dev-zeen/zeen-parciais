import { useCallback, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, Modal } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import footballField from '@/assets/images/field.png';
import { View } from '@/components/Themed';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { TeamPlayer } from '@/components/contexts/team/TeamPlayer';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';

type SoccerFieldProps = {
  isMarketClose: boolean;
  substitutions?: Substitutions[];
};

export function SoccerField({ isMarketClose, substitutions }: SoccerFieldProps) {
  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const lineup = useTeamLineupStore((state) => state.lineup);
  const capitain = useTeamLineupStore((state) => state.capitain);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const [positionMarketSearch, setPositionMarketSearch] = useState<LineupPosition>();

  const [playerIndex, setPlayerIndex] = useState(0);

  const [showMarketModal, setShowMarketModal] = useState(false);

  const handlePurchasePlayerOnMarket = useCallback(
    (player: LineupPosition, playerIndex: number) => {
      setPositionMarketSearch(player);
      setPlayerIndex(playerIndex);
    },
    []
  );

  const handleCloseMarketModal = useCallback(() => {
    setShowMarketModal(false);
    setPositionMarketSearch(undefined);
    setPlayerIndex(0);
  }, []);

  useEffect(() => {
    if (positionMarketSearch) setShowMarketModal(true);
  }, [positionMarketSearch]);

  return (
    <View className="flex-1 justify-center items-center rounded-lg pt-2 mx-2">
      <ImageBackground
        source={footballField}
        style={{
          height: Dimensions.get('window').height * 0.55,
          width: Dimensions.get('window').width - 16,
        }}
        alt="Campinho"
      />

      {lineup?.starting.map((position, index) => {
        return (
          <View
            key={`${position.left} + ${position.position} + ${position.top}`}
            className="absolute"
            style={{
              top: position.top as any,
              left: position.left as any,
              backgroundColor: 'transparent',
            }}>
            {position.player ? (
              <TeamPlayer
                player={position.player as LineupPlayer}
                hasCaptain={capitain === position.player?.atleta_id}
                handleCapitain={updateCapitain}
                isPlayed={playerStats?.atletas?.[position.player.atleta_id]?.entrou_em_campo}
                isReplaced={substitutions?.some(
                  (item) => item.saiu.atleta_id === position.player?.atleta_id
                )}
              />
            ) : (
              <AddPlayerButton
                onPurchasePlayerOnMarket={(e) => handlePurchasePlayerOnMarket(e, index)}
                positionLineup={position}
              />
            )}
          </View>
        );
      })}

      {showMarketModal && (
        <Modal
          animationType="slide"
          transparent
          visible={showMarketModal}
          onRequestClose={() => setShowMarketModal(false)}>
          <Market
            position={positionMarketSearch}
            handleCloseMarketModal={handleCloseMarketModal}
            playerIndex={playerIndex}
          />
        </Modal>
      )}
    </View>
  );
}
