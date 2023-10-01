import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import { View } from '@/components/Themed';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { TeamPlayer } from '@/components/contexts/team/TeamPlayer';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { PlayerStats } from '@/models/Stats';
import { onGetPlayerLowestPrice } from '@/utils/team';

type ListReservePlayersProps = {
  playerStats: PlayerStats;
  lineup: LineupPlayers;
  substitutions?: Substitutions[];
  isViewOnly?: boolean;
};

export function ListReservePlayers({
  playerStats,
  lineup,
  substitutions,
  isViewOnly = false,
}: ListReservePlayersProps) {
  const alertToStartingsPlayerPositionNotFilled = useCallback(
    () =>
      Alert.alert('Atenção', 'Você deve preencher todos os titulares para a posição.', [
        { text: 'OK' },
      ]),
    []
  );

  const [playerLowestPrice, setPlayerLowestPrice] = useState<LineupPosition>();
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [positionMarketSearch, setPositionMarketSearch] = useState<LineupPosition>();
  const [playerIndex, setPlayerIndex] = useState(0);

  const handlePurchasePlayerOnMarket = useCallback(
    (player: LineupPosition, playerIndex: number) => {
      const playersSamePositionFromLineupStarting = lineup?.starting.filter(
        (item) => item.position === player.position
      );

      const isPlayersFilledInPosition = playersSamePositionFromLineupStarting?.every(
        (item) => item.player
      );

      if (!isPlayersFilledInPosition) {
        alertToStartingsPlayerPositionNotFilled();
        return;
      }

      const lowestPlayer = onGetPlayerLowestPrice(lineup as LineupPlayers, player);
      setPlayerLowestPrice(lowestPlayer);

      setPositionMarketSearch(player);
      setPlayerIndex(playerIndex);
    },
    [lineup]
  );

  const handleCloseMarketModal = useCallback(() => {
    setShowMarketModal(false);
    setPositionMarketSearch(undefined);
    setPlayerIndex(0);
  }, []);

  useEffect(() => {
    if (positionMarketSearch && playerLowestPrice) setShowMarketModal(true);
  }, [positionMarketSearch, playerLowestPrice]);

  return (
    <>
      <View className="flex-row rounded-lg py-2">
        {lineup?.reserves?.map((position, index) => {
          return (
            <View key={position.position} className="flex-1 items-center">
              {position && position.player ? (
                <TeamPlayer
                  isViewOnly={isViewOnly}
                  player={position.player as LineupPlayer}
                  isReservePlayer
                  isPlayed={playerStats?.atletas?.[position.player.atleta_id]?.entrou_em_campo}
                  isEnteredInMatch={substitutions?.some(
                    (item) => item.entrou.atleta_id === position.player?.atleta_id
                  )}
                />
              ) : (
                <AddPlayerButton
                  key={position.abbr}
                  onPurchasePlayerOnMarket={() => handlePurchasePlayerOnMarket(position, index)}
                  positionLineup={position}
                  isViewOnly={isViewOnly}
                />
              )}
            </View>
          );
        })}
      </View>

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
            playerLowestPrice={playerLowestPrice?.player}
          />
        </Modal>
      )}
    </>
  );
}
