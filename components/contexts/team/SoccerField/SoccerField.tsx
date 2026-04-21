import { useCallback } from 'react';
import { Dimensions, ImageBackground } from 'react-native';

import footballField from '@/assets/images/field.png';
import { View } from '@/components/Themed';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { TeamPlayer } from '@/components/contexts/team/TeamPlayer';
import { Positions, Zone } from '@/constants/Formations';
import usePlayerStats from '@/hooks/usePlayerStats';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import useTeamLineupStore from '@/store/useTeamLineupStore';

const screenWidth = Dimensions.get('window').width;
const fieldWidth = screenWidth;

type SoccerFieldProps = {
  lineup: LineupPlayers;
  captain: number;
  substitutions?: Substitutions[];
  isViewOnly?: boolean;
  round: number;
  onOpenMarket: (position: LineupPosition, playerIndex: number) => void;
};

export function SoccerField({
  lineup,
  substitutions,
  captain,
  isViewOnly = false,
  round,
  onOpenMarket,
}: SoccerFieldProps) {
  const { playerStats } = usePlayerStats();

  const updateCaptain = useTeamLineupStore((state) => state.updateCaptain);

  const handlePurchasePlayerOnMarket = useCallback(
    (player: LineupPosition, playerIndex: number) => {
      onOpenMarket(player, playerIndex);
    },
    [onOpenMarket]
  );

  const renderItem = useCallback(
    (position: LineupPosition, index: number) => {
      return (
        <View
          key={position.player ? position.player.atleta_id : position.abbr + index}
          style={{
            backgroundColor: 'transparent',
          }}>
          {position.player ? (
            <TeamPlayer
              isViewOnly={isViewOnly}
              player={position.player as LineupPlayer}
              isCaptain={captain === position.player?.atleta_id}
              handleCaptain={updateCaptain}
              isPlayed={playerStats?.atletas?.[position.player.atleta_id]?.entrou_em_campo}
              isReplaced={substitutions?.some(
                (item) => item.saiu.atleta_id === position.player?.atleta_id
              )}
              isEnteredInMatch={substitutions?.some(
                (item) => item.entrou.atleta_id === position.player?.atleta_id
              )}
              round={round}
            />
          ) : (
            <AddPlayerButton
              onPurchasePlayerOnMarket={(e) => handlePurchasePlayerOnMarket(e, index)}
              positionLineup={position}
            />
          )}
        </View>
      );
    },
    [
      isViewOnly,
      captain,
      updateCaptain,
      playerStats?.atletas,
      substitutions,
      round,
      handlePurchasePlayerOnMarket,
    ]
  );

  return (
    <View className="flex-1 justify-center items-center rounded-lg pt-2 mx-2 bg-transparent">
      <ImageBackground
        source={footballField}
        style={{
          height: 430,
          width: fieldWidth,
        }}
        alt="Campinho"
      />

      <View
        style={{
          borderRadius: 16,
          position: 'absolute',
          top: 13,
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
          top: 112,
          borderRadius: 16,
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
          top: 210,
          borderRadius: 16,
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
          top: 305,
          borderRadius: 16,
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
          top: 305,
          left: 20,
          borderRadius: 16,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          backgroundColor: 'transparent',
        }}>
        {lineup?.starting.filter((item) => item.position === Positions.TECNICO).map(renderItem)}
      </View>
    </View>
  );
}
