import { useCallback } from 'react';
import { Alert, useColorScheme } from 'react-native';

import { Text, View } from '@/components/Themed';
import { AnimatedCard } from '@/components/structure/AnimatedCard';
import { AddPlayerButton } from '@/components/contexts/team/AddPlayerButton';
import { TeamPlayer } from '@/components/contexts/team/TeamPlayer';
import usePlayerStats from '@/hooks/usePlayerStats';
import { Substitutions } from '@/models/Club';
import { LineupPlayer, LineupPlayers, LineupPosition } from '@/models/Formations';
import { onGetPlayerLowestPrice } from '@/utils/team';

type ListReservePlayersProps = {
  lineup: LineupPlayers;
  substitutions?: Substitutions[];
  isViewOnly?: boolean;
  round?: number;
  onOpenMarket: (position: LineupPosition, playerIndex: number, playerLowestPrice?: LineupPosition) => void;
};

export function ListReservePlayers({
  lineup,
  substitutions,
  isViewOnly = false,
  round,
  onOpenMarket,
}: ListReservePlayersProps) {
  const colorTheme = useColorScheme();
  const alertToStartingsPlayerPositionNotFilled = useCallback(
    () =>
      Alert.alert('Atenção', 'Você deve preencher todos os titulares para a posição.', [
        { text: 'OK' },
      ]),
    []
  );

  const { playerStats } = usePlayerStats();

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
      onOpenMarket(player, playerIndex, lowestPlayer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineup, onOpenMarket]
  );

  const reservesCount = lineup?.reserves?.filter((item) => item.player).length || 0;
  const totalReserves = lineup?.reserves?.length || 0;

  return (
    <AnimatedCard variant="flat" className="mx-2">
      <View style={{ backgroundColor: 'transparent', gap: 12 }}>
        <View
          className="flex-row justify-between items-center"
          style={{ backgroundColor: 'transparent' }}>
          <Text className="text-base font-semibold">Jogadores Reservas</Text>
          <View
            className={`px-2 py-1 rounded-full ${
              reservesCount === totalReserves
                ? colorTheme === 'dark'
                  ? 'bg-green-900'
                  : 'bg-green-100'
                : colorTheme === 'dark'
                ? 'bg-amber-900'
                : 'bg-amber-100'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                reservesCount === totalReserves ? 'text-green-500' : 'text-amber-500'
              }`}>
              {reservesCount}/{totalReserves}
            </Text>
          </View>
        </View>

        <View className="flex-row rounded-lg" style={{ backgroundColor: 'transparent' }}>
          {lineup?.reserves?.map((position, index) => {
            return (
              <View
                key={position.position + '-' + index}
                className="flex-1 items-center"
                style={{ backgroundColor: 'transparent' }}>
                {position && position.player ? (
                  <TeamPlayer
                    isViewOnly={isViewOnly}
                    player={position.player as LineupPlayer}
                    isReservePlayer
                    isPlayed={playerStats?.atletas?.[position.player.atleta_id]?.entrou_em_campo}
                    isEnteredInMatch={substitutions?.some(
                      (item) => item.entrou.atleta_id === position.player?.atleta_id
                    )}
                    round={round}
                    isReplaced={substitutions?.some(
                      (item) => item.saiu.atleta_id === position.player?.atleta_id
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
      </View>
    </AnimatedCard>
  );
}
