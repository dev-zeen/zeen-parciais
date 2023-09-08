import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import { Text, View } from '@/components/Themed';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { TeamPlayer } from '@/components/contexts/team/TeamPlayer';
import useLineup from '@/hooks/useLineup';
import usePlayerStats from '@/hooks/usePlayerStats';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { onGetPlayerLowestPrice } from '@/utils/team';

export function ListReservePlayers() {
  const alertToStartingsPlayerPositionNotFilled = () =>
    Alert.alert('Atenção', 'Você deve preencher todos os titulares para a posição.', [
      { text: 'OK' },
    ]);

  const { playerStats } = usePlayerStats();

  const { lineup, substitutions } = useLineup();

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
    <View className="rounded-lg items-center justify-center">
      <Text className="font-semibold text-base text-center">Banco de Reservas</Text>
      <View className="flex-row rounded-lg py-2 mb-1 items-center justify-center">
        {lineup?.reserves?.map((position, index) => {
          return (
            <View key={position.position} className="flex-1 justify-center items-center">
              {position && position.player ? (
                <TeamPlayer
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
    </View>
  );
}
