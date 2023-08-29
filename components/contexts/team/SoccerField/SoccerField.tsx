import { useCallback, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, Modal } from 'react-native';

import Market from '@/app/(tabs)/team/market';
import footballField from '@/assets/images/field.png';
import { View } from '@/components/Themed';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { TeamPlayer } from '@/components/contexts/team/TeamPlayer';
import { Positions, Zone } from '@/constants/Formations';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPosition } from '@/models/Formations';
import { useGetScoredPlayers } from '@/queries/stats.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';

type SoccerFieldProps = {
  isMarketClose: boolean;
  substitutions?: Substitutions[];
};

const screenWidth = Dimensions.get('window').width;

export function SoccerField({ isMarketClose, substitutions }: SoccerFieldProps) {
  const fieldWidth = screenWidth - 16;

  const { data: playerStats } = useGetScoredPlayers(isMarketClose);

  const lineup = useTeamLineupStore((state) => state.lineup);
  const capitain = useTeamLineupStore((state) => state.capitain);
  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);

  const [positionMarketSearch, setPositionMarketSearch] = useState<LineupPosition>();

  const [playerIndex, setPlayerIndex] = useState(0);

  const [showMarketModal, setShowMarketModal] = useState(false);

  const renderItem = (position: LineupPosition, index: number) => {
    return (
      <View
        key={position.player ? position.player.atleta_id : position.abbr + index}
        style={{
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
  };

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
          height: 480,
          width: fieldWidth,
        }}
        alt="Campinho"
      />

      <View
        style={{
          position: 'absolute',
          top: 15,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}>
        {lineup?.starting.filter((item) => item.position === Positions.ATACANTE).map(renderItem)}
      </View>

      <View
        style={{
          position: 'absolute',
          top: 130,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}>
        {lineup?.starting.filter((item) => item.position === Positions.MEIO_CAMPO).map(renderItem)}
      </View>

      <View
        style={{
          position: 'absolute',
          top: 250,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          gap: 10,
        }}>
        {lineup?.starting
          .filter((item) => item.zone === Zone.DEFESA)
          .sort((a, b) => (a?.sequencePosition as number) - (b?.sequencePosition as number))
          .map(renderItem)}
      </View>

      <View
        style={{
          position: 'absolute',
          top: 350,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}>
        {lineup?.starting.filter((item) => item.position === Positions.GOLEIRO).map(renderItem)}
      </View>

      <View
        style={{
          position: 'absolute',
          top: 350,
          left: 20,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          backgroundColor: 'transparent',
        }}>
        {lineup?.starting.filter((item) => item.position === Positions.TECNICO).map(renderItem)}
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
          />
        </Modal>
      )}
    </View>
  );
}
